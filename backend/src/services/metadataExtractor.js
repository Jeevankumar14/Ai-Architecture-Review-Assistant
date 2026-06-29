import extractionService from './ai/extractionService.js';
import logger from '../utils/logger.js';

class MetadataExtractor {
  /**
   * Extract vital architectural metadata from raw document text
   */
  async extractMetadata(text) {
    logger.info('Extracting metadata from document');

    const systemPrompt = `You are an expert software architect.
Extract metadata from the provided architectural text.
Return ONLY a JSON object with the following keys:
- "cloudProvider"
- "architectureStyle"
- "programmingLanguages" (array)
- "databases" (array)
- "authentication"`;

    try {
      // Use the first 8000 characters to save tokens for metadata
      const textSample = text.slice(0, 8000);
      const response = await extractionService.extractData(textSample, systemPrompt);
      return JSON.parse(response.content);
    } catch (error) {
      logger.error('Metadata extraction failed', { error: error.message });
      return {};
    }
  }
}

export default new MetadataExtractor();
