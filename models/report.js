import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  description: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      "Spam",
      "Harassment",
      "Inappropriate Content",
      "Fake Account",
      "Other"
    ]
  },
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
