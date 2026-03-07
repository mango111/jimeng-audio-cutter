# 即梦数字人音频智能裁切工具 v2.0

## 核心需求

1. 上传音频文件（中文歌曲）
2. 自动ASR识别生成歌词时间轴
3. 交互式歌词列表（复选框 + 点击播放）
4. 批量导出选中片段（≤36秒，超过自动分割）

## 技术栈

- Next.js 14 + TypeScript
- FFmpeg.wasm（音频处理）
- Web Speech API（ASR，先用模拟数据）
- Tailwind CSS

## 核心功能

### 1. 音频上传
- 支持 MP3/WAV/M4A
- 显示音频波形（可选）

### 2. ASR识别
- 先用模拟数据
- 后续接入 Whisper API

### 3. 交互式歌词
- 每句前有复选框
- 点击歌词 → 高亮 + 播放该片段
- 显示时间轴

### 4. 智能导出
- 勾选片段批量导出
- 超过36秒自动分割
- ZIP打包下载

## 项目结构

```
app/
  page.tsx              # 主界面
lib/
  asr.ts               # ASR识别（模拟）
  audio.ts             # 音频播放控制
  segment.ts           # 智能分割
  ffmpeg.ts            # FFmpeg封装
components/
  AudioUploader.tsx    # 上传组件
  LyricsList.tsx       # 歌词列表
  AudioPlayer.tsx      # 播放器
  ExportPanel.tsx      # 导出面板
```
