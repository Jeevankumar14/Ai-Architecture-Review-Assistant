import extractionService from './ai/extractionService.js';
import logger from '../utils/logger.js';

class DiagramProcessor {
  /**
   * Uses Qwen 3 32B via Groq to extract structural component data from raw OCR text
   */
  async processDiagramText(ocrText) {
    logger.info('Processing OCR text into structured diagram data');

    const systemPrompt = `You are an expert cloud architecture diagram parser.
You will receive raw text extracted from an architecture diagram via OCR.
Identify the main components, databases, and potential connections based on the text.
Output a valid JSON object containing:
- "components": array of strings (e.g. "API Gateway", "User Service")
- "databases": array of strings (e.g. "PostgreSQL", "Redis")
- "cloudProvider": string (e.g. "AWS", "Azure", "Unknown")`;

    try {
      const response = await extractionService.extractData(ocrText, systemPrompt);
      const data = JSON.parse(response.content);
      return data;
    } catch (error) {
      logger.error('Diagram processing failed', { error: error.message });
      return { components: [], databases: [], cloudProvider: 'Unknown' };
    }
  }
}

export default new DiagramProcessor();
