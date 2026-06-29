import { getGeminiClient, handleAiError } from './aiClient.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

class ReviewService {
  /**
   * Invoke Gemini 2.5 Flash for architecture analysis
   */
  async generateArchitectureReview(messages, systemPrompt, maxTokens = 8192) {
    const ai = getGeminiClient();
    
    // Convert OpenAI-style messages to Gemini contents format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    try {
      const startTime = Date.now();
      let response;
      let usedModel = 'gemini-3.0-flash';
      
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.0-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json',
          }
        });
      } catch (err) {
        logger.warn('Gemini 3.0 Flash failed, falling back to gemini-2.5-flash', { error: err.message });
        usedModel = 'gemini-2.5-flash';
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json',
          }
        });
      }
      
      const elapsed = Date.now() - startTime;

      logger.info('Gemini review invocation complete', {
        model: usedModel,
        elapsed: `${elapsed}ms`,
      });

      return {
        content: response.text,
        usage: {
          input_tokens: response.usageMetadata?.promptTokenCount,
          output_tokens: response.usageMetadata?.candidatesTokenCount
        },
        processingTime: elapsed,
      };
    } catch (error) {
      logger.error('Gemini invocation failed', { error: error.message });
      throw handleAiError(error);
    }
  }
}

export default new ReviewService();
