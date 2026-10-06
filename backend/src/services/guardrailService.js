class GuardrailService {
  constructor() {
    this.promptInjectionPatterns = [
      /ignore (all|any|previous) instructions/i,
      /disregard (all|any|the) (previous|above) (instructions|rules|prompts)/i,
      /system prompt/i,
      /developer message/i,
      /reveal (the )?(system prompt|prompt|instructions)/i,
      /follow these instructions/i,
      /you are now/i,
    ];

    this.malwarePatterns = [
      /<script\b/i,
      /javascript:/i,
      /vbscript:/i,
      /powershell/i,
      /cmd\.exe/i,
      /\beval\s*\(/i,
      /autoopen/i,
      /document\.cookie/i,
      /base64,/i,
    ];

    this.piiPatterns = [
      { regex: /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, replacement: '[REDACTED_EMAIL]' },
      { regex: /\b\+?\d[\d\s().-]{7,}\d\b/g, replacement: '[REDACTED_PHONE]' },
      { regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[REDACTED_SSN]' },
      { regex: /\b(?:\d[ -]*?){13,19}\b/g, replacement: '[REDACTED_CARD]' },
    ];
  }

  isAdmin(user) {
    return user?.role === 'admin';
  }

  detectPromptInjection(text) {
    const content = this._toString(text);
    return this.promptInjectionPatterns
      .filter((pattern) => pattern.test(content))
      .map((pattern) => pattern.toString());
  }

  detectMalwareIndicators(text) {
    const content = this._toString(text);
    return this.malwarePatterns
      .filter((pattern) => pattern.test(content))
      .map((pattern) => pattern.toString());
  }

  redactPII(text) {
    let content = this._toString(text);
    for (const rule of this.piiPatterns) {
      content = content.replace(rule.regex, rule.replacement);
    }
    return content;
  }

  sanitizeText(text, { maxLength = 8000 } = {}) {
    let content = this._toString(text);
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    content = this.redactPII(content);

    for (const pattern of this.promptInjectionPatterns) {
      content = content.replace(pattern, '[REDACTED_PROMPT_INSTRUCTION]');
    }

    content = content
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    if (maxLength && content.length > maxLength) {
      content = `${content.slice(0, maxLength).trim()}...`;
    }

    return content;
  }

  sanitizeDocumentsForModel(documents, { maxLength = 4000 } = {}) {
    return (documents || []).map((doc) => ({
      ...doc,
      content: this.sanitizeText(doc.content, { maxLength }),
      metadata: doc.metadata ? { ...doc.metadata } : undefined,
    }));
  }

  assertSafeDocumentText(text, { threshold = 0.35, ocr = false, strict = false } = {}) {
    const content = this._toString(text);
    const malwareHits = this.detectMalwareIndicators(content);
    if (malwareHits.length > 0 && strict) {
      const error = new Error('Potentially malicious content detected in uploaded document');
      error.statusCode = 400;
      error.details = malwareHits;
      throw error;
    }

    if (ocr) {
      const confidence = this.scoreOcrConfidence(content);
      if (confidence < threshold && strict) {
        const error = new Error('OCR confidence too low to safely process the image');
        error.statusCode = 400;
        error.details = { confidence };
        throw error;
      }
    }

    return {
      malwareHits,
      confidence: ocr ? this.scoreOcrConfidence(content) : null,
    };
  }

  scoreOcrConfidence(text) {
    const content = this._toString(text).trim();
    if (!content) return 0;

    const lengthScore = Math.min(content.length / 400, 1);
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const wordScore = Math.min(wordCount / 40, 1);
    const alnumCount = (content.match(/[A-Za-z0-9]/g) || []).length;
    const alnumRatio = alnumCount / content.length;
    const suspiciousPenalty = this.detectPromptInjection(content).length > 0 ? 0.15 : 0;

    const score = (lengthScore * 0.35) + (wordScore * 0.35) + (alnumRatio * 0.30) - suspiciousPenalty;
    return Math.max(0, Math.min(1, score));
  }

  validateReviewOutput(reviewData) {
    const normalized = this.normalizeReviewOutput(reviewData);
    if (!normalized.executiveSummary) {
      const error = new Error('LLM review payload is missing executiveSummary');
      error.statusCode = 502;
      throw error;
    }

    return normalized;
  }

  normalizeReviewOutput(reviewData) {
    const source = reviewData && typeof reviewData === 'object' && !Array.isArray(reviewData)
      ? reviewData
      : {};

    const normalizeArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
    const normalizeString = (value, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback;

    const findings = normalizeArray(source.findings).map((finding) => {
      if (!finding || typeof finding !== 'object' || Array.isArray(finding)) {
        return null;
      }

      const issue = normalizeString(finding.issue, 'Untitled finding');
      const severity = ['Critical', 'High', 'Medium', 'Low'].includes(finding.severity)
        ? finding.severity
        : 'Medium';
      const category = ['Security', 'Scalability', 'Performance', 'Cost', 'Maintainability'].includes(finding.category)
        ? finding.category
        : 'Maintainability';
      const explanation = normalizeString(finding.explanation, issue);
      const recommendation = normalizeString(finding.recommendation, 'Review this area manually and add a targeted fix.');
      const evidence = normalizeArray(finding.evidence).map((item) => normalizeString(item)).filter(Boolean);

      return { issue, severity, category, explanation, recommendation, evidence };
    }).filter(Boolean);

    return {
      executiveSummary: normalizeString(source.executiveSummary, 'Review completed.'),
      insights: normalizeArray(source.insights),
      findings,
      criticalRisks: normalizeArray(source.criticalRisks),
      recommendations: normalizeArray(source.recommendations),
      suggestedQuestions: normalizeArray(source.suggestedQuestions),
    };
  }

  validateAssistantResponse(text) {
    const content = this._toString(text);
    const leakHits = [
      /system prompt/i,
      /developer message/i,
      /ignore previous instructions/i,
      /as an ai language model/i,
    ].filter((pattern) => pattern.test(content));

    if (leakHits.length > 0) {
      const error = new Error('Potential prompt leakage detected in model response');
      error.statusCode = 502;
      error.details = leakHits.map((pattern) => pattern.toString());
      throw error;
    }

    return this.sanitizeText(content, { maxLength: 12000 });
  }

  _toString(text) {
    if (typeof text === 'string') {
      return text;
    }

    if (text === null || text === undefined) {
      return '';
    }

    return String(text);
  }

  /**
   * Safely parse JSON from LLM responses, stripping markdown fences, preambles, and repairing truncation
   */
  safeParseJson(rawContent) {
    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error('LLM response content is empty');
    }

    let cleaned = rawContent.trim();

    // 1. Remove markdown code fences if present (```json ... ``` or ``` ...)
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // 2. Extract substring starting from first '{' or '['
    const firstBrace = cleaned.search(/[{\[]/);
    if (firstBrace !== -1) {
      cleaned = cleaned.slice(firstBrace);
    }

    // 3. Try standard JSON.parse first
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      // 4. Try lenient fixes: remove trailing commas before } or ] and strip control chars
      try {
        const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
        let sub = lastBrace !== -1 ? cleaned.slice(0, lastBrace + 1) : cleaned;
        const fixed = sub
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ');
        return JSON.parse(fixed);
      } catch (err2) {
        // 5. Try automatic truncation repair (close open quotes and balance brackets)
        try {
          const repaired = this._repairTruncatedJson(cleaned);
          return JSON.parse(repaired);
        } catch (err3) {
          throw new Error(`LLM did not return a valid JSON object: ${err.message}`);
        }
      }
    }
  }

  _repairTruncatedJson(jsonStr) {
    let str = jsonStr.trim();
    let inString = false;
    let escaped = false;
    const stack = [];

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '\\' && inString) {
        escaped = !escaped;
        continue;
      }
      if (char === '"' && !escaped) {
        inString = !inString;
      } else if (!inString) {
        if (char === '{' || char === '[') {
          stack.push(char);
        } else if (char === '}') {
          if (stack[stack.length - 1] === '{') stack.pop();
        } else if (char === ']') {
          if (stack[stack.length - 1] === '[') stack.pop();
        }
      }
      escaped = false;
    }

    // Close open string
    if (inString) {
      str += '"';
    }

    // Remove any trailing commas or dangling colon
    str = str.replace(/,\s*$/, '').replace(/:\s*$/, ': null');

    // Close remaining open brackets in reverse order
    while (stack.length > 0) {
      const open = stack.pop();
      str += (open === '{' ? '}' : ']');
    }

    return str;
  }
}

export default new GuardrailService();