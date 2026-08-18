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
  status: {
    type: String,
    default: "pending",
    enum: ['pending', 'active', "banned", "deleted"],
  },
  suspensionEnd: {
    type: Date,
  },
  registrationExpiresAt: {
    type: Date
  }
}, { timestamps: true });


// hash passwrd before save
userschema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});


// compare hash and userEntered Password
userschema.methods.checkpassword = async function (oldpassword) {
  const result1 = await bcrypt.compare(oldpassword, this.password);
  return result1;
};

userschema.index(
  { registrationExpiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: 'pending' },
  }
);


export const User = mongoose.models.User || mongoose.model("User", userschema);
