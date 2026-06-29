import logger from '../utils/logger.js';

class ScoringEngine {
  constructor() {
    this.deductionRules = {
      Critical: 15,
      High: 10,
      Medium: 5,
      Low: 2,
    };

    this.weights = {
      security: 0.25,
      scalability: 0.20,
      performance: 0.20,
      cost: 0.15,
      maintainability: 0.20,
    };
  }

  /**
   * Calculate scores from review findings (deterministic fallback)
   */
  calculateScores(findings) {
    const categories = ['Security', 'Scalability', 'Performance', 'Cost', 'Maintainability'];
    const scores = {};

    for (const category of categories) {
      const categoryFindings = findings.filter((f) => f.category === category);
      const result = this._scoreCategory(category, categoryFindings);
      scores[category.toLowerCase()] = result;
    }

    // Calculate weighted overall
    const overallScore = Math.round(
      Object.entries(scores).reduce((sum, [cat, data]) => {
        return sum + data.score * (this.weights[cat] || 0.20);
      }, 0)
    );

    scores.overall = {
      score: overallScore,
      reasoning: this._buildOverallReasoning(scores),
      deductions: [],
    };

    logger.info('Scores calculated', {
      overall: overallScore,
      categories: Object.fromEntries(
        Object.entries(scores).map(([k, v]) => [k, v.score])
      ),
    });

    return scores;
  }

  _scoreCategory(category, findings) {
    let score = 100;
    const deductions = [];

    for (const finding of findings) {
      const severity = finding.severity ? finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1).toLowerCase() : 'Medium';
      const points = this.deductionRules[severity] || 0;
      score = Math.max(0, score - points);
      deductions.push({
        issue: finding.issue,
        severity: finding.severity,
        points,
      });
    }

    const reasoning = deductions.length > 0
      ? `${category} score: ${score}/100. ${deductions.length} issues found. ` +
        deductions.map((d) => `${d.severity} issue "${d.issue}" (-${d.points} pts)`).join('. ') + '.'
      : `${category} score: 100/100. No issues identified in this category.`;

    return { score, reasoning, deductions };
  }

  _buildOverallReasoning(scores) {
    const parts = Object.entries(scores)
      .filter(([k]) => k !== 'overall')
      .map(([cat, data]) => `${cat}: ${data.score}/100 (weight: ${this.weights[cat] * 100}%)`);

    return `Overall architecture score calculated as weighted average. ${parts.join(', ')}.`;
  }

  /**
   * Merge AI-generated scores with deterministic calculation
   * Uses AI scores if available, falls back to deterministic
   */
  mergeScores(aiScores, deterministicScores) {
    if (!aiScores) return deterministicScores;

    const merged = {};
    const categories = ['security', 'scalability', 'performance', 'cost', 'maintainability', 'overall'];

    for (const cat of categories) {
      merged[cat] = {
        score: aiScores[cat]?.score ?? deterministicScores[cat]?.score ?? 100,
        reasoning: aiScores[cat]?.reasoning ?? deterministicScores[cat]?.reasoning ?? '',
        deductions: aiScores[cat]?.deductions ?? deterministicScores[cat]?.deductions ?? [],
      };
    }

    return merged;
  }
}

export default new ScoringEngine();
