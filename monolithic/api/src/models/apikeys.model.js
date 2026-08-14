import mongoose from 'mongoose';

const apikeyschema = new mongoose.Schema({
    apikey: {
        type: String,
        required: true,
        unique: true,
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        default: "active",
        enum: ['active', 'inactive', 'revoked']
    }
})

apikeyschema.index({ apikey: 1, userid: 1 }, { unique: true });

export const ApiKey = mongoose.model('ApiKey', apikeyschema);