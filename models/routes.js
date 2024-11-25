import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const RouteSchema = new Schema({
  uid: { type: String, required: true },
  postID: { type: String, required: true },
  routes: { type: mongoose.Schema.Types.Mixed, required: true }
});

export default model("Route", RouteSchema);
