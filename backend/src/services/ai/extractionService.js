import { getGeminiClient, handleAiError } from './aiClient.js';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

class ExtractionService {
  /**
   * Invoke Gemini directly for structured extraction
   */
  async extractData(prompt, systemPrompt) {
    const ai = getGeminiClient();
    const startTime = Date.now();
    const primaryModel = env.extractionModel || 'gemini-2.5-flash';
    let usedModel = primaryModel;

    try {
      let response;
      try {
        response = await ai.models.generateContent({
          model: primaryModel,
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
        logger.warn(`Primary model ${primaryModel} extraction failed, falling back to gemini-2.5-flash`, { error: err.message });
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

      const responseText = typeof response.text === 'function' ? await response.text() : response.text;
      return {
        content: (responseText || '').trim(),
        processingTime: elapsed,
      };
    } catch (error) {
      logger.error('Gemini extraction failed completely', { error: error.message });
      throw handleAiError(error);
    }
  }
}

export default new ExtractionService();
