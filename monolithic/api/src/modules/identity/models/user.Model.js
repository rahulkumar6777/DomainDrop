import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const USER_STATUSES = Object.freeze([
  "pending",
  "provisioning",
  "provisioning_failed",
  "active",
  "banned",
  "deleted",
]);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    subscription: {
      type: String,
      default: "free",
      enum: ["free", "starter"],
      required: true,
    },
    subscriptionStart: {
      type: Date,
      default: null,
    },
    subscriptionEnd: {
      type: Date,
      default: null,
    },
    subscriptionId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "pending",
      enum: USER_STATUSES,
      required: true,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    provisioningError: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
      select: false,
    },
    suspensionEnd: {
      type: Date,
      default: null,
    },
    registrationExpiresAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
      transform: (_document, result) => {
        delete result.password;
        delete result.provisioningError;
        return result;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword() {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.checkpassword = function checkPassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ status: 1, createdAt: -1 });
userSchema.index(
  { registrationExpiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: "pending" },
  },
);

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);
