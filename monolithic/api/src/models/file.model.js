import mongoose from 'mongoose'

const fileschema = new mongoose.Schema({
    originalfilename: {
        type: String,
    },
    type: {
        type: String
    },
    size: {
        type: Number
    },
    folderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })


fileschema.index({ folderid: 1, owner: 1 }, { unique: true })

export const File = mongoose.model("File", fileschema)