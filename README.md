# Latex-Extraction

`Latex-Extraction` 是一个基于 React + Vite 的前端工具，用来把数学公式截图或文本描述转换成可编辑的 LaTeX 代码。

你可以上传图片、粘贴截图或输入文本，前端会调用 Gemini 生成 LaTeX，并在页面中提供实时预览与手动编辑。

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

## 项目结构

- `src/App.tsx`：主界面、上传交互、LaTeX 编辑与预览
- `src/lib/gemini.ts`：调用 Gemini 生成 LaTeX 的核心逻辑
- `src/lib/utils.ts`：样式工具函数
- `src/index.css`：全局样式、KaTeX 与代码高亮样式
- `vite.config.ts`：Vite 配置，以及 `GEMINI_API_KEY` 的构建期注入
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
```

说明：

- 当前代码通过 `vite.config.ts` 在构建时读取 `GEMINI_API_KEY`
- `.env.example` 里还有 `APP_URL` 示例字段，但当前应用代码没有实际使用它

### 3. 启动开发环境

```bash
npm run dev
```

默认会启动在：

```text
http://localhost:3000
```

### 4. 构建生产包

```bash
npm run build
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

## 当前实现的限制

- 上传入口目前只接受图片文件，不支持 PDF
- 识别质量依赖图片清晰度、公式复杂度和 Gemini 的输出稳定性
- 多个公式会尝试合并为标准 LaTeX 环境，但结果仍可能需要手动修正
- 当前没有历史记录、文件导出或批量处理功能

## 安全说明

当前实现会在前端直接调用 Gemini，且 `GEMINI_API_KEY` 是通过 `vite.config.ts` 注入到客户端构建产物中的。

这意味着：

- 如果你只是在本地开发使用，风险主要在你自己的机器环境
- 如果你把当前版本直接公开部署，访问页面的人理论上可能提取并滥用你的 API key

因此当前实现更适合：

- 本地开发
- 个人使用
- 受信任的内部环境

不建议直接用于公开部署。若要安全上线，建议改成：

- 前端只请求你自己的后端接口
- 后端保存私密 API key
- 后端再代为调用 Gemini

## 仓库现状说明

这个仓库目前包含的是一个已成型的 LaTeX 提取前端，而不是完整的后端服务。README 已按现有代码行为编写，因此文档描述的是“当前实际实现”，不是未来规划版本。
