# 文档解析可视化应用

基于百度文档解析API的文档解析和可视化应用。

## 功能特性

- ✅ Access Token配置和验证
- ✅ 批量文件上传（支持多种格式）
- ✅ 异步任务提交和结果轮询
- ✅ 原始文件预览（支持缩放）
- ✅ 解析结果可视化展示：
  - Markdown预览
  - JSON数据查看
  - 表格展示
  - 图表解析和可视化
  - 印章和手写识别
  - 公式渲染（LaTeX）
  - 标题层级树

## 技术栈

### 前端
- React 18
- Vite
- Ant Design 5
- React Markdown
- React JSON View
- KaTeX (公式渲染)

### 后端
- Node.js
- Express
- Axios

## 安装和运行

### 1. 安装依赖

**Windows (PowerShell):**
```powershell
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ..\client
npm install
```

**或者使用启动脚本（会自动检查并安装依赖）：**
```powershell
# PowerShell
.\start-dev.ps1

# 或双击运行
start-dev.bat
```

### 2. 运行项目

**方式一：使用启动脚本（推荐）**

Windows 用户可以直接双击 `start-dev.bat` 或在 PowerShell 中运行：
```powershell
.\start-dev.ps1
```

脚本会自动打开两个窗口分别运行前后端服务。

**方式二：手动启动**

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

### 3. 访问应用

启动成功后：
- 前端: http://localhost:3000
- 后端API: http://localhost:3001

**验证服务：**
- 后端测试：访问 http://localhost:3001/api/token 应返回 `{"token":null}`
- 前端测试：访问 http://localhost:3000 应显示应用界面

### 4. 遇到问题？

如果遇到错误代码 -102 或其他连接问题，请查看 [故障排除指南](TROUBLESHOOTING.md)

## 使用说明

1. **配置Access Token**
   - 在左侧面板输入百度API的Access Token
   - 点击"测试连接"验证Token有效性
   - Token验证成功后会自动保存

2. **上传文件**
   - 点击"选择文件"按钮上传文档
   - 支持批量上传
   - 支持格式：PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, 图片等
   - 文件大小限制：不超过50M

3. **配置参数**
   - 选择识别语种（默认：中英文）
   - 开启/关闭公式识别
   - 开启/关闭图表解析
   - 开启/关闭图片矫正
   - 开启/关闭图片解析

4. **查看结果**
   - 文件上传后会自动提交解析任务
   - 系统会自动轮询获取解析结果（5-10秒后开始）
   - 在右侧面板切换不同Tab查看解析结果

## 项目结构

```
parser-demo/
├── server/              # 后端服务
│   ├── index.js        # Express服务器
│   └── package.json
├── client/              # 前端应用
│   ├── src/
│   │   ├── components/  # React组件
│   │   │   ├── LeftPanel.jsx
│   │   │   ├── CenterPanel.jsx
│   │   │   ├── RightPanel.jsx
│   │   │   └── tabs/    # 结果展示Tab
│   │   ├── utils/       # 工具函数
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## API说明

### 后端API端点

- `POST /api/test-token` - 测试Access Token
- `GET /api/token` - 获取保存的Token
- `POST /api/submit-task` - 提交解析任务
- `POST /api/query-task` - 查询任务结果
- `POST /api/fetch-content` - 获取文件内容（Markdown/JSON）

## 注意事项

1. **QPS限制**
   - 提交请求接口QPS为2
   - 获取结果接口QPS为10
   - 系统已实现轮询间隔控制

2. **文件大小**
   - 通过file_data上传：不超过50M
   - 通过file_url上传：PDF不超过300M，其他不超过50M

3. **CORS问题**
   - 后端已配置CORS，避免浏览器跨域限制

4. **Token安全**
   - 当前实现为简单存储，生产环境建议使用数据库或Redis

## 开发计划

- [ ] 文件预览功能完善
- [ ] 图表解析结果可视化
- [ ] 导出解析结果
- [ ] 历史记录管理
- [ ] 错误重试机制优化

## 许可证

MIT

