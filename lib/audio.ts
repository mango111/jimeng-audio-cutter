// 音频播放控制
export class AudioController {
  private audio: HTMLAudioElement;
  
  constructor(audioFile: File) {
    this.audio = new Audio(URL.createObjectURL(audioFile));
  }
  
  playSegment(start: number, end: number) {
    this.audio.currentTime = start;
    this.audio.play();
    
    const checkTime = () => {
      if (this.audio.currentTime >= end) {
        this.audio.pause();
      } else {
        requestAnimationFrame(checkTime);
      }
    };
    checkTime();
  }
  
  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
  
  getDuration() {
    return this.audio.duration;
  }
}
