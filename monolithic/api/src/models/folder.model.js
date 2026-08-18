import mongoose from 'mongoose';

const folderschema = new mongoose.Schema({
  foldername: {
    type: String,
    required: true,
    trim: true
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

const Folder = mongoose.model('Folder', folderschema);

export { Folder };
