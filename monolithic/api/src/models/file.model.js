import mongoose from 'mongoose'

const fileschema = new mongoose.Schema({
    originalfilename: {
        type: String,
    },
    type: {
        type: String
    },
    objectKey: {
        type: String,
        required: true,
    },
    size: {
        type: Number
    },
    folderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        index: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })


fileschema.index({ folderid: 1, owner: 1, createdAt: -1, })

export const File = mongoose.model("File", fileschema)