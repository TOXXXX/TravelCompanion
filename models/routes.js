import { Schema, model } from 'mongoose';

const RouteSchema = new Schema({
  uid: { type: String, required: true },
  pid: { type: String, required: true },
  routeName: { type: String, required: true },
  tripDuration: { type: Number }, // not required
  origin: {
    name: { type: String, required: true },
    coordinates: {
      type: [Number], // [longitude, latitude]
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
  }
}, { timestamps: true });

export default model('Route', RouteSchema);

