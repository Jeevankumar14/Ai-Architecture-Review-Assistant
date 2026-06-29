/**
 * System prompt for scoring engine
 */
export const scoringSystemPrompt = `You are a Software Architecture Scoring Engine. 
Given a list of architecture findings with severities, calculate precise scores.

SCORING RULES (Starting from 100 for each category):
- Critical Issue: -15 points
- High Issue: -10 points  
- Medium Issue: -5 points
- Low Issue: -2 points

Minimum score is 0. Maximum is 100.

CATEGORIES: Security, Scalability, Performance, Cost, Maintainability

Overall Score = weighted average:
- Security: 25%
- Scalability: 20%
- Performance: 20%
- Cost: 15%
- Maintainability: 20%

You MUST respond with valid JSON (no markdown, no code fences):

{
  "security": {
    "score": <number>,
    "reasoning": "Explanation of score with specific deductions",
    "deductions": [{"issue": "...", "severity": "...", "points": <number>}]
  },
  "scalability": { ... same structure ... },
  "performance": { ... same structure ... },
  "cost": { ... same structure ... },
  "maintainability": { ... same structure ... },
  "overall": {
    "score": <number>,
    "reasoning": "Overall assessment explaining the weighted calculation",
    "deductions": []
  }
}

Every score MUST include clear reasoning explaining why points were deducted.`;

/**
 * Build scoring user message from findings
 */
export const buildScoringUserMessage = (findings) => {
  let message = '## Architecture Findings to Score\n\n';

  for (const finding of findings) {
    message += `- [${finding.severity}] [${finding.category}] ${finding.issue}: ${finding.explanation}\n`;
  }

  message += '\nCalculate architecture scores based on the above findings using the scoring rules.';
  return message;
};

export default { scoringSystemPrompt, buildScoringUserMessage };
