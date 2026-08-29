import mongoose from "mongoose";

const apiKeyUsageSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
            trim: true,
            match: [
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                "Invalid usage event id",
            ],
        },
        apiKeyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ApiKey",
            required: true,
            immutable: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            immutable: true,
        },
        ipAddress: {
            type: String,
            trim: true,
            maxlength: 64,
            default: null,
        },
        method: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            maxlength: 10,
        },
        endpoint: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
        statusCode: {
            type: Number,
            required: true,
            min: 100,
            max: 599,
        },
        durationMs: {
            type: Number,
            required: true,
            min: 0,
        },
        timestamp: {
            type: Date,
            required: true,
            immutable: true,
        },
    },
    {
        versionKey: false,
    },
);

apiKeyUsageSchema.index({ apiKeyId: 1, timestamp: -1 });
apiKeyUsageSchema.index({ userId: 1, timestamp: -1 });
apiKeyUsageSchema.index({ apiKeyId: 1, endpoint: 1, timestamp: -1 });

export const ApiKeyUsage = mongoose.models.ApiKeyUsage || mongoose.model("ApiKeyUsage", apiKeyUsageSchema);

