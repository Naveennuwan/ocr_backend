export class ParsingService {
    static parseStructuredData(text, fileType) {
      const result = {
        rawText: text,
        structuredData: {},
        tables: [],
        entities: []
      };
  
      const patterns = {
        invoiceNumber: /(?:invoice|bill)\s*#?\s*[:]?\s*([A-Z0-9\-]+)/i,
        date: /(?:date|issued|invoice date)\s*[:]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        total: /(?:total|amount due|grand total)\s*[:]?\s*[$€£]?\s*([\d,]+\.?\d*)/i,
        tax: /(?:tax|vat|gst)\s*[:]?\s*[$€£]?\s*([\d,]+\.?\d*)/i,
        subtotal: /(?:sub.?total|sub total)\s*[:]?\s*[$€£]?\s*([\d,]+\.?\d*)/i
      };
  
      // Extract entities
      for (const [key, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern);
        if (match) {
          result.entities.push({
            type: key,
            value: match[1]
          });
          result.structuredData[key] = match[1];
        }
      }
  
      // Extract potential table data
      const lines = text.split('\n');
      const tableRows = [];
      
      lines.forEach(line => {
        const monetaryMatch = line.match(/(\$|€|£|₹)?\s*[\d,]+\.?\d*/);
        if (monetaryMatch) {
          const cells = line.split(/\s{2,}|\t/).filter(cell => cell.trim());
          if (cells.length >= 2) {
            tableRows.push(cells);
          }
        }
      });
  
      if (tableRows.length > 0) {
        result.tables.push({
          headers: ['Item', 'Description', 'Quantity', 'Price', 'Amount'],
          rows: tableRows
        });
      }
  
      return result;
    }
  }