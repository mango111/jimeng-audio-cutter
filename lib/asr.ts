// ASR识别 - Groq Whisper API
export interface LyricLine {
  id: string;
  start: number;
  end: number;
  text: string;
}

export async function transcribeAudio(audioFile: File): Promise<LyricLine[]> {
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API 错误: ${response.status}`);
    }
    
    const data = await response.json();
    return data.segments || [];
  } catch (error) {
    console.error('ASR 识别失败:', error);
    return [];
  }
}
