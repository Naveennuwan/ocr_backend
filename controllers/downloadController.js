import { ExportService } from '../services/exportService.js';
import { FileService } from '../services/fileService.js';

export class DownloadController {
  static async downloadExcel(req, res) {
    try {
      const { filename } = req.params;
      const data = req.query.data ? JSON.parse(req.query.data) : { rawText: 'No data provided' };
      
      console.log(`Generating Excel for: ${filename}`);
      const excelPath = await ExportService.generateExcel(data, filename.replace(/\.[^/.]+$/, ""));
      
      res.download(excelPath, `extracted-${Date.now()}.xlsx`, (err) => {
        if (err) {
          console.error('Excel download error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
          }
        }
        // Clean up
        FileService.cleanupFile(excelPath);
      });
    } catch (error) {
      console.error('Excel endpoint error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate Excel file' });
    }
  }

  static async downloadCSV(req, res) {
    try {
      const { filename } = req.params;
      const data = req.query.data ? JSON.parse(req.query.data) : { rawText: 'No data provided' };
      
      console.log(`Generating CSV for: ${filename}`);
      const csvPath = ExportService.generateCSV(data, filename.replace(/\.[^/.]+$/, ""));
      
      res.download(csvPath, `extracted-${Date.now()}.csv`, (err) => {
        if (err) {
          console.error('CSV download error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
          }
        }
        // Clean up
        FileService.cleanupFile(csvPath);
      });
    } catch (error) {
      console.error('CSV endpoint error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate CSV file' });
    }
  }

  static async downloadText(req, res) {
    try {
      const { filename } = req.params;
      const data = req.query.data ? JSON.parse(req.query.data) : { rawText: 'No data provided' };
      
      console.log(`Generating Text file for: ${filename}`);
      const textPath = ExportService.generateTextFile(data, filename.replace(/\.[^/.]+$/, ""));
      
      res.download(textPath, `extracted-${Date.now()}.txt`, (err) => {
        if (err) {
          console.error('Text download error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
          }
        }
        // Clean up
        FileService.cleanupFile(textPath);
      });
    } catch (error) {
      console.error('Text endpoint error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate text file' });
    }
  }
}