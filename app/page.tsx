'use client';

import { useState } from 'react';
import { Upload, Music, Download, Play, Loader2 } from 'lucide-react';
import { transcribeAudio, LyricLine } from '@/lib/asr';
import { AudioController } from '@/lib/audio';
import { smartSegment } from '@/lib/segment';
import { cutAudio } from '@/lib/ffmpeg';

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recognitionProgress, setRecognitionProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [audioCtrl, setAudioCtrl] = useState<AudioController | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    // 模拟上传进度
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          startRecognition(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const startRecognition = async (file: File) => {
    setIsRecognizing(true);
    setRecognitionProgress(0);

    const ctrl = new AudioController(file);
    setAudioCtrl(ctrl);

    // 启动进度模拟
    const progressInterval = setInterval(() => {
      setRecognitionProgress(prev => Math.min(prev + 3, 90));
    }, 500);

    try {
      const result = await transcribeAudio(file);
      clearInterval(progressInterval);
      setRecognitionProgress(100);
      
      if (result.length > 0) {
        setLyrics(result);
      } else {
        alert('识别失败：未返回任何结果');
      }
    } catch (error) {
      clearInterval(progressInterval);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      alert('识别失败：' + errorMsg);
    }
    
    setTimeout(() => setIsRecognizing(false), 500);
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
      
      <div className="relative max-w-3xl mx-auto px-4 py-12">
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
          <p className="text-gray-600">上传音频，AI 自动识别，轻松裁剪 ✨</p>
        </div>

        {/* 上传区 */}
        {!audioFile && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-pink-100">
            <label className="block cursor-pointer">
              <div className="border-3 border-dashed border-gray-300 rounded-2xl p-16 text-center hover:border-pink-400 hover:bg-pink-50/50 transition-all">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl font-medium text-gray-700 mb-2">点击上传音频文件</p>
                <p className="text-sm text-gray-500">支持 MP3, WAV, M4A 格式</p>
              </div>
              <input type="file" accept="audio/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        )}

        {/* 上传进度 */}
        {isUploading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-pink-100">
            <div className="text-center mb-4">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-pink-500 animate-spin" />
              <p className="text-lg font-medium text-gray-700">正在上传音频...</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">{uploadProgress}%</p>
          </div>
        )}

        {/* 识别进度 */}
        {isRecognizing && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-purple-100">
            <div className="text-center mb-4">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-spin" />
              <p className="text-lg font-medium text-gray-700">AI 正在识别歌词...</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full" style={{ width: `${recognitionProgress}%` }} />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">{recognitionProgress}%</p>
          </div>
        )}

        {/* 歌词列表 */}
        {lyrics.length > 0 && !isRecognizing && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Music className="w-5 h-5 text-orange-500" />
              选择要裁剪的片段
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {lyrics.map(lyric => (
                <div key={lyric.id} className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selected.has(lyric.id) ? 'border-pink-400 bg-pink-50 shadow-md' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'} ${playing === lyric.id ? 'ring-2 ring-pink-400' : ''}`} onClick={() => toggleSelect(lyric.id)}>
                  <div className="flex items-center gap-4">
                    <input type="checkbox" checked={selected.has(lyric.id)} onChange={() => {}} className="w-5 h-5 text-pink-500 rounded" />
                    <span className="text-sm text-gray-500 font-mono min-w-[60px]">{lyric.start.toFixed(1)}s</span>
                    <span className="flex-1 text-gray-700">{lyric.text}</span>
                    <button onClick={(e) => { e.stopPropagation(); playLyric(lyric); }} className="p-2 rounded-lg hover:bg-pink-100 transition-colors">
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
          <button onClick={handleExport} className="w-full bg-gradient-to-r from-pink-600 to-orange-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
            <Download className="w-6 h-6" />
            导出选中片段 ({selected.size})
          </button>
        )}
      </div>
    </div>
  );
}
