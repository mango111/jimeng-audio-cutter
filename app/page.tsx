'use client';

import { useState } from 'react';
import { transcribeAudio, LyricLine } from '@/lib/asr';
import { AudioController } from '@/lib/audio';
import { smartSegment } from '@/lib/segment';
import { cutAudio } from '@/lib/ffmpeg';

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioCtrl, setAudioCtrl] = useState<AudioController | null>(null);

  const handleUpload = async (file: File) => {
    setAudioFile(file);
    setLoading(true);
    
    const ctrl = new AudioController(file);
    setAudioCtrl(ctrl);
    
    const result = await transcribeAudio(file);
    setLyrics(result);
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const playLyric = (lyric: LyricLine) => {
    if (!audioCtrl) return;
    setPlaying(lyric.id);
    audioCtrl.playSegment(lyric.start, lyric.end);
    setTimeout(() => setPlaying(null), (lyric.end - lyric.start) * 1000);
  };

  const handleExport = async () => {
    if (!audioFile) return;
    
    const selectedLyrics = lyrics.filter(l => selected.has(l.id));
    const segments = smartSegment(selectedLyrics);
    
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
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            className="border p-2 rounded w-full"
          />
        </div>

        {loading && <div className="text-center">识别中...</div>}

        {lyrics.length > 0 && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">歌词列表</h2>
              <button
                onClick={handleExport}
                disabled={selected.size === 0}
                className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                导出选中 ({selected.size})
              </button>
            </div>
            
            <div className="space-y-2">
              {lyrics.map(lyric => (
                <div
                  key={lyric.id}
                  className={`border p-3 rounded flex items-center gap-3 cursor-pointer ${
                    playing === lyric.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => playLyric(lyric)}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(lyric.id)}
                    onChange={() => toggleSelect(lyric.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{lyric.text}</div>
                    <div className="text-sm text-gray-500">
                      {lyric.start.toFixed(1)}s - {lyric.end.toFixed(1)}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
