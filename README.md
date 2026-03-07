# 即梦数字人音频智能裁切工具 v2.0

为数字人视频制作提供音频智能分段，自动识别歌词，交互式裁切。

## 功能特性

- 🎵 上传音频文件（MP3/WAV/M4A）
- 🤖 自动ASR识别生成歌词时间轴
- ✅ 交互式歌词列表（复选框选择）
- 🎧 点击歌词播放对应片段
- ✂️ 智能分段（每段≤36秒）
- 📦 批量导出选中片段

## 使用流程

1. 上传音频文件
2. 等待自动识别歌词（2秒）
3. 点击歌词试听片段
4. 勾选需要导出的歌词
5. 点击"导出选中"批量下载

## 技术栈

- Next.js 14 + TypeScript
- FFmpeg.wasm（浏览器端音频处理）
- Tailwind CSS
- Web Speech API（ASR）

## 快速开始

```bash
# 1. 配置 API Key
cp .env.local.example .env.local
# 编辑 .env.local，填入 Groq API Key

# 2. 安装依赖
pnpm install

# 3. 开发模式
pnpm dev
```

访问 http://localhost:3000

## API 集成

已集成 Groq Whisper API，支持自动语音识别。

详见：[GROQ_INTEGRATION.md](./GROQ_INTEGRATION.md)

**降级策略**：未配置 API Key 时自动使用模拟数据。

## 项目结构

```
lib/
  asr.ts      - ASR识别（当前为模拟数据）
  audio.ts    - 音频播放控制
  segment.ts  - 智能分段算法
  ffmpeg.ts   - FFmpeg封装
app/
  page.tsx    - 主界面
```

## 开发计划

- [x] 交互式歌词列表
- [x] 点击播放片段
- [x] 智能分段算法
- [ ] 接入真实ASR（Whisper API）
- [ ] ZIP批量打包
- [ ] 音频波形显示

## GitHub

https://github.com/liumu96/jimeng-audio-cutter
