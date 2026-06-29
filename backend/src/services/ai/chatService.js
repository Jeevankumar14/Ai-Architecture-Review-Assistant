import { getGroqClient, getGeminiClient, handleAiError } from './aiClient.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

class ChatService {
  /**
   * Invoke Llama 3.1 8B via Groq with streaming
   */
  async *chatResponse(messages, systemPrompt, maxTokens = 4096) {
    const client = getGroqClient();

    const payload = {
      model: env.chatModel || 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: maxTokens,
      temperature: 0.4,
      stream: true,
    };

    try {
      const stream = await client.chat.completions.create(payload, { timeout: 5000 });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      if (error.status === 429 || error.message.includes('timeout') || error.message.includes('rate limit')) {
        logger.warn('Groq chat rate limited. Falling back to Gemini 2.5 Flash stream...');
        try {
          const ai = getGeminiClient();
          const geminiContents = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Understood.' }] }, // Context initialization
            ...messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : (m.role === 'system' ? 'user' : m.role),
              parts: [{ text: m.content }]
            }))
          ];

          const geminiStream = await ai.models.generateContentStream({
            model: env.architectureReviewModel || 'gemini-2.5-flash',
            contents: geminiContents,
          });

          for await (const chunk of geminiStream) {
            if (chunk.text) yield chunk.text;
          }
          return;
        } catch (fallbackError) {
          logger.error('Gemini chat fallback failed', { error: fallbackError.message });
        }
      }

      logger.error('Groq chat streaming failed', {
        model: env.chatModel,
        error: error.message,
      });
      throw handleAiError(error);
    }
  }
}

export default new ChatService();
