import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class HealthController {
  static checkHealth(req, res) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: ['OCR', 'PDF Processing', 'Excel Export', 'CSV Export', 'Text Export'],
      directories: {
        uploads: fs.existsSync(path.join(__dirname, '../../uploads')),
        exports: fs.existsSync(path.join(__dirname, '../../exports'))
      }
    });
  }

  static getHomePage(req, res) {
    // Same HTML as before, but moved here for organization
    res.send(`
      <!DOCTYPE html>
      <html>
      <!-- HTML content from your original code -->
      </html>
    `);
  }

  static getTestUploadPage(req, res) {
    res.send(`
      <h1>Test File Upload</h1>
      <form action="/api/extract" method="post" enctype="multipart/form-data">
        <input type="file" name="file" required>
        <button type="submit">Upload</button>
      </form>
    `);
  }
}