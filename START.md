# 快速启动指南

## 🚀 一键启动（推荐）

### Windows 用户

**方法1：双击运行**
- 双击 `start-dev.bat` 文件
- 会自动打开两个窗口运行前后端服务

**方法2：PowerShell 运行**
```powershell
.\start-dev.ps1
```

## 📋 手动启动步骤

### 步骤 1：安装依赖

如果还没有安装依赖，请先安装：

```powershell
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ..\client
npm install
```

### 步骤 2：启动后端服务

打开第一个终端窗口：

```powershell
cd server
npm run dev
```

看到以下信息表示后端启动成功：
```
服务器运行在 http://localhost:3001
```

### 步骤 3：启动前端服务

打开第二个终端窗口：

```powershell
cd client
npm run dev
```

看到以下信息表示前端启动成功：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 步骤 4：访问应用

在浏览器中打开：http://localhost:3000

## ✅ 验证服务

### 后端服务
访问 http://localhost:3001/api/token
- ✅ 成功：返回 `{"token":null}`
- ❌ 失败：检查后端服务是否启动

### 前端服务
访问 http://localhost:3000
- ✅ 成功：显示应用界面
- ❌ 失败：检查前端服务是否启动

## ⚠️ 常见问题

### 错误代码 -102
- **原因**：服务未启动或端口被占用
- **解决**：确保前后端服务都已启动，检查端口是否被占用

### 端口被占用
- 修改端口配置（见 TROUBLESHOOTING.md）
- 或关闭占用端口的程序

### 依赖安装失败
```powershell
# 清除缓存后重新安装
npm cache clean --force
npm install
```

## 📚 更多帮助

- 详细文档：查看 [README.md](README.md)
- 故障排除：查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- 快速开始：查看 [QUICKSTART.md](QUICKSTART.md)

