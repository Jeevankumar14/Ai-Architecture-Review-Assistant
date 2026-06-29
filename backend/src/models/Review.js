import mongoose from 'mongoose';

const findingSchema = new mongoose.Schema(
  {
    issue: { type: String, required: true },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: true,
    },
    category: {
      type: String,
      enum: ['Security', 'Scalability', 'Performance', 'Cost', 'Maintainability'],
      required: true,
    },
    explanation: { type: String, required: true },
    recommendation: { type: String, required: true },
  },
  { _id: false }
);

const scoreDetailSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    reasoning: { type: String, required: true },
    deductions: [
      {
        issue: String,
        severity: String,
        points: Number,
      },
    ],
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scores: {
      overall: { type: scoreDetailSchema, required: true },
      security: { type: scoreDetailSchema, required: true },
      scalability: { type: scoreDetailSchema, required: true },
      performance: { type: scoreDetailSchema, required: true },
      cost: { type: scoreDetailSchema, required: true },
      maintainability: { type: scoreDetailSchema, required: true },
    },
    executiveSummary: {
      type: String,
      required: true,
    },
    insights: [
      {
        insightType: { type: String, enum: ['Critical Insight', 'Optimization', 'Best Practice'] },
        component: String,
        description: String,
      }
    ],
    findings: [findingSchema],
    deterministicFindings: [
      {
        rule: String,
        status: { type: String, enum: ['Pass', 'Fail'] },
        explanation: String,
      },
    ],
    criticalRisks: [String],
    recommendations: [String],
    suggestedQuestions: [String],
    documentsAnalyzed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
    },
    generationTime: Number, // milliseconds
    tokensUsed: Number,
    generatedBy: {
      type: String,
      default: 'gemini-2.5-flash',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ projectId: 1, generatedAt: -1 });
reviewSchema.index({ userId: 1, generatedAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
