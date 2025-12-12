import express from "express";
import joi from "joi";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const schema = joi.object({
    name: joi.string().min(2).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).max(128).required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(422).json({ error: true, message: error.details[0].message });

  try {
    const existing = await User.findOne({ email: value.email.toLowerCase() });
    if (existing) return res.status(409).json({ error: true, message: "Email already in use" });

    const passwordHash = await User.hashPassword(value.password);
    const user = await User.create({ name: value.name, email: value.email.toLowerCase(), passwordHash });

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });

    return res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email } });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
});

router.post("/login", async (req, res) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(422).json({ error: true, message: error.details[0].message });

  try {
    const user = await User.findOne({ email: value.email.toLowerCase() });
    if (!user) return res.status(401).json({ error: true, message: "Invalid credentials" });

    const ok = await user.comparePassword(value.password);
    if (!ok) return res.status(401).json({ error: true, message: "Invalid credentials" });

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });

    return res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email } });
  } catch (e) {
    return res.status(500).json({ error: true, message: e.message });
  }
});

export default router;
