// 供品图鉴（古风雅物 + 今世饮食 + 跨世奇物）
export const OFFERING_CATS = [
  { id: 'ancient', name: '古风雅物' },
  { id: 'modern', name: '今世饮食' },
  { id: 'future', name: '跨世奇物' },
];

export const OFFERINGS = [
  {
    id: 'wine', name: '清酒一壶', cat: 'ancient', sub: '青瓷酒壶 · 对影成三人',
    svg: `<g>
      <ellipse cx="0" cy="-2" rx="14" ry="3.5" fill="rgba(0,0,0,.22)"/>
      <path d="M-9 -2 C-15 -14 -7 -24 -4 -31 L-3 -37 L3 -37 L4 -31 C7 -24 15 -14 9 -2 Z" fill="#84a399" stroke="#3c524b" stroke-width="1"/>
      <rect x="-4.5" y="-40" width="9" height="4" rx="1" fill="#a8322d"/>
      <path d="M9 -24 C17 -26 18 -14 9 -11" fill="none" stroke="#3c524b" stroke-width="1.6"/>
      <path d="M-8 -18 Q-16 -24 -18 -29" fill="none" stroke="#3c524b" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M12 -2 L14 -9 L21 -9 L23 -2 Z" fill="#9dbbb0" stroke="#3c524b" stroke-width=".9"/>
    </g>`,
  },
  {
    id: 'tea', name: '清茶一盏', cat: 'ancient', sub: '热气袅袅 · 故人请用茶',
    svg: `<g>
      <ellipse cx="0" cy="-2" rx="15" ry="4" fill="#6b4e35"/>
      <path d="M-11 -4 C-11 -16 11 -16 11 -4 Z" fill="#dfeae2" stroke="#4a5d54" stroke-width="1"/>
      <ellipse cx="0" cy="-14" rx="10.5" ry="3" fill="#c7d8cb" stroke="#4a5d54" stroke-width=".9"/>
      <ellipse cx="0" cy="-14" rx="8.5" ry="2" fill="#8aa868"/>
      <path d="M-3 -19 q-3 -6 1 -11 M3 -18 q3 -6 -1 -12" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.1" stroke-linecap="round"/>
    </g>`,
  },
  {
    id: 'dongpo', name: '东坡红烧肉', cat: 'ancient', sub: '慢著火少著水 · 火候足时他自美',
    svg: `<g>
      <ellipse cx="0" cy="-2" rx="18" ry="4.5" fill="#d9d1c0" stroke="#5a5246" stroke-width="1"/>
      <rect x="-11" y="-17" width="22" height="13" rx="2.5" fill="#8f2c1c"/>
      <rect x="-11" y="-14" width="22" height="3.5" fill="#e6b998"/>
      <rect x="-11" y="-19" width="22" height="4.5" rx="2" fill="#b63e24"/>
      <path d="M-11 -11 L11 -11 M0 -19 L0 -4" stroke="#d9b45a" stroke-width="1.1"/>
      <circle cx="-6" cy="-6" r="2.5" fill="#4f7a42"/><circle cx="7" cy="-6" r="2.5" fill="#4f7a42"/>
    </g>`,
  },
  {
    id: 'zongzi', name: '楚江香粽', cat: 'ancient', sub: '青箬裹糯 · 岁岁端午不曾忘',
    svg: `<g>
      <ellipse cx="0" cy="-2" rx="18" ry="4.5" fill="#d9cfba" stroke="#5a5246" stroke-width="1"/>
      <path d="M-12 -5 L-2 -22 L8 -5 Z" fill="#486b3e" stroke="#2c4425" stroke-width="1"/>
      <path d="M-2 -4 L7 -20 L15 -4 Z" fill="#587d4b" stroke="#2c4425" stroke-width="1"/>
      <path d="M-7 -12 L3 -11 M2 -11 L11 -10" stroke="#d9b45a" stroke-width="1.2"/>
    </g>`,
  },
  {
    id: 'fruits', name: '时令鲜果', cat: 'ancient', sub: '寿桃与柑橘 · 四时风物',
    svg: `<g>
      <ellipse cx="0" cy="-2" rx="19" ry="4.5" fill="#b8432f" stroke="#5c1e14" stroke-width="1"/>
      <circle cx="-7" cy="-10" r="7" fill="#e28a2b"/>
      <circle cx="7" cy="-9" r="6.5" fill="#d94f3d"/>
      <path d="M0 -8 C-7 -15 -5 -24 0 -25 C5 -24 7 -15 0 -8 Z" fill="#f29aa2"/>
      <path d="M0 -24 q4 -3 7 0" stroke="#4b733b" stroke-width="1.6" fill="none"/>
    </g>`,
  },
  {
    id: 'flowers', name: '秋菊寒梅', cat: 'ancient', sub: '瓶插清供 · 幽香一室',
    svg: `<g>
      <path d="M-6 -2 L-8 -18 L-3 -26 L3 -26 L8 -18 L6 -2 Z" fill="#e8e2d2" stroke="#5c5549" stroke-width="1"/>
      <path d="M0 -26 C-4 -36 -10 -42 -13 -47 M0 -26 C3 -37 9 -43 13 -49 M0 -26 L-1 -46" stroke="#3d3228" stroke-width="1.3" fill="none"/>
      <circle cx="-11" cy="-45" r="3.5" fill="#d94f5c"/><circle cx="-5" cy="-38" r="3" fill="#e67380"/>
      <circle cx="9" cy="-44" r="4.5" fill="#e8b838"/><circle cx="2" cy="-42" r="4" fill="#f0c850"/>
      <circle cx="13" cy="-49" r="2.8" fill="#d94f5c"/>
    </g>`,
  },
  {
    id: 'milktea', name: '冰镇珍珠奶茶', cat: 'modern', sub: '全糖少冰 · 请古人尝尝现代甜水',
    svg: `<g>
      <path d="M-9 -2 L-11 -28 L11 -28 L9 -2 Z" fill="#f3dfc1" stroke="#5c4938" stroke-width="1"/>
      <path d="M-10 -22 L10 -22 L9 -4 L-9 -4 Z" fill="#d8a974"/>
      <ellipse cx="0" cy="-28" rx="11.5" ry="2.6" fill="#fff8ec" stroke="#5c4938" stroke-width="1"/>
      <line x1="2" y1="-16" x2="6" y2="-38" stroke="#a8322d" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="-5" cy="-6" r="1.7" fill="#2b1d12"/><circle cx="-1" cy="-5.5" r="1.7" fill="#2b1d12"/><circle cx="4" cy="-6.5" r="1.7" fill="#2b1d12"/><circle cx="-3" cy="-9" r="1.7" fill="#2b1d12"/><circle cx="2" cy="-9.5" r="1.7" fill="#2b1d12"/>
    </g>`,
  },
  {
    id: 'cola', name: '冰阔落', cat: 'modern', sub: '呲——碳酸气泡的快乐水',
    svg: `<g>
      <rect x="-8.5" y="-27" width="17" height="25" rx="2.5" fill="#c62828" stroke="#6d1212" stroke-width="1"/>
      <ellipse cx="0" cy="-27" rx="8.5" ry="2.2" fill="#d8dde0" stroke="#666" stroke-width=".8"/>
      <path d="M-8.5 -15 Q0 -19 8.5 -13" fill="none" stroke="#ffffff" stroke-width="2.2"/>
      <circle cx="-3" cy="-32" r="1.1" fill="rgba(255,255,255,.7)"/><circle cx="3" cy="-35" r="1.4" fill="rgba(255,255,255,.6)"/>
    </g>`,
  },
  {
    id: 'coffee', name: '手冲拿铁', cat: 'modern', sub: '提神醒脑 · 熬夜写诗必备',
    svg: `<g>
      <ellipse cx="0" cy="-2" rx="14" ry="3.2" fill="#ebe5d8" stroke="#5a5246" stroke-width="1"/>
      <path d="M-9 -4 L-10 -20 L10 -20 L9 -4 Z" fill="#f7f3ea" stroke="#5a5246" stroke-width="1"/>
      <path d="M10 -17 C15 -17 15 -8 9 -8" fill="none" stroke="#5a5246" stroke-width="1.8"/>
      <ellipse cx="0" cy="-20" rx="10" ry="2.6" fill="#9c6b43"/>
      <path d="M-3 -20 C-3 -22 0 -22 0 -20 C0 -22 3 -22 3 -20 C3 -18 0 -17 0 -17 C0 -17 -3 -18 -3 -20 Z" fill="#f7f3ea"/>
    </g>`,
  },
  {
    id: 'hotpot', name: '红油小火锅', cat: 'modern', sub: '咕嘟咕嘟 · 人间烟火气最抚故人心',
    svg: `<g>
      <rect x="-10" y="-6" width="20" height="4" fill="#3a3530"/>
      <circle cx="0" cy="-4" r="2" fill="#ff7a29"/>
      <path d="M-16 -17 L16 -17 L12 -6 L-12 -6 Z" fill="#b86b35" stroke="#4a2c15" stroke-width="1"/>
      <ellipse cx="0" cy="-17" rx="16" ry="4.5" fill="#c83728" stroke="#4a2c15" stroke-width="1"/>
      <path d="M0 -21.5 C-5 -19 5 -15 0 -12.5" fill="none" stroke="#e8dcc4" stroke-width="1.3"/>
      <path d="M-6 -20 C2 -19 -2 -15 -6 -13.5 L-13 -16 Z" fill="#f3e6cc" opacity=".88"/>
      <path d="M-4 -25 q-2 -6 2 -11 M4 -24 q2 -6 -2 -12" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.2" stroke-linecap="round"/>
    </g>`,
  },
  {
    id: 'burger', name: '炸鸡与汉堡', cat: 'modern', sub: '热量炸弹 · 来自西方的胡饼与炙鸡',
    svg: `<g>
      <ellipse cx="0" cy="-2" rx="16" ry="4" fill="#f0e6d2" stroke="#5a5246" stroke-width="1"/>
      <path d="M-11 -5 L11 -5 L10 -2 L-10 -2 Z" fill="#d99b4e"/>
      <rect x="-12" y="-8" width="24" height="3.2" rx="1.5" fill="#5e3219"/>
      <path d="M-12 -8 L-8 -11 L-3 -8 L3 -11 L8 -8 L12 -10" fill="none" stroke="#5a9e3e" stroke-width="2"/>
      <path d="M-11 -10 C-11 -19 11 -19 11 -10 Z" fill="#d99b4e" stroke="#6e471b" stroke-width="1"/>
      <circle cx="-4" cy="-14" r=".8" fill="#fff"/><circle cx="0" cy="-15" r=".8" fill="#fff"/><circle cx="4" cy="-13.5" r=".8" fill="#fff"/>
    </g>`,
  },
  {
    id: 'ticket', name: '复兴号高铁票', cat: 'future', sub: '千里江陵一日还 · 朝发夕至已成真',
    svg: `<g transform="rotate(-6)">
      <rect x="-16" y="-20" width="32" height="18" rx="2" fill="#89b8d6" stroke="#2c4c63" stroke-width="1"/>
      <rect x="-16" y="-20" width="32" height="4.5" fill="#3a7ca5"/>
      <line x1="-11" y1="-11" x2="-3" y2="-11" stroke="#1d3240" stroke-width="1.6"/>
      <line x1="3" y1="-11" x2="11" y2="-11" stroke="#1d3240" stroke-width="1.6"/>
      <path d="M-1 -11 L2 -11 M1 -13 L3 -11 L1 -9" fill="none" stroke="#a8322d" stroke-width="1.2"/>
      <line x1="-11" y1="-6" x2="8" y2="-6" stroke="#2c4c63" stroke-width="1" stroke-dasharray="2 1"/>
    </g>`,
  },
  {
    id: 'china_map', name: '今日盛世舆图', cat: 'future', sub: '山河无恙 · 烟火寻常 · 如公所愿',
    svg: `<g>
      <rect x="-18" y="-11" width="36" height="8" rx="2" fill="#e8dcc4" stroke="#6e5a3e" stroke-width="1"/>
      <ellipse cx="-18" cy="-7" rx="2.5" ry="4.5" fill="#a8322d"/>
      <ellipse cx="18" cy="-7" rx="2.5" ry="4.5" fill="#a8322d"/>
      <path d="M-12 -11 L-10 -25 L10 -25 L12 -11 Z" fill="#f3ead8" stroke="#6e5a3e" stroke-width="1"/>
      <path d="M-5 -19 l4 -2 l4 1 l2 3 l-3 3 l-5 -1 z" fill="#c94f44" opacity=".8"/>
    </g>`,
  },
  {
    id: 'moon_photo', name: '嫦娥探月照片', cat: 'future', sub: '今人已登广寒宫 · 替太白摘下月色',
    svg: `<g>
      <rect x="-13" y="-32" width="26" height="30" rx="1.5" fill="#18202c" stroke="#d9b45a" stroke-width="1.4"/>
      <circle cx="0" cy="-19" r="7" fill="#f5e9c8"/>
      <circle cx="-2" cy="-20" r="1.5" fill="#d8caa6"/><circle cx="3" cy="-17" r="1.1" fill="#d8caa6"/>
      <path d="M-12 -6 Q0 -11 12 -6 L12 -3 L-12 -3 Z" fill="#7c8794"/>
      <line x1="6" y1="-8" x2="6" y2="-14" stroke="#d9b45a" stroke-width="1"/>
      <rect x="6" y="-14" width="4" height="2.6" fill="#c8352b"/>
    </g>`,
  },
  {
    id: 'textbook', name: '现代语文课本', cat: 'future', sub: '「背诵全文」· 千载之下孩童皆诵公诗',
    svg: `<g>
      <path d="M-14 -3 L-11 -22 L13 -22 L10 -3 Z" fill="#d94f3d" stroke="#5c1e14" stroke-width="1"/>
      <path d="M-14 -3 L10 -3 L11 -1 L-13 -1 Z" fill="#f5efe2" stroke="#5a5246" stroke-width=".8"/>
      <rect x="-6" y="-19" width="12" height="12" fill="#f5efe2" stroke="#5c1e14" stroke-width=".7"/>
      <line x1="-2" y1="-16" x2="-2" y2="-9" stroke="#2a241d" stroke-width="1.2"/>
      <line x1="2" y1="-16" x2="2" y2="-9" stroke="#2a241d" stroke-width="1.2"/>
    </g>`,
  },
  {
    id: 'glasses', name: '老花眼镜', cat: 'future', sub: '琉璃明目 · 愿先生晚年读书不再昏花',
    svg: `<g>
      <ellipse cx="0" cy="-2" rx="16" ry="3.5" fill="rgba(0,0,0,.18)"/>
      <circle cx="-7" cy="-8" r="5.5" fill="rgba(220,240,250,.35)" stroke="#b08d57" stroke-width="1.5"/>
      <circle cx="7" cy="-8" r="5.5" fill="rgba(220,240,250,.35)" stroke="#b08d57" stroke-width="1.5"/>
      <path d="M-1.5 -8 Q0 -10 1.5 -8" fill="none" stroke="#b08d57" stroke-width="1.5"/>
      <path d="M-12.5 -8 L-16 -14 M12.5 -8 L16 -14" stroke="#b08d57" stroke-width="1.3" stroke-linecap="round"/>
    </g>`,
  },
];

export const OFFERING_MAP = Object.fromEntries(OFFERINGS.map((o) => [o.id, o]));
