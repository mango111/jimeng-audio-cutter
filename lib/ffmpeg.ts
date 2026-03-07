// FFmpeg.wasm 封装
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg() {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
}

export async function cutAudio(
  audioFile: File,
  start: number,
  end: number,
  outputName: string
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();
  
  await ffmpeg.writeFile('input.mp3', new Uint8Array(await audioFile.arrayBuffer()));
  
  await ffmpeg.exec([
    '-i', 'input.mp3',
    '-ss', start.toString(),
    '-to', end.toString(),
    '-c', 'copy',
    outputName
  ]);
  
  const data = await ffmpeg.readFile(outputName);
  // FFmpeg returns Uint8Array
  return new Blob([data as Uint8Array], { type: 'audio/mpeg' });
}
