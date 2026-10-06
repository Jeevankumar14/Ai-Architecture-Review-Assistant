import logger from '../utils/logger.js';

class ScoringEngine {
  constructor() {
    this.deductionRules = {
      Critical: 30, // Large penalty for critical security / architectural flaws
      High: 18,     // Meaningful penalty for high severity flaws (e.g. SPOF, unisolated DB)
      Medium: 8,    // Moderate penalty (e.g. missing cache, unencrypted transport)
      Low: 3,       // Minor improvement opportunities
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
      const categoryFindings = findings.filter(
        (f) => (f.category || '').toLowerCase() === category.toLowerCase()
      );
      const result = this._scoreCategory(category, categoryFindings);
      scores[category.toLowerCase()] = result;
    }

    // Calculate weighted overall (capped at 96)
    const overallScore = Math.min(96, Math.round(
      Object.entries(scores).reduce((sum, [cat, data]) => {
        return sum + data.score * (this.weights[cat] || 0.20);
      }, 0)
    ));

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
    // Production ceiling: max score is 96 (no architecture is 100% flawless)
    let score = 96;
    const deductions = [];
    let hasCritical = false;
    let hasHigh = false;

    for (const finding of findings) {
      const severity = finding.severity
        ? finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1).toLowerCase()
        : 'Medium';

      if (severity === 'Critical') hasCritical = true;
      if (severity === 'High') hasHigh = true;

      const points = this.deductionRules[severity] || 0;
      score = Math.max(0, score - points);
      deductions.push({
        issue: finding.issue,
        severity: finding.severity,
        points,
      });
    }

    // Severity Caps: A category with a Critical flaw must not exceed 65; with a High flaw must not exceed 80
    if (hasCritical) {
      score = Math.min(score, 65);
    } else if (hasHigh) {
      score = Math.min(score, 80);
    }

    // Strict ceiling cap
    score = Math.min(96, Math.max(0, score));

    const reasoning = deductions.length > 0
      ? `${category} score: ${score}/100. ${deductions.length} issue(s) identified. ` +
        deductions.map((d) => `${d.severity} issue "${d.issue}" (-${d.points} pts)`).join('. ') + '.'
      : `${category} score: ${score}/100. Strong alignment with architectural standards with minor optimization opportunities remaining.`;

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
   * Uses AI scores if available, falls back to deterministic, with 96 ceiling enforced
   */
  mergeScores(aiScores, deterministicScores) {
    if (!aiScores) return deterministicScores;

    const merged = {};
    const categories = ['security', 'scalability', 'performance', 'cost', 'maintainability', 'overall'];

    for (const cat of categories) {
      const rawScore = aiScores[cat]?.score ?? deterministicScores[cat]?.score ?? 96;
      merged[cat] = {
        score: Math.min(96, Math.max(0, typeof rawScore === 'number' ? rawScore : 96)),
        reasoning: aiScores[cat]?.reasoning ?? deterministicScores[cat]?.reasoning ?? '',
        deductions: aiScores[cat]?.deductions ?? deterministicScores[cat]?.deductions ?? [],
      };
    }

    return merged;
  }
}

export default new ScoringEngine();
