import mongoose from "mongoose";

// Attachment schema
const attachmentSchema = new mongoose.Schema({
  fileType: { type: String },
  url: { type: String, required: true }
}, { _id: false });

// Task schema
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  order: Number,
  stage: String,
  index: Number,
  attachment: [attachmentSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { _id: true });

// Project schema
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true
  },
  description: String,
  task: [taskSchema]
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
