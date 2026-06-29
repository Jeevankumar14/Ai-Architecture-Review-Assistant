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

    // Check 1: Missing Authentication
    const hasAuth = textData.includes('auth') || textData.includes('cognito') || textData.includes('jwt') || textData.includes('oauth');
    findings.push({
      rule: 'Authentication Mechanism',
      status: hasAuth ? 'Pass' : 'Fail',
      explanation: hasAuth ? 'Authentication component detected.' : 'CRITICAL: No authentication mechanism (like JWT, OAuth, or Cognito) was detected in the architecture.'
    });

    // Check 2: Database Caching
    const hasCache = textData.includes('cache') || textData.includes('redis') || textData.includes('memcached');
    findings.push({
      rule: 'Database Caching',
      status: hasCache ? 'Pass' : 'Fail',
      explanation: hasCache ? 'Caching layer detected.' : 'MEDIUM: No caching layer detected. Consider adding Redis or Memcached to reduce database load.'
    });

    // Check 3: Load Balancing
    const hasLB = textData.includes('load balancer') || textData.includes('alb') || textData.includes('gateway');
    findings.push({
      rule: 'Load Balancing',
      status: hasLB ? 'Pass' : 'Fail',
      explanation: hasLB ? 'Load balancing component detected.' : 'HIGH: Missing load balancer. Essential for high availability.'
    });

    return findings;
  }
}

export default new RuleEngine();
