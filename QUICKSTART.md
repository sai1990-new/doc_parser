# 快速启动指南

## 前置要求

- Node.js >= 16.0.0
- npm 或 yarn

## 安装步骤

### 1. 安装后端依赖

```bash
cd server
npm install
```

### 2. 安装前端依赖

```bash
cd ../client
npm install
```

## 运行项目

### 方式一：分别启动（推荐用于开发调试）

**终端1 - 启动后端服务：**
```bash
cd server
npm run dev
```
后端服务将在 http://localhost:3001 启动

**终端2 - 启动前端服务：**
```bash
cd client
npm run dev
```
前端应用将在 http://localhost:3000 启动

### 方式二：同时启动（需要根目录安装依赖）

在项目根目录运行：
```bash
npm install
npm run dev
```

## 使用流程

1. **获取Access Token**
   - 访问百度AI开放平台获取API Key和Secret Key
   - 使用API Key和Secret Key获取Access Token
   - 参考：https://ai.baidu.com/ai-doc/REFERENCE/Ck3dwjgn3

2. **配置Token**
   - 在左侧面板输入Access Token
   - 点击"测试连接"验证Token
   - Token验证成功后会自动保存

3. **上传文件**
   - 点击"选择文件"按钮
   - 支持批量选择多个文件
   - 文件会自动提交解析任务

4. **查看结果**
   - 文件上传后会自动开始解析
   - 系统会在5-10秒后开始轮询结果
   - 在右侧面板切换不同Tab查看解析结果

## 注意事项

1. **QPS限制**
   - 提交请求接口：QPS = 2（每秒最多2次请求）
   - 获取结果接口：QPS = 10（每秒最多10次请求）
   - 系统已实现自动控制，避免频繁请求

2. **文件大小限制**
   - 通过file_data上传：不超过50M
   - 通过file_url上传：PDF不超过300M，其他不超过50M
   - PDF文档最大支持2000页

3. **支持的文件格式**
   - 版式文档：pdf、jpg、jpeg、png、bmp、tif、tiff、ofd、ppt、pptx
   - 流式文档：doc、docx、txt、xls、xlsx、wps、html、mhtml

4. **解析结果有效期**
   - markdown_url和parse_result_url链接有效期30天
   - 建议及时下载保存重要结果

## 常见问题

### Q: Token验证失败？
A: 请检查Token是否正确，是否已过期。Token通常有效期为30天。

### Q: 文件上传失败？
A: 请检查：
- 文件格式是否支持
- 文件大小是否超过限制
- Token是否有效
- 网络连接是否正常

### Q: 解析结果一直显示"处理中"？
A: 解析可能需要较长时间，请耐心等待。如果超过10分钟仍无结果，可能是：
- 文件过大
- 服务器繁忙
- 任务失败（查看错误信息）

### Q: 如何查看详细的错误信息？
A: 在文件列表中，失败的文件会显示红色标签，点击查看详细错误信息。

## 开发说明

### 项目结构
```
parser-demo/
├── server/          # 后端服务（Express）
├── client/          # 前端应用（React + Vite）
└── README.md        # 详细文档
```

### 技术栈
- 后端：Node.js + Express + Axios
- 前端：React 18 + Vite + Ant Design 5
- 工具库：React Markdown, React JSON View, KaTeX

### 修改配置
- 后端端口：修改 `server/index.js` 中的 `PORT` 变量
- 前端端口：修改 `client/vite.config.js` 中的 `server.port`

