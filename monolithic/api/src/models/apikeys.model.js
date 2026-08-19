import mongoose from "mongoose";

export const API_KEY_SCOPES = Object.freeze([
  "files:read",
  "files:write",
  "spaces:read",
  "spaces:write",
  "storage:read",
  "policy:write",
]);

export const DEFAULT_API_KEY_SCOPES = Object.freeze([...API_KEY_SCOPES]);

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      default: "Default key",
    },
    keyPrefix: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
      immutable: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      select: false,
      lowercase: true,
      match: [/^[a-f0-9]{64}$/, "Invalid API key hash"],
    },
    scopes: {
      type: [String],
      enum: API_KEY_SCOPES,
      default: () => [...DEFAULT_API_KEY_SCOPES],
      validate: {
        validator: (scopes) =>
          Array.isArray(scopes) &&
          scopes.length > 0 &&
          new Set(scopes).size === scopes.length,
        message: "API key must have at least one unique scope",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "revoked"],
      default: "active",
      required: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
      transform: (_document, result) => {
        delete result.keyHash;
        return result;
      },
    },
  },
);

apiKeySchema.pre("validate", function setRevokedAt() {
  if (this.status === "revoked" && !this.revokedAt) {
    this.revokedAt = new Date();
  }
});

apiKeySchema.methods.isUsable = function isUsable(at = new Date()) {
  return (
    this.status === "active" && (!this.expiresAt || this.expiresAt > at)
  );
};

apiKeySchema.methods.hasScope = function hasScope(scope, at = new Date()) {
  return this.isUsable(at) && this.scopes.includes(scope);
};

apiKeySchema.index({ keyPrefix: 1 });
apiKeySchema.index({ userId: 1, status: 1, createdAt: -1 });

export const ApiKey = mongoose.models.ApiKey || mongoose.model("ApiKey", apiKeySchema);
