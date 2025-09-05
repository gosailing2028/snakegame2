export class Sound{
  constructor(){
    this.ctx = null;
    this.enabled = true;
  }
  _ensure(){
    if(!this.ctx){
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }
  play(freq=440, duration=0.08, type='sine', gain=0.04){
    this._ensure();
    if(!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type=type; o.frequency.value=freq;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t+duration);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t+duration);
  }
  eat(){ this.play(660, 0.08, 'sine', 0.06); }
  hit(){ this.play(160, 0.12, 'square', 0.08); }
}