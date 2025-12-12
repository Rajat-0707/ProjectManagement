import express from "express";
import joi from "joi";
import mongoose from "mongoose";
import Project from "../models/index.js";
import auth from "../middleware/auth.js";

const api = express.Router();

// Helpers
const isValid = id => mongoose.isValidObjectId(id);

// --------------------------------------------------
// GET ALL PROJECTS
// --------------------------------------------------
api.get("/projects", auth, async (req, res) => {
  try {
    const projects = await Project.find({}, { task: 0, __v: 0, updatedAt: 0 });
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

// --------------------------------------------------
// GET PROJECT BY ID
// --------------------------------------------------
// --------------------------------------------------
// GET PROJECT BY ID
// --------------------------------------------------
api.get("/project/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!isValid(id))
    return res.status(400).json({ error: true, message: "Invalid project ID" });

  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: true, message: "Project not found" });

    return res.json([project]);  // IMPORTANT: keep old format
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

// --------------------------------------------------
// CREATE PROJECT
// --------------------------------------------------
api.post("/project", auth, async (req, res) => {
  const schema = joi.object({
    title: joi.string().min(3).max(30).required(),
    description: joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(422).json({ error: true, message: error.details[0].message });

  try {
    const project = await Project.create(value);
    return res.json(project);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: true, message: "Title must be unique" });
    }
    return res.status(500).json({ error: true, message: e.message });
  }
});

// --------------------------------------------------
// UPDATE PROJECT
// --------------------------------------------------
api.put("/project/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!isValid(id))
    return res.status(400).json({ error: true, message: "Invalid project ID" });

  const schema = joi.object({
    title: joi.string().min(3).max(30).required(),
    description: joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(422).json({ error: true, message: error.details[0].message });

  try {
    const updated = await Project.findByIdAndUpdate(id, value, { new: true });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

// --------------------------------------------------
// DELETE PROJECT
// --------------------------------------------------
api.delete("/project/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!isValid(id))
    return res.status(400).json({ error: true, message: "Invalid project ID" });

  try {
    await Project.findByIdAndDelete(id);
    return res.json({ message: "Project deleted" });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

// --------------------------------------------------
// CREATE TASK
// --------------------------------------------------
api.post("/project/:id/task", auth, async (req, res) => {
  const { id } = req.params;

  if (!isValid(id))
    return res.status(400).json({ error: true, message: "Invalid project ID" });

  const schema = joi.object({
    title: joi.string().min(3).max(30).required(),
    description: joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(422).json({ error: true, message: error.details[0].message });

  try {
    const project = await Project.findById(id, { task: 1 });

    const nextOrder = project.task.length;
    const nextIndex = project.task.length > 0 ? Math.max(...project.task.map(t => t.index)) + 1 : 0;

    await Project.updateOne(
      { _id: id },
      { $push: { task: { ...value, stage: "Requested", order: nextOrder, index: nextIndex } } }
    );

    return res.json({ message: "Task added" });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

// --------------------------------------------------
// GET SINGLE TASK
// --------------------------------------------------
api.get("/project/:id/task/:taskId", auth, async (req, res) => {
  const { id, taskId } = req.params;

  if (!isValid(id) || !isValid(taskId))
    return res.status(400).json({ error: true, message: "Invalid ID" });

  try {
    const project = await Project.findOne(
      { _id: id, "task._id": taskId },
      { task: { $elemMatch: { _id: taskId } } }
    );

    if (!project) return res.status(404).json({ error: true, message: "Task not found" });

    return res.json(project.task[0]);
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

// --------------------------------------------------
// UPDATE TASK
// --------------------------------------------------
api.put("/project/:id/task/:taskId", auth, async (req, res) => {
  const { id, taskId } = req.params;

  if (!isValid(id) || !isValid(taskId))
    return res.status(400).json({ error: true, message: "Invalid ID" });

  const schema = joi.object({
    title: joi.string().min(3).max(30).required(),
    description: joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(422).json({ error: true, message: error.details[0].message });

  try {
    await Project.updateOne(
      { _id: id, "task._id": taskId },
      { $set: { "task.$.title": value.title, "task.$.description": value.description } }
    );

    return res.json({ message: "Task updated" });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

// --------------------------------------------------
// DELETE TASK
// --------------------------------------------------
api.delete("/project/:id/task/:taskId", auth, async (req, res) => {
  const { id, taskId } = req.params;

  if (!isValid(id) || !isValid(taskId))
    return res.status(400).json({ error: true, message: "Invalid ID" });

  try {
    await Project.updateOne(
      { _id: id },
      { $pull: { task: { _id: taskId } } }
    );
    return res.json({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

// --------------------------------------------------
// UPDATE ALL TASK STATUSES (drag + drop logic)
// --------------------------------------------------
api.put("/project/:id/todo", auth, async (req, res) => {
  const { id } = req.params;

  if (!isValid(id)) return res.status(400).json({ error: true, message: "Invalid project ID" });

  const updates = [];

  for (const col of Object.values(req.body)) {
    const stageName = col.name;

    col.items.forEach((task, index) => {
      updates.push({
        taskId: task._id,
        stage: stageName,
        order: index,
      });
    });
  }

  try {
    await Promise.all(
      updates.map(update => {
        return Project.updateOne(
          { _id: id, "task._id": update.taskId },
          { $set: { "task.$.order": update.order, "task.$.stage": update.stage } }
        );
      })
    );

    return res.json({ message: "Tasks updated", updates });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

export default api;
