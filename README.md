# Latex-Extraction

`Latex-Extraction` 是一个基于 React + Vite 的前端工具，用来把数学公式截图或文本描述转换成可编辑的 LaTeX 代码。

你可以上传图片、粘贴截图或输入文本，前端会把请求发给本地服务端 API，再由服务端调用 Gemini 生成 LaTeX，并在页面中提供实时预览与手动编辑。

## 当前功能

- 上传数学公式图片
- 拖拽图片到输入区
- 直接粘贴截图到输入区
- 输入补充文字说明或直接输入公式文本
- 调用 Gemini 生成 LaTeX
- 使用 KaTeX 实时预览公式渲染结果
- 在编辑器中手动修正 LaTeX 源码
- 一键复制生成结果
- 内置几个常见 LaTeX 模板片段

## 技术栈

- React 19
- TypeScript
- Vite 6
- Tailwind CSS v4
- Framer Motion
- `@google/genai`
- KaTeX
- Prism.js
- `react-simple-code-editor`
- Express

## 项目结构

- `src/App.tsx`：主界面、上传交互、LaTeX 编辑与预览
- `server.js`：服务端入口，负责保存 API key、调用 Gemini、提供 `/api/extract-latex`
- `src/lib/gemini.ts`：前端 API 请求封装
- `src/lib/utils.ts`：样式工具函数
- `src/index.css`：全局样式、KaTeX 与代码高亮样式
- `vite.config.ts`：前端构建配置
- `.env.example`：环境变量示例文件

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local` 或 `.env`：

```bash
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

说明：

- `GEMINI_API_KEY` 现在只由 `server.js` 在服务端读取
- 浏览器端不会再拿到这个 key
- `PORT` 不填时默认是 `3000`

### 3. 启动开发环境

```bash
npm run dev
```

这个命令现在会同时启动：

- Express 服务端
- Vite 开发中间件
- 本地 API 路由 `/api/extract-latex`

默认地址：

```text
http://localhost:3000
```

### 4. 构建生产包

```bash
npm run build
```

构建完成后可用下面命令启动生产模式：

```bash
npm start
```

### 5. 类型检查

```bash
npm run lint
```

## 使用方式

1. 上传一张公式图片，或直接把截图粘贴到输入区
2. 如果需要，可以补充文字说明
3. 点击 `Synthesize Output`
4. 等待 Gemini 返回 LaTeX 结果
5. 在右侧编辑器中手动调整输出
6. 检查渲染预览是否正确
7. 点击复制按钮获取最终 LaTeX

## 平时怎么用

日常本地使用时，最简单的流程就是：

1. 第一次进入项目时运行 `npm install`
2. 在根目录准备 `.env.local` 或 `.env`，填好 `GEMINI_API_KEY`
3. 开发时运行 `npm run dev`
4. 打开 `http://localhost:3000`
5. 上传或粘贴公式图片，生成并修改 LaTeX

如果你只是想像正式环境那样跑一遍：

1. 先运行 `npm run build`
2. 再运行 `npm start`
3. 打开 `http://localhost:3000`

## 当前实现的限制

- 上传入口目前只接受图片文件，不支持 PDF
- 识别质量依赖图片清晰度、公式复杂度和 Gemini 的输出稳定性
- 多个公式会尝试合并为标准 LaTeX 环境，但结果仍可能需要手动修正
- 当前没有历史记录、文件导出或批量处理功能

## 安全说明

当前版本已经改成服务端代理模式：

- 浏览器只请求 `/api/extract-latex`
- `GEMINI_API_KEY` 只保存在服务端环境变量中
- Vite 不再把 key 注入前端 bundle

这意味着只要你没有把真实 `.env` 文件提交到仓库，访问网页的人就不能直接从前端代码里拿到你的 Gemini key。

仍然要注意：

- 不要把真实 `.env`、`.env.local` 提交到 Git
- 不要把带密钥的服务器日志或部署配置公开出去
- 如果你已经怀疑 key 泄漏，直接去 Gemini 控制台轮换 key

## 仓库现状说明

这个仓库目前已经是一个带最小后端代理的 LaTeX 提取应用。README 按当前代码行为编写，描述的是现在可直接运行的实现。
