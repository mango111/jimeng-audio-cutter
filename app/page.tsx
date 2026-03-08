'use client';

import { useState } from 'react';
import { Upload, Music, Search, Sparkles, Download, Play } from 'lucide-react';
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
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [lyricsSource, setLyricsSource] = useState<'netease' | 'ai' | null>(null);

  const handleUpload = async (file: File) => {
    setAudioFile(file);
    setLoading(true);
    
    const ctrl = new AudioController(file);
    setAudioCtrl(ctrl);
    
    const result = await transcribeAudio(file);
    setLyrics(result);
    setLoading(false);
  };

  const fetchLyrics = async (forceAI = false) => {
    if (!songName) return;
    setLoading(true);
    
    try {
      const params = new URLSearchParams({ song: songName });
      if (artistName) params.append('artist', artistName);
      if (forceAI) params.append('forceAI', 'true');
      
      const res = await fetch(`/api/lyrics?${params}`);
      const data = await res.json();
      
      if (data.lyrics) {
        setLyricsSource(data.source);
        const lines = data.lyrics.split('\n').filter((l: string) => l.trim());
        const parsed = lines.map((text: string, i: number) => ({
          id: `lyric-${i}`,
          text: text.replace(/\[\d+:\d+\.\d+\]/g, '').trim(),
          start: i * 3,
          end: (i + 1) * 3
        }));
        setLyrics(parsed);
      }
    } catch (error) {
      alert('查询失败');
    }
    
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-purple-50">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-3xl" />
      
      <div className="relative max-w-4xl mx-auto px-4 py-12">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              即梦音频智能裁切
            </h1>
          </div>
          <p className="text-gray-600">轻松裁剪你的音频片段，让创作更简单 ✨</p>
        </div>

        {/* 音频上传 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6 border border-pink-100">
          <label className="block cursor-pointer">
            <div className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
              audioFile ? 'border-pink-400 bg-pink-50' : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/50'
            }`}>
              <Upload className={`w-12 h-12 mx-auto mb-4 ${audioFile ? 'text-pink-500' : 'text-gray-400'}`} />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {audioFile ? audioFile.name : '点击上传音频文件'}
              </p>
              <p className="text-sm text-gray-500">支持 MP3, WAV, M4A 格式</p>
            </div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        {/* 歌词查询 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-500" />
            歌词查询
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="歌曲名"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="演唱者（可选）"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => fetchLyrics(false)}
              disabled={!songName || loading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              查询歌词
            </button>
            {lyricsSource === 'netease' && (
              <button
                onClick={() => fetchLyrics(true)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                AI 重新识别
              </button>
            )}
          </div>
          
          {lyricsSource && (
            <div className="mt-4 text-sm text-gray-600 bg-pink-50 px-4 py-2 rounded-lg">
              来源：{lyricsSource === 'netease' ? '网易云音乐 🎵' : 'AI识别 ✨'}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">识别中...</p>
          </div>
        )}

        {/* 歌词列表 */}
        {lyrics.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6 border border-purple-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-500" />
              选择片段
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {lyrics.map(lyric => (
                <div
                  key={lyric.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selected.has(lyric.id)
                      ? 'border-pink-400 bg-pink-50' 
                      : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                  } ${playing === lyric.id ? 'ring-2 ring-pink-400' : ''}`}
                  onClick={() => toggleSelect(lyric.id)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selected.has(lyric.id)}
                      onChange={() => {}}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-400"
                    />
                    <span className="text-sm text-gray-500 font-mono">
                      {lyric.start.toFixed(1)}s
                    </span>
                    <span className="flex-1 text-gray-700">{lyric.text}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playLyric(lyric);
                      }}
                      className="p-2 rounded-lg hover:bg-pink-100 transition-colors"
                    >
                      <Play className="w-4 h-4 text-pink-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 导出按钮 */}
        {selected.size > 0 && (
          <button
            onClick={handleExport}
            className="w-full bg-gradient-to-r from-pink-600 to-orange-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3"
          >
            <Download className="w-6 h-6" />
            导出选中片段 ({selected.size})
          </button>
        )}
      </div>
    </div>
  );
}
