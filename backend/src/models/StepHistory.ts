import mongoose, { Document, Schema } from 'mongoose';

export interface IStepHistory extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format
  steps: number;
  calories?: number;
  distance?: number; // in km
  createdAt: Date;
  updatedAt: Date;
}

const StepHistorySchema = new Schema<IStepHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    steps: { type: Number, default: 0, min: 0 },
    calories: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one entry per user per date
StepHistorySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IStepHistory>('StepHistory', StepHistorySchema);

