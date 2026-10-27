// 核心标准化与规制映射模块：将先贤人物与名胜古迹统一转化为标准渲染实体契约
import { getPortraitInfo } from './portraits.js';
const TREE_PRESETS = {
  pine:    { name: '苍松', kind: 'pine',    leaf: '#2f4b38' },
  cypress: { name: '古柏', kind: 'cypress', leaf: '#2d4732' },
  willow:  { name: '垂柳', kind: 'willow',  leaf: '#6b8550' },
  plum:    { name: '寒梅', kind: 'plum',    leaf: '#c85c6b' },
  peach:   { name: '桃树', kind: 'plum',    leaf: '#e396a2' },
  bamboo:  { name: '修竹', kind: 'bamboo',  leaf: '#4d6f49' },
  ginkgo:  { name: '银杏', kind: 'ginkgo',  leaf: '#d4a638' },
  broad:   { name: '古樟', kind: 'broad',   leaf: '#3e5e3c' },
};

const AMBIENT_MAP = {
  stars:     { sky: ['#141a29', '#2b364f'], celestial: 'stars',     particles: 'firefly' },
  snow:      { sky: ['#d8dde2', '#99a3ad'], celestial: 'moon-pale', particles: 'snow' },
  petals:    { sky: ['#efe2dc', '#c9a9a2'], celestial: 'sun',       particles: 'petal' },
  rain:      { sky: ['#cfd6d8', '#8a989c'], celestial: 'moon-pale', particles: 'rain' },
  fireflies: { sky: ['#182026', '#2e3f47'], celestial: 'moon',      particles: 'firefly' },
  leaves:    { sky: ['#e9dcc5', '#b99c72'], celestial: 'sunset',    particles: 'goldleaf' },
  dust:      { sky: ['#e4d2b4', '#ad8c5f'], celestial: 'sunset',    particles: 'goldleaf' },
};

const MILITARY_GENERALS = new Set([
  'jiangziya', 'sunwu', 'baiqi', 'lianpo', 'limu',
  'mengtian', 'hanxin', 'weiqing', 'huoqubing', 'liuling', 'suwu', 'banchao',
  'guanyu', 'zhouyu', 'lijin', 'guozhiyi', 'yuefei', 'qijiguang'
]);

const OBSERVATORY_SCHOLARS = new Set([
  'zhangheng', 'zucongzhi', 'guoshoujing', 'shenkuo', 'bisheng', 'songyingxing'
]);

const CUSTOM_BANNERS = {
  huangdi: '人文初祖', dayu: '功齐天地', qinshihuang: '六合一统', liubang: '大风歌台',
  hanwudi: '雄才大略', liuxiu: '光武中兴', caocao: '魏武遗风', liubei: '汉昭烈陵',
  sunquan: '江东霸业', yangjian: '开皇盛治', lishimin: '贞观九嵕', wuzetian: '乾陵无字',
  songtsen: '雪域赞普', liyu: '故国月明', zhaokuangyin: '永昌帝陵', chengjisihan: '长生天佑',
  zhuyuanzhang: '治隆唐宋', zhudi: '永乐盛世',
  kongzi: '万世师表', laozi: '道法自然', mengzi: '亚圣浩气', zhuangzi: '逍遥天地',
  mozi: '兼爱非攻', xunzi: '劝学隆礼', hanfeizi: '法术势成', zhuxi: '格物致知',
  wangyangming: '此心光明', wensheng: '唐蕃一家',
  zhougong: '制礼作乐', guanzi: '九合诸侯', shangyang: '徙木立信', linxiangru: '完璧归赵',
  zhangliang: '运筹帷幄', xiaoge: '镇国萧相', jiaoyi: '治安策论', zhugeliang: '鞠躬尽瘁',
  weizheng: '千秋金鉴', direnjie: '斗南一人', yanzhenqing: '气吞嵩华', hanyu: '百代文宗',
  fanzhongyan: '先忧后乐', baozheng: '铁面清风', ouyangxiu: '醉翁遗韵', wanganshi: '荆公新法',
  simaguang: '资治通鉴', wentianxiang: '丹心照汗', liubowen: '诚意神算', yuqian: '留清白间',
  hairui: '粤东正气', zhangjuzheng: '太岳救时', shikefa: '梅花忠魂',
  jiangziya: '太公兵法', sunwu: '兵圣奇谋', baiqi: '武安战威', lianpo: '老将尚饭',
  limu: '北疆长城', mengtian: '威震匈奴', hanxin: '国士无双', weiqing: '帝国双璧',
  huoqubing: '气吞祁连', liuling: '飞将在塞', suwu: '北海牧羝', banchao: '定远万里',
  guanyu: '义薄云天', zhouyu: '江左风流', lijin: '大唐卫公', guozhiyi: '再造唐室',
  yuefei: '还我河山', qijiguang: '海波尽平',
  jingke: '易水寒风', chensheng: '王侯宁种', wuguang: '揭竿大泽', xiangyu: '力拔山兮',
  zhangjiao: '苍天当立', mulan: '万里戎机', huangchao: '冲天香阵', songjiang: '替天行道',
  fangla: '东南义旗', lizicheng: '均田免粮',
  xuanzang: '大唐三藏', zhangheng: '候风观象', zucongzhi: '缀术圆率', guoshoujing: '授时测天',
  shenkuo: '梦溪格物', bisheng: '胶泥活字', songyingxing: '天工开物',
  bianque: '医祖脉宗', zhangzhongjing: '医圣济世', huatuo: '悬壶华佗', sunsimiao: '大医精诚',
  lishizhen: '本草纲目', luban: '百工圣祖', libing: '深淘低作', zhangqian: '凿空西域',
  cailun: '蔡侯造纸', lidaoyuan: '水经注疏', luyu: '茶圣清泉', huangdaopo: '衣被天下',
  zhenghe: '云帆万里', xuxiake: '朝碧暮苍',
};

const SITE_ARCH_LABELS = {
  battle_chariot:      '古战场规制 · 辕门帅帐 · 铜戈战车遗迹',
  battle_altar:        '古战场规制 · 忠魂祭坛 · 折戟断剑遗冢',
  battle_cliff:        '古战场规制 · 临江摩崖 · 烽火楼船水寨',
  battle_pass:         '古战场规制 · 雄关箭楼 · 烽燧雉堞城垣',
  palace_platform:     '宫殿遗址规制 · 巨型夯土台基 · 龙尾丹陛双阙',
  palace_tower:        '名楼高台规制 · 重檐飞阁 · 凭栏江山胜迹',
  palace_pavilion:     '名园雅集规制 · 曲水流觞 · 崇山茂林修竹',
  palace_bridge:       '古桥天工规制 · 敞肩单孔石拱 · 望柱雕栏',
  palace_waterworks:   '水利海丝规制 · 分水鱼嘴 · 镇水石犀奇功',
  palace_imperial:     '帝都紫禁规制 · 三层汉白玉丹陛 · 重檐庑殿金顶',
  arch_jade_altar:     '考古探源规制 · 莫角山神王祭坛 · 玉琮神徽',
  arch_bronze_pit:     '考古遗址规制 · 殷商汉楚探方 · 重器卜辞遗珍',
  arch_sanxingdui:     '古蜀祭祀规制 · 三星堆祭祀神坛 · 纵目神树',
  arch_terracotta:     '帝陵军阵规制 · 骊山兵马俑军阵 · 地下宿卫廊道',
  arch_desert_stupa:   '丝路故城规制 · 大漠生土佛塔 · 雅丹夯土残垣',
  arch_grotto:         '皇家石窟规制 · 斩山开窟 · 大佛摩崖龛像',
  arch_mogao:          '敦煌千佛规制 · 鸣沙山九层木构窟檐 · 飞天壁画',
};

export function resolveHierarchy(raw, era, role, kind) {
  const id = raw.id;
  const banner = raw.archBanner || CUSTOM_BANNERS[id] || (raw.title ? raw.title.replace(/\s*·\s*/g, '').slice(0, 4) : raw.name.slice(0, 4));

  // 名胜古迹（古战场、著名宫殿建筑、考古遗址）
  if (kind === 'site') {
    const siteArch = raw.siteArch || (
      role === '古战场遗址' ? 'battle_pass' :
      role === '建筑宫殿遗址' ? 'palace_platform' : 'arch_bronze_pit'
    );
    const steleType = role === '古战场遗址' ? 'raw' : role === '建筑宫殿遗址' ? 'imperial' : 'sage';
    return {
      archType: siteArch,
      archLabel: SITE_ARCH_LABELS[siteArch] || `${role} · 历史遗迹规制`,
      archBanner: banner,
      steleType,
    };
  }

  // 先贤人物陵寝规制
  if (role === '帝王霸主') {
    if (id === 'chengjisihan') {
      return { archType: 'emperor_ordos', archLabel: '八白室金顶陵宫 · 九斿白纛苏鲁锭', archBanner: banner, steleType: 'imperial' };
    }
    if (era === '元明') {
      return { archType: 'emperor_minglou', archLabel: '明代皇陵规制 · 宝城宝顶 · 方城明楼', archBanner: banner, steleType: 'imperial' };
    }
    if (era === '隋唐' || era === '宋') {
      return { archType: 'emperor_shanling', archLabel: '唐宋因山为陵 · 神道华表 · 翼马翁仲', archBanner: banner, steleType: 'imperial' };
    }
    return { archType: 'emperor_fudou', archLabel: '秦汉覆斗方上大陵 · 子母双石阙 · 镇墓辟邪', archBanner: banner, steleType: 'imperial' };
  }

  if (role === '圣贤哲人') {
    return { archType: 'sage_paifang', archLabel: '圣林规制 · 四柱三间冲天石坊 · 须弥座台基', archBanner: banner, steleType: 'sage' };
  }

  if (role === '将相名臣') {
    if (MILITARY_GENERALS.has(id)) {
      return { archType: 'general_qilian', archLabel: '名将规制 · 祁连叠石将坛 · 神道石马石虎', archBanner: banner, steleType: 'general' };
    }
    return { archType: 'minister_pavilion', archLabel: '名臣祠墓规制 · 敕建重檐御碑亭 · 螭首龟趺碑', archBanner: banner, steleType: 'bixi' };
  }

  if (role === '起义豪杰') {
    return { archType: 'rebel_altar', archLabel: '豪杰义冢 · 三层巨石盟坛 · 摩崖剑碑 · 燎原火盆', archBanner: banner, steleType: 'raw' };
  }

  if (role === '百工奇人') {
    if (id === 'xuanzang') {
      return { archType: 'monk_pagoda', archLabel: '兴教寺规制 · 五层砖石密檐舍利塔', archBanner: banner, steleType: 'sage' };
    }
    if (OBSERVATORY_SCHOLARS.has(id)) {
      return { archType: 'scholar_observatory', archLabel: '观星台规制 · 覆斗青砖测景台 · 圭表石栏', archBanner: banner, steleType: 'sage' };
    }
    return { archType: 'artisan_shrine', archLabel: '百工医圣祠规制 · 飞檐石龛 · 青石须弥方台', archBanner: banner, steleType: 'sage' };
  }

  return { archType: 'poet_garden', archLabel: '文人诗冢规制 · 粉墙黛瓦月洞门 · 青砖罗圈墓垣', archBanner: banner, steleType: 'literati' };
}

function parseDeathYear(yearsStr, fallback = 1400) {
  if (!yearsStr) return fallback;
  const s = String(yearsStr);
  const isBC = s.includes('前') || s.includes('距今');
  const nums = s.match(/\d+/g);
  if (!nums || !nums.length) return fallback;
  const last = Number(nums[nums.length - 1]);
  if (s.includes('距今')) return 2000 - last;
  return isBC ? -last : last;
}

export function normalizeEntity(raw) {
  const kind = raw.kind || 'figure';
  const lon = raw.lon ?? raw.coords?.[0] ?? 110;
  const lat = raw.lat ?? raw.coords?.[1] ?? 34;
  const zi = raw.zi || raw.courtesy || raw.title || '';
  const place = raw.place || raw.location || '';
  const motto = raw.motto || raw.quote || '';
  const epitaph = raw.epitaph || raw.scene?.epitaph || (kind === 'site' ? `${raw.name}遗迹` : `${raw.name}之墓`);
  const death = typeof raw.death === 'number' ? raw.death : parseDeathYear(raw.years);
  const persona = raw.persona || raw.aiPersona || '';

  const deeds = (raw.deeds || []).map((d) => ({
    t: d.t || d.year || '',
    e: d.e || d.text || '',
  }));

  const works = (raw.works || []).map((w) => ({
    title: w.title || '',
    text: w.text || w.body || '',
  }));

  const sc = raw.scene || {};
  const amb = AMBIENT_MAP[sc.ambient] || AMBIENT_MAP.leaves;
  const treePreset = TREE_PRESETS[raw.treeType] || TREE_PRESETS.pine;
  const hierarchy = resolveHierarchy(raw, raw.era, raw.role, kind);

  const scene = {
    sky: sc.sky || amb.sky,
    celestial: sc.celestial || amb.celestial,
    particles: sc.particles || amb.particles,
    tomb: sc.tomb || (sc.stoneShape === 'wide' ? 'mound' : 'stele'),
    emblem: sc.emblem || 'slips',
    tree: sc.tree || treePreset,
    archType: hierarchy.archType,
    archLabel: hierarchy.archLabel,
    archBanner: hierarchy.archBanner,
    steleType: hierarchy.steleType,
  };

  return {
    ...raw,
    kind,
    lon,
    lat,
    coords: [lon, lat],
    zi,
    place,
    motto,
    epitaph,
    death,
    persona,
    deeds,
    works,
    scene,
    portrait: getPortraitInfo({ ...raw, kind }),
  };
}
