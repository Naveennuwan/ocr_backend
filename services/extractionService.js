import Tesseract from 'tesseract.js';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';

export class ExtractionService {
  static async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      return pdfData.text;
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  static async extractTextFromImage(filePath) {
    try {
      const { data: { text } } = await Tesseract.recognize(
        filePath,
        process.env.OCR_LANGUAGE || 'eng',
        { logger: m => console.log(m) }
      );
      return text;
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  static async extractTextFromWord(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      throw new Error(`Word document extraction failed: ${error.message}`);
    }
  }

  static async extractText(filePath, fileType) {
    if (fileType.includes('pdf')) {
      return await this.extractTextFromPDF(filePath);
    } else if (fileType.includes('image')) {
      return await this.extractTextFromImage(filePath);
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return await this.extractTextFromWord(filePath);
    } else {
      return await this.extractTextFromImage(filePath);
    }
  }
}