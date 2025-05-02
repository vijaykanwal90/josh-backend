import mongoose from 'mongoose';
const PrivacySchema = new mongoose.Schema({
    content: String,
    renderedContent: String,
    contentType: {
      type: String,
      enum: ['disclaimer', 'refund', 'license', 'terms'],
      required: true
    }
  }, { timestamps: true }); // Automatically adds and updates createdAt & updatedAt
export const Privacy = mongoose.model('Privacy', PrivacySchema);
