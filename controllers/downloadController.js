import { ExportService } from '../services/exportService.js';
import { FileService } from '../services/fileService.js';
import fs from 'fs';

export class DownloadController {
  static async downloadExcel(req, res) {
    try {
      const { filename } = req.params;
      let data;
      
      try {
        data = req.query.data ? JSON.parse(req.query.data) : { rawText: 'No data provided' };
      } catch (parseError) {
        console.error('❌ Failed to parse data:', parseError);
        return res.status(400).json({ error: 'Invalid data format' });
      }
      
      console.log(`📊 Generating Excel for: ${filename}`);
      
      const exportData = ExportService.prepareDataForExport(data, filename);
      const excelPath = await ExportService.generateExcel(
        exportData, 
        filename.replace(/\.[^/.]+$/, "")
      );
      
      // Force download headers
      const downloadFilename = `smarthand-extraction-${Date.now()}.xlsx`;
      
      // Set proper headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      res.setHeader('Content-Transfer-Encoding', 'binary');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Send file
      res.download(excelPath, downloadFilename, (err) => {
        if (err) {
          console.error('❌ Excel download error:', err);
        }
        // Clean up
        FileService.cleanupFile(excelPath);
      });
      
    } catch (error) {
      console.error('❌ Excel endpoint error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate Excel file'
      });
    }
  }

  static async downloadCSV(req, res) {
    try {
      const { filename } = req.params;
      const data = req.query.data ? JSON.parse(req.query.data) : { rawText: 'No data provided' };
      
      console.log(`📄 Generating CSV for: ${filename}`);
      console.log(`📝 Editing status: ${data.metadata?.isEdited ? 'EDITED' : 'ORIGINAL'}`);
      
      // Prepare data with metadata
      const exportData = ExportService.prepareDataForExport(data, filename);
      
      // Generate CSV file
      const csvPath = ExportService.generateCSV(
        exportData,
        filename.replace(/\.[^/.]+$/, "")
      );
      
      // Create download filename
      const timestamp = Date.now();
      const downloadFilename = exportData.metadata?.isEdited 
        ? `smarthand-edited-${timestamp}.csv`
        : `smarthand-original-${timestamp}.csv`;
      
      res.download(csvPath, downloadFilename, (err) => {
        if (err) {
          console.error('❌ CSV download error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
          }
        }
        // Clean up temporary file
        FileService.cleanupFile(csvPath);
      });
      
    } catch (error) {
      console.error('❌ CSV endpoint error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate CSV file',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  static async downloadText(req, res) {
    try {
      const { filename } = req.params;
      const data = req.query.data ? JSON.parse(req.query.data) : { rawText: 'No data provided' };
      
      console.log(`📝 Generating Text file for: ${filename}`);
      console.log(`📝 Editing status: ${data.metadata?.isEdited ? 'EDITED' : 'ORIGINAL'}`);
      
      // Prepare data with metadata
      const exportData = ExportService.prepareDataForExport(data, filename);
      
      // Generate Text file
      const textPath = ExportService.generateTextFile(
        exportData,
        filename.replace(/\.[^/.]+$/, "")
      );
      
      // Create download filename
      const timestamp = Date.now();
      const downloadFilename = exportData.metadata?.isEdited 
        ? `smarthand-edited-${timestamp}.txt`
        : `smarthand-original-${timestamp}.txt`;
      
      res.download(textPath, downloadFilename, (err) => {
        if (err) {
          console.error('❌ Text download error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
          }
        }
        // Clean up temporary file
        FileService.cleanupFile(textPath);
      });
      
    } catch (error) {
      console.error('❌ Text endpoint error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate text file',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Optional: Endpoint to check export status
  static async getExportInfo(req, res) {
    try {
      const { filename } = req.params;
      const data = req.query.data ? JSON.parse(req.query.data) : { rawText: '' };
      
      const exportData = ExportService.prepareDataForExport(data, filename);
      
      res.json({
        success: true,
        info: {
          filename: filename,
          characterCount: exportData.rawText.length,
          isEdited: exportData.metadata.isEdited,
          editedAt: exportData.metadata.editedAt,
          hasStructuredData: Object.keys(exportData.structuredData).length > 0,
          hasEntities: exportData.entities.length > 0,
          hasTables: exportData.tables.length > 0,
          availableFormats: ['excel', 'csv', 'text'],
          exportDate: exportData.metadata.exportDate
        }
      });
      
    } catch (error) {
      console.error('Export info error:', error);
      res.status(500).json({ 
        error: error.message,
        success: false
      });
    }
  }
}