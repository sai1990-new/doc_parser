// 测试后端服务是否正常运行
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testBackend() {
  console.log('测试后端服务...\n');

  // 1. 测试健康检查
  try {
    console.log('1. 测试健康检查端点...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✓ 健康检查成功:', healthResponse.data);
  } catch (error) {
    console.error('✗ 健康检查失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('  错误: 后端服务未启动，请运行: cd server && npm run dev');
      return;
    }
  }

  // 2. 测试获取Token
  try {
    console.log('\n2. 测试获取Token端点...');
    const tokenResponse = await axios.get(`${BASE_URL}/api/token`);
    console.log('✓ 获取Token成功:', tokenResponse.data);
  } catch (error) {
    console.error('✗ 获取Token失败:', error.message);
  }

  // 3. 测试Token验证（使用无效token）
  try {
    console.log('\n3. 测试Token验证端点（使用测试token）...');
    const testResponse = await axios.post(`${BASE_URL}/api/test-token`, {
      token: 'test_token_12345'
    });
    console.log('✓ Token验证响应:', testResponse.data);
  } catch (error) {
    if (error.response) {
      console.log('✓ Token验证响应（预期失败）:', error.response.data);
    } else {
      console.error('✗ Token验证失败:', error.message);
    }
  }

  console.log('\n测试完成！');
}

testBackend().catch(console.error);

