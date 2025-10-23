import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["resume", "jd"], required: true },
  fileUrl: { type: String },
  text: { type: String },
});

export default mongoose.model("Document", documentSchema);
