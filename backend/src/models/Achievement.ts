import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string; // Reference to achievement definition
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlockedAt?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    achievementId: {
      type: String,
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
    unlockedAt: { type: Number, default: undefined },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one achievement per user per achievementId
AchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);

