import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitor extends Document {
  ip: string; // Anonymized IP for privacy
  originalIP?: string; // Original IP for security (optional)
  userAgent?: string;
  path: string;
  method: string;
  timestamp: Date;
  country?: string;
  city?: string;
  region?: string;
  referrer?: string;
}

const VisitorSchema: Schema = new Schema({
  ip: { type: String, required: true, index: true }, // Anonymized IP
  originalIP: { type: String }, // Original IP (for security logs if needed)
  userAgent: { type: String },
  path: { type: String, required: true },
  method: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  country: { type: String },
  city: { type: String },
  region: { type: String },
  referrer: { type: String },
}, {
  timestamps: true,
});

// Compound index for efficient queries
VisitorSchema.index({ ip: 1, timestamp: -1 });
VisitorSchema.index({ path: 1, timestamp: -1 });

export default mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema);