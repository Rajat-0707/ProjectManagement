import express from "express";
import api from './routes/index.js';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import cors from "cors";
import auth from './routes/auth.js';


mongoose.set('strictQuery', false);

dotenv.config();

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_PATH)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB Error:', err));

// --- App Setup ---
const PORT = process.env.SERVER_PORT || 9000;
const origin = process.env.CORS_ORIGIN || "http://localhost:5173";  

const app = express();

// --- CORS ---
app.use(cors({ origin }));
app.options('*', cors()); // Allow preflight

// --- Body Parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/auth', auth);

app.use(api);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Your app is running at http://localhost:${PORT}`);
});
