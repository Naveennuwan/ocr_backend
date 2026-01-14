import exceljs from 'exceljs';
import { parse } from 'json2csv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ExportService {
  static async generateExcel(data, filename) {
    try {
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Extracted Data');

      // Add raw text
      worksheet.addRow(['RAW EXTRACTED TEXT']);
      worksheet.addRow([data.rawText]);
      worksheet.addRow([]);

      // Add structured data
      if (Object.keys(data.structuredData).length > 0) {
        worksheet.addRow(['STRUCTURED DATA']);
        for (const [key, value] of Object.entries(data.structuredData)) {
          worksheet.addRow([key.toUpperCase(), value]);
        }
        worksheet.addRow([]);
      }

      // Add entities
      if (data.entities.length > 0) {
        worksheet.addRow(['EXTRACTED ENTITIES']);
        worksheet.addRow(['Type', 'Value']);
        data.entities.forEach(entity => {
          worksheet.addRow([entity.type, entity.value]);
        });
        worksheet.addRow([]);
      }

      // Add tables
      data.tables.forEach((table, index) => {
        worksheet.addRow([`TABLE ${index + 1}`]);
        if (table.headers) {
          worksheet.addRow(table.headers);
        }
        table.rows.forEach(row => {
          worksheet.addRow(row);
        });
        worksheet.addRow([]);
      });

      const exportDir = path.join(__dirname, '../../exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const excelPath = path.join(exportDir, `${filename}.xlsx`);
      await workbook.xlsx.writeFile(excelPath);
      return excelPath;
    } catch (error) {
      console.error('Excel generation error:', error);
      throw error;
    }
  }

  static generateCSV(data, filename) {
    try {
      const exportDir = path.join(__dirname, '../../exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const csvPath = path.join(exportDir, `${filename}.csv`);
      
      if (Object.keys(data.structuredData).length > 0) {
        const csv = parse([data.structuredData]);
        fs.writeFileSync(csvPath, csv);
      } else {
        fs.writeFileSync(csvPath, data.rawText);
      }

      return csvPath;
    } catch (error) {
      console.error('CSV generation error:', error);
      throw error;
    }
  }

  static generateTextFile(data, filename) {
    try {
      const exportDir = path.join(__dirname, '../../exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const textPath = path.join(exportDir, `${filename}.txt`);
      let content = 'EXTRACTED TEXT CONTENT\n';
      content += '='.repeat(50) + '\n\n';
      content += data.rawText + '\n\n';
      
      if (Object.keys(data.structuredData).length > 0) {
        content += '\nSTRUCTURED DATA\n';
        content += '='.repeat(50) + '\n';
        for (const [key, value] of Object.entries(data.structuredData)) {
          content += `${key.toUpperCase()}: ${value}\n`;
        }
      }
      
      fs.writeFileSync(textPath, content);
      return textPath;
    } catch (error) {
      console.error('Text file generation error:', error);
      throw error;
    }
  }
}