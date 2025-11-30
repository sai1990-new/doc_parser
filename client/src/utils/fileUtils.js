// 将文件转换为base64
export function base64EncodeFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // 移除data URL前缀，只保留base64数据
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 根据文件扩展名判断文件类型
export function getFileType(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const imageTypes = ['jpg', 'jpeg', 'png', 'bmp', 'tif', 'tiff'];
  const pdfTypes = ['pdf'];
  const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'wps'];
  
  if (imageTypes.includes(ext)) return 'image';
  if (pdfTypes.includes(ext)) return 'pdf';
  if (officeTypes.includes(ext)) return 'office';
  return 'other';
}

// 创建文件预览URL
export function createFilePreviewUrl(file) {
  return URL.createObjectURL(file);
}

