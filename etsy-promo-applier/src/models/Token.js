import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, 'Please provide a token'],
    unique: true,
    trim: true,
  },
  promoCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromoCode',
    required: [true, 'Please provide a promo code ID'],
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration: 7 days from creation
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
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

// Index for faster queries and to enforce uniqueness
TokenSchema.index({ token: 1 }, { unique: true });
TokenSchema.index({ promoCodeId: 1 });
TokenSchema.index({ isUsed: 1 });
TokenSchema.index({ expiresAt: 1 });

export default mongoose.models.Token || mongoose.model('Token', TokenSchema);
