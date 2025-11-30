import * as XLSX from 'xlsx';

/**
 * 读取Excel文件并转换为HTML表格
 */
export function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 获取所有工作表
        const sheets = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            defval: '',
            raw: false // 将数字转换为字符串
          });
          
          // 转换为HTML表格
          const html = XLSX.utils.sheet_to_html(worksheet, { 
            id: `sheet-${sheetName}`,
            editable: false
          });
          
          return {
            name: sheetName,
            data: jsonData,
            html: html
          };
        });
        
        resolve({
          sheets,
          sheetNames: workbook.SheetNames
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 将Excel数据转换为React表格组件
 */
export function excelToReactTable(sheetData) {
  if (!sheetData || !sheetData.data || sheetData.data.length === 0) {
    return null;
  }

  const rows = sheetData.data;
  const maxCols = Math.max(...rows.map(row => row.length));
  
  // 确保所有行都有相同的列数
  const normalizedRows = rows.map(row => {
    const newRow = [...row];
    while (newRow.length < maxCols) {
      newRow.push('');
    }
    return newRow;
  });

  return normalizedRows;
}

