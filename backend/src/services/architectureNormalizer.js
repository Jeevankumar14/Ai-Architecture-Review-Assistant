import logger from '../utils/logger.js';

/**
 * Architecture Normalizer
 * Converts diverse raw extraction outputs (Deterministic text extraction, Diagram OCR/Vision,
 * or merged multi-file data) into the unified Canonical Architecture Representation.
 * Guarantees schema consistency for Rule Engine, Scoring Engine, and Review Engine.
 */

class ArchitectureNormalizer {
  /**
   * Normalize an extracted architecture structure into the Canonical Architecture representation.
   * @param {Object} rawData - Deterministic extractor output
   * @param {Object} [diagramData] - Optional OCR/Vision diagram topology
   * @returns {Object} Canonical Architecture schema
   */
  normalize(rawData = {}, diagramData = null) {
    // If diagram data is present alongside text, merge them first
    const source = diagramData ? this.mergeAndNormalize(diagramData, rawData) : rawData;

    const components = [];
    const seenComponents = new Set();

    const addComponent = (name, type, technology = null) => {
      if (!name || typeof name !== 'string') return;
      const cleanName = name.trim();
      const key = cleanName.toLowerCase();
      if (!seenComponents.has(key)) {
        seenComponents.add(key);
        components.push({
          name: cleanName,
          type: type || 'service',
          technology: technology || cleanName,
        });
      }
    };

    // 1. Classify typed components into the canonical component list
    (source.databases || []).forEach(db => addComponent(db, 'database', db));
    (source.caches || []).forEach(cache => addComponent(cache, 'cache', cache));
    (source.queues || []).forEach(q => addComponent(q, 'message_queue', q));
    (source.gateways || []).forEach(gw => addComponent(gw, 'api_gateway', gw));
    (source.loadBalancers || []).forEach(lb => addComponent(lb, 'load_balancer', lb));
    (source.storage || []).forEach(st => addComponent(st, 'storage', st));
    (source.compute || []).forEach(cp => addComponent(cp, 'compute', cp));
    (source.authentication || []).forEach(auth => addComponent(auth, 'authentication', auth));
    (source.securityControls || []).forEach(sec => addComponent(sec, 'security_control', sec));
    (source.microservices || []).forEach(svc => addComponent(svc, 'service', null));

    // Also ingest any components defined as objects or strings from diagramData
    if (Array.isArray(source.components)) {
      source.components.forEach(c => {
        if (typeof c === 'string') {
          addComponent(c, 'component', c);
        } else if (c && typeof c === 'object' && c.name) {
          addComponent(c.name, c.type || 'component', c.technology || null);
        }
      });
    }

    // 2. Normalize connections into uniform `{ source, target, relationship }` objects
    const connections = [];
    const connectionStrings = [];
    const seenConnections = new Set();

    const addConnection = (src, tgt, rel = 'connects_to') => {
      if (!src || !tgt) return;
      const s = src.trim();
      const t = tgt.trim();
      if (!s || !t || s.toLowerCase() === t.toLowerCase()) return;

      const key = `${s}->${t}->${rel}`.toLowerCase();
      if (!seenConnections.has(key)) {
        seenConnections.add(key);
        connections.push({
          source: s,
          target: t,
          relationship: rel,
        });
        connectionStrings.push(`${s} -> ${t} (${rel})`);
      }
    };

    if (Array.isArray(source.connections)) {
      source.connections.forEach(conn => {
        if (typeof conn === 'string') {
          // Parse directed strings like "User -> API Gateway -> Microservice"
          const parts = conn.split(/\s*(?:->|-->|→)\s*/);
          if (parts.length >= 2) {
            for (let i = 0; i < parts.length - 1; i++) {
              addConnection(parts[i], parts[i + 1], 'routes_to');
            }
          }
        } else if (conn && typeof conn === 'object') {
          addConnection(conn.source, conn.target, conn.relationship || 'connects_to');
        }
      });
    }

    // 3. Normalize dependencies
    const dependencies = [];
    if (Array.isArray(source.dependencies)) {
      source.dependencies.forEach(dep => {
        if (typeof dep === 'string' && dep.trim()) {
          dependencies.push(dep.trim());
        } else if (dep && typeof dep === 'object' && dep.source && dep.target) {
          dependencies.push(`${dep.source} depends on ${dep.target}`);
        }
      });
    } else {
      // Derive dependencies from connections where appropriate
      connections.forEach(c => {
        if (c.relationship === 'reads_writes' || c.relationship === 'caches' || c.relationship === 'depends_on') {
          dependencies.push(`${c.source} depends on ${c.target}`);
        }
      });
    }

    // 4. Assemble canonical schema
    const canonical = {
      components,
      connections,
      databases: [...new Set(source.databases || [])],
      caches: [...new Set(source.caches || [])],
      queues: [...new Set(source.queues || [])],
      loadBalancers: [...new Set(source.loadBalancers || [])],
      gateways: [...new Set(source.gateways || [])],
      authentication: [...new Set(source.authentication || [])],
      securityControls: [...new Set(source.securityControls || [])],
      storage: [...new Set(source.storage || [])],
      cloudProviders: [...new Set(source.cloudProviders || [])],
      microservices: [...new Set(source.microservices || [])],
      apis: [...new Set(source.apis || [])],
      dependencies: [...new Set(dependencies)],
      patterns: [...new Set(source.patterns || [])],
      technologyStack: [...new Set(source.technologyStack || [])],
      cloudProvider: source.cloudProviders?.[0] || source.cloudProvider || 'Cloud / On-Premise',
    };

    // Flatten flat arrays for backward compatibility with existing ruleEngine checks
    canonical.componentsList = components.map(c => c.name);
    canonical.connectionStrings = connectionStrings;

    return canonical;
  }

  /**
   * Merge diagram topology with document report extraction for combined uploads.
   * e.g., Diagram + PDF or Diagram + DOCX.
   */
  mergeAndNormalize(diagramData = {}, documentData = {}) {
    logger.debug('Merging diagram topology and document data');

    const mergeArrays = (arr1 = [], arr2 = []) => {
      return [...new Set([...(arr1 || []), ...(arr2 || [])])];
    };

    return {
      databases: mergeArrays(diagramData.databases, documentData.databases),
      caches: mergeArrays(diagramData.caches, documentData.caches),
      queues: mergeArrays(diagramData.queues, documentData.queues),
      loadBalancers: mergeArrays(diagramData.loadBalancers, documentData.loadBalancers),
      gateways: mergeArrays(diagramData.gateways, documentData.gateways),
      storage: mergeArrays(diagramData.storage, documentData.storage),
      compute: mergeArrays(diagramData.compute, documentData.compute),
      authentication: mergeArrays(diagramData.authentication, documentData.authentication),
      securityControls: mergeArrays(diagramData.securityControls, documentData.securityControls),
      cloudProviders: mergeArrays(diagramData.cloudProviders, documentData.cloudProviders),
      microservices: mergeArrays(diagramData.microservices, documentData.microservices),
      apis: mergeArrays(diagramData.apis, documentData.apis),
      patterns: mergeArrays(diagramData.patterns, documentData.patterns),
      technologyStack: mergeArrays(diagramData.technologyStack, documentData.technologyStack),
      components: [...(diagramData.components || []), ...(documentData.components || [])],
      connections: [...(diagramData.connections || []), ...(documentData.connections || [])],
      dependencies: mergeArrays(diagramData.dependencies, documentData.dependencies),
      cloudProvider: diagramData.cloudProvider || documentData.cloudProvider || 'Cloud / On-Premise',
    };
  }
}

export default new ArchitectureNormalizer();
