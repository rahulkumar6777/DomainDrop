import mongoose from "mongoose";
import {
  STORAGE_CORS_LIMITS,
  STORAGE_CORS_METHODS,
  createDefaultStorageCorsConfiguration,
} from "../constant/storageCors.js";

export const STORAGE_VISIBILITIES = Object.freeze(["private", "public-read"]);
export const STORAGE_STATUSES = Object.freeze([
  "provisioning",
  "active",
  "suspended",
  "error",
  "deleting",
]);

const nonNegativeInteger = {
  validator: Number.isSafeInteger,
  message: "Storage counters and limits must be safe integers",
};

const bucketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      immutable: true,
    },
    provider: {
      type: String,
      enum: ["minio"],
      default: "minio",
      required: true,
      immutable: true,
    },
  },
  { _id: false },
);

const policySchema = new mongoose.Schema(
  {
    visibility: {
      type: String,
      enum: STORAGE_VISIBILITIES,
      default: "private",
      required: true,
    },
    appliedVisibility: {
      type: String,
      enum: STORAGE_VISIBILITIES,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "applied", "error"],
      default: "pending",
      required: true,
    },
    appliedAt: {
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
  { _id: false },
);

const uniqueValues = {
  validator: (values) => new Set(values.map((value) => value.toLowerCase())).size === values.length,
  message: "CORS values must be unique",
};

const corsRuleSchema = new mongoose.Schema(
  {
    allowedOrigins: {
      type: [{ type: String, trim: true, maxlength: 255 }],
      default: () => [],
      validate: [
        uniqueValues,
        {
          validator: (values) => values.length <= STORAGE_CORS_LIMITS.maxOrigins,
          message: `CORS supports at most ${STORAGE_CORS_LIMITS.maxOrigins} custom origins`,
        },
      ],
    },
    allowedMethods: {
      type: [{ type: String, enum: STORAGE_CORS_METHODS }],
      default: () => ["GET", "HEAD", "PUT"],
      validate: [
        uniqueValues,
        {
          validator: (values) => values.length > 0,
          message: "CORS requires at least one allowed method",
        },
      ],
    },
    allowedHeaders: {
      type: [{ type: String, trim: true, maxlength: 128 }],
      default: () => ["*"],
      validate: [
        uniqueValues,
        {
          validator: (values) => values.length <= STORAGE_CORS_LIMITS.maxHeaders,
          message: `CORS supports at most ${STORAGE_CORS_LIMITS.maxHeaders} allowed headers`,
        },
      ],
    },
    exposeHeaders: {
      type: [{ type: String, trim: true, maxlength: 128 }],
      default: () => ["ETag"],
      validate: [
        uniqueValues,
        {
          validator: (values) => values.length <= STORAGE_CORS_LIMITS.maxHeaders,
          message: `CORS supports at most ${STORAGE_CORS_LIMITS.maxHeaders} exposed headers`,
        },
      ],
    },
    maxAgeSeconds: {
      type: Number,
      min: 0,
      max: STORAGE_CORS_LIMITS.maxAgeSeconds,
      validate: nonNegativeInteger,
      default: 3600,
    },
  },
  { _id: false },
);

const corsSchema = new mongoose.Schema(
  {
    configuration: {
      type: corsRuleSchema,
      default: createDefaultStorageCorsConfiguration,
    },
    appliedConfiguration: {
      type: corsRuleSchema,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "applied", "error"],
      default: "pending",
      required: true,
    },
    appliedAt: {
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
  { _id: false },
);

const usageSchema = new mongoose.Schema(
  {
    objects: {
      type: Number,
      default: 0,
      min: 0,
      validate: nonNegativeInteger,
    },
    bytes: {
      type: Number,
      default: 0,
      min: 0,
      validate: nonNegativeInteger,
    },
    reservedObjects: {
      type: Number,
      default: 0,
      min: 0,
      validate: nonNegativeInteger,
    },
    reservedBytes: {
      type: Number,
      default: 0,
      min: 0,
      validate: nonNegativeInteger,
    },
    lastReconciledAt: {
      type: Date,
      default: null,
    },
    appliedEvents: {
      type: [String],
      default: () => [],
      select: false,
    },
  },
  { _id: false },
);

const quotaSchema = new mongoose.Schema(
  {
    maxBytes: {
      type: Number,
      required: true,
      min: 0,
      validate: nonNegativeInteger,
    },
    maxObjects: {
      type: Number,
      required: true,
      min: 0,
      validate: nonNegativeInteger,
    },
    maxFileSize: {
      type: Number,
      required: true,
      min: 1,
      validate: nonNegativeInteger,
    },
  },
  { _id: false },
);

const storageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },
    bucket: {
      type: bucketSchema,
      required: true,
    },
    policy: {
      type: policySchema,
      default: () => ({}),
    },
    cors: {
      type: corsSchema,
      default: () => ({}),
    },
    usage: {
      type: usageSchema,
      default: () => ({}),
    },
    quota: {
      type: quotaSchema,
      required: true,
    },
    status: {
      type: String,
      enum: STORAGE_STATUSES,
      default: "provisioning",
      required: true,
    },
    provisioningError: {
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

storageSchema.index({ status: 1, updatedAt: 1 });

export const Storage = mongoose.models.Storage || mongoose.model("Storage", storageSchema);
