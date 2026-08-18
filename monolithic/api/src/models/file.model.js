import mongoose from "mongoose";

export const FILE_STATUSES = Object.freeze([
    "pending",
    "ready",
    "deleting",
    "failed",
]);

const fileSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1024,
        },
        mimeType: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            default: "application/octet-stream",
        },
        objectKey: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1024,
            immutable: true,
        },
        size: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isSafeInteger,
                message: "File size must be a safe integer",
            },
        },
        etag: {
            type: String,
            trim: true,
            default: null,
        },
        checksumSha256: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^[a-f0-9]{64}$/, "Invalid SHA-256 checksum"],
            default: null,
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            required: true,
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            immutable: true,
        },
        status: {
            type: String,
            enum: FILE_STATUSES,
            default: "pending",
            required: true,
        },
        uploadedAt: {
            type: Date,
            default: null,
        },
        failureReason: {
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

// An object key only needs to be unique inside its owner's isolated bucket.
fileSchema.index({ ownerId: 1, objectKey: 1 }, { unique: true });
fileSchema.index({ ownerId: 1, folderId: 1, createdAt: -1 });
fileSchema.index({ ownerId: 1, status: 1, createdAt: -1 });

export const File = mongoose.models.File || mongoose.model("File", fileSchema);
