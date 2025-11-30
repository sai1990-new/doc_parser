import React, { useState, useEffect } from 'react';
import { Button, Space, Empty, Tabs, Table, Spin, message, Alert } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined } from '@ant-design/icons';
import { readExcelFile, excelToReactTable } from '../utils/excelUtils';
import { readWordFile } from '../utils/officeUtils';

function CenterPanel({ selectedFile, files }) {
  const [zoom, setZoom] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [wordHtml, setWordHtml] = useState(null);
  const [loadingWord, setLoadingWord] = useState(false);

  useEffect(() => {
    setZoom(1);
    setExcelData(null);
    setWordHtml(null);
    
    if (selectedFile && selectedFile.file) {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      const isExcel = ['xls', 'xlsx'].includes(fileExt);
      const isWord = ['docx'].includes(fileExt);
      
      if (isExcel) {
        // 加载Excel文件
        setLoadingExcel(true);
        readExcelFile(selectedFile.file)
          .then(data => {
            setExcelData(data);
            setLoadingExcel(false);
          })
          .catch(error => {
            console.error('读取Excel文件失败:', error);
            message.error('读取Excel文件失败: ' + error.message);
            setLoadingExcel(false);
          });
      } else if (isWord) {
        // 加载Word文件
        setLoadingWord(true);
        readWordFile(selectedFile.file)
          .then(data => {
            setWordHtml(data.html);
            setLoadingWord(false);
            if (data.messages && data.messages.length > 0) {
              console.warn('Word转换警告:', data.messages);
            }
          })
          .catch(error => {
            console.error('读取Word文件失败:', error);
            message.error('读取Word文件失败: ' + error.message);
            setLoadingWord(false);
          });
      } else {
        // 其他文件类型，创建预览URL
        const url = URL.createObjectURL(selectedFile.file);
        setPreviewUrl(url);
        
        // 清理函数
        return () => {
          URL.revokeObjectURL(url);
        };
      }
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
  };

  if (!selectedFile) {
    return (
      <div className="center-panel">
        <Empty description="请选择文件进行预览" />
      </div>
    );
  }

  const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'bmp', 'tif', 'tiff'].includes(fileExt);
  const isPdf = fileExt === 'pdf';
  const isExcel = ['xls', 'xlsx'].includes(fileExt);
  const isWord = ['docx'].includes(fileExt);
  const isPPT = ['ppt', 'pptx'].includes(fileExt);
  const isOffice = ['doc', 'wps'].includes(fileExt); // doc和wps格式暂不支持直接预览

  return (
    <div className="center-panel">
      {!isExcel && (
        <div className="zoom-controls">
          <Space>
            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} size="small" />
            <span style={{ minWidth: '60px', textAlign: 'center', display: 'inline-block' }}>
              {Math.round(zoom * 100)}%
            </span>
            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} size="small" />
            <Button icon={<ReloadOutlined />} onClick={handleReset} size="small" />
          </Space>
        </div>
      )}
      <div className="file-preview-container">
        <div 
          className="file-preview-content"
          style={!isExcel ? {
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s'
          } : {}}
        >
          {isImage && previewUrl && (
            <img src={previewUrl} alt={selectedFile.name} />
          )}
          {isPdf && previewUrl && (
            <embed
              src={previewUrl}
              type="application/pdf"
              style={{ width: '800px', height: '1000px' }}
            />
          )}
          {isExcel && (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {loadingExcel ? (
                <div style={{ textAlign: 'center', padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16, color: '#999' }}>正在加载Excel文件...</div>
                </div>
              ) : excelData ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Tabs
                    defaultActiveKey={excelData.sheetNames[0]}
                    items={excelData.sheets.map((sheet, index) => {
                      const tableData = excelToReactTable(sheet);
                      const columns = tableData && tableData.length > 0 
                        ? tableData[0].map((header, colIndex) => ({
                            title: header || `列 ${colIndex + 1}`,
                            dataIndex: colIndex,
                            key: colIndex,
                            render: (text) => {
                              if (text === null || text === undefined) return '';
                              return String(text);
                            },
                            width: 150,
                            ellipsis: true
                          }))
                        : [];
                      
                      const dataSource = tableData && tableData.length > 1
                        ? tableData.slice(1).map((row, rowIndex) => ({
                            key: rowIndex,
                            ...row.reduce((acc, cell, cellIndex) => {
                              acc[cellIndex] = cell !== null && cell !== undefined ? String(cell) : '';
                              return acc;
                            }, {})
                          }))
                        : [];

                      return {
                        key: sheet.name,
                        label: sheet.name,
                        children: (
                          <div style={{ flex: 1, overflow: 'auto' }}>
                            <Table
                              columns={columns}
                              dataSource={dataSource}
                              pagination={{ 
                                pageSize: 50,
                                showSizeChanger: true,
                                showTotal: (total) => `共 ${total} 行`,
                                pageSizeOptions: ['20', '50', '100', '200']
                              }}
                              scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
                              size="small"
                              bordered
                              sticky
                            />
                          </div>
                        )
                      };
                    })}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                  />
                </div>
              ) : (
                <Empty description="无法加载Excel文件" />
              )}
            </div>
          )}
          {isWord && (
            <div style={{ width: '100%', height: '100%', padding: '20px', overflow: 'auto' }}>
              {loadingWord ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16, color: '#999' }}>正在加载Word文件...</div>
                </div>
              ) : wordHtml ? (
                <div 
                  className="word-preview"
                  dangerouslySetInnerHTML={{ __html: wordHtml }}
                  style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '20px',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              ) : (
                <Empty description="无法加载Word文件" />
              )}
            </div>
          )}
          {isPPT && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              <Alert
                message="PPT文件预览"
                description={
                  <div>
                    <p style={{ marginTop: 8 }}>
                      PPT文件预览功能开发中，请查看右侧的解析结果：
                    </p>
                    <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: 8 }}>
                      <li>Markdown 格式内容</li>
                      <li>表格数据</li>
                      <li>图片和图表</li>
                      <li>标题层级结构</li>
                    </ul>
                  </div>
                }
                type="info"
                showIcon
              />
            </div>
          )}
          {isOffice && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              <p>Office文档预览</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                文件名: {selectedFile.name}
              </p>
              <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                请查看右侧的解析结果
              </p>
            </div>
          )}
          {!isImage && !isPdf && !isExcel && !isWord && !isPPT && !isOffice && !previewUrl && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              <p>文件预览功能开发中</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                文件名: {selectedFile.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CenterPanel;

