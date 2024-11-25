import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true },
  accountCreated: { type: Date, default: Date.now },
  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, unique: true },
  posts: { type: [String], default: [] },
  personalPageComments: { type: [String], default: [] }
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default model("User", UserSchema);
