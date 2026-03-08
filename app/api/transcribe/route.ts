import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', 'whisper-large-v3');
    groqFormData.append('language', 'zh');
    groqFormData.append('response_format', 'verbose_json');
    
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
      },
      body: groqFormData,
    });
    
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const segments = data.segments?.map((seg: any, index: number) => ({
      id: `lyric-${index}`,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    })) || [];
    
    return NextResponse.json({ segments });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
