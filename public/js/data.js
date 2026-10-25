// 九州怀古录 · 统一数据门面与注册表（先秦至明代：123位先贤陵寝 + 38处名胜古迹，共161处人文坐标）
import { XIANQIN } from './figures/xianqin.js';
import { QINHAN } from './figures/qinhan.js';
import { WEIJIN } from './figures/weijin.js';
import { SUITANG } from './figures/suitang.js';
import { SONG } from './figures/song.js';
import { YUANMING } from './figures/yuanming.js';

import { BATTLEFIELDS } from './sites/battlefields.js';
import { PALACES } from './sites/palaces.js';
import { ARCHAEOLOGY } from './sites/archaeology.js';

import { normalizeEntity } from './core/normalizer.js';
import { decollideCoordinates } from './core/spatial.js';

export const ERAS = ['先秦', '秦汉', '魏晋', '隋唐', '宋', '元明'];

export const FIGURE_ROLES = [
  '帝王霸主',
  '将相名臣',
  '起义豪杰',
  '圣贤哲人',
  '文豪艺人',
  '百工奇人'
];

export const SITE_ROLES = [
  '古战场遗址',
  '建筑宫殿遗址',
  '考古文明遗址'
];

export const ROLES = [...FIGURE_ROLES, ...SITE_ROLES];

export const ROLE_META = {
  // 先贤人物六类
  '帝王霸主':     { color: '#c4832b', badge: '帝', kind: 'figure', desc: '开疆拓土 · 帝王霸业' },
  '将相名臣':     { color: '#a8362b', badge: '相', kind: 'figure', desc: '定国安邦 · 铁血丹心' },
  '起义豪杰':     { color: '#c25229', badge: '义', kind: 'figure', desc: '揭竿而起 · 替天行道' },
  '圣贤哲人':     { color: '#3f765a', badge: '圣', kind: 'figure', desc: '立德立言 · 万世师表' },
  '文豪艺人':     { color: '#6b538c', badge: '文', kind: 'figure', desc: '锦绣诗篇 · 翰墨丹青' },
  '百工奇人':     { color: '#396f8f', badge: '工', kind: 'figure', desc: '格物致知 · 巧夺天工' },
  // 名胜古迹三类
  '古战场遗址':   { color: '#9e2820', badge: '战', kind: 'site',   desc: '金戈铁马 · 千古沙场' },
  '建筑宫殿遗址': { color: '#9e6b24', badge: '宫', kind: 'site',   desc: '琼楼天工 · 雄关名阁' },
  '考古文明遗址': { color: '#2b6e68', badge: '古', kind: 'site',   desc: '文明探源 · 旷世遗珍' }
};

const RAW_ALL = [
  ...XIANQIN,
  ...QINHAN,
  ...WEIJIN,
  ...SUITANG,
  ...SONG,
  ...YUANMING,
  ...BATTLEFIELDS,
  ...PALACES,
  ...ARCHAEOLOGY,
].map(normalizeEntity);

export const ENTITIES = decollideCoordinates(RAW_ALL, 0.24);
export const FIGURES = ENTITIES; // 兼容后端 server.js 与旧调用方
export const ONLY_FIGURES = ENTITIES.filter((e) => e.kind === 'figure');
export const ONLY_SITES = ENTITIES.filter((e) => e.kind === 'site');

const ENTITY_MAP = new Map(ENTITIES.map((e) => [e.id, e]));

export function getFigure(id) {
  return ENTITY_MAP.get(id) || null;
}

export function getEntity(id) {
  return ENTITY_MAP.get(id) || null;
}
