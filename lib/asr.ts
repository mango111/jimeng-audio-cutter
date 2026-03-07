// ASR识别 - Groq Whisper API
export interface LyricLine {
  id: string;
  start: number;
  end: number;
  text: string;
}

export async function transcribeAudio(audioFile: File): Promise<LyricLine[]> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  
  if (!apiKey) {
    console.warn('未配置 Groq API Key，使用模拟数据');
    return mockASR(audioFile);
  }
  
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'zh');
    formData.append('response_format', 'verbose_json');
    
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API 错误: ${response.status}`);
    }
    
    const data = await response.json();
    return parseWhisperResponse(data);
  } catch (error) {
    console.error('ASR 识别失败:', error);
    return mockASR(audioFile);
  }
}

function parseWhisperResponse(data: any): LyricLine[] {
  if (!data.segments) return [];
  
  return data.segments.map((seg: any, index: number) => ({
    id: `lyric-${index}`,
    start: seg.start,
    end: seg.end,
    text: seg.text.trim(),
  }));
}

async function mockASR(audioFile: File): Promise<LyricLine[]> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return [
    { id: '1', start: 0, end: 3.5, text: '天空好想下雨' },
    { id: '2', start: 3.5, end: 7.2, text: '我好想住你隔壁' },
    { id: '3', start: 7.2, end: 11.0, text: '傻站在你家楼下' },
    { id: '4', start: 11.0, end: 14.5, text: '抬起头数乌云' },
    { id: '5', start: 14.5, end: 18.3, text: '如果场景里出现一架钢琴' },
    { id: '6', start: 18.3, end: 22.0, text: '我会唱歌给你听' },
  ];
}
