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
  console.error("❌ UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ UNHANDLED PROMISE REJECTION:", reason);
});

const app = express();

// Middleware
app.use(cors({
  origin: 'https://smartocr.netlify.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure directories exist
console.log('📁 Initializing directories...');
FileService.ensureDirectoryExists(process.env.UPLOAD_DIR || 'uploads');
FileService.ensureDirectoryExists(process.env.EXPORT_DIR || 'exports');

// Routes
app.use('/api/extract', extractRoutes);
app.use('/api/download', downloadRoutes);
app.use('/', healthRoutes);

// Test endpoint for file upload
app.get('/api/test-upload', (req, res) => {
  res.send(`
    <h1>Test File Upload</h1>
    <form action="/api/extract" method="post" enctype="multipart/form-data">
      <input type="file" name="file" required>
      <button type="submit">Upload</button>
    </form>
  `);
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   SmartHand Document Processor 🚀                    ║
  ║                                                       ║
  ║   ✅ Server running on port ${PORT}                    ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'} ║
  ║                                                       ║
  ║   📁 Uploads: ${process.env.UPLOAD_DIR || 'uploads'}  ║
  ║   📁 Exports: ${process.env.EXPORT_DIR || 'exports'}  ║
  ║                                                       ║
  ║   ✨ Now with text editing support!                  ║
  ║                                                       ║
  ║   🌐 Open: http://localhost:${PORT}                  ║
  ║   🧪 Test: http://localhost:${PORT}/api/test-upload  ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;