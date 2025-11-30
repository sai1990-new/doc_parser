import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Upload, 
  Select, 
  Switch, 
  Space, 
  List, 
  Tag, 
  Progress,
  message,
  Divider
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { base64EncodeFile } from '../utils/fileUtils';

const { Option } = Select;

const SUPPORTED_FORMATS = [
  'pdf', 'jpg', 'jpeg', 'png', 'bmp', 'tif', 'tiff', 'ofd', 'ppt', 'pptx',
  'doc', 'docx', 'txt', 'xls', 'xlsx', 'wps', 'html', 'mhtml'
];

function LeftPanel({
  accessToken,
  setAccessToken,
  tokenValid,
  setTokenValid,
  files,
  setFiles,
  selectedFile,
  setSelectedFile,
  config,
  setConfig,
  parseResults,
  setParseResults
}) {
  const [testingToken, setTestingToken] = useState(false);
  const [uploading, setUploading] = useState({});

  // 测试Token
  const handleTestToken = async () => {
    if (!accessToken.trim()) {
      message.error('请输入Access Token');
      return;
    }

    setTestingToken(true);
    try {
      console.log('发送Token验证请求...', accessToken.substring(0, 20) + '...');
      const response = await axios.post('/api/test-token', { token: accessToken });
      console.log('Token验证响应:', response.data);
      
      if (response.data.success) {
        setTokenValid(true);
        if (response.data.warning) {
          message.warning(response.data.message + ' (' + response.data.warning + ')');
        } else {
          message.success(response.data.message || 'Token验证成功');
        }
      } else {
        setTokenValid(false);
        message.error(response.data.error || 'Token验证失败');
      }
    } catch (error) {
      console.error('Token验证错误:', error);
      console.error('错误响应:', error.response?.data);
      setTokenValid(false);
      
      const errorMessage = error.response?.data?.error || error.message || 'Token验证失败';
      const errorDetails = error.response?.data?.details;
      
      if (errorDetails) {
        message.error(`${errorMessage}: ${JSON.stringify(errorDetails)}`);
      } else {
        message.error(errorMessage);
      }
    } finally {
      setTestingToken(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !SUPPORTED_FORMATS.includes(fileExt)) {
      message.error(`不支持的文件格式: ${fileExt}`);
      return false;
    }

    if (file.size > 50 * 1024 * 1024) {
      message.error('文件大小不能超过50M');
      return false;
    }

    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      pollCount: 0, // 轮询次数
      statusText: '上传中...',
      file: file, // 保存文件对象用于预览
      type: file.type
    };

    setFiles(prev => [...prev, newFile]);
    setUploading(prev => ({ ...prev, [fileId]: true }));

    try {
      // 更新状态：正在读取文件
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 5, statusText: '正在读取文件...' } : f
      ));

      // 读取文件并转换为base64
      const fileData = await base64EncodeFile(file);
      
      // 更新状态：正在提交任务
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 8, statusText: '正在提交任务...' } : f
      ));
      
      // 提交解析任务
      const submitData = {
        file_data: fileData,
        file_name: file.name,
        ...config
      };

      const submitResponse = await axios.post('/api/submit-task', submitData);
      
      if (submitResponse.data.error_code === 0) {
        const taskId = submitResponse.data.result.task_id;
        
        // 更新文件状态
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            taskId, 
            status: 'processing', 
            progress: 10,
            statusText: '任务已提交，等待处理...',
            pollCount: 0
          } : f
        ));

        // 开始轮询结果
        pollTaskResult(fileId, taskId, 0);
      } else {
        throw new Error(submitResponse.data.error_msg || '提交任务失败');
      }
    } catch (error) {
      console.error('上传文件错误:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error', error: error.response?.data?.error_msg || error.message } : f
      ));
      message.error('文件上传失败: ' + (error.response?.data?.error_msg || error.message));
    } finally {
      setUploading(prev => {
        const newState = { ...prev };
        delete newState[fileId];
        return newState;
      });
    }

    return false; // 阻止默认上传行为
  };

  // 轮询任务结果
  const pollTaskResult = async (fileId, taskId, retryCount = 0) => {
    try {
      // 等待5-10秒后开始轮询
      if (retryCount === 0) {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            progress: 20,
            statusText: '等待处理中...',
            pollCount: 0
          } : f
        ));
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));
      }

      // 更新进度和状态
      const pollCount = retryCount + 1;
      const maxPolls = 120; // 最多轮询120次（约2分钟）
      const progress = Math.min(20 + Math.floor((pollCount / maxPolls) * 70), 90);
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          progress,
          pollCount,
          statusText: `解析中... (${pollCount}次查询)`
        } : f
      ));

      const response = await axios.post('/api/query-task', { task_id: taskId });
      const result = response.data;

      if (result.error_code === 0 && result.result) {
        const { status, task_error, markdown_url, parse_result_url } = result.result;

        if (status === 'success') {
          // 任务成功，获取解析结果
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { 
              ...f, 
              status: 'success', 
              taskId,
              progress: 100,
              statusText: '解析完成'
            } : f
          ));

          // 获取解析结果内容
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { 
              ...f, 
              progress: 95,
              statusText: '正在获取解析结果...'
            } : f
          ));

          const results = await fetchParseResults(markdown_url, parse_result_url);
          setParseResults(prev => ({
            ...prev,
            [fileId]: {
              ...result.result,
              ...results
            }
          }));

          setFiles(prev => prev.map(f => 
            f.id === fileId ? { 
              ...f, 
              progress: 100,
              statusText: '解析完成'
            } : f
          ));

          message.success(`文件 ${files.find(f => f.id === fileId)?.name} 解析成功`);
        } else if (status === 'failed') {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { 
              ...f, 
              status: 'error', 
              error: task_error || '解析失败',
              progress: 0,
              statusText: '解析失败'
            } : f
          ));
          message.error(`文件解析失败: ${task_error || '未知错误'}`);
        } else if (status === 'processing' || status === 'pending') {
          // 根据状态更新文本
          const statusText = status === 'pending' 
            ? `排队中... (${pollCount}次查询)`
            : `处理中... (${pollCount}次查询)`;
          
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { 
              ...f, 
              statusText 
            } : f
          ));

          // 继续轮询，注意QPS限制（10次/秒），所以至少间隔100ms
          setTimeout(() => {
            pollTaskResult(fileId, taskId, retryCount + 1);
          }, 1000);
        }
      } else {
        throw new Error(result.error_msg || '查询任务失败');
      }
    } catch (error) {
      console.error('轮询任务结果错误:', error);
      // 如果错误不是致命的，继续重试
      if (retryCount < 120) { // 最多重试120次（约2分钟）
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            statusText: `重试中... (${retryCount + 1}/120)`
          } : f
        ));
        setTimeout(() => {
          pollTaskResult(fileId, taskId, retryCount + 1);
        }, 2000);
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'error', 
            error: '轮询超时',
            progress: 0,
            statusText: '超时'
          } : f
        ));
        message.error('获取解析结果超时');
      }
    }
  };

  // 获取解析结果内容
  const fetchParseResults = async (markdownUrl, parseResultUrl) => {
    const results = {};

    try {
      // 获取Markdown内容
      if (markdownUrl) {
        const mdResponse = await axios.post('/api/fetch-content', { url: markdownUrl });
        results.markdownContent = mdResponse.data.content;
      }
    } catch (error) {
      console.error('获取Markdown内容失败:', error);
    }

    try {
      // 获取JSON内容
      if (parseResultUrl) {
        const jsonResponse = await axios.post('/api/fetch-content', { url: parseResultUrl });
        results.jsonContent = jsonResponse.data.content;
      }
    } catch (error) {
      console.error('获取JSON内容失败:', error);
    }

    return results;
  };

  // 删除文件
  const handleDeleteFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setParseResults(prev => {
      const newResults = { ...prev };
      delete newResults[fileId];
      return newResults;
    });
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  // 选择文件
  const handleSelectFile = (file) => {
    setSelectedFile(file);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'success':
        return <Tag color="success" icon={<CheckCircleOutlined />}>成功</Tag>;
      case 'error':
        return <Tag color="error" icon={<CloseCircleOutlined />}>失败</Tag>;
      case 'processing':
        return <Tag color="processing" icon={<LoadingOutlined />}>处理中</Tag>;
      default:
        return <Tag>上传中</Tag>;
    }
  };

  return (
    <div className="left-panel">
      {/* Access Token配置 */}
      <Card title="Access Token" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Password
            placeholder="请输入Access Token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            status={tokenValid ? 'success' : ''}
          />
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              block
              onClick={handleTestToken}
              loading={testingToken}
              disabled={!accessToken.trim()}
            >
              测试连接
            </Button>
            <Button
              type="default"
              block
              onClick={() => {
                if (accessToken.trim()) {
                  setTokenValid(true);
                  message.success('Token已保存（未验证）');
                } else {
                  message.error('请输入Access Token');
                }
              }}
              disabled={!accessToken.trim() || testingToken}
            >
              直接保存（跳过验证）
            </Button>
          </Space>
          {tokenValid && (
            <Tag color="success" style={{ width: '100%', textAlign: 'center' }}>
              Token已验证
            </Tag>
          )}
        </Space>
      </Card>

      {/* 文件上传 */}
      <Card title="文件上传" size="small" style={{ marginBottom: 16 }}>
        <Upload
          beforeUpload={handleFileUpload}
          showUploadList={false}
          multiple
          disabled={!tokenValid}
        >
          <Button 
            icon={<UploadOutlined />} 
            block 
            disabled={!tokenValid}
          >
            选择文件
          </Button>
        </Upload>
        <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
          支持格式: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, 图片等
          <br />
          文件大小: 不超过50M
        </div>
      </Card>

      {/* 参数配置 */}
      <Card title="参数配置" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>识别语种:</label>
            <Select
              value={config.language_type}
              onChange={(value) => setConfig(prev => ({ ...prev, language_type: value }))}
              style={{ width: '100%' }}
            >
              <Option value="CHN_ENG">中英文</Option>
              <Option value="JAP">日语</Option>
              <Option value="KOR">韩语</Option>
              <Option value="FRE">法语</Option>
              <Option value="SPA">西班牙语</Option>
              <Option value="POR">葡萄牙语</Option>
              <Option value="GER">德语</Option>
              <Option value="ITA">意大利语</Option>
              <Option value="RUS">俄语</Option>
            </Select>
          </div>
          <div>
            <Space>
              <Switch
                checked={config.recognize_formula}
                onChange={(checked) => setConfig(prev => ({ ...prev, recognize_formula: checked }))}
              />
              <span>公式识别</span>
            </Space>
          </div>
          <div>
            <Space>
              <Switch
                checked={config.analysis_chart}
                onChange={(checked) => setConfig(prev => ({ ...prev, analysis_chart: checked }))}
              />
              <span>图表解析</span>
            </Space>
          </div>
          <div>
            <Space>
              <Switch
                checked={config.angle_adjust}
                onChange={(checked) => setConfig(prev => ({ ...prev, angle_adjust: checked }))}
              />
              <span>图片矫正</span>
            </Space>
          </div>
          <div>
            <Space>
              <Switch
                checked={config.parse_image_layout}
                onChange={(checked) => setConfig(prev => ({ ...prev, parse_image_layout: checked }))}
              />
              <span>解析图片</span>
            </Space>
          </div>
        </Space>
      </Card>

      {/* 文件列表 */}
      <Card title="文件列表" size="small">
        <List
          dataSource={files}
          renderItem={(file) => (
            <List.Item
              className={`file-list-item ${file.status} ${selectedFile?.id === file.id ? 'active' : ''}`}
              onClick={() => {
                // 只有成功或失败的文件才能查看
                if (file.status === 'success' || file.status === 'error') {
                  handleSelectFile(file);
                } else if (file.status === 'processing' || file.status === 'uploading') {
                  message.info('文件正在处理中，请稍候...');
                }
              }}
              style={{ cursor: file.status === 'success' || file.status === 'error' ? 'pointer' : 'default' }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <Space>
                    {getStatusTag(file.status)}
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                    />
                  </Space>
                </div>
                {(file.status === 'processing' || file.status === 'uploading') && (
                  <div style={{ marginTop: 8 }}>
                    <Progress 
                      percent={file.progress || 0} 
                      size="small" 
                      status={file.status === 'error' ? 'exception' : 'active'} 
                    />
                    {file.statusText && (
                      <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                        {file.statusText}
                      </div>
                    )}
                  </div>
                )}
                {file.error && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#ff4d4f' }}>
                    错误: {file.error}
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

export default LeftPanel;

