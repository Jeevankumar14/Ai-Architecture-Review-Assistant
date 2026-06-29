import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ['light'],
      default: 'light',
    },
    reviewDepth: {
      type: String,
      enum: ['standard', 'deep', 'quick'],
      default: 'standard',
    },
    scoringMode: {
      type: String,
      enum: ['strict', 'balanced', 'lenient'],
      default: 'balanced',
    },
    notifications: {
      email: { type: Boolean, default: true },
      reviewComplete: { type: Boolean, default: true },
    },
    maxTokensPerRequest: {
      type: Number,
      default: 4096,
      min: 512,
      max: 8192,
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
