# Groq Whisper API 集成指南

## 获取 API Key

1. 访问 https://console.groq.com
2. 注册/登录账号
3. 获取免费 API Key

## 配置

创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

## API 端点

```
POST https://api.groq.com/openai/v1/audio/transcriptions
```

## 请求参数

- `file`: 音频文件（mp3/wav/m4a/mp4/mpeg/mpga/webm）
- `model`: whisper-large-v3
- `language`: zh（中文）
- `response_format`: verbose_json（包含时间戳）

## 响应格式

```json
{
  "segments": [
    {
      "start": 0.0,
      "end": 3.5,
      "text": "歌词内容"
    }
  ]
}
```

## 降级策略

如果 API Key 未配置或请求失败，自动使用模拟数据。

## 测试

```bash
pnpm dev
```

上传音频文件，系统会自动调用 Groq API 识别歌词。
