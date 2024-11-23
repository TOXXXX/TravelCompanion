import { Schema, model } from "mongoose";

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

export default model("User", UserSchema);
