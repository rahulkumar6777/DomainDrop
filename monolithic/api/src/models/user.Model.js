import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";

const userschema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscription: {
    type: String,
    default: "free",
    enum: ["free", "starter"],
  },
  subscriptionStart: {
    type: Date,
  },
  subscriptionEnd: {
    type: Date,
  },
  subscriptionId: {
    type: String,
    default: null,
  },
  storageUsed: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "active",
    enum: ['pending', 'active', "banned", "deleted"],
  },
  suspensionEnd: {
    type: Date,
  }
}, { timestamps: true });


// hash passwrd before save
userschema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});


// compare hash and userEntered Password
userschema.methods.checkpassword = async function (oldpassword) {
  const result1 = await bcrypt.compare(oldpassword, this.password);
  return result1;
};


export const User = mongoose.model("User", userschema);
