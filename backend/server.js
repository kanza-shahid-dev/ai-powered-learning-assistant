import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json()); //JSON body parser
app.use(express.urlencoded({ extended: false })); //Form data parser

//static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashcardRoutes);

app.use(errorHandler);

//404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

//Start server
const PORT = process.env.PORT || 5001;
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log("🚀 Server running on port ", PORT);
  });
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
