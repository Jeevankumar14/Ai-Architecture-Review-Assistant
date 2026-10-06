import logger from '../utils/logger.js';

class RuleEngine {
  /**
   * Execute deterministic checks against the parsed architecture data
   * Returns an array of findings { rule, status, explanation }
   */
  executeChecks(architectureData) {
    logger.info('Executing deterministic rule checks');
    const findings = [];
    const textData = JSON.stringify(architectureData).toLowerCase();

    // Check 1: Authentication & Access Control (Security - Critical)
    const hasAuth = textData.includes('auth') || textData.includes('cognito') || textData.includes('jwt') || textData.includes('oauth') || textData.includes('iam');
    findings.push({
      rule: 'Authentication & Access Control',
      category: 'Security',
      severity: 'Critical',
      issue: 'Missing Authentication & Access Control Mechanism',
      status: hasAuth ? 'Pass' : 'Fail',
      explanation: hasAuth ? 'Authentication & authorization components detected.' : 'CRITICAL: No explicit authentication or authorization mechanism (e.g. JWT, OAuth2, Cognito, IAM) was detected in the architecture.'
    });

    // Check 2: Single Point of Failure & Redundancy (Scalability - High)
    const hasRedundancy = textData.includes('multi-az') || textData.includes('replica') || textData.includes('cluster') || textData.includes('auto-scaling') || textData.includes('failover') || textData.includes('redundant');
    findings.push({
      rule: 'Single Points of Failure & Redundancy',
      category: 'Scalability',
      severity: 'High',
      issue: 'Single Point of Failure (SPOF) - Lack of Component Redundancy',
      status: hasRedundancy ? 'Pass' : 'Fail',
      explanation: hasRedundancy ? 'High availability / redundancy patterns detected (e.g., replicas, multi-AZ, or clustering).' : 'HIGH: Potential single point of failure (SPOF). Ensure critical services have replicas, multi-AZ failover, or auto-scaling groups.'
    });

    // Check 3: Direct Database Exposure (Security - Critical)
    const connections = Array.isArray(architectureData?.connections) ? architectureData.connections.join(' ').toLowerCase() : '';
    const hasDirectDbAccess = connections.includes('user -> db') || connections.includes('client -> db') || connections.includes('browser -> postgres') || connections.includes('user -> sql') || (textData.includes('public') && textData.includes('database'));
    findings.push({
      rule: 'Direct Database Isolation',
      category: 'Security',
      severity: 'Critical',
      issue: 'Direct Database Exposure Without Tier Isolation',
      status: !hasDirectDbAccess ? 'Pass' : 'Fail',
      explanation: !hasDirectDbAccess ? 'Database tier is properly isolated behind backend services.' : 'CRITICAL: Potential direct database exposure detected without intermediary API or service tier protection.'
    });

    // Check 4: Load Balancing & Traffic Distribution (Performance - High)
    const hasLB = textData.includes('load balancer') || textData.includes('alb') || textData.includes('nlb') || textData.includes('gateway') || textData.includes('ingress');
    findings.push({
      rule: 'Load Balancing & Gateway Protection',
      category: 'Performance',
      severity: 'High',
      issue: 'Missing Load Balancer or API Gateway',
      status: hasLB ? 'Pass' : 'Fail',
      explanation: hasLB ? 'Load balancing or API gateway component detected.' : 'HIGH: Missing load balancer or API Gateway. Essential for traffic routing, rate limiting, and high availability.'
    });

    // Check 5: Database Caching Layer (Performance - Medium)
    const hasCache = textData.includes('cache') || textData.includes('redis') || textData.includes('memcached') || textData.includes('elasticache');
    findings.push({
      rule: 'Database Caching Layer',
      category: 'Performance',
      severity: 'Medium',
      issue: 'Missing Caching Layer for Database Offloading',
      status: hasCache ? 'Pass' : 'Fail',
      explanation: hasCache ? 'Caching layer detected (Redis/Memcached).' : 'MEDIUM: No caching layer detected. Consider adding Redis or Memcached to reduce database load and latency.'
    });

    // Check 6: Transport Security & Encryption (Security - Medium)
    const hasEncryption = textData.includes('https') || textData.includes('tls') || textData.includes('ssl') || textData.includes('kms') || textData.includes('encrypt');
    findings.push({
      rule: 'Transport Security & Encryption',
      category: 'Security',
      severity: 'Medium',
      issue: 'Unencrypted Transport / Missing TLS Enforcement',
      status: hasEncryption ? 'Pass' : 'Fail',
      explanation: hasEncryption ? 'Transport security (HTTPS/TLS) and/or encryption mechanisms detected.' : 'MEDIUM: No explicit encryption or TLS configuration detected. Ensure all inter-service communications use HTTPS/mTLS.'
    });

    return findings;
  }
}

export default new RuleEngine();
