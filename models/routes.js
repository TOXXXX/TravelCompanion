import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const RouteSchema = new Schema(
  {
    uid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    routeName: { type: String, required: true },
    routeDesc: { type: String },
    tripDuration: { type: Number },
    origin: {
      name: { type: String, required: true },
      coordinates: {
        type: [Number],
        required: true
      },
      description: { type: String }
    },
    destination: {
      name: { type: String, required: true },
      coordinates: {
        type: [Number],
        required: true
      },
      description: { type: String }
    },
    routeType: { type: String, required: true },
    mapDataUrl: { type: String, required: true }
  },
  { timestamps: true }
);

export default model('Route', RouteSchema);

