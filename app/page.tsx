'use client';

import { useState } from 'react';
import { parseLRC } from '@/lib/lyrics';
import { smartSegment } from '@/lib/segment';
import { cutAudio } from '@/lib/ffmpeg';

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState('');
  const [segments, setSegments] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!audioFile) return;
    
    setProcessing(true);
    const lyricLines = parseLRC(lyrics);
    const audio = new Audio(URL.createObjectURL(audioFile));
    
    audio.onloadedmetadata = () => {
      const segs = smartSegment(lyricLines, audio.duration);
      setSegments(segs);
      setProcessing(false);
    };
  };

  const handleExport = async () => {
    if (!audioFile) return;
    
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const blob = await cutAudio(audioFile, seg.start, seg.end, `segment_${i + 1}.mp3`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `segment_${i + 1}.mp3`;
      a.click();
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">即梦音频智能裁切</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-2">上传音频</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-2">歌词 (LRC格式)</label>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="border p-2 rounded w-full h-40"
            placeholder="[00:12.00]第一句歌词"
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={!audioFile || !lyrics || processing}
          className="bg-blue-500 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {processing ? '处理中...' : '智能分段'}
        </button>

        {segments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">分段预览 ({segments.length}段)</h2>
            <div className="space-y-2">
              {segments.map((seg, i) => (
                <div key={i} className="border p-3 rounded">
                  <div className="font-bold">段落 {i + 1}</div>
                  <div className="text-sm text-gray-600">
                    {seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s 
                    (时长: {(seg.end - seg.start).toFixed(1)}s)
                  </div>
                  <div className="text-sm mt-1">{seg.lyrics.join(' / ')}</div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleExport}
              className="bg-green-500 text-white px-6 py-2 rounded mt-4"
            >
              导出全部
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
