import { getGeminiClient, handleAiError } from './aiClient.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

class ExtractionService {
  /**
   * Invoke Gemini directly for structured extraction (replaces OpenRouter)
   */
  async extractData(prompt, systemPrompt) {
    const ai = getGeminiClient();
    const startTime = Date.now();
    let usedModel = 'gemini-3.0-flash';

    try {
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.0-flash',
          contents: [{
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + prompt }]
          }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });
      } catch (err) {
        logger.warn('Gemini 3.0 Flash extraction failed, falling back to gemini-2.5-flash', { error: err.message });
        usedModel = 'gemini-2.5-flash';
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + prompt }]
          }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });
      }

      const elapsed = Date.now() - startTime;
      
      logger.info('Gemini extraction complete', {
        model: usedModel,
        elapsed: `${elapsed}ms`,
      });

      return {
        content: response.text.trim(),
        processingTime: elapsed,
      };
    } catch (error) {
      logger.error('Gemini extraction failed completely', { error: error.message });
      throw handleAiError(error);
    }
  }
}

export default new ExtractionService();
