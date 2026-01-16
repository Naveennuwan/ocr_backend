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
      console.log('📊 Generating Excel file...');
      console.log('📝 Data received:', {
        hasText: !!data.rawText,
        textLength: data.rawText?.length || 0,
        isEdited: data.metadata?.isEdited || false
      });

      // Create workbook
      const workbook = new exceljs.Workbook();
      workbook.creator = 'SmartHand OCR';
      workbook.lastModifiedBy = 'SmartHand OCR';
      workbook.created = new Date();
      workbook.modified = new Date();

      // === SHEET 1: EXTRACTED DATA ===
      const dataSheet = workbook.addWorksheet('Extracted Data');
      
      // Title
      dataSheet.addRow(['SMARTHAND OCR - EXTRACTED DOCUMENT DATA']);
      dataSheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF1976D2' } };
      dataSheet.getRow(1).alignment = { horizontal: 'center' };
      dataSheet.mergeCells('A1:B1');
      
      // Metadata
      dataSheet.addRow(['Generated:', new Date().toISOString()]);
      if (data.metadata?.originalFilename) {
        dataSheet.addRow(['Original File:', data.metadata.originalFilename]);
      }
      dataSheet.addRow(['Character Count:', data.rawText?.length || 0]);
      if (data.metadata?.isEdited) {
        dataSheet.addRow(['Status:', 'EDITED BY USER']);
        if (data.metadata.editedAt) {
          dataSheet.addRow(['Edited At:', data.metadata.editedAt]);
        }
      } else {
        dataSheet.addRow(['Status:', 'ORIGINAL EXTRACTION']);
      }
      
      dataSheet.addRow([]); // Empty row
      
      // === EXTRACTED TEXT ===
      dataSheet.addRow(['EXTRACTED TEXT:']);
      dataSheet.getRow(dataSheet.rowCount).font = { bold: true, size: 14 };
      
      if (data.rawText) {
        // Split text into manageable chunks for Excel
        const textChunks = this.splitTextForExcel(data.rawText);
        textChunks.forEach(chunk => {
          dataSheet.addRow([chunk]);
        });
      } else {
        dataSheet.addRow(['No text extracted']);
      }
      
      dataSheet.addRow([]); // Empty row
      
      // === STRUCTURED DATA ===
      if (data.structuredData && Object.keys(data.structuredData).length > 0) {
        dataSheet.addRow(['STRUCTURED DATA:']);
        dataSheet.getRow(dataSheet.rowCount).font = { bold: true, size: 14 };
        
        Object.entries(data.structuredData).forEach(([key, value]) => {
          dataSheet.addRow([`${key.toUpperCase()}:`, value]);
        });
        
        dataSheet.addRow([]); // Empty row
      }
      
      // === ENTITIES ===
      if (data.entities && data.entities.length > 0) {
        dataSheet.addRow(['EXTRACTED ENTITIES:']);
        dataSheet.getRow(dataSheet.rowCount).font = { bold: true, size: 14 };
        
        // Add headers
        dataSheet.addRow(['Type', 'Value']);
        const headerRow = dataSheet.getRow(dataSheet.rowCount);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
        
        // Add entity rows
        data.entities.forEach(entity => {
          dataSheet.addRow([entity.type, entity.value]);
        });
        
        dataSheet.addRow([]); // Empty row
      }
      
      // === TABLES ===
      if (data.tables && data.tables.length > 0) {
        data.tables.forEach((table, tableIndex) => {
          dataSheet.addRow([`TABLE ${tableIndex + 1}:`]);
          dataSheet.getRow(dataSheet.rowCount).font = { bold: true, size: 14 };
          
          if (table.headers && table.headers.length > 0) {
            dataSheet.addRow(table.headers);
            const tableHeaderRow = dataSheet.getRow(dataSheet.rowCount);
            tableHeaderRow.font = { bold: true };
            tableHeaderRow.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE8F5E9' }
            };
          }
          
          if (table.rows && table.rows.length > 0) {
            table.rows.forEach(row => {
              dataSheet.addRow(row);
            });
          }
          
          dataSheet.addRow([]); // Empty row between tables
        });
      }
      
      // === SHEET 2: METADATA ===
      const metadataSheet = workbook.addWorksheet('Metadata');
      metadataSheet.addRow(['SMARTHAND OCR - METADATA']);
      metadataSheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF1976D2' } };
      metadataSheet.mergeCells('A1:B1');
      
      metadataSheet.addRow(['Export Information', '']);
      metadataSheet.addRow(['Export Date:', new Date().toISOString()]);
      metadataSheet.addRow(['Application:', 'SmartHand OCR Document Processor']);
      metadataSheet.addRow(['Version:', '2.0']);
      
      metadataSheet.addRow(['', '']);
      metadataSheet.addRow(['Document Information', '']);
      metadataSheet.addRow(['Original Filename:', filename]);
      metadataSheet.addRow(['Text Length:', data.rawText?.length || 0]);
      metadataSheet.addRow(['Has Structured Data:', data.structuredData ? 'Yes' : 'No']);
      metadataSheet.addRow(['Has Entities:', data.entities?.length > 0 ? 'Yes' : 'No']);
      metadataSheet.addRow(['Has Tables:', data.tables?.length > 0 ? 'Yes' : 'No']);
      
      if (data.metadata) {
        metadataSheet.addRow(['', '']);
        metadataSheet.addRow(['Editing Information', '']);
        metadataSheet.addRow(['Edited:', data.metadata.isEdited ? 'YES' : 'NO']);
        if (data.metadata.editedAt) {
          metadataSheet.addRow(['Edited At:', data.metadata.editedAt]);
        }
      }
      
      // Set column widths
      dataSheet.columns = [
        { width: 25 },
        { width: 50 }
      ];
      
      metadataSheet.columns = [
        { width: 25 },
        { width: 40 }
      ];

      // Create exports directory
      const exportDir = path.join(__dirname, '../../exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
        console.log('📁 Created export directory:', exportDir);
      }

      // Generate safe filename
      const safeFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const excelPath = path.join(exportDir, `${safeFilename}.xlsx`);
      
      console.log('💾 Saving Excel file to:', excelPath);
      
      // Write to file with proper error handling
      await workbook.xlsx.writeFile(excelPath);
      
      // Verify file was created
      if (fs.existsSync(excelPath)) {
        const stats = fs.statSync(excelPath);
        console.log('✅ Excel file created successfully!');
        console.log('📄 File size:', Math.round(stats.size / 1024), 'KB');
        return excelPath;
      } else {
        throw new Error('Excel file was not created');
      }
      
    } catch (error) {
      console.error('❌ Excel generation error:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to generate Excel file: ${error.message}`);
    }
  }

  // Helper method to split text for Excel (Excel has cell limit)
  static splitTextForExcel(text, maxLength = 32767) {
    if (!text || text.length <= maxLength) {
      return [text || ''];
    }
    
    const chunks = [];
    let currentChunk = '';
    
    // Split by sentences if possible
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  static generateCSV(data, filename) {
    try {
      console.log('📄 Generating CSV file...');
      
      // Create CSV content
      let csvContent = '';
      
      // Header
      csvContent += '# SMARTHAND OCR EXTRACTION DATA\n';
      csvContent += `# Generated: ${new Date().toISOString()}\n`;
      csvContent += `# Filename: ${filename}\n`;
      csvContent += `# Text Length: ${data.rawText?.length || 0}\n`;
      
      if (data.metadata?.isEdited) {
        csvContent += '# Status: EDITED BY USER\n';
        if (data.metadata.editedAt) {
          csvContent += `# Edited At: ${data.metadata.editedAt}\n`;
        }
      } else {
        csvContent += '# Status: ORIGINAL EXTRACTION\n';
      }
      
      csvContent += '\n';
      
      // Text content
      csvContent += 'EXTRACTED_TEXT\n';
      if (data.rawText) {
        // Escape quotes and newlines for CSV
        const escapedText = data.rawText
          .replace(/"/g, '""')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        csvContent += `"${escapedText}"\n\n`;
      } else {
        csvContent += '"No text extracted"\n\n';
      }
      
      // Structured Data
      if (data.structuredData && Object.keys(data.structuredData).length > 0) {
        csvContent += 'STRUCTURED_DATA\n';
        csvContent += 'KEY,VALUE\n';
        
        Object.entries(data.structuredData).forEach(([key, value]) => {
          const escapedValue = String(value).replace(/"/g, '""');
          csvContent += `"${key}","${escapedValue}"\n`;
        });
        
        csvContent += '\n';
      }
      
      // Entities
      if (data.entities && data.entities.length > 0) {
        csvContent += 'ENTITIES\n';
        csvContent += 'TYPE,VALUE\n';
        
        data.entities.forEach(entity => {
          const escapedType = String(entity.type).replace(/"/g, '""');
          const escapedValue = String(entity.value).replace(/"/g, '""');
          csvContent += `"${escapedType}","${escapedValue}"\n`;
        });
        
        csvContent += '\n';
      }
      
      // Create exports directory
      const exportDir = path.join(__dirname, '../../exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      // Generate safe filename
      const safeFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const csvPath = path.join(exportDir, `${safeFilename}.csv`);
      
      // Write file
      fs.writeFileSync(csvPath, csvContent, 'utf8');
      
      // Verify
      if (fs.existsSync(csvPath)) {
        const stats = fs.statSync(csvPath);
        console.log('✅ CSV file created successfully!');
        console.log('📄 File size:', Math.round(stats.size / 1024), 'KB');
        return csvPath;
      } else {
        throw new Error('CSV file was not created');
      }
      
    } catch (error) {
      console.error('❌ CSV generation error:', error);
      throw new Error(`Failed to generate CSV file: ${error.message}`);
    }
  }

  static generateTextFile(data, filename) {
    try {
      console.log('📝 Generating Text file...');
      
      let content = '╔══════════════════════════════════════════════════╗\n';
      content += '║           SMART HAND OCR EXTRACTION DATA          ║\n';
      content += '╚══════════════════════════════════════════════════╝\n\n';
      
      // Metadata
      content += '▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ METADATA ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀\n';
      content += `Generated: ${new Date().toISOString()}\n`;
      content += `Filename: ${filename}\n`;
      content += `Text Length: ${data.rawText?.length || 0}\n`;
      
      if (data.metadata?.isEdited) {
        content += `Status: EDITED BY USER\n`;
        if (data.metadata.editedAt) {
          content += `Edited At: ${data.metadata.editedAt}\n`;
        }
      } else {
        content += 'Status: Original extraction\n';
      }
      
      content += '\n';
      
      // Text
      content += '▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ EXTRACTED TEXT ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀\n';
      content += (data.rawText || 'No text extracted') + '\n\n';
      
      // Structured Data
      if (data.structuredData && Object.keys(data.structuredData).length > 0) {
        content += '▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ STRUCTURED DATA ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀\n';
        Object.entries(data.structuredData).forEach(([key, value]) => {
          content += `${key.toUpperCase().padEnd(20)} : ${value}\n`;
        });
        content += '\n';
      }
      
      // Create exports directory
      const exportDir = path.join(__dirname, '../../exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      // Generate safe filename
      const safeFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const textPath = path.join(exportDir, `${safeFilename}.txt`);
      
      // Write file
      fs.writeFileSync(textPath, content, 'utf8');
      
      // Verify
      if (fs.existsSync(textPath)) {
        const stats = fs.statSync(textPath);
        console.log('✅ Text file created successfully!');
        console.log('📄 File size:', Math.round(stats.size / 1024), 'KB');
        return textPath;
      } else {
        throw new Error('Text file was not created');
      }
      
    } catch (error) {
      console.error('❌ Text file generation error:', error);
      throw new Error(`Failed to generate text file: ${error.message}`);
    }
  }

  // Helper to prepare data
  static prepareDataForExport(data, originalFilename) {
    return {
      rawText: data.rawText || '',
      structuredData: data.structuredData || {},
      entities: data.entities || [],
      tables: data.tables || [],
      metadata: {
        ...(data.metadata || {}),
        isEdited: data.metadata?.isEdited || false,
        editedAt: data.metadata?.editedAt || null,
        originalFilename: originalFilename,
        exportDate: new Date().toISOString(),
        version: '2.0'
      }
    };
  }
}