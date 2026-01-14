import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import extractRoutes from "./routes/extractRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { FileService } from "./services/fileService.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED PROMISE REJECTION:", reason);
});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Ensure directories exist
FileService.ensureDirectoryExists('uploads');
FileService.ensureDirectoryExists('exports');

// Routes
app.use('/api/extract', extractRoutes);
app.use('/api/download', downloadRoutes);
app.use('/', healthRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   SmartHand Document Processor 🚀                    ║
  ║                                                       ║
  ║   Server running on port ${PORT}                      ║
  ║                                                       ║
  ║   📁 Uploads: ./uploads                              ║
  ║   📁 Exports: ./exports                              ║
  ║                                                       ║
  ║   🌐 Open in browser: http://localhost:${PORT}       ║
  ║   🧪 Test upload: http://localhost:${PORT}/api/test-upload ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;