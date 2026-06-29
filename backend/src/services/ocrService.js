import sharp from 'sharp';
import logger from '../utils/logger.js';
import { getGeminiClient } from './ai/aiClient.js';
import env from '../config/env.js';

class OcrService {
  /**
   * Extract text and bounding boxes from an image buffer using Gemini Vision
   */
  async processImage(buffer) {
    try {
      logger.info('Starting OCR processing with Gemini 2.5 Flash');
      
      // Convert to normalized format and optimize size
      const normalizedBuffer = await sharp(buffer)
        .png()
        .resize({ width: 1600, withoutEnlargement: true })
        .toBuffer();

      const ai = getGeminiClient();
      
      const response = await ai.models.generateContent({
        model: env.architectureReviewModel || 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [
            { text: 'Extract all the text, labels, and architectural components from this diagram. Return ONLY the extracted text in a clean, structured format. Do not use markdown blocks.' },
            { inlineData: { data: normalizedBuffer.toString('base64'), mimeType: 'image/png' } }
          ]
        }]
      });

      logger.info('OCR processing completed successfully via Gemini');

      return {
        text: response.text.trim(),
        boxes: [] // Bounding boxes are not easily returned by standard Gemini text output
      };
    } catch (error) {
      logger.error('OCR Processing failed', { error: error.message });
      throw new Error(`Failed to extract text via OCR: ${error.message}`);
    }
  }
}

export default new OcrService();
