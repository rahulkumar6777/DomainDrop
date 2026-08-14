import mongoose from 'mongoose';

const folderschema = new mongoose.Schema({
  foldername: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: "default Folder"
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

folderschema.index({ foldername: 1, userid: 1 }, { unique: true });

const Folder = mongoose.model('Folder', folderschema);

export { Folder };
