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
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API 错误:', data);
      throw new Error(data.message || data.error || 'API 调用失败');
    }
    
    return data.segments || [];
  } catch (error) {
    console.error('ASR 识别失败:', error);
    throw error;
  }
}
