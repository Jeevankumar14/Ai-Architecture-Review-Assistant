import architectureExtractor from './architectureExtractor.js';
import architectureNormalizer from './architectureNormalizer.js';
import logger from '../utils/logger.js';

class ArchitectureParser {
  /**
   * Deterministically parses architecture details from document text and/or diagram OCR data.
   * Completely replaces the slow 15-25s Gemini LLM extraction call on the Fast Review path.
   * Runs in < 25ms using dictionaries, regex patterns, and canonical normalization.
   * 
   * @param {string} documentText - Extracted text from PDF, DOC/DOCX, TXT, JSON, YAML
   * @param {Object|null} ocrData - Extracted topology from diagram OCR/vision (if diagram uploaded)
   * @param {Object|null} metadata - Optional pre-existing document metadata
   * @returns {Promise<Object>} Canonical Architecture representation
   */
  async parseArchitecture(documentText = '', ocrData = null, metadata = null) {
    const startTime = Date.now();
    logger.info('Parsing architecture deterministically (Fast Path, Zero LLM Call)');

    try {
      // 1. Deterministic Extraction from raw document text
      const extractedFromText = architectureExtractor.extractFromText(documentText || '');

      // 2. Incorporate metadata if provided
      if (metadata) {
        if (metadata.cloudProvider && !extractedFromText.cloudProviders.includes(metadata.cloudProvider)) {
          extractedFromText.cloudProviders.push(metadata.cloudProvider);
        }
        if (Array.isArray(metadata.databases)) {
          extractedFromText.databases.push(...metadata.databases);
        }
        if (Array.isArray(metadata.programmingLanguages)) {
          extractedFromText.technologyStack.push(...metadata.programmingLanguages);
        }
      }

      // 3. Normalize into Canonical Architecture schema (merging diagram data if present)
      const canonical = architectureNormalizer.normalize(extractedFromText, ocrData);

      const elapsed = Date.now() - startTime;
      logger.info('Deterministic architecture parsing complete', {
        durationMs: elapsed,
        components: canonical.components.length,
        databases: canonical.databases.length,
        connections: canonical.connections.length,
      });

      return canonical;
    } catch (error) {
      logger.error('Deterministic architecture parsing failed, returning empty canonical schema', { error: error.message });
      return architectureNormalizer.normalize({}, ocrData);
    }
  }
}

export default new ArchitectureParser();
