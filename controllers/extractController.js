import { ExtractionService } from '../services/extractionService.js';
import { ParsingService } from '../services/parsingService.js';
import { FileService } from '../services/fileService.js';

export class ExtractController {
  static async extractText(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const fileType = req.file.mimetype;

      console.log(`Processing file: ${req.file.originalname}, Type: ${fileType}`);

      // Extract text from file
      const extractedText = await ExtractionService.extractText(filePath, fileType);
      console.log(`Extracted ${extractedText.length} characters`);

      // Parse structured data
      const parsedData = ParsingService.parseStructuredData(extractedText, fileType);

      // Clean up uploaded file
      FileService.cleanupFile(filePath);

      // Return response
      res.json({
        success: true,
        message: 'File processed successfully',
        data: {
          rawText: extractedText,
          structuredData: parsedData.structuredData,
          entities: parsedData.entities,
          tables: parsedData.tables,
          downloadFormats: [
            {
              format: 'excel',
              endpoint: `/api/download/excel/${req.file.filename}`,
              description: 'Download as Excel (.xlsx)',
              icon: '📊'
            },
            {
              format: 'csv',
              endpoint: `/api/download/csv/${req.file.filename}`,
              description: 'Download as CSV',
              icon: '📄'
            },
            {
              format: 'text',
              endpoint: `/api/download/text/${req.file.filename}`,
              description: 'Download as Text file',
              icon: '📝'
            }
          ],
          fileInfo: {
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
            processedAt: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      console.error('Processing error:', error);
      
      // Clean up file if exists
      if (req.file && req.file.path) {
        FileService.cleanupFile(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'An unexpected error occurred'
      });
    }
  }
}