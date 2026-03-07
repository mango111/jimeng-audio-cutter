# 部署指南

## Vercel 部署

### 方式1：通过 GitHub（推荐）

1. 推送代码到 GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/liumu96/jimeng-audio-cutter.git
git push -u origin main
```

2. 访问 https://vercel.com
3. 点击 "Import Project"
4. 选择 GitHub 仓库
5. 配置环境变量：
   - `NEXT_PUBLIC_SILICONFLOW_API_KEY`
6. 点击 Deploy

### 方式2：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

## 环境变量配置

在 Vercel 项目设置中添加：

```
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

## 部署后测试

访问部署的 URL，上传音频测试功能。
