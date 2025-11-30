import mammoth from 'mammoth';

/**
 * 读取Word文档（.docx）并转换为HTML
 */
export function readWordFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        
        resolve({
          html: result.value,
          messages: result.messages
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
 * 读取PPT文件（.pptx）
 * 注意：.pptx 是压缩的 XML 格式，需要特殊处理
 */
export function readPPTFile(file) {
  return new Promise((resolve, reject) => {
    // 对于 PPT，我们可以尝试使用解析结果
    // 或者显示提示信息
    reject(new Error('PPT文件预览需要使用解析结果，请在右侧查看'));
  });
}

