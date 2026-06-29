import Review from '../models/Review.js';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import vectorSearchService from './vectorSearchService.js';
import reviewService from './ai/reviewService.js';
import ruleEngine from './ruleEngine.js';
import scoringEngine from './scoringEngine.js';
import { reviewSystemPrompt, buildReviewUserMessage } from '../prompts/reviewPrompt.js';
import { scoringSystemPrompt, buildScoringUserMessage } from '../prompts/scoringPrompt.js';
import logger from '../utils/logger.js';

class ReviewEngine {
  /**
   * Main entry point for generating a comprehensive architecture review
   */
  async generateReview(projectId, userId, documentIds, architectureData = {}) {
    logger.info('Starting review generation pipeline', { projectId });
    const startTime = Date.now();

    try {
      // 0. Execute Deterministic Checks First
      const ruleFindings = ruleEngine.executeChecks(architectureData);

      // 1. Create a placeholder review record
      const review = await Review.create({
        projectId,
        userId,
        status: 'generating',
        generatedBy: 'gemini-2.5-flash',
        scores: {
          overall: { score: 0, reasoning: 'Generating...' },
          security: { score: 0, reasoning: 'Generating...', deductions: [] },
          scalability: { score: 0, reasoning: 'Generating...', deductions: [] },
          performance: { score: 0, reasoning: 'Generating...', deductions: [] },
          cost: { score: 0, reasoning: 'Generating...', deductions: [] },
          maintainability: { score: 0, reasoning: 'Generating...', deductions: [] },
        },
        executiveSummary: 'Generating review...',
        findings: [],
        deterministicFindings: ruleFindings, // Attach rule engine results
      });

      // 2. Retrieve all document chunks for this project
      const allChunks = await vectorSearchService.searchDocumentChunks('', projectId, 100);

      // 3. Retrieve relevant knowledge base entries based on document content
      // We take a sampling of the text to find relevant patterns
      const sampleText = allChunks.slice(0, 5).map(c => c.content).join(' ');
      const kbEntries = sampleText ? await vectorSearchService.searchKnowledgeBase(sampleText, null, 15) : [];

      // 4. Generate review using Groq DeepSeek R1
      // We pass the deterministic findings so the LLM can explain them!
      const userMessage = buildReviewUserMessage(allChunks, kbEntries, ruleFindings);
      const reviewResponse = await reviewService.generateArchitectureReview(
        [{ role: 'user', content: userMessage }],
        reviewSystemPrompt,
        8192
      );

      // 5. Parse the LLM JSON response
      let reviewData = {};
      try {
        reviewData = JSON.parse(reviewResponse.content);
      } catch (err) {
        logger.error('Failed to parse DeepSeek JSON response', { response: reviewResponse.content });
        throw new Error('LLM did not return a valid JSON object.');
      }

      // 6. Calculate scores (deterministic based on ALL findings)
      const normalizedFindings = (reviewData.findings || []).map(f => ({
        ...f,
        severity: f.severity ? f.severity.charAt(0).toUpperCase() + f.severity.slice(1).toLowerCase() : 'Medium',
        category: f.category ? f.category.charAt(0).toUpperCase() + f.category.slice(1).toLowerCase() : 'Maintainability'
      }));
      const allFindings = [...normalizedFindings, ...ruleFindings];
      const deterministicScores = scoringEngine.calculateScores(allFindings);

      // 7. Get AI-generated scores for richer reasoning via DeepSeek
      let aiScores = null;
      try {
        const scoringMessage = buildScoringUserMessage(allFindings);
        const scoringResponse = await reviewService.generateArchitectureReview(
          [{ role: 'user', content: scoringMessage }],
          scoringSystemPrompt,
          4096
        );
        aiScores = JSON.parse(scoringResponse.content);
      } catch (err) {
        logger.warn('Failed to parse DeepSeek scoring response, falling back to deterministic scores.');
      }

      const finalScores = aiScores ? this._mergeScores(deterministicScores, aiScores) : deterministicScores;

      // 8. Update Review Record
      const updatedReview = await Review.findByIdAndUpdate(
        review._id,
        {
          status: 'completed',
          scores: finalScores,
          executiveSummary: reviewData.executiveSummary || 'Review completed.',
          insights: reviewData.insights || [],
          findings: normalizedFindings || [],
          criticalRisks: reviewData.criticalRisks || [],
          recommendations: reviewData.recommendations || [],
          suggestedQuestions: reviewData.suggestedQuestions || [
            "What are the biggest security risks?",
            "How can we reduce infrastructure costs?",
            "Can you explain the load balancing recommendation?"
          ],
          generatedAt: new Date(),
          tokensUsed: reviewResponse.usage?.output_tokens || 0,
        },
        { new: true }
      );

      // 9. Initialize Chat Session for follow-ups
      const chatSession = await this._initializeChatSession(projectId, userId, updatedReview);

      const elapsed = Date.now() - startTime;
      logger.info('Review generation complete', {
        projectId,
        overall: finalScores.overall.score,
        findings: reviewData.findings?.length || 0,
        elapsed: `${elapsed}ms`,
      });

      return { review: updatedReview, chatSession };

    } catch (error) {
      logger.error('Review generation failed', { projectId, error: error.message });
      throw error;
    }
  }

  // Merging and DB Initialization helpers omitted for brevity but remain structurally identical.
  // ...
  _mergeScores(deterministic, aiScores) {
    const merged = { ...deterministic };
    for (const key of Object.keys(merged)) {
      if (aiScores[key] && aiScores[key].reasoning) {
        merged[key].reasoning = aiScores[key].reasoning;
      }
    }
    return merged;
  }

  async _initializeChatSession(projectId, userId, review) {
    const session = await ChatSession.create({
      projectId,
      userId,
      reviewId: review._id,
      title: 'Architecture Review Discussion',
      status: 'active',
    });

    // Create an initial system message containing the review context
    const reviewContext = this._buildReviewContext(review);
    
    await ChatMessage.create({
      sessionId: session._id,
      role: 'system',
      content: reviewContext,
      messageType: 'review',
      modelUsed: 'gemini-2.5-flash'
    });

    return session;
  }

  _buildReviewContext(review) {
    // Builds markdown representation of review
    return `Review Summary: ${review.executiveSummary}`;
  }
}

export default new ReviewEngine();
