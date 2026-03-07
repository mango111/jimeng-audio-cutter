// 智能分段算法
import { LyricLine } from './lyrics';

export interface Segment {
  start: number;
  end: number;
  lyrics: string[];
}

export function smartSegment(
  lyrics: LyricLine[],
  audioDuration: number,
  maxDuration = 36
): Segment[] {
  const segments: Segment[] = [];
  let currentStart = 0;
  let currentLyrics: string[] = [];
  
  for (let i = 0; i < lyrics.length; i++) {
    const current = lyrics[i];
    const next = lyrics[i + 1];
    const duration = current.time - currentStart;
    
    currentLyrics.push(current.text);
    
    // 达到最大时长或最后一句
    if (duration >= maxDuration || !next) {
      const end = next ? next.time : audioDuration;
      segments.push({
        start: currentStart,
        end,
        lyrics: [...currentLyrics]
      });
      currentStart = end;
      currentLyrics = [];
    }
  }
  
  return segments;
}
