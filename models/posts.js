import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const PostSchema = new Schema({
  uid: { type: String, required: true },
  isPlan: { type: Boolean, required: true },
  intendedTime: {
    type: [{ type: Date }],
    validate: {
      validator: (v) => v.length === 0 || v.length === 2, // Must be 0 or 2 dates
      message: "intendedTime must contain two dates or be null."
    }
  },
  title: { type: String, required: true },
  intro: { type: String },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  created: { type: Date, default: Date.now },
  lastEdited: { type: Date, default: Date.now },
  comments: { type: [String], default: [] },
  likeByUsers: { type: [String], default: [] }
});

export default model("Post", PostSchema);
