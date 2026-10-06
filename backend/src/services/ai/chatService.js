import { getGroqClient, getGeminiClient, handleAiError } from './aiClient.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

class ChatService {
  /**
   * Gemini 2.5 Flash streaming with proper message formatting & systemInstruction
   */
  async *_geminiChat(messages, systemPrompt, maxTokens = 2048) {
    const ai = getGeminiClient();

    // Normalize conversation history into valid alternating Gemini contents
    const contents = [];
    for (const msg of messages) {
      const role = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
      const text = typeof msg.content === 'string' ? msg.content.trim() : '';
      if (!text) continue;

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += '\n\n' + text;
      } else {
        contents.push({ role, parts: [{ text }] });
      }
    }

    if (contents.length === 0 || contents[0].role !== 'user') {
      contents.unshift({ role: 'user', parts: [{ text: 'Please answer the architecture query according to your instructions.' }] });
    }

    const modelName = env.architectureReviewModel || 'gemini-2.5-flash';
    const stream = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: maxTokens,
        temperature: 0.4,
      },
    });

    for await (const chunk of stream) {
      const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text;
      if (text) {
        yield text;
      }
    }
  }

  /**
   * Optional Groq streaming
   */
  async *_groqChat(messages, systemPrompt, maxTokens = 2048) {
    const client = getGroqClient();
    const payload = {
      model: env.chatModel || 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: maxTokens,
      temperature: 0.4,
      stream: true,
    };

    const stream = await client.chat.completions.create(payload, { timeout: 4000 });
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Main chatResponse generator:
   * If Groq API key is present, try Groq;
   * on ANY error or if Groq is not configured, seamlessly stream from Gemini.
   */
  async *chatResponse(messages, systemPrompt, maxTokens = 2048) {
    if (env.groqApiKey) {
      try {
        let yieldedAny = false;
        for await (const chunk of this._groqChat(messages, systemPrompt, maxTokens)) {
          yieldedAny = true;
          yield chunk;
        }
        if (yieldedAny) return;
      } catch (groqError) {
        logger.warn('Groq chat failed, falling back to Gemini', {
          error: groqError.message,
          model: env.chatModel,
        });
      }
    }

    // Direct or fallback to Gemini
    try {
      for await (const chunk of this._geminiChat(messages, systemPrompt, maxTokens)) {
        yield chunk;
      }
    } catch (geminiError) {
      logger.error('Gemini chat streaming failed', { error: geminiError.message });
      throw handleAiError(geminiError);
    }
  }
}

export default new ChatService();
