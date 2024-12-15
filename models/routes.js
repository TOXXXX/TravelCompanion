import { Schema, model } from "mongoose";

const RouteSchema = new Schema(
  {
    uid: { type: String, required: true },
    pid: { type: String, required: true },
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
    routeType: { type: String, required: true }
  },
  { timestamps: true }
);

export default model("Route", RouteSchema);
