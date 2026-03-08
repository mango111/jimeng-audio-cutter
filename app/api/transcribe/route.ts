import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('开始识别音频:', audioFile.name, audioFile.size);

    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', 'whisper-large-v3');
    groqFormData.append('language', 'zh');
    groqFormData.append('response_format', 'verbose_json');
    
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    console.log('API Key 存在:', !!apiKey);
    
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: groqFormData,
    });
    
    console.log('Groq 响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API 错误:', errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('识别到片段数:', data.segments?.length || 0);
    
    const segments = data.segments?.map((seg: any, index: number) => ({
      id: `lyric-${index}`,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    })) || [];
    
    return NextResponse.json({ segments });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ 
      error: 'Transcription failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
