import mongoose from 'mongoose';

const TokenEventSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['processing', 'success', 'error'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  promoCode: {
    type: String,
    default: null,
  },
  errorCode: {
    type: String,
    default: null,
  },
  errorDetails: {
    type: String,
    default: null,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  }
});

// Index for faster queries
TokenEventSchema.index({ token: 1 });
TokenEventSchema.index({ timestamp: -1 }); // For sorting by most recent
TokenEventSchema.index({ status: 1 });

export default mongoose.models.TokenEvent || mongoose.model('TokenEvent', TokenEventSchema);
