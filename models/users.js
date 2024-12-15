import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const UserSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountCreated: { type: Date, default: Date.now },
  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  posts: { type: [String], default: [] },
  personalPageComments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Comment" }
  ],
  profilePicture: { type: String, default: "/default-profile.svg" },
  bio: { type: String, default: "This user has not set a bio yet." },
  role: { type: String, default: "User" },
  isHidden: { type: Boolean, default: false, required: true }
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default model("User", UserSchema);
