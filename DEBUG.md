# Token验证调试指南

## 问题排查步骤

### 1. 检查后端服务是否运行

在浏览器中访问：http://localhost:3001/api/health

应该返回：
```json
{
  "status": "ok",
  "timestamp": "...",
  "hasToken": false,
  "port": 3001
}
```

### 2. 检查后端日志

启动后端服务后，在控制台应该看到：
```
服务器运行在 http://localhost:3001
API端点:
  GET  /api/health - 健康检查
  POST /api/test-token - 测试Token
  ...
```

### 3. 测试Token验证

当你在前端点击"测试连接"时，后端控制台应该显示：
```
开始验证Token...
Token验证响应: { ... }
```

### 4. 常见错误码

- **110**: access_token无效或不存在
- **282001**: 参数错误（task_id不存在），但token可能是有效的
- **ECONNREFUSED**: 无法连接到百度API服务器
- **ETIMEDOUT**: 请求超时

### 5. 手动测试Token验证

使用PowerShell测试：

```powershell
# 测试健康检查
Invoke-WebRequest -Uri http://localhost:3001/api/health | Select-Object -ExpandProperty Content

# 测试Token验证（替换YOUR_TOKEN为实际token）
$body = @{ token = "YOUR_TOKEN" } | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3001/api/test-token -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content
```

### 6. 查看浏览器控制台

打开浏览器开发者工具（F12），查看：
- **Console标签**: 查看JavaScript错误和日志
- **Network标签**: 查看API请求和响应

### 7. 如果验证一直失败

可以尝试：
1. 使用"直接保存（跳过验证）"按钮
2. 检查Token是否正确（从百度AI平台获取）
3. 检查网络连接是否正常
4. 查看后端控制台的详细错误信息

## 获取Access Token

1. 访问百度AI开放平台：https://ai.baidu.com/
2. 登录并创建应用
3. 获取API Key和Secret Key
4. 使用以下方式获取Access Token：

```bash
# 使用curl（需要替换YOUR_API_KEY和YOUR_SECRET_KEY）
curl "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=YOUR_API_KEY&client_secret=YOUR_SECRET_KEY"
```

或者访问：
```
https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=YOUR_API_KEY&client_secret=YOUR_SECRET_KEY
```

在浏览器中打开上述URL（替换YOUR_API_KEY和YOUR_SECRET_KEY），会返回JSON格式的响应，其中包含`access_token`字段。

