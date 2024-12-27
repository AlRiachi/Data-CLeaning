import Papa from 'papaparse';

export const processDataInChunks = (file) => {
  return new Promise((resolve, reject) => {
    const data = {};
    let headers = [];
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          headers = Object.keys(results.data[0]);
          headers.forEach(header => {
            data[header] = [];
          });

          results.data.forEach(row => {
            headers.forEach(header => {
              const value = parseFloat(row[header]);
              if (!isNaN(value)) {
                data[header].push(value);
              }
            });
          });

          const validHeaders = headers.filter(header => data[header].length > 0);
          const validData = {};
          validHeaders.forEach(header => {
            validData[header] = data[header];
          });

          resolve({ 
            data: validData, 
            headers: validHeaders,
            originalData: results.data
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const exportToCSV = (data, columns) => {
  const rows = [];
  const maxLength = Math.max(...columns.map(col => data[col].length));
  
  // Header row
  rows.push(columns.join(','));
  
  // Data rows
  for (let i = 0; i < maxLength; i++) {
    const row = columns.map(col => data[col][i] ?? '').join(',');
    rows.push(row);
  }
  
  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'cleaned_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const cleanData = (data, options) => {
  const newData = { ...data };
  
  Object.keys(newData).forEach(column => {
    const values = newData[column];
    
    if (options.removeOutliers) {
      const { q1, q3 } = calculateQuartiles(values);
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      newData[column] = values.filter(v => v >= lowerBound && v <= upperBound);
    }
    
    if (options.removeZeros) {
      newData[column] = values.filter(v => v !== 0);
    }
    
    if (options.removeNegatives) {
      newData[column] = values.filter(v => v >= 0);
    }
  });
  
  return newData;
};

const calculateQuartiles = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const q1 = sorted[Math.floor(mid / 2)];
  const q3 = sorted[Math.floor(mid + mid / 2)];
  return { q1, q3 };
};

export const CHUNK_SIZE = 10000;
