// 智能分段算法
import { LyricLine } from './asr';

export interface Segment {
  id: string;
  start: number;
  end: number;
  lyrics: string[];
  duration: number;
}

export function smartSegment(
  selectedLyrics: LyricLine[],
  maxDuration = 36
): Segment[] {
  const segments: Segment[] = [];
  let current: LyricLine[] = [];
  let startTime = 0;
  
  for (const lyric of selectedLyrics) {
    const duration = lyric.end - startTime;
    
    if (duration > maxDuration && current.length > 0) {
      // 超过最大时长，创建新段
      const lastLyric = current[current.length - 1];
      segments.push({
        id: `seg-${segments.length}`,
        start: startTime,
        end: lastLyric.end,
        lyrics: current.map(l => l.text),
        duration: lastLyric.end - startTime
      });
      current = [lyric];
      startTime = lyric.start;
    } else {
      current.push(lyric);
    }
  }
  
  // 最后一段
  if (current.length > 0) {
    const lastLyric = current[current.length - 1];
    segments.push({
      id: `seg-${segments.length}`,
      start: startTime,
      end: lastLyric.end,
      lyrics: current.map(l => l.text),
      duration: lastLyric.end - startTime
    });
  }
  
  return segments;
}
