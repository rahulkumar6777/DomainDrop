import mongoose from "mongoose";

const normalizeSpaceName = (name) =>
  name.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");

const spaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      select: false,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    keyPrefix: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      select: false,
      maxlength: 31,
      match: [/^spaces\/[a-f0-9]{24}$/, "Invalid space key prefix"],
    },
    isDefault: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
);

spaceSchema.pre("validate", function prepareSpace() {
  if (typeof this.name === "string") {
    this.name = this.name.trim().replace(/\s+/g, " ");
    this.normalizedName = normalizeSpaceName(this.name);
  }

  if (!this.keyPrefix) {
    this.keyPrefix = `spaces/${this._id}`;
  }
});

function normalizeUpdatedName() {
  const update = this.getUpdate();
  if (!update || Array.isArray(update)) {
    return;
  }

  const suppliedName = update.$set?.name ?? update.name;
  if (typeof suppliedName !== "string") {
    return;
  }

  const name = suppliedName.trim().replace(/\s+/g, " ");
  if (update.$set) {
    update.$set.name = name;
    update.$set.normalizedName = normalizeSpaceName(name);
    return;
  }

  update.name = name;
  update.normalizedName = normalizeSpaceName(name);
}

spaceSchema.pre("findOneAndUpdate", normalizeUpdatedName);
spaceSchema.pre("updateOne", normalizeUpdatedName);

spaceSchema.index({ userId: 1, normalizedName: 1 }, { unique: true });
spaceSchema.index({ userId: 1, createdAt: -1 });
spaceSchema.index(
  { userId: 1, isDefault: 1 },
  {
    unique: true,
    partialFilterExpression: { isDefault: true },
  },
);

export const Space = mongoose.models.Space || mongoose.model("Space", spaceSchema);
