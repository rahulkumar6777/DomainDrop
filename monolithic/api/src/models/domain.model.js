import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
    domain: {
        type: String,
        required: true,
        unique: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    status: {
        type: String,
        default: "active",
        enum: ['active', 'inactive', 'revoked']
    }
})


domainSchema.index({ domain: 1, userid: 1 }, { unique: true });


export const Domain = mongoose.model('Domain', domainSchema);