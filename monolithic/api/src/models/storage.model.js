import mongoose from "mongoose";

const storageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // MinIO bucket
    bucket: {
      name: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      provider: {
        type: String,
        enum: ["minio"],
        default: "minio",
      },
    },

    // Bucket access policy
    policy: {
      type: {
        type: String,
        enum: ["private", "public-read", "custom"],
        default: "private",
      },

      // Custom MinIO policy JSON
      rules: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    // Custom domain configuration
    // customDomain: {
    //   domain: {
    //     type: String,
    //     lowercase: true,
    //     trim: true,
    //     default: null,
    //   },

    //   verified: {
    //     type: Boolean,
    //     default: false,
    //   },

    //   verificationToken: {
    //     type: String,
    //     default: null,
    //   },

    //   ssl: {
    //     enabled: {
    //       type: Boolean,
    //       default: false,
    //     },

    //     status: {
    //       type: String,
    //       enum: ["pending", "active", "failed"],
    //       default: "pending",
    //     },
    //   },

    //   status: {
    //     type: String,
    //     enum: ["pending", "active", "disabled"],
    //     default: "pending",
    //   },
    // },  // later we can add custom domain support if needed

    // Storage usage
    usage: {
      objects: {
        type: Number,
        default: 0,
      },

      bytes: {
        type: Number,
        default: 0,
      },
    },

    // Storage limits from user's plan
    quota: {
      maxBytes: {
        type: Number,
        default: 0,
      },

      maxObjects: {
        type: Number,
        default: 0,
      },

      maxFileSize: {
        type: Number,
        default: 209715200,
      },
    },

    status: {
      type: String,
      enum: ["provisioning", "active", "suspended", "error"],
      default: "provisioning",
    },
  },
  {
    timestamps: true,
  }
);

storageSchema.index({ "bucket.name": 1, userId: 1 }, { unique: true });

export const Storage = mongoose.model("Storage", storageSchema);