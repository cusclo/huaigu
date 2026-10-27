// 怀古 · 古典金石与雅乐声律合成引擎（Web Audio API 原生纯算合成，零外部音频资源依赖）
let audioCtx = null;
let soundEnabled = localStorage.getItem('huaigu_sound') === '1';

function getContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('huaigu_sound', soundEnabled ? '1' : '0');
  if (soundEnabled) {
    getContext();
    playChime(660); // 试听提示音
  }
  return soundEnabled;
}

/**
 * 模拟先秦编钟 / 青铜磬泛音
 * @param {number} baseFreq 基频 (Hz)
 */
export function playChime(baseFreq = 523.25) { // 默认 C5 宫音
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.18, now);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
  master.connect(ctx.destination);

  // 编钟双音频泛音结构（椭圆钟体双音）
  const partials = [
    { ratio: 1.0, gain: 0.8 },
    { ratio: 2.76, gain: 0.35 },
    { ratio: 5.4, gain: 0.15 },
    { ratio: 8.9, gain: 0.08 },
  ];

  partials.forEach(({ ratio, gain }) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * ratio, now);

    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + (2.5 / Math.sqrt(ratio)));

    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + 3.0);
  });
}

/**
 * 模拟古琴散音与泛音（七弦古琴丝木共振）
 * @param {'gong'|'shang'|'jiao'|'zhi'|'yu'} note 五声音阶
 */
export function playZither(note = 'gong') {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const PENTATONIC = {
    gong: 261.63,   // 宫 (C4)
    shang: 293.66,  // 商 (D4)
    jiao: 329.63,   // 角 (E4)
    zhi: 392.00,    // 徵 (G4)
    yu: 440.00,     // 羽 (A4)
  };

  const freq = PENTATONIC[note] || 261.63;
  const now = ctx.currentTime;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(freq * 4, now);
  filter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 1.2);

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.22, now);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

  filter.connect(master);
  master.connect(ctx.destination);

  // 琴弦主振荡
  const osc1 = ctx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(freq, now);

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.01, now); // 轻微失谐模拟琴面共振

  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.4, now);
  g2.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

  osc1.connect(filter);
  osc2.connect(g2);
  g2.connect(filter);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 3.3);
  osc2.stop(now + 3.3);
}

/**
 * 播放供奉 / 题壁水墨清音（轻磬玉石声）
 */
export function playOfferingSound() {
  playChime(784); // 高徵音 (G5)
}

/**
 * 播放古今对话穿越灵光音
 */
export function playTravelSound() {
  playZither('yu');
}
