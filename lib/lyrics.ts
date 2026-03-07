// 歌词解析和时间轴处理
export interface LyricLine {
  time: number; // 秒
  text: string;
}

export function parseLRC(content: string): LyricLine[] {
  const lines = content.split('\n');
  const lyrics: LyricLine[] = [];
  
  for (const line of lines) {
    const match = line.match(/\[(\d+):(\d+)\.(\d+)\](.*)/);
    if (match) {
      const [, min, sec, ms, text] = match;
      const time = parseInt(min) * 60 + parseInt(sec) + parseInt(ms) / 100;
      lyrics.push({ time, text: text.trim() });
    }
  }
  
  return lyrics.sort((a, b) => a.time - b.time);
}
