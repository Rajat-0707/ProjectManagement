import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: true, message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: true, message: "Invalid token" });
  }
}
