// 穿越过渡：墨滴晕开 → 文字浮现 → 进入新页面
// 首次完整演绎；同一会话再次穿越时缩短；系统「减少动态效果」时直接跳转
let travels = 0;
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function inkTravel({ x, y, text = '', dark = true, duration }, go) {
  if (reduceMotion()) { go(); return; }
  const first = travels++ === 0;
  const total = duration ?? (first ? 2100 : 900);
  const veil = document.getElementById('veil');
  veil.classList.remove('out', 'on');
  veil.style.setProperty('--x', `${x}px`);
  veil.style.setProperty('--y', `${y}px`);
  // 墨晕与文字动画随总时长等比缩放
  veil.style.setProperty('--ink-dur', `${(total * 0.76) / 1000}s`);
  veil.style.setProperty('--text-dur', `${(total * 1.14) / 1000}s`);
  veil.querySelector('.veil-ink').style.background = dark
    ? 'radial-gradient(circle, #0c0f14 55%, rgba(12,15,20,.85) 70%, transparent 72%)'
    : 'radial-gradient(circle, #f1e9d8 55%, rgba(241,233,216,.85) 70%, transparent 72%)';
  veil.querySelector('.veil-text').style.color = dark ? '#e7dcc4' : '#1f1c18';
  veil.querySelector('.veil-text').textContent = text;
  void veil.offsetWidth;
  veil.classList.add('on');
  setTimeout(() => {
    go();
    setTimeout(() => {
      veil.classList.add('out');
      setTimeout(() => veil.classList.remove('on', 'out'), 800);
    }, first ? 250 : 120);
  }, total);
}
