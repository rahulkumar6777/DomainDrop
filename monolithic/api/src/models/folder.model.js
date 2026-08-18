import mongoose from "mongoose";

const normalizeFolderName = (name) =>
  name.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");

const folderSchema = new mongoose.Schema(
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
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
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

folderSchema.pre("validate", function normalizeName() {
  if (typeof this.name === "string") {
    this.name = this.name.trim().replace(/\s+/g, " ");
    this.normalizedName = normalizeFolderName(this.name);
  }

  if (this.parentId && this._id.equals(this.parentId)) {
    this.invalidate("parentId", "A folder cannot be its own parent");
  }

  if (this.isDefault && this.parentId) {
    this.invalidate("parentId", "The default folder must be a root folder");
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
    update.$set.normalizedName = normalizeFolderName(name);
    return;
  }

  update.name = name;
  update.normalizedName = normalizeFolderName(name);
}

folderSchema.pre("findOneAndUpdate", normalizeUpdatedName);
folderSchema.pre("updateOne", normalizeUpdatedName);

folderSchema.index(
  { userId: 1, parentId: 1, normalizedName: 1 },
  { unique: true },
);
folderSchema.index({ userId: 1, parentId: 1, createdAt: -1 });
folderSchema.index(
  { userId: 1, isDefault: 1 },
  {
    unique: true,
    partialFilterExpression: { isDefault: true },
  },
);

export const Folder = mongoose.models.Folder || mongoose.model("Folder", folderSchema);
