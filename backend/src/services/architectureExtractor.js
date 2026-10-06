import logger from '../utils/logger.js';

/**
 * High-performance deterministic architecture extractor.
 * Converts raw architectural text, specifications, and labels into structured components
 * using technology dictionaries, keyword classification, and regex relationship patterns.
 * Operates in < 20ms with ZERO external LLM calls.
 */

// ─── DICTIONARIES ─────────────────────────────────────────────────────────────

export const TECH_DICTIONARY = {
  // Databases (Relational, Document, Key-Value, Graph, Columnar)
  databases: [
    { name: 'PostgreSQL', pattern: /\b(postgres(ql)?|psql|aurora postgres)\b/i, technology: 'PostgreSQL' },
    { name: 'MySQL', pattern: /\b(mysql|aurora mysql)\b/i, technology: 'MySQL' },
    { name: 'MongoDB', pattern: /\b(mongo(db)?|documentdb)\b/i, technology: 'MongoDB' },
    { name: 'DynamoDB', pattern: /\bdynamodb\b/i, technology: 'Amazon DynamoDB' },
    { name: 'Oracle Database', pattern: /\boracle(\s+db|\s+database)?\b/i, technology: 'Oracle' },
    { name: 'Microsoft SQL Server', pattern: /\b(mssql|sql server)\b/i, technology: 'MS SQL Server' },
    { name: 'SQLite', pattern: /\bsqlite\b/i, technology: 'SQLite' },
    { name: 'Apache Cassandra', pattern: /\bcassandra\b/i, technology: 'Apache Cassandra' },
    { name: 'MariaDB', pattern: /\bmariadb\b/i, technology: 'MariaDB' },
    { name: 'CockroachDB', pattern: /\bcockroach(db)?\b/i, technology: 'CockroachDB' },
    { name: 'Google Firestore', pattern: /\b(firestore|datastore)\b/i, technology: 'Google Firestore' },
    { name: 'Neo4j', pattern: /\bneo4j\b/i, technology: 'Neo4j Graph DB' },
    { name: 'ClickHouse', pattern: /\bclickhouse\b/i, technology: 'ClickHouse' },
    { name: 'Snowflake', pattern: /\bsnowflake\b/i, technology: 'Snowflake Data Warehouse' },
    { name: 'Elasticsearch', pattern: /\b(elastic(search)?|opensearch)\b/i, technology: 'Elasticsearch' },
  ],

  // In-Memory Caches
  caches: [
    { name: 'Redis', pattern: /\b(redis|elasticache)\b/i, technology: 'Redis' },
    { name: 'Memcached', pattern: /\bmemcached\b/i, technology: 'Memcached' },
    { name: 'Hazelcast', pattern: /\bhazelcast\b/i, technology: 'Hazelcast' },
    { name: 'Ehcache', pattern: /\behcache\b/i, technology: 'Ehcache' },
    { name: 'Varnish', pattern: /\bvarnish\b/i, technology: 'Varnish Cache' },
    { name: 'Dragonfly', pattern: /\bdragonflydb\b/i, technology: 'Dragonfly' },
  ],

  // Message Brokers / Event Streaming / Queues
  queues: [
    { name: 'Apache Kafka', pattern: /\b(kafka|confluent|msk)\b/i, technology: 'Apache Kafka' },
    { name: 'RabbitMQ', pattern: /\brabbitmq\b/i, technology: 'RabbitMQ' },
    { name: 'AWS SQS', pattern: /\b(sqs|simple queue service)\b/i, technology: 'Amazon SQS' },
    { name: 'AWS SNS', pattern: /\b(sns|simple notification service)\b/i, technology: 'Amazon SNS' },
    { name: 'AWS EventBridge', pattern: /\beventbridge\b/i, technology: 'Amazon EventBridge' },
    { name: 'Apache Pulsar', pattern: /\bpulsar\b/i, technology: 'Apache Pulsar' },
    { name: 'ActiveMQ', pattern: /\bactivemq\b/i, technology: 'ActiveMQ' },
    { name: 'NATS', pattern: /\bnats\b/i, technology: 'NATS' },
    { name: 'Google Pub/Sub', pattern: /\b(google pub\/?sub|cloud pub\/?sub)\b/i, technology: 'Google Cloud Pub/Sub' },
    { name: 'Azure Service Bus', pattern: /\bservice bus\b/i, technology: 'Azure Service Bus' },
    { name: 'BullMQ', pattern: /\bbullmq\b/i, technology: 'BullMQ' },
  ],

  // API Gateways & Reverse Proxies / Load Balancers
  loadBalancers: [
    { name: 'AWS Application Load Balancer', pattern: /\b(alb|application load balancer)\b/i, technology: 'AWS ALB' },
    { name: 'AWS Network Load Balancer', pattern: /\b(nlb|network load balancer)\b/i, technology: 'AWS NLB' },
    { name: 'AWS Elastic Load Balancer', pattern: /\belb\b/i, technology: 'AWS ELB' },
    { name: 'Nginx', pattern: /\bnginx\b/i, technology: 'Nginx' },
    { name: 'HAProxy', pattern: /\bhaproxy\b/i, technology: 'HAProxy' },
    { name: 'Envoy', pattern: /\benvoy\b/i, technology: 'Envoy Proxy' },
    { name: 'Traefik', pattern: /\btraefik\b/i, technology: 'Traefik' },
    { name: 'Cloudflare', pattern: /\bcloudflare\b/i, technology: 'Cloudflare' },
  ],

  gateways: [
    { name: 'AWS API Gateway', pattern: /\b(api gateway|amazon api gateway)\b/i, technology: 'AWS API Gateway' },
    { name: 'Kong Gateway', pattern: /\bkong\b/i, technology: 'Kong Gateway' },
    { name: 'Apigee', pattern: /\bapigee\b/i, technology: 'Google Apigee' },
    { name: 'Express Gateway', pattern: /\bexpress gateway\b/i, technology: 'Express Gateway' },
    { name: 'Tyk', pattern: /\btyk\b/i, technology: 'Tyk API Gateway' },
    { name: 'KrakenD', pattern: /\bkrakend\b/i, technology: 'KrakenD' },
    { name: 'Zuul', pattern: /\bzuul\b/i, technology: 'Netflix Zuul' },
    { name: 'Ocelot', pattern: /\bocelot\b/i, technology: 'Ocelot API Gateway' },
  ],

  // Object & File Storage
  storage: [
    { name: 'Amazon S3', pattern: /\b(s3|simple storage service)\b/i, technology: 'Amazon S3' },
    { name: 'Google Cloud Storage', pattern: /\b(gcs|cloud storage)\b/i, technology: 'Google Cloud Storage' },
    { name: 'Azure Blob Storage', pattern: /\bblob storage\b/i, technology: 'Azure Blob Storage' },
    { name: 'MinIO', pattern: /\bminio\b/i, technology: 'MinIO' },
    { name: 'Amazon EFS', pattern: /\befs\b/i, technology: 'Amazon EFS' },
    { name: 'Amazon EBS', pattern: /\bebs\b/i, technology: 'Amazon EBS' },
    { name: 'Ceph', pattern: /\bceph\b/i, technology: 'Ceph' },
  ],

  // Compute, Containers & Orchestration
  compute: [
    { name: 'Kubernetes', pattern: /\b(kubernetes|k8s)\b/i, technology: 'Kubernetes' },
    { name: 'Docker', pattern: /\bdocker\b/i, technology: 'Docker' },
    { name: 'AWS ECS', pattern: /\b(ecs|elastic container service)\b/i, technology: 'Amazon ECS' },
    { name: 'AWS EKS', pattern: /\beks\b/i, technology: 'Amazon EKS' },
    { name: 'AWS Lambda', pattern: /\b(lambda|serverless functions?)\b/i, technology: 'AWS Lambda' },
    { name: 'AWS Fargate', pattern: /\bfargate\b/i, technology: 'AWS Fargate' },
    { name: 'Google Cloud Run', pattern: /\bcloud run\b/i, technology: 'Google Cloud Run' },
    { name: 'Google Kubernetes Engine', pattern: /\bgke\b/i, technology: 'Google GKE' },
    { name: 'Azure Kubernetes Service', pattern: /\baks\b/i, technology: 'Azure AKS' },
    { name: 'Amazon EC2', pattern: /\bec2\b/i, technology: 'Amazon EC2' },
  ],

  // Authentication & Security Controls
  authentication: [
    { name: 'JWT', pattern: /\b(jwt|json web token)\b/i, technology: 'JWT' },
    { name: 'OAuth 2.0', pattern: /\boauth(2|\.0)?\b/i, technology: 'OAuth 2.0' },
    { name: 'OpenID Connect', pattern: /\b(oidc|openid connect)\b/i, technology: 'OpenID Connect' },
    { name: 'Amazon Cognito', pattern: /\bcognito\b/i, technology: 'Amazon Cognito' },
    { name: 'Auth0', pattern: /\bauth0\b/i, technology: 'Auth0' },
    { name: 'Keycloak', pattern: /\bkeycloak\b/i, technology: 'Keycloak' },
    { name: 'SAML', pattern: /\bsaml(2|\.0)?\b/i, technology: 'SAML' },
    { name: 'AWS IAM', pattern: /\biam\b/i, technology: 'AWS IAM' },
    { name: 'API Key Authentication', pattern: /\bapi keys?\b/i, technology: 'API Key' },
  ],

  securityControls: [
    { name: 'AWS WAF', pattern: /\bwaf\b/i, technology: 'AWS WAF' },
    { name: 'AWS Shield', pattern: /\bshield\b/i, technology: 'AWS Shield' },
    { name: 'HashiCorp Vault', pattern: /\b(vault|hashicorp vault)\b/i, technology: 'HashiCorp Vault' },
    { name: 'AWS KMS', pattern: /\bkms\b/i, technology: 'AWS KMS' },
    { name: 'TLS / SSL Encryption', pattern: /\b(tls|ssl|https|mtls)\b/i, technology: 'TLS/HTTPS' },
    { name: 'Rate Limiting', pattern: /\brate limit(ing|er)?\b/i, technology: 'Rate Limiting' },
    { name: 'Secrets Manager', pattern: /\bsecrets manager\b/i, technology: 'AWS Secrets Manager' },
  ],

  // Cloud Providers
  cloudProviders: [
    { name: 'AWS', pattern: /\b(aws|amazon web services)\b/i },
    { name: 'Google Cloud (GCP)', pattern: /\b(gcp|google cloud)\b/i },
    { name: 'Microsoft Azure', pattern: /\b(azure|microsoft azure)\b/i },
    { name: 'Cloudflare', pattern: /\bcloudflare\b/i },
    { name: 'DigitalOcean', pattern: /\bdigitalocean\b/i },
  ],

  // Architectural Patterns
  patterns: [
    { name: 'Microservices Architecture', pattern: /\bmicroservices?\b/i },
    { name: 'Event-Driven Architecture', pattern: /\b(event-driven|event driven|pub\/?sub)\b/i },
    { name: 'Serverless Architecture', pattern: /\bserverless\b/i },
    { name: 'Monolithic Architecture', pattern: /\bmonolith(ic)?\b/i },
    { name: 'CQRS', pattern: /\bcqrs\b/i },
    { name: 'Hexagonal Architecture', pattern: /\b(hexagonal|ports and adapters)\b/i },
    { name: 'API-First Architecture', pattern: /\bapi-first\b/i },
    { name: 'Domain-Driven Design', pattern: /\b(domain-driven|ddd)\b/i },
  ],

  // Technologies / Languages / Frameworks
  technologyStack: [
    { name: 'Node.js', pattern: /\bnode(\.js)?\b/i },
    { name: 'TypeScript', pattern: /\btypescript\b/i },
    { name: 'Python', pattern: /\bpython\b/i },
    { name: 'Java', pattern: /\bjava\b/i },
    { name: 'Go', pattern: /\b(golang|go)\b/i },
    { name: 'Rust', pattern: /\brust\b/i },
    { name: 'C# / .NET', pattern: /\b(c#|\.net|dotnet)\b/i },
    { name: 'React', pattern: /\breact(\.js)?\b/i },
    { name: 'Vue', pattern: /\bvue(\.js)?\b/i },
    { name: 'Angular', pattern: /\bangular\b/i },
    { name: 'Next.js', pattern: /\bnext(\.js)?\b/i },
    { name: 'Express.js', pattern: /\bexpress(\.js)?\b/i },
    { name: 'Spring Boot', pattern: /\bspring boot\b/i },
    { name: 'FastAPI', pattern: /\bfastapi\b/i },
    { name: 'GraphQL', pattern: /\bgraphql\b/i },
    { name: 'gRPC', pattern: /\bgrpc\b/i },
  ]
};

// ─── RELATIONSHIP REGEX PATTERNS ──────────────────────────────────────────────

const RELATIONSHIP_PATTERNS = [
  // Routes to / proxies to / forwards to
  { regex: /([A-Za-z0-9_\-\s]{2,30})\s+(?:routes(?:\s+requests)?\s+to|proxies\s+to|forwards\s+to|gateways?\s+to)\s+([A-Za-z0-9_\-\s]{2,30})/gi, relationship: 'routes_to' },
  
  // Reads / writes / stores in database
  { regex: /([A-Za-z0-9_\-\s]{2,30})\s+(?:stores\s+(?:data\s+)?in|writes\s+to|reads\s+from|persists\s+to|queries)\s+([A-Za-z0-9_\-\s]{2,30})/gi, relationship: 'reads_writes' },
  
  // Caches in
  { regex: /([A-Za-z0-9_\-\s]{2,30})\s+(?:caches\s+(?:data\s+)?in|uses\s+cache|queries\s+cache)\s+([A-Za-z0-9_\-\s]{2,30})/gi, relationship: 'caches' },
  
  // Publishes / sends events to queue
  { regex: /([A-Za-z0-9_\-\s]{2,30})\s+(?:publishes\s+(?:events?\s+|messages?\s+)?to|sends\s+(?:messages?\s+)?to|emits\s+to)\s+([A-Za-z0-9_\-\s]{2,30})/gi, relationship: 'publishes_to' },
  
  // Consumes from queue
  { regex: /([A-Za-z0-9_\-\s]{2,30})\s+(?:consumes\s+from|subscribes\s+to|listens\s+to|polls)\s+([A-Za-z0-9_\-\s]{2,30})/gi, relationship: 'consumes_from' },

  // Communicates / depends on
  { regex: /([A-Za-z0-9_\-\s]{2,30})\s+(?:depends\s+on|communicates\s+with|calls|invokes)\s+([A-Za-z0-9_\-\s]{2,30})/gi, relationship: 'depends_on' },

  // Arrow notation: A -> B or A --> B
  { regex: /([A-Za-z0-9_\-\s]{2,30})\s*(?:-{1,3}>|→)\s*([A-Za-z0-9_\-\s]{2,30})/gi, relationship: 'connects_to' },
];

// Service name extractor (e.g., "Order Service", "Payment Microservice", "Auth Service", "Notification Worker")
const SERVICE_NAME_REGEX = /\b([A-Z][a-zA-Z0-9_-]*(?:\s+[A-Z][a-zA-Z0-9_-]*)*\s+(?:Service|Microservice|API|Worker|Gateway|Processor|Consumer|Producer|App))\b/g;

// API endpoint extractor (e.g., "/api/v1/orders", "GET /users")
const API_ENDPOINT_REGEX = /\b((?:GET|POST|PUT|DELETE|PATCH)\s+)?(\/(?:api|v[0-9]+)[a-zA-Z0-9_\-\/]+)\b/gi;

class ArchitectureExtractor {
  extract(text) {
    return this.extractFromText(text);
  }

  /**
   * Deterministically extracts architectural components and relationships from text.
   * @param {string} text - Raw extracted document text
   * @returns {Object} Structured raw extraction
   */
  extractFromText(text) {
    if (!text || typeof text !== 'string') {
      return this._emptyExtraction();
    }

    const startTime = Date.now();
    const cleanText = text.slice(0, 50000); // Analyze up to 50KB

    const detected = {
      databases: this._matchDict(cleanText, TECH_DICTIONARY.databases),
      caches: this._matchDict(cleanText, TECH_DICTIONARY.caches),
      queues: this._matchDict(cleanText, TECH_DICTIONARY.queues),
      loadBalancers: this._matchDict(cleanText, TECH_DICTIONARY.loadBalancers),
      gateways: this._matchDict(cleanText, TECH_DICTIONARY.gateways),
      storage: this._matchDict(cleanText, TECH_DICTIONARY.storage),
      compute: this._matchDict(cleanText, TECH_DICTIONARY.compute),
      authentication: this._matchDict(cleanText, TECH_DICTIONARY.authentication),
      securityControls: this._matchDict(cleanText, TECH_DICTIONARY.securityControls),
      cloudProviders: this._matchDict(cleanText, TECH_DICTIONARY.cloudProviders),
      patterns: this._matchDict(cleanText, TECH_DICTIONARY.patterns),
      technologyStack: this._matchDict(cleanText, TECH_DICTIONARY.technologyStack),
      microservices: this._extractServiceNames(cleanText),
      apis: this._extractApis(cleanText),
      connections: this._extractRelationships(cleanText),
    };

    logger.debug('Deterministic architecture extraction complete', {
      durationMs: Date.now() - startTime,
      databases: detected.databases.length,
      microservices: detected.microservices.length,
      connections: detected.connections.length,
    });

    return detected;
  }

  _matchDict(text, entries) {
    const matched = [];
    for (const item of entries) {
      if (item.pattern.test(text)) {
        matched.push(item.name);
      }
    }
    return [...new Set(matched)];
  }

  _extractServiceNames(text) {
    const services = new Set();
    const matches = text.matchAll(SERVICE_NAME_REGEX);
    for (const match of matches) {
      const name = match[1]?.trim();
      // Filter out overly generic or noisy tokens
      if (name && name.length >= 4 && name.length <= 40 && !/^(The Service|This Service|Any Service|Our Service)$/i.test(name)) {
        services.add(name);
      }
    }
    return Array.from(services);
  }

  _extractApis(text) {
    const apis = new Set();
    const matches = text.matchAll(API_ENDPOINT_REGEX);
    for (const match of matches) {
      const method = match[1] ? match[1].trim() + ' ' : '';
      const path = match[2]?.trim();
      if (path && path.length > 2 && path.length < 80) {
        apis.add(`${method}${path}`);
      }
    }
    return Array.from(apis).slice(0, 30);
  }

  _extractRelationships(text) {
    const connections = [];
    const seen = new Set();

    for (const { regex, relationship } of RELATIONSHIP_PATTERNS) {
      const matches = text.matchAll(regex);
      for (const match of matches) {
        const source = match[1]?.trim().replace(/[\r\n\t]+/g, ' ');
        const target = match[2]?.trim().replace(/[\r\n\t]+/g, ' ');

        if (
          source && target &&
          source.length >= 2 && source.length <= 40 &&
          target.length >= 2 && target.length <= 40 &&
          source.toLowerCase() !== target.toLowerCase() &&
          !/^(it|this|that|there|they|we|you|which|where)$/i.test(source) &&
          !/^(it|this|that|there|they|we|you|which|where)$/i.test(target)
        ) {
          const key = `${source}->${target}->${relationship}`.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            connections.push({
              source,
              target,
              relationship,
              directedString: `${source} -> ${target} (${relationship})`,
            });
          }
        }
      }
    }

    return connections.slice(0, 50);
  }

  _emptyExtraction() {
    return {
      databases: [],
      caches: [],
      queues: [],
      loadBalancers: [],
      gateways: [],
      storage: [],
      compute: [],
      authentication: [],
      securityControls: [],
      cloudProviders: [],
      patterns: [],
      technologyStack: [],
      microservices: [],
      apis: [],
      connections: [],
    };
  }
}

export default new ArchitectureExtractor();
