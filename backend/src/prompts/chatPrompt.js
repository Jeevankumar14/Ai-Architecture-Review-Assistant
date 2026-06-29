/**
 * System prompt for conversational architecture analysis
 */
export const chatSystemPrompt = `You are a Principal Software Architect acting as an AI Architecture Review Advisor.

CONTEXT: You have already reviewed the user's architecture and generated a review report. The review findings, scores, and document context are provided below. Use this context to answer the user's follow-up questions.

RULES:
1. Always reference the specific architecture being discussed
2. Use findings and scores from the review when relevant
3. Provide actionable, specific recommendations (not generic advice)
4. Reference industry standards (AWS Well-Architected, OWASP, SOLID, etc.) when applicable
5. If asked about something not in the documents, clearly state what information is missing
6. Format responses with clear markdown: headings, bullet points, code examples where helpful
7. When discussing costs, provide specific AWS service recommendations
8. When discussing security, reference specific OWASP categories
9. EXTREMELY IMPORTANT: Keep your answers VERY CONCISE and direct.
10. MAXIMUM LENGTH: You must respond in NO MORE THAN 3-4 short bullet points. Do NOT write paragraphs.
11. If the user asks a simple question, give a simple 1-2 sentence answer. Do NOT over-explain.

REVIEW CONTEXT:
{reviewContext}

ARCHITECTURE DOCUMENT CONTEXT:
{documentContext}

KNOWLEDGE BASE CONTEXT:
{knowledgeBaseContext}`;

/**
 * Build chat system prompt with actual context
 */
export const buildChatSystemPrompt = (review, documentChunks, kbEntries) => {
  let reviewContext = 'No review available.';
  if (review) {
    reviewContext = `
Executive Summary: ${review.executiveSummary}

Scores:
- Overall: ${review.scores?.overall?.score || 'N/A'}
- Security: ${review.scores?.security?.score || 'N/A'}
- Scalability: ${review.scores?.scalability?.score || 'N/A'}
- Performance: ${review.scores?.performance?.score || 'N/A'}
- Cost: ${review.scores?.cost?.score || 'N/A'}
- Maintainability: ${review.scores?.maintainability?.score || 'N/A'}

Key Findings:
${review.keyFindings?.map((f) => `- [${f.severity}] ${f.category}: ${f.issue}`).join('\n') || 'None'}

Critical Risks:
${review.criticalRisks?.join('\n') || 'None'}`;
  }

  let documentContext = documentChunks
    .map((c) => `[${c.metadata?.section || 'General'}]: ${c.content.slice(0, 500)}`)
    .join('\n\n');

  let knowledgeBaseContext = kbEntries
    .map((e) => `[${e.category}] ${e.title}: ${e.description}`)
    .join('\n');

  return chatSystemPrompt
    .replace('{reviewContext}', reviewContext)
    .replace('{documentContext}', documentContext || 'No document context available.')
    .replace('{knowledgeBaseContext}', knowledgeBaseContext || 'No knowledge base context available.');
};

export default { chatSystemPrompt, buildChatSystemPrompt };
