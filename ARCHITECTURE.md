# 即梦数字人音频智能裁切工具 - 技术架构

## 项目概述

**目标**：为数字人视频制作提供音频智能分段工具，每段≤36秒，自动去除静音。

**技术栈**：
- Next.js 14 (App Router)
- FFmpeg.wasm (浏览器端音频处理)
- Tailwind CSS
- TypeScript

## 核心功能

1. **音频上传** - 支持 MP3/WAV/M4A
2. **歌词解析** - LRC/TXT 格式
3. **智能分段** - 基于歌词时间轴，每段≤36秒
4. **静音检测** - 自动去除静音片段
5. **批量导出** - ZIP 打包下载

## 技术架构

```
┌─────────────────────────────────────┐
│         Next.js Frontend            │
├─────────────────────────────────────┤
│  Upload → Parse → Segment → Export  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         FFmpeg.wasm                 │
├─────────────────────────────────────┤
│  Audio Decode → Silence Detect →    │
│  Segment Cut → Export               │
└─────────────────────────────────────┘
```

## 目录结构

```
jimeng-audio-cutter/
├── app/
│   ├── page.tsx              # 主页面
│   ├── layout.tsx
│   └── api/
├── components/
│   ├── AudioUploader.tsx     # 音频上传
│   ├── LyricsParser.tsx      # 歌词解析
│   ├── SegmentPreview.tsx    # 分段预览
│   └── ExportPanel.tsx       # 导出面板
├── lib/
│   ├── ffmpeg.ts            # FFmpeg 封装
│   ├── lyrics.ts            # 歌词解析
│   ├── segment.ts           # 智能分段
│   └── silence.ts           # 静音检测
└── public/
```

## 核心算法

### 智能分段算法
```typescript
function smartSegment(lyrics, maxDuration = 36) {
  // 1. 按歌词时间轴分段
  // 2. 合并短片段（<10秒）
  // 3. 拆分长片段（>36秒）
  // 4. 在静音处切分
}
```

### 静音检测
```typescript
function detectSilence(audioBuffer, threshold = -40) {
  // 使用 FFmpeg silencedetect 滤镜
  // 返回静音区间列表
}
```

## 开发计划

**Day 1-2**: 项目初始化 + 音频上传
**Day 3-4**: 歌词解析 + 智能分段
**Day 5-6**: 静音检测 + 导出功能
**Day 7**: 测试优化 + 部署

## 技术难点

1. **FFmpeg.wasm 性能** - 大文件处理慢
2. **内存管理** - 浏览器内存限制
3. **分段精度** - 保证切分点准确

## 解决方案

1. 使用 Web Worker 处理
2. 分块处理大文件
3. 在静音处切分，避免截断
