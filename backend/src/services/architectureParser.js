import extractionService from './ai/extractionService.js';
import logger from '../utils/logger.js';

class ArchitectureParser {
  /**
   * Parse deep architecture structure from all available document data
   */
  async parseArchitecture(documentText, ocrData = null, metadata = null) {
    logger.info('Parsing full architecture details');

    const systemPrompt = `You are an expert software architect.
Analyze the provided system text and any OCR data.
Output a valid JSON object containing:
- "microservices": array of strings
- "dependencies": array of strings (e.g. "ServiceA -> DB")
- "patterns": array of architecture patterns detected
- "technologyStack": array of strings`;

    const prompt = `
      Metadata: ${JSON.stringify(metadata || {})}
      OCR Data: ${JSON.stringify(ocrData || {})}
      Document Extract: ${documentText.slice(0, 10000)}
    `;

    try {
      const response = await extractionService.extractData(prompt, systemPrompt);
      return JSON.parse(response.content);
    } catch (error) {
      logger.error('Architecture parsing failed', { error: error.message });
      return { microservices: [], dependencies: [], patterns: [], technologyStack: [] };
    }
  }
}

export default new ArchitectureParser();
