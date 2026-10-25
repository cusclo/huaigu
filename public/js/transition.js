// 穿越过渡：墨滴晕开 → 文字浮现 → 进入新页面
export function inkTravel({ x, y, text = '', dark = true, duration = 2100 }, go) {
  const veil = document.getElementById('veil');
  veil.classList.remove('out', 'on');
  veil.style.setProperty('--x', `${x}px`);
  veil.style.setProperty('--y', `${y}px`);
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
    }, 250);
  }, duration);
}
