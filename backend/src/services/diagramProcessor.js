import architectureExtractor from './architectureExtractor.js';
import logger from '../utils/logger.js';

class DiagramProcessor {
  /**
   * Deterministically processes OCR text into structured diagram data
   * Uses rules, tech dictionaries, and regex patterns in < 10ms with zero LLM calls.
   */
  async processDiagramText(ocrText) {
    logger.info('Processing OCR text into structured diagram data (Deterministic)');

    if (!ocrText || typeof ocrText !== 'string') {
      return this._emptyData();
    }

    try {
      const extracted = architectureExtractor.extractFromText(ocrText);
      const components = [
        ...extracted.databases,
        ...extracted.caches,
        ...extracted.queues,
        ...extracted.loadBalancers,
        ...extracted.gateways,
        ...extracted.compute,
        ...extracted.microservices,
        ...extracted.storage,
      ];

      return {
        components: [...new Set(components)],
        microservices: extracted.microservices || [],
        apis: extracted.apis || [],
        databases: extracted.databases || [],
        loadBalancers: extracted.loadBalancers || [],
        cloudServices: extracted.storage || [],
        externalSystems: [],
        connections: (extracted.connections || []).map(c => c.directedString || `${c.source} -> ${c.target}`),
        dependencies: (extracted.connections || []).filter(c => c.relationship === 'depends_on').map(c => `${c.source} depends on ${c.target}`),
        cloudProvider: extracted.cloudProviders?.[0] || 'Unknown',
      };
    } catch (error) {
      logger.error('Diagram processing failed', { error: error.message });
      return this._emptyData();
    }
  }

  _emptyData() {
    return {
      components: [],
      microservices: [],
      apis: [],
      databases: [],
      loadBalancers: [],
      cloudServices: [],
      externalSystems: [],
      connections: [],
      dependencies: [],
      cloudProvider: 'Unknown',
    };
  }
}

export default new DiagramProcessor();
