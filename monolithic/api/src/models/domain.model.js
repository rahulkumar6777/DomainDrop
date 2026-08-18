import mongoose from "mongoose";

const domainSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 253,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "failed"],
      default: "pending",
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
);

domainSchema.index({ status: 1, updatedAt: 1 });

export const Domain = mongoose.models.Domain || mongoose.model("Domain", domainSchema);
