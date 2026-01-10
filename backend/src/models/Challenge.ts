import mongoose, { Document, Schema } from 'mongoose';

export interface IChallenge extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'daily' | 'weekly' | 'special';
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  reward: number;
  expiresAt: number;
  completed: boolean;
  claimed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'special'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🎯' },
    target: { type: Number, required: true },
    current: { type: Number, default: 0 },
    reward: { type: Number, required: true },
    expiresAt: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for querying active challenges
ChallengeSchema.index({ userId: 1, expiresAt: 1 });
ChallengeSchema.index({ userId: 1, completed: 1, claimed: 1 });

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);

