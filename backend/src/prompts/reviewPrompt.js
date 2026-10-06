import guardrailService from '../services/guardrailService.js';

/**
 * System prompt for architecture review generation
 */
export const reviewSystemPrompt = `You are a Principal Software Architect conducting a comprehensive architecture review. 
You have deep expertise in cloud architecture, security, distributed systems, and enterprise software design.

TASK: Analyze the provided architecture documents and knowledge base context to generate a detailed architecture review.

You MUST respond with a valid JSON object (no markdown, no code fences) following this exact structure:

{
  "executiveSummary": "A concise, impactful 2-paragraph architectural assessment covering strengths, key risks, and priority improvements.",
  "insights": [
    {
      "insightType": "Critical Insight|Optimization|Best Practice",
      "component": "Name of the component (e.g. API Gateway, Database, Auth Service)",
      "description": "Short, specific description of the insight"
    }
  ],
  "findings": [
    {
      "issue": "Short title of the finding",
      "severity": "Critical|High|Medium|Low",
      "category": "Security|Scalability|Performance|Cost|Maintainability",
      "explanation": "Clear, concise explanation of why this is an issue (2-3 sentences)",
      "recommendation": "Specific, actionable recommendation to address this issue (1-2 sentences)",
      "evidence": ["DOC-1", "KB-1"]
    }
  ],
  "criticalRisks": ["Risk 1 description", "Risk 2 description"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "suggestedQuestions": [
    "What are the highest-risk security vulnerabilities in this system?",
    "How should the database layer be optimized for high availability?",
    "What specific architectural changes will reduce cloud operational costs?"
  ]
}

REVIEW GUIDELINES:
1. Evaluate across ALL five categories: Security, Scalability, Performance, Cost, Maintainability.
2. Provide AT LEAST 3 important, high-impact architectural findings based on the actual components, data flows, and infrastructure described in the documents. If the architecture is minimal, provide at least 1-2 essential findings.
3. Realistic Production Scoring: No score (category or overall) should ever be 100. The maximum score ceiling is 96, reflecting continuous optimization opportunities in real-world cloud systems.
4. Be specific - reference actual components, services, databases, queues, or patterns from the documents.
5. Provide actionable recommendations, not generic advice.
6. Keep explanations direct and punchy (no filler text or verbose boilerplate).
7. Critical findings = architecture-breaking issues that need immediate attention.
8. High findings = significant issues that should be addressed before production.
9. Medium findings = improvements that should be planned.
10. Low findings = nice-to-have improvements.
11. Generate 3-5 relevant follow-up questions specific to this architecture.

KNOWLEDGE BASE CONTEXT:
Use the provided knowledge base entries to validate findings against industry best practices.
Reference specific frameworks (AWS Well-Architected, OWASP, etc.) when applicable.`;

/**
 * Build the user message for review generation
 */
const formatArchitectureSummary = (architectureData = {}) => {
  const fields = [
    ['Microservices', architectureData.microservices],
    ['Dependencies', architectureData.dependencies],
    ['Patterns', architectureData.patterns],
    ['Technology Stack', architectureData.technologyStack],
  ];

  const lines = [];
  for (const [label, value] of fields) {
    if (Array.isArray(value) && value.length > 0) {
      lines.push(`${label}: ${value.join(', ')}`);
    }
  }

  return lines.length > 0 ? lines.join('\n') : 'No structured architecture summary was extracted.';
};

export const buildReviewUserMessage = (documentChunks, kbEntries, ruleFindings = [], architectureData = {}) => {
  let message = '## Architecture Documents\n\n';

  for (const [index, chunk] of documentChunks.entries()) {
    const source = chunk.metadata?.source || `Document-${index + 1}`;
    const section = chunk.metadata?.section || '';
    message += `### Source: DOC-${index + 1} | ${source}${section ? ` | Section: ${section}` : ''}\n`;
    const maxLen = chunk.content?.length > 1000 ? 16000 : 1000;
    const safeContent = guardrailService.sanitizeText(chunk.content, { maxLength: maxLen });
    message += safeContent + '\n\n';
  }

  if (!documentChunks || documentChunks.length === 0) {
    message += '### Structured Architecture Summary\n';
    message += formatArchitectureSummary(architectureData) + '\n\n';
  }

  if (kbEntries.length > 0) {
    message += '## Knowledge Base Reference\n\n';
    for (const [index, entry] of kbEntries.entries()) {
      const safeTitle = guardrailService.sanitizeText(entry.title, { maxLength: 120 });
      const safeCategory = guardrailService.sanitizeText(entry.category, { maxLength: 80 });
      const safeDescription = guardrailService.sanitizeText(entry.description, { maxLength: 1000 });
      message += `### KB-${index + 1} | ${safeTitle} (${safeCategory})\n`;
      message += safeDescription + '\n';
      if (entry.bestPractices?.length) {
        message += `Best Practices: ${entry.bestPractices.map((item) => guardrailService.sanitizeText(item, { maxLength: 200 })).join('; ')}\n`;
      }
      if (entry.antiPatterns?.length) {
        message += `Anti-Patterns: ${entry.antiPatterns.map((item) => guardrailService.sanitizeText(item, { maxLength: 200 })).join('; ')}\n`;
      }
      message += '\n';
    }
  }

  if (ruleFindings.length > 0) {
    message += '## Deterministic Guardrail Findings\n\n';
    for (const finding of ruleFindings) {
      message += `- [${finding.status}] ${finding.rule}: ${guardrailService.sanitizeText(finding.explanation, { maxLength: 400 })}\n`;
    }
    message += '\n';
  }

  message += '\nPlease generate a comprehensive architecture review based on the above documents and knowledge base context.';

  return message;
};

export default { reviewSystemPrompt, buildReviewUserMessage };
