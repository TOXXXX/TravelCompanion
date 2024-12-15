import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
  uid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  created: { type: Date, default: Date.now },
  lastEdited: { type: Date, default: Date.now }
});

export default model("Comment", CommentSchema);
