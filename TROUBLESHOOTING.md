# 故障排除指南

## 错误代码 -102

错误代码 -102 表示连接被拒绝，通常是因为前端服务没有启动或无法访问。

## 解决方案

### 1. 确保服务已启动

**方法一：使用启动脚本（推荐）**

在项目根目录双击运行：
- Windows: `start-dev.bat`
- PowerShell: `.\start-dev.ps1`

**方法二：手动启动**

打开两个终端窗口：

**终端1 - 启动后端：**
```powershell
cd server
npm run dev
```

**终端2 - 启动前端：**
```powershell
cd client
npm run dev
```

### 2. 检查端口是否被占用

在 PowerShell 中运行：
```powershell
# 检查 3000 端口
netstat -ano | findstr :3000

# 检查 3001 端口
netstat -ano | findstr :3001
```

如果端口被占用，可以：
- 关闭占用端口的程序
- 或修改端口配置

### 3. 修改端口配置（如果端口被占用）

**修改前端端口：**
编辑 `client/vite.config.js`：
```javascript
server: {
  port: 3002,  // 改为其他端口
  // ...
}
```

**修改后端端口：**
编辑 `server/index.js`：
```javascript
const PORT = process.env.PORT || 3003;  // 改为其他端口
```

同时更新 `client/vite.config.js` 中的代理目标：
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3003',  // 与后端端口一致
    changeOrigin: true
  }
}
```

### 4. 检查防火墙设置

确保 Windows 防火墙允许 Node.js 访问网络：
1. 打开 Windows 防火墙设置
2. 允许 Node.js 通过防火墙

### 5. 清除缓存并重新安装

如果问题持续存在，尝试清除缓存：

```powershell
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 并重新安装
cd server
Remove-Item -Recurse -Force node_modules
npm install

cd ../client
Remove-Item -Recurse -Force node_modules
npm install
```

### 6. 检查 Node.js 版本

确保 Node.js 版本 >= 16.0.0：
```powershell
node --version
```

### 7. 检查浏览器控制台

打开浏览器开发者工具（F12），查看：
- Console 标签：查看 JavaScript 错误
- Network 标签：查看网络请求状态

### 8. 常见错误信息

**"Cannot GET /"**
- 前端服务未启动或端口错误

**"Network Error" 或 "ERR_CONNECTION_REFUSED"**
- 后端服务未启动
- 端口配置错误

**"Module not found"**
- 依赖未安装，运行 `npm install`

## 验证服务是否正常运行

### 后端服务
访问：http://localhost:3001/api/token
应该返回：`{"token":null}`

### 前端服务
访问：http://localhost:3000
应该显示应用界面

## 仍然无法解决？

1. 检查所有终端窗口是否有错误信息
2. 查看 `server` 和 `client` 目录下的日志
3. 确保没有其他程序占用端口
4. 尝试重启计算机

