import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// 增加请求体大小限制（50MB）
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('请求体:', JSON.stringify(req.body).substring(0, 200));
  }
  next();
});

// 存储Access Token（实际生产环境应使用数据库或Redis）
let accessToken = null;

// 测试Access Token
app.post('/api/test-token', async (req, res) => {
  try {
    console.log('收到Token验证请求');
    console.log('请求体:', req.body);
    
    const { token } = req.body;
    if (!token) {
      console.log('Token为空');
      return res.status(400).json({ error: 'Token不能为空' });
    }

    console.log('开始验证Token...', token.substring(0, 20) + '...');

    // 使用一个更简单的验证方法：直接调用查询接口，如果返回token相关错误则无效
    const testUrl = `https://aip.baidubce.com/rest/2.0/brain/online/v2/parser/task/query?access_token=${token}`;
    
    try {
      const testResponse = await axios.post(
        testUrl, 
        new URLSearchParams({ task_id: 'invalid_test_task_id' }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000
        }
      );

      console.log('Token验证响应:', testResponse.data);

      // 检查错误码
      const errorCode = testResponse.data?.error_code;
      
      // 110: access_token无效或不存在
      // 282001: 参数错误（可能是task_id不存在，但token有效）
      if (errorCode === 110) {
        return res.status(400).json({ 
          error: 'Token无效或已过期',
          error_code: 110,
          details: testResponse.data
        });
      }
      
      // 如果返回282001（参数错误），说明token是有效的，只是task_id不存在
      // 如果返回其他错误，也认为token可能是有效的
      if (errorCode === 282001 || errorCode === 0) {
        accessToken = token;
        console.log('Token验证成功，已保存');
        return res.json({ 
          success: true, 
          message: 'Token验证成功',
          error_code: errorCode
        });
      }
      
      // 其他情况，保存token但给出警告
      accessToken = token;
      console.log('Token已保存（警告：返回了未知错误码）');
      return res.json({ 
        success: true, 
        message: 'Token已保存',
        warning: '验证时返回了未知错误码',
        error_code: errorCode,
        details: testResponse.data
      });
      
    } catch (error) {
      console.error('Token验证请求失败:', error.message);
      
      // 检查是否是token相关的错误
      if (error.response?.data) {
        const errorCode = error.response.data.error_code;
        console.log('错误码:', errorCode);
        
        // 110: access_token无效
        if (errorCode === 110) {
          return res.status(400).json({ 
            error: 'Token无效或已过期',
            error_code: 110,
            details: error.response.data
          });
        }
        
        // 282001: 参数错误（task_id不存在），但token可能是有效的
        if (errorCode === 282001) {
          accessToken = token;
          console.log('Token验证成功（task_id不存在，但token有效）');
          return res.json({ 
            success: true, 
            message: 'Token验证成功',
            error_code: 282001
          });
        }
      }
      
      // 网络错误或其他错误，但可能是token有效的
      // 为了用户体验，先保存token，让用户尝试使用
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return res.status(500).json({ 
          error: '验证超时，请检查网络连接',
          details: error.message
        });
      }
      
      // 其他错误，可能是网络问题，先保存token
      // 但需要检查是否是token错误
      if (error.response?.status === 401 || error.response?.status === 403) {
        return res.status(400).json({ 
          error: 'Token无效或已过期',
          details: error.response?.data || error.message
        });
      }
      
      accessToken = token;
      console.log('Token已保存（验证时出现网络错误，但token可能有效）');
      return res.json({ 
        success: true, 
        message: 'Token已保存（验证时出现网络错误，请稍后重试）',
        warning: error.message
      });
    }
  } catch (error) {
    console.error('Token验证异常:', error);
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    
    // 确保总是返回响应
    try {
      return res.status(500).json({ 
        error: 'Token验证失败', 
        details: error.message,
        code: error.code
      });
    } catch (sendError) {
      console.error('发送响应失败:', sendError);
    }
  }
});

// 获取保存的Token
app.get('/api/token', (req, res) => {
  res.json({ token: accessToken });
});

// 提交解析任务
app.post('/api/submit-task', async (req, res) => {
  try {
    console.log('收到提交任务请求');
    console.log('文件名:', req.body.file_name);
    console.log('是否有file_data:', !!req.body.file_data);
    console.log('是否有file_url:', !!req.body.file_url);
    console.log('file_data长度:', req.body.file_data ? req.body.file_data.length : 0);
    console.log('参数:', JSON.stringify({
      recognize_formula: req.body.recognize_formula,
      analysis_chart: req.body.analysis_chart,
      language_type: req.body.language_type
    }));

    const { file_data, file_url, file_name, ...params } = req.body;
    
    if (!accessToken) {
      console.log('错误: 未配置Access Token');
      return res.status(400).json({ error: '请先配置Access Token' });
    }

    if (!file_name) {
      console.log('错误: 文件名为空');
      return res.status(400).json({ error: '文件名不能为空' });
    }

    if (!file_data && !file_url) {
      console.log('错误: file_data和file_url都为空');
      return res.status(400).json({ error: 'file_data和file_url至少提供一个' });
    }

    const url = `https://aip.baidubce.com/rest/2.0/brain/online/v2/parser/task?access_token=${accessToken}`;
    
    console.log('构建表单数据...');
    const formData = new URLSearchParams();
    if (file_data) {
      // 检查base64数据是否过大
      if (file_data.length > 50 * 1024 * 1024) {
        console.log('警告: file_data过大，长度:', file_data.length);
      }
      formData.append('file_data', file_data);
    }
    if (file_url) formData.append('file_url', file_url);
    formData.append('file_name', file_name);
    
    // 添加可选参数
    if (params.recognize_formula !== undefined) {
      formData.append('recognize_formula', params.recognize_formula);
    }
    if (params.analysis_chart !== undefined) {
      formData.append('analysis_chart', params.analysis_chart);
    }
    if (params.angle_adjust !== undefined) {
      formData.append('angle_adjust', params.angle_adjust);
    }
    if (params.parse_image_layout !== undefined) {
      formData.append('parse_image_layout', params.parse_image_layout);
    }
    if (params.language_type) {
      formData.append('language_type', params.language_type);
    }
    if (params.switch_digital_width) {
      formData.append('switch_digital_width', params.switch_digital_width);
    }

    console.log('发送请求到百度API...');
    const response = await axios.post(url, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 60000 // 60秒超时
    });

    console.log('百度API响应:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('提交任务错误:');
    console.error('错误消息:', error.message);
    console.error('错误代码:', error.code);
    console.error('响应数据:', error.response?.data);
    console.error('响应状态:', error.response?.status);
    console.error('错误堆栈:', error.stack);
    
    res.status(500).json({ 
      error: '提交任务失败', 
      details: error.response?.data || error.message,
      code: error.code,
      status: error.response?.status
    });
  }
});

// 查询任务结果
app.post('/api/query-task', async (req, res) => {
  try {
    const { task_id } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: '请先配置Access Token' });
    }

    if (!task_id) {
      return res.status(400).json({ error: 'task_id不能为空' });
    }

    const url = `https://aip.baidubce.com/rest/2.0/brain/online/v2/parser/task/query?access_token=${accessToken}`;
    
    const response = await axios.post(url, new URLSearchParams({ task_id }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    res.json(response.data);
  } catch (error) {
    console.error('查询任务错误:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '查询任务失败', 
      details: error.response?.data || error.message 
    });
  }
});

// 下载文件内容（用于markdown_url和parse_result_url）
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL不能为空' });
    }

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    // 判断内容类型
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="download"`);
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('下载文件错误:', error.message);
    res.status(500).json({ 
      error: '下载文件失败', 
      details: error.message 
    });
  }
});

// 获取文件内容（返回文本或JSON）
app.post('/api/fetch-content', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL不能为空' });
    }

    const response = await axios.get(url, {
      timeout: 30000,
      responseType: 'text', // 先以文本形式获取
      transformResponse: [(data) => data] // 不自动转换
    });

    // 尝试解析为JSON
    let content;
    const contentType = response.headers['content-type'] || '';
    
    if (contentType.includes('application/json') || contentType.includes('text/json')) {
      try {
        content = JSON.parse(response.data);
      } catch (e) {
        content = response.data;
      }
    } else {
      // 尝试解析为JSON（某些API可能不设置正确的content-type）
      try {
        content = JSON.parse(response.data);
      } catch (e) {
        // 不是JSON，返回原始文本
        content = response.data;
      }
    }

    res.json({ content });
  } catch (error) {
    console.error('获取内容错误:', error.message);
    res.status(500).json({ 
      error: '获取内容失败', 
      details: error.message 
    });
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasToken: !!accessToken,
    port: PORT
  });
});

// 全局错误处理中间件（必须在所有路由之后）
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  console.error('错误堆栈:', err.stack);
  res.status(500).json({ 
    error: '服务器内部错误', 
    details: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ 
    error: '接口不存在', 
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API端点:`);
  console.log(`  GET  /api/health - 健康检查`);
  console.log(`  POST /api/test-token - 测试Token`);
  console.log(`  GET  /api/token - 获取保存的Token`);
  console.log(`  POST /api/submit-task - 提交解析任务`);
  console.log(`  POST /api/query-task - 查询任务结果`);
  console.log(`  POST /api/fetch-content - 获取文件内容`);
});

