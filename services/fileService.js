import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FileService {
  static cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('✅ Cleaned up file:', path.basename(filePath));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to cleanup file:', error.message);
      return false;
    }
  }

  static ensureDirectoryExists(dirPath) {
    try {
      // Convert relative path to absolute
      const absolutePath = dirPath.startsWith('/') 
        ? dirPath 
        : path.join(process.cwd(), dirPath);
      
      if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true });
        console.log('📁 Created directory:', absolutePath);
      }
      return absolutePath;
    } catch (error) {
      console.error('❌ Failed to create directory:', error.message);
      throw error;
    }
  }

  // New method: Get export directory path
  static getExportDirectory() {
    const exportDir = path.join(process.cwd(), 'exports');
    this.ensureDirectoryExists(exportDir);
    return exportDir;
  }

  // New method: Get unique filename with timestamp
  static generateUniqueFilename(originalName, suffix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const name = originalName.replace(/\.[^/.]+$/, ""); // Remove extension
    const ext = originalName.split('.').pop();
    
    return `${name}${suffix ? '-' + suffix : ''}-${timestamp}-${random}.${ext}`;
  }

  // New method: Check if file exists
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  // New method: Get file size
  static getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }
}