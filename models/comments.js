import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
  uid: { type: String, required: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  postId: { type: String, default: null },
  created: { type: Date, default: Date.now },
  lastEdited: { type: Date, default: Date.now }
});

export default model("Comment", CommentSchema);
