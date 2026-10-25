// 名胜古迹专属场景渲染引擎：古战场遗址、著名宫殿建筑遗址、重大考古文明遗址
import { svgEl } from '../util.js';

export function drawSiteArchitecture(ctx) {
  const {
    svg, fig, sc, TX, GROUND, night, sky0, sky1, INK,
    mix, linear, radial, drawRoof, drawPlaque, drawHuabiao
  } = ctx;

  const g = svgEl('g', { class: 'site-arch' }, svg);
  const arch = sc.archType || 'palace_platform';
  const banner = sc.archBanner || fig.name.slice(0, 4);

  const stoneMain = night ? '#484c56' : '#857e71';
  const stoneDark = night ? '#2d3038' : '#585248';
  const stoneLight = night ? '#636875' : '#aba393';
  const brickMain = night ? '#363942' : '#69645c';
  const zhuWall = night ? '#592422' : '#85312b';
  const roofTile = night ? '#1c2028' : '#32302d';
  const goldTrim = '#d4b263';
  const bronze = night ? '#3c5448' : '#4a6657';
  const earth = night ? mix(sky1, '#0d1016', 0.45) : mix('#7c6a50', sky1, 0.22);

  svgEl('ellipse', { cx: TX, cy: GROUND + 5, rx: 300, ry: 20, fill: '#000', opacity: 0.32, filter: 'url(#ink-blur)' }, g);

  // 1. 【古战场 · 辕门帅帐 + 双轮青铜战车 + 战鼓铜戈（牧野/官渡/五丈原）】
  if (arch === 'battle_chariot') {
    // 夯土点将高台
    svgEl('polygon', { points: `${TX - 260},${GROUND} ${TX - 235},${GROUND - 48} ${TX + 235},${GROUND - 48} ${TX + 260},${GROUND}`, fill: earth, stroke: stoneDark, 'stroke-width': 1 }, g);
    // 中军帅帐（硬山/穹顶帷幕大帐）
    const by = GROUND - 48;
    svgEl('path', { d: `M${TX - 135} ${by} L${TX - 115} ${by - 115} Q${TX} ${by - 165} ${TX + 115} ${by - 115} L${TX + 135} ${by}Z`, fill: night ? '#2b2623' : '#4a3d33', stroke: goldTrim, 'stroke-width': 1.2 }, g);
    svgEl('path', { d: `M${TX - 142} ${by - 110} Q${TX} ${by - 185} ${TX + 142} ${by - 110}`, fill: 'none', stroke: zhuWall, 'stroke-width': 5 }, g);
    drawPlaque(g, TX, by - 118, banner, 96, 24);
    // 左侧：先秦/汉魏双轮战车遗迹
    const cx = TX - 195, cy = GROUND - 26;
    svgEl('circle', { cx: cx, cy: cy, r: 26, fill: 'none', stroke: stoneDark, 'stroke-width': 4 }, g);
    for (let a = 0; a < 180; a += 30) {
      const rad = (a * Math.PI) / 180;
      svgEl('line', { x1: cx - Math.cos(rad) * 26, y1: cy - Math.sin(rad) * 26, x2: cx + Math.cos(rad) * 26, y2: cy + Math.sin(rad) * 26, stroke: stoneDark, 'stroke-width': 1.3 }, g);
    }
    svgEl('rect', { x: cx - 22, y: cy - 34, width: 44, height: 22, fill: zhuWall, opacity: 0.85 }, g);
    svgEl('line', { x1: cx + 22, y1: cy - 18, x2: cx + 68, y2: cy - 36, stroke: stoneDark, 'stroke-width': 3 }, g);
    // 右侧：夔龙大战鼓架
    const dx = TX + 195, dy = GROUND - 48;
    svgEl('line', { x1: dx - 22, y1: dy, x2: dx - 16, y2: dy - 64, stroke: zhuWall, 'stroke-width': 4 }, g);
    svgEl('line', { x1: dx + 22, y1: dy, x2: dx + 16, y2: dy - 64, stroke: zhuWall, 'stroke-width': 4 }, g);
    svgEl('ellipse', { cx: dx, cy: dy - 38, rx: 22, ry: 26, fill: '#8f322a', stroke: goldTrim, 'stroke-width': 1.5 }, g);
    svgEl('circle', { cx: dx, cy: dy - 38, r: 16, fill: '#dfd2b5' }, g);
  }

  // 2. 【古战场 · 忠魂祭坛 + 折戟断剑遗冢 + 燎原火盆（长平/巨鹿/垓下）】
  else if (arch === 'battle_altar') {
    // 苍凉巨石垒筑三层古战坛
    svgEl('polygon', { points: `${TX - 270},${GROUND} ${TX - 250},${GROUND - 34} ${TX + 250},${GROUND - 34} ${TX + 270},${GROUND}`, fill: stoneDark }, g);
    svgEl('polygon', { points: `${TX - 210},${GROUND - 34} ${TX - 190},${GROUND - 68} ${TX + 190},${GROUND - 68} ${TX + 210},${GROUND - 34}`, fill: stoneMain }, g);
    svgEl('path', { d: `M${TX - 165} ${GROUND - 68} Q${TX} ${GROUND - 225} ${TX + 165} ${GROUND - 68}Z`, fill: earth, filter: 'url(#ink-rough)' }, g);
    drawPlaque(g, TX, GROUND - 155, banner, 98, 24);
    // 斜插沙场的折戟断剑丛
    [[-185, -18], [-152, 12], [155, -14], [190, 20], [-225, -8], [228, 15]].forEach(([ox, rot]) => {
      const sx = TX + ox, sy = GROUND - 34;
      const sg = svgEl('g', { transform: `translate(${sx} ${sy}) rotate(${rot})` }, g);
      svgEl('line', { x1: 0, y1: 0, x2: 0, y2: -62, stroke: stoneDark, 'stroke-width': 3 }, sg);
      svgEl('path', { d: 'M0 -52 L16 -46 L0 -40 M-8 -32 L8 -32', stroke: bronze, 'stroke-width': 2.5, fill: 'none' }, sg);
    });
    // 双耳青铜燎原火盆
    [-125, 125].forEach((ox, i) => {
      const fx = TX + ox, fy = GROUND - 68;
      svgEl('path', { d: `M${fx - 22} ${fy - 24} L${fx + 22} ${fy - 24} L${fx + 14} ${fy} L${fx - 14} ${fy}Z`, fill: '#3d3326', stroke: goldTrim, 'stroke-width': 0.8 }, g);
      svgEl('circle', { cx: fx, cy: fy - 36, r: 30, fill: radial('bfire' + i, '#ff6e24', 0.45) }, g);
      svgEl('path', { d: `M${fx - 12} ${fy - 24} Q${fx - 14} ${fy - 48} ${fx - 2} ${fy - 62} Q${fx + 4} ${fy - 44} ${fx + 8} ${fy - 66} Q${fx + 18} ${fy - 45} ${fx + 12} ${fy - 24}Z`, fill: '#e85b22', style: `animation: breathe ${2 + i * 0.5}s ease-in-out infinite` }, g);
    });
  }

  // 3. 【古战场 · 临江摩崖石壁 + 烽火望楼 + 蒙冲战船（赤壁/淝水/采石矶/崖山/鄱阳湖）】
  else if (arch === 'battle_cliff') {
    // 拔地而起的临江赤壁/崖门摩崖峭壁
    const cliffColor = fig.id === 'site_chibi' ? (night ? '#4a2622' : '#7a3b32') : stoneDark;
    svgEl('polygon', {
      points: `${TX - 295},${GROUND} ${TX - 275},${GROUND - 190} ${TX - 195},${GROUND - 295} ${TX - 110},${GROUND - 265} ${TX - 65},${GROUND - 190} ${TX + 140},${GROUND - 165} ${TX + 215},${GROUND - 235} ${TX + 275},${GROUND - 140} ${TX + 290},${GROUND}`,
      fill: linear('cliff', [[0, mix(cliffColor, '#fff', 0.15)], [0.6, cliffColor], [1, mix(cliffColor, '#000', 0.45)]]),
      filter: 'url(#ink-rough)'
    }, g);
    // 峭壁之巅的木构望江烽火台
    const tx = TX - 165, ty = GROUND - 285;
    svgEl('rect', { x: tx - 28, y: ty - 38, width: 56, height: 38, fill: zhuWall }, g);
    drawRoof(g, tx, ty - 62, 78, 24, false);
    // 摩崖石壁朱砂题刻大字（如“赤壁”、“浩气崖山”）
    const mChars = [...banner.slice(0, 2)];
    mChars.forEach((ch, idx) => {
      const mt = svgEl('text', {
        x: TX - 165, y: GROUND - 175 + idx * 54,
        'font-size': 46, 'text-anchor': 'middle',
        fill: '#e8d0a5', 'font-family': 'var(--f-brush)', opacity: 0.88
      }, g);
      mt.textContent = ch;
    });
    // 右侧江面战船高桅剪影
    const bx = TX + 210, by = GROUND - 20;
    svgEl('path', { d: `M${bx - 55} ${by} Q${bx} ${by + 16} ${bx + 55} ${by} L${bx + 42} ${by + 12} L${bx - 42} ${by + 12}Z`, fill: INK }, g);
    svgEl('line', { x1: bx, y1: by, x2: bx, y2: by - 115, stroke: INK, 'stroke-width': 3 }, g);
    svgEl('path', { d: `M${bx} ${by - 108} L${bx + 42} ${by - 88} L${bx + 36} ${by - 32} L${bx} ${by - 40}Z`, fill: zhuWall, opacity: 0.85 }, g);
  }

  // 4. 【雄关古隘 · 城墙券门 + 重檐箭楼 + 塞外烽燧（虎牢关/睢阳/山海关/嘉峪关）】
  else if (arch === 'battle_pass') {
    // 巍峨关城城台与两翼长城垛口
    const wallH = 132, wallTop = GROUND - wallH;
    svgEl('polygon', {
      points: `${TX - 310},${GROUND} ${TX - 295},${wallTop + 18} ${TX - 165},${wallTop} ${TX + 165},${wallTop} ${TX + 295},${wallTop + 18} ${TX + 310},${GROUND}`,
      fill: brickMain, stroke: stoneDark, 'stroke-width': 1.4
    }, g);
    // 城墙雉堞垛口
    for (let x = TX - 285; x <= TX + 270; x += 24) {
      const yOff = Math.abs(x - TX) > 165 ? 14 : 0;
      svgEl('rect', { x, y: wallTop - 10 + yOff, width: 15, height: 10, fill: brickMain }, g);
    }
    // 关门大券洞
    svgEl('path', { d: `M${TX - 52} ${GROUND} L${TX - 52} ${GROUND - 72} A52 52 0 0 1 ${TX + 52} ${GROUND - 72} L${TX + 52} ${GROUND}Z`, fill: '#171412', stroke: stoneLight, 'stroke-width': 2.5 }, g);
    // 城台上的重檐歇山大箭楼（仿山海关“天下第一关”/嘉峪关柔远楼）
    const twTop = wallTop - 112;
    svgEl('rect', { x: TX - 96, y: twTop + 32, width: 192, height: 80, fill: zhuWall }, g);
    // 箭窗阵列
    for (let x = TX - 76; x <= TX + 64; x += 28) {
      svgEl('rect', { x, y: twTop + 44, width: 12, height: 18, fill: '#1e1916', stroke: goldTrim, 'stroke-width': 0.7 }, g);
    }
    drawRoof(g, TX, twTop - 18, 236, 52, true);
    drawPlaque(g, TX, twTop + 76, banner, 104, 25);
  }

  // 5. 【帝国宫殿遗址 · 三层巨型夯土高台 + 龙尾丹陛 + 翔鸾栖凤双阙（阿房宫/未央宫/大明宫/二里头）】
  else if (arch === 'palace_platform') {
    // 巨型三层夯土高台（仿大明宫含元殿/阿房宫前殿）
    svgEl('polygon', { points: `${TX - 310},${GROUND} ${TX - 285},${GROUND - 55} ${TX + 285},${GROUND - 55} ${TX + 310},${GROUND}`, fill: earth }, g);
    svgEl('polygon', { points: `${TX - 250},${GROUND - 55} ${TX - 225},${GROUND - 115} ${TX + 225},${GROUND - 115} ${TX + 250},${GROUND - 55}`, fill: mix(earth, stoneMain, 0.35) }, g);
    svgEl('rect', { x: TX - 225, y: GROUND - 132, width: 450, height: 18, fill: stoneLight }, g);
    // 中央百级龙尾道御阶
    svgEl('polygon', { points: `${TX - 76},${GROUND} ${TX - 54},${GROUND - 132} ${TX + 54},${GROUND - 132} ${TX + 76},${GROUND}`, fill: stoneLight, stroke: stoneDark, 'stroke-width': 1 }, g);
    for (let i = 1; i <= 10; i++) {
      const sy = GROUND - i * 12.5;
      svgEl('line', { x1: TX - 72 + i * 1.8, y1: sy, x2: TX + 72 - i * 1.8, y2: sy, stroke: stoneDark, 'stroke-width': 1 }, g);
    }
    // 高台之上的正殿柱网与重檐庑殿巨顶
    const pTop = GROUND - 235;
    svgEl('rect', { x: TX - 125, y: pTop + 34, width: 250, height: 69, fill: zhuWall, opacity: 0.92 }, g);
    for (let dx = -105; dx <= 105; dx += 35) {
      svgEl('line', { x1: TX + dx, y1: pTop + 34, x2: TX + dx, y2: GROUND - 132, stroke: goldTrim, 'stroke-width': 2.2 }, g);
    }
    drawRoof(g, TX, pTop - 16, 295, 52, true);
    drawPlaque(g, TX, pTop + 48, banner, 108, 25);
    // 左右翔鸾、栖凤飞廊双阙阁
    [-255, 255].forEach((dx) => {
      const qx = TX + dx, qy = GROUND - 55;
      svgEl('rect', { x: qx - 28, y: qy - 110, width: 56, height: 110, fill: stoneMain }, g);
      svgEl('rect', { x: qx - 32, y: qy - 148, width: 64, height: 38, fill: zhuWall }, g);
      drawRoof(g, qx, qy - 176, 86, 28, false);
    });
  }

  // 6. 【江南三大名楼 / 铜雀高台 · 三层重檐飞阁（滕王阁/黄鹤楼/岳阳楼/铜雀台）】
  else if (arch === 'palace_tower') {
    // 临江高筑青石城台基座
    svgEl('polygon', { points: `${TX - 235},${GROUND} ${TX - 215},${GROUND - 64} ${TX + 215},${GROUND - 64} ${TX + 235},${GROUND}`, fill: stoneDark, stroke: stoneLight, 'stroke-width': 1 }, g);
    // 三层飞檐楼阁（逐层收分，配平座勾栏）
    const tiers = [
      { y: GROUND - 64,  w: 196, h: 68, roofW: 248 },
      { y: GROUND - 148, w: 152, h: 58, roofW: 204 },
      { y: GROUND - 222, w: 112, h: 52, roofW: 162 },
    ];
    tiers.forEach((tr, idx) => {
      const topY = tr.y - tr.h;
      svgEl('rect', { x: TX - tr.w / 2, y: topY, width: tr.w, height: tr.h, fill: zhuWall }, g);
      // 雕花格扇窗与立柱
      for (let x = TX - tr.w / 2 + 18; x < TX + tr.w / 2 - 10; x += 28) {
        svgEl('line', { x1: x, y1: topY, x2: x, y2: tr.y, stroke: goldTrim, 'stroke-width': 1.5, opacity: 0.7 }, g);
      }
      // 平座栏杆
      svgEl('rect', { x: TX - tr.w / 2 - 8, y: tr.y - 8, width: tr.w + 16, height: 8, fill: stoneLight }, g);
      drawRoof(g, TX, topY - 26, tr.roofW, 30, idx === 2);
    });
    // 攒尖葫芦宝顶
    svgEl('polygon', { points: `${TX},${GROUND - 318} ${TX - 9},${GROUND - 296} ${TX + 9},${GROUND - 296}`, fill: goldTrim }, g);
    drawPlaque(g, TX, GROUND - 208, banner, 102, 24);
  }

  // 7. 【会稽兰亭 · 流觞曲水 + 崇山修竹四角碑亭】
  else if (arch === 'palace_pavilion') {
    // 蜿蜒流淌的九曲清溪（曲水流觞）
    svgEl('path', {
      d: `M${TX - 310} ${GROUND - 8} C${TX - 190} ${GROUND - 45} ${TX - 80} ${GROUND + 22} ${TX + 40} ${GROUND - 18} C${TX + 150} ${GROUND - 52} ${TX + 230} ${GROUND + 10} ${TX + 320} ${GROUND - 12}`,
      fill: 'none', stroke: '#5d8280', 'stroke-width': 28, 'stroke-linecap': 'round', opacity: 0.78
    }, g);
    // 溪上漂浮的荷叶羽觞（红漆耳杯）
    [-160, -95, 115, 185].forEach((dx, i) => {
      const cx = TX + dx, cy = GROUND - 16 + (i % 2 ? 8 : -8);
      svgEl('ellipse', { cx, cy, rx: 10, ry: 5, fill: '#4e7548' }, g);
      svgEl('ellipse', { cx, cy: cy - 2, rx: 6, ry: 3, fill: '#a8322d', stroke: goldTrim, 'stroke-width': 0.8 }, g);
    });
    // 兰亭四角飞檐敞亭
    svgEl('rect', { x: TX - 135, y: GROUND - 22, width: 270, height: 22, fill: stoneDark }, g);
    [-105, -72, 72, 105].forEach((dx) => svgEl('rect', { x: TX + dx - 4, y: GROUND - 210, width: 8, height: 188, fill: zhuWall }, g));
    drawRoof(g, TX, GROUND - 262, 255, 52, true);
    drawPlaque(g, TX, GROUND - 205, banner, 96, 24);
  }

  // 8. 【赵州安济桥 · 隋代单孔坦弧敞肩石拱桥】
  else if (arch === 'palace_bridge') {
    // 橫跨画面的大跨度坦弧石拱桥身
    const bTop = GROUND - 155;
    svgEl('path', {
      d: `M${TX - 320} ${GROUND} L${TX - 320} ${bTop + 32} Q${TX} ${bTop - 42} ${TX + 320} ${bTop + 32} L${TX + 320} ${GROUND} L${TX + 245} ${GROUND} A255 155 0 0 0 ${TX - 245} ${GROUND} Z`,
      fill: stoneLight, stroke: stoneDark, 'stroke-width': 2
    }, g);
    // 两肩四个敞肩小腹拱（李春首创工程奇迹）
    [[-195, 22, -14], [-138, 16, -26], [138, 16, -26], [195, 22, -14]].forEach(([dx, r, dy]) => {
      svgEl('circle', { cx: TX + dx, cy: bTop + 42 + dy, r, fill: sky1, stroke: stoneDark, 'stroke-width': 2.5 }, g);
    });
    // 主拱顶双龙吸水兽面石雕与桥面雕龙栏板
    svgEl('circle', { cx: TX, cy: bTop + 12, r: 10, fill: stoneDark, stroke: goldTrim, 'stroke-width': 1 }, g);
    for (let dx = -270; dx <= 270; dx += 45) {
      const y = bTop + 26 - Math.cos((dx / 300) * (Math.PI / 2)) * 34;
      svgEl('rect', { x: TX + dx - 3, y: y - 24, width: 6, height: 24, fill: stoneMain }, g);
    }
    drawPlaque(g, TX, bTop - 26, banner, 102, 24);
  }

  // 9. 【水利与海丝奇功 · 鱼嘴分水堤 / 远洋水密隔舱巨舶（都江堰/南海一号）】
  else if (arch === 'palace_waterworks') {
    if (fig.id === 'site_nanhai1') {
      // 南海一号：南宋三桅远洋大福船与风帆
      svgEl('path', {
        d: `M${TX - 235} ${GROUND - 55} L${TX - 185} ${GROUND} L${TX + 185} ${GROUND} L${TX + 245} ${GROUND - 68} L${TX + 150} ${GROUND - 48} L${TX - 150} ${GROUND - 48}Z`,
        fill: '#4a3220', stroke: goldTrim, 'stroke-width': 1.5
      }, g);
      // 十三道水密隔舱肋骨线
      for (let x = TX - 165; x <= TX + 165; x += 28) {
        svgEl('line', { x1: x, y1: GROUND - 48, x2: x, y2: GROUND, stroke: '#291a10', 'stroke-width': 2 }, g);
      }
      // 三根高耸船桅与硬篷风帆
      [[-125, 195], [0, 255], [125, 210]].forEach(([dx, mh]) => {
        const mx = TX + dx;
        svgEl('line', { x1: mx, y1: GROUND - 48, x2: mx, y2: GROUND - 48 - mh, stroke: '#3b2616', 'stroke-width': 4 }, g);
        svgEl('polygon', {
          points: `${mx},${GROUND - 38 - mh} ${mx + 56},${GROUND - 18 - mh} ${mx + 48},${GROUND - 85} ${mx},${GROUND - 95}`,
          fill: '#dfd3bc', stroke: '#8c7654', 'stroke-width': 1, opacity: 0.88
        }, g);
      });
      drawPlaque(g, TX, GROUND - 235, banner, 98, 24);
    } else {
      // 都江堰：玉垒山宝瓶口离堆 + 鱼嘴分水石堤 + 安澜索桥 + 二王庙飞檐
      svgEl('polygon', { points: `${TX - 280},${GROUND} ${TX - 245},${GROUND - 185} ${TX - 125},${GROUND - 215} ${TX - 85},${GROUND}`, fill: stoneDark }, g);
      svgEl('polygon', { points: `${TX + 85},${GROUND} ${TX + 115},${GROUND - 175} ${TX + 245},${GROUND - 195} ${TX + 280},${GROUND}`, fill: stoneMain }, g);
      drawRoof(g, TX - 185, GROUND - 242, 118, 28, true);
      // 跨越宝瓶口的安澜竹索吊桥
      svgEl('path', { d: `M${TX - 125} ${GROUND - 155} Q${TX} ${GROUND - 115} ${TX + 115} ${GROUND - 148}`, fill: 'none', stroke: '#5e472d', 'stroke-width': 3 }, g);
      svgEl('path', { d: `M${TX - 125} ${GROUND - 138} Q${TX} ${GROUND - 98} ${TX + 115} ${GROUND - 131}`, fill: 'none', stroke: '#8a6b47', 'stroke-width': 4 }, g);
      drawPlaque(g, TX, GROUND - 215, banner, 98, 24);
    }
  }

  // 10. 【明北京紫禁城 · 三层汉白玉须弥座丹陛 + 重檐庑殿金顶奉天殿（太和殿）】
  else if (arch === 'palace_imperial') {
    // 三层汉白玉“土”字形须弥座高台（带望柱栏板与丹陛御路）
    const levels = [
      { w: 540, y: GROUND,      h: 26 },
      { w: 470, y: GROUND - 26, h: 24 },
      { w: 400, y: GROUND - 50, h: 22 },
    ];
    levels.forEach((lv) => {
      svgEl('rect', { x: TX - lv.w / 2, y: lv.y - lv.h, width: lv.w, height: lv.h, fill: '#e6dfd1', stroke: stoneDark, 'stroke-width': 1 }, g);
      for (let x = TX - lv.w / 2 + 16; x <= TX + lv.w / 2 - 16; x += 28) {
        if (Math.abs(x - TX) < 48) continue;
        svgEl('rect', { x: x - 2, y: lv.y - lv.h - 10, width: 4, height: 10, fill: '#f2ece0' }, g);
      }
    });
    // 中央云龙大石雕御路
    svgEl('polygon', { points: `${TX - 46},${GROUND} ${TX - 36},${GROUND - 72} ${TX + 36},${GROUND - 72} ${TX + 46},${GROUND}`, fill: '#d6cebe', stroke: goldTrim, 'stroke-width': 1.2 }, g);
    // 十一个开间的奉天殿（太和殿）朱红殿身与金琐窗
    const dBase = GROUND - 72, dTop = dBase - 108;
    svgEl('rect', { x: TX - 180, y: dTop, width: 360, height: 108, fill: '#8f2922' }, g);
    for (let x = TX - 160; x <= TX + 160; x += 32) {
      svgEl('line', { x1: x, y1: dTop, x2: x, y2: dBase, stroke: goldTrim, 'stroke-width': 2.2 }, g);
    }
    // 皇家最高等级：黄色琉璃瓦重檐庑殿金顶 + 正脊螭吻
    const goldRoof = night ? '#8c6d2c' : '#c99b38';
    svgEl('path', {
      d: `M${TX - 228} ${dTop + 12} Q${TX - 165} ${dTop - 22} ${TX - 140} ${dTop - 32} L${TX + 140} ${dTop - 32} Q${TX + 165} ${dTop - 22} ${TX + 228} ${dTop + 12}Z`,
      fill: goldRoof, stroke: '#5c4314', 'stroke-width': 1.2
    }, g);
    svgEl('path', {
      d: `M${TX - 196} ${dTop - 24} Q${TX - 135} ${dTop - 68} ${TX - 105} ${dTop - 78} L${TX + 105} ${dTop - 78} Q${TX + 135} ${dTop - 68} ${TX + 196} ${dTop - 24}Z`,
      fill: '#dbad42', stroke: '#5c4314', 'stroke-width': 1.2
    }, g);
    svgEl('line', { x1: TX - 106, y1: dTop - 78, x2: TX + 106, y2: dTop - 78, stroke: '#f7e094', 'stroke-width': 3.5 }, g);
    drawPlaque(g, TX, dTop - 16, banner, 106, 25);
  }

  // 11. 【良渚古城 · 莫角山三层神王祭坛 + 内圆外方巨型玉琮王】
  else if (arch === 'arch_jade_altar') {
    const jade = '#7fa38c', jadeDark = '#3f5e4d';
    // 莫角山三层夯土祭坛
    svgEl('polygon', { points: `${TX - 265},${GROUND} ${TX - 235},${GROUND - 36} ${TX + 235},${GROUND - 36} ${TX + 265},${GROUND}`, fill: earth }, g);
    svgEl('polygon', { points: `${TX - 205},${GROUND - 36} ${TX - 180},${GROUND - 70} ${TX + 180},${GROUND - 70} ${TX + 205},${GROUND - 36}`, fill: mix(earth, jadeDark, 0.3) }, g);
    // 左侧与后方象征性的巨型内圆外方「玉琮王」礼器碑座
    [-155, 155].forEach((dx) => {
      const jx = TX + dx, jy = GROUND - 70;
      svgEl('rect', { x: jx - 28, y: jy - 96, width: 56, height: 96, fill: jade, stroke: jadeDark, 'stroke-width': 1.5 }, g);
      svgEl('ellipse', { cx: jx, cy: jy - 96, rx: 22, ry: 6, fill: jadeDark }, g);
      // 玉琮分节横槽与神人兽面纹眼目
      for (let s = 1; s <= 4; s++) {
        const sy = jy - s * 22;
        svgEl('line', { x1: jx - 28, y1: sy, x2: jx + 28, y2: sy, stroke: jadeDark, 'stroke-width': 2 }, g);
        svgEl('circle', { cx: jx - 10, cy: sy + 10, r: 3, fill: 'none', stroke: jadeDark, 'stroke-width': 1.2 }, g);
        svgEl('circle', { cx: jx + 10, cy: sy + 10, r: 3, fill: 'none', stroke: jadeDark, 'stroke-width': 1.2 }, g);
      }
    });
    // 后方高悬礼天苍璧（大玉璧）
    svgEl('circle', { cx: TX, cy: GROUND - 205, r: 58, fill: 'none', stroke: jade, 'stroke-width': 22, opacity: 0.75 }, g);
    drawPlaque(g, TX, GROUND - 205, banner, 98, 24);
  }

  // 12. 【殷墟 / 马王堆 · 考古探方阶梯 + 后母戊巨型青铜方鼎 + 甲骨卜辞】
  else if (arch === 'arch_bronze_pit') {
    // 考古阶梯状探方基座
    svgEl('polygon', { points: `${TX - 275},${GROUND} ${TX - 255},${GROUND - 32} ${TX + 255},${GROUND - 32} ${TX + 275},${GROUND}`, fill: earth }, g);
    svgEl('polygon', { points: `${TX - 220},${GROUND - 32} ${TX - 200},${GROUND - 64} ${TX + 200},${GROUND - 64} ${TX + 220},${GROUND - 32}`, fill: stoneDark }, g);
    // 后母戊大方鼎镇守两侧
    [-168, 168].forEach((dx) => {
      const bx = TX + dx, by = GROUND - 64;
      // 四柱足
      [-22, -8, 8, 22].forEach((lx) => svgEl('rect', { x: bx + lx - 3.5, y: by - 36, width: 7, height: 36, fill: bronze }, g));
      // 矩形深腹鼎身与饕餮雷纹
      svgEl('rect', { x: bx - 32, y: by - 88, width: 64, height: 52, fill: bronze, stroke: goldTrim, 'stroke-width': 1.2 }, g);
      svgEl('rect', { x: bx - 22, y: by - 78, width: 44, height: 32, fill: 'none', stroke: goldTrim, 'stroke-width': 1, opacity: 0.65 }, g);
      // 立耳
      svgEl('path', { d: `M${bx - 26} ${by - 88} L${bx - 26} ${by - 106} L${bx - 12} ${by - 106} L${bx - 12} ${by - 88} M${bx + 12} ${by - 88} L${bx + 12} ${by - 106} L${bx + 26} ${by - 106} L${bx + 26} ${by - 88}`, fill: 'none', stroke: bronze, 'stroke-width': 4 }, g);
    });
    drawRoof(g, TX, GROUND - 255, 220, 36, false);
    drawPlaque(g, TX, GROUND - 210, banner, 98, 24);
  }

  // 13. 【三星堆古蜀遗址 · 古蜀祭祀神坛 + 凸目千里眼青铜大面具 + 黄金太阳轮】
  else if (arch === 'arch_sanxingdui') {
    const shuBronze = '#3c6e5d', shuGold = '#e6bd53';
    // 三层古蜀祭祀台
    svgEl('polygon', { points: `${TX - 260},${GROUND} ${TX - 235},${GROUND - 36} ${TX + 235},${GROUND - 36} ${TX + 260},${GROUND}`, fill: stoneDark }, g);
    svgEl('polygon', { points: `${TX - 195},${GROUND - 36} ${TX - 175},${GROUND - 72} ${TX + 175},${GROUND - 72} ${TX + 195},${GROUND - 36}`, fill: shuBronze }, g);
    // 后方高悬青铜太阳轮与纵目大面具图腾
    const my = GROUND - 210;
    svgEl('circle', { cx: TX, cy: my, r: 72, fill: 'none', stroke: shuGold, 'stroke-width': 3, opacity: 0.45 }, g);
    for (let a = 0; a < 360; a += 72) {
      const rad = (a * Math.PI) / 180;
      svgEl('line', { x1: TX, y1: my, x2: TX + Math.cos(rad) * 72, y2: my + Math.sin(rad) * 72, stroke: shuGold, 'stroke-width': 2.5, opacity: 0.45 }, g);
    }
    // 左右对称青铜纵目神面具（宽耳、凸柱状眼、夔龙额饰）
    [-168, 168].forEach((dx) => {
      const mx = TX + dx, by = GROUND - 135;
      // 招风大耳
      svgEl('path', { d: `M${mx - 28} ${by - 12} L${mx - 62} ${by - 28} L${mx - 54} ${by + 8} Z M${mx + 28} ${by - 12} L${mx + 62} ${by - 28} L${mx + 54} ${by + 8} Z`, fill: shuBronze, stroke: shuGold, 'stroke-width': 1 }, g);
      // U形方脸与神秘微笑口唇
      svgEl('path', { d: `M${mx - 30} ${by - 32} L${mx + 30} ${by - 32} L${mx + 24} ${by + 22} Q${mx} ${by + 32} ${mx - 24} ${by + 22}Z`, fill: shuBronze, stroke: shuGold, 'stroke-width': 1.4 }, g);
      // 外凸柱状纵目
      svgEl('rect', { x: mx - 22, y: by - 14, width: 14, height: 8, rx: 3, fill: shuGold }, g);
      svgEl('rect', { x: mx + 8, y: by - 14, width: 14, height: 8, rx: 3, fill: shuGold }, g);
      // 额中通天卷云冠
      svgEl('path', { d: `M${mx} ${by - 32} Q${mx - 12} ${by - 68} ${mx + 8} ${by - 76} Q${mx + 18} ${by - 58} ${mx} ${by - 32}`, fill: shuGold }, g);
    });
    drawPlaque(g, TX, GROUND - 205, banner, 98, 24);
  }

  // 14. 【秦兵马俑军阵 · 地下拱廊隔梁 + 披甲武士陶俑方阵】
  else if (arch === 'arch_terracotta') {
    // 一号坑夯土隔墙与军阵探方
    svgEl('rect', { x: TX - 285, y: GROUND - 38, width: 570, height: 38, fill: earth, stroke: stoneDark, 'stroke-width': 1 }, g);
    // 两侧整列肅立的大秦锐士陶俑方阵（高发髻、披玄甲、执戈按剑）
    [-235, -190, -145, 145, 190, 235].forEach((dx, i) => {
      const wx = TX + dx, wy = GROUND - 38;
      const scale = 1 - Math.abs(dx) * 0.0005;
      const wg = svgEl('g', { transform: `translate(${wx} ${wy}) scale(${scale})` }, g);
      // 陶俑踏板与战靴双腿
      svgEl('rect', { x: -14, y: -6, width: 28, height: 6, fill: stoneDark }, wg);
      svgEl('rect', { x: -9, y: -32, width: 7, height: 26, fill: stoneMain }, wg);
      svgEl('rect', { x: 2, y: -32, width: 7, height: 26, fill: stoneMain }, wg);
      // 战袍与鱼鳞甲胸铠
      svgEl('path', { d: 'M-14 -32 L-16 -78 L16 -78 L14 -32 Z', fill: stoneMain, stroke: stoneDark, 'stroke-width': 1 }, wg);
      svgEl('rect', { x: -12, y: -74, width: 24, height: 28, fill: '#3d3a35', stroke: goldTrim, 'stroke-width': 0.6 }, wg);
      // 领巾、头部与秦人偏髻
      svgEl('circle', { cx: 0, cy: -88, r: 8.5, fill: stoneLight }, wg);
      svgEl('rect', { x: i % 2 ? -5 : 1, y: -101, width: 6, height: 6, rx: 1, fill: stoneDark }, wg);
      // 手执长戈
      svgEl('line', { x1: 14, y1: 0, x2: 14, y2: -118, stroke: bronze, 'stroke-width': 2 }, wg);
    });
    drawPlaque(g, TX, GROUND - 205, banner, 98, 24);
  }

  // 15. 【丝路大漠故城 · 楼兰/交河生土圆柱佛塔 + 雅丹夯土残垣】
  else if (arch === 'arch_desert_stupa') {
    const sandEarth = night ? '#4a3d2e' : '#b89b6c';
    const sandDark = night ? '#2e251b' : '#856c45';
    // 后方高耸的楼兰/交河大佛塔（多级方座 + 覆钵圆塔身）
    svgEl('polygon', { points: `${TX - 135},${GROUND} ${TX - 120},${GROUND - 55} ${TX + 120},${GROUND - 55} ${TX + 135},${GROUND}`, fill: sandDark }, g);
    svgEl('polygon', { points: `${TX - 98},${GROUND - 55} ${TX - 88},${GROUND - 115} ${TX + 88},${GROUND - 115} ${TX + 98},${GROUND - 55}`, fill: sandEarth }, g);
    svgEl('path', {
      d: `M${TX - 72} ${GROUND - 115} L${TX - 65} ${GROUND - 215} Q${TX} ${GROUND - 268} ${TX + 65} ${GROUND - 215} L${TX + 72} ${GROUND - 115}Z`,
      fill: linear('stupa', [[0, sandEarth], [1, sandDark]]),
      filter: 'url(#ink-rough)'
    }, g);
    // 风蚀水平土层纹
    for (let y = GROUND - 35; y >= GROUND - 225; y -= 26) {
      svgEl('line', { x1: TX - 64, y1: y, x2: TX + 64, y2: y, stroke: '#000', 'stroke-width': 1.2, opacity: 0.25 }, g);
    }
    // 两侧生土减地雕刻残垣与佛龛（仿交河故城/楼兰三间房）
    [-215, 215].forEach((dx) => {
      const rx = TX + dx;
      svgEl('polygon', {
        points: `${rx - 52},${GROUND} ${rx - 48},${GROUND - 132} ${rx - 18},${GROUND - 148} ${rx + 15},${GROUND - 115} ${rx + 46},${GROUND - 138} ${rx + 52},${GROUND}`,
        fill: sandDark, filter: 'url(#ink-rough)'
      }, g);
      svgEl('path', { d: `M${rx - 14} ${GROUND - 35} L${rx - 14} ${GROUND - 78} A14 14 0 0 1 ${rx + 14} ${GROUND - 78} L${rx + 14} ${GROUND - 35}Z`, fill: '#1c1610' }, g);
    });
    drawPlaque(g, TX, GROUND - 205, banner, 98, 24);
  }

  // 16. 【皇家石窟 · 云冈/龙门斩山开窟 + 露天卢舍那/释迦大佛与火焰背光】
  else if (arch === 'arch_grotto') {
    // 武州山/龙门山整座石壁与两侧千佛小龛
    svgEl('path', {
      d: `M${TX - 310} ${GROUND} L${TX - 290} ${GROUND - 235} Q${TX - 180} ${GROUND - 295} ${TX} ${GROUND - 305} Q${TX + 180} ${GROUND - 295} ${TX + 290} ${GROUND - 235} L${TX + 310} ${GROUND}Z`,
      fill: stoneDark, filter: 'url(#ink-rough)'
    }, g);
    // 中央主佛大圆拱窟龛
    svgEl('path', {
      d: `M${TX - 135} ${GROUND} L${TX - 135} ${GROUND - 155} A135 125 0 0 1 ${TX + 135} ${GROUND - 155} L${TX + 135} ${GROUND}Z`,
      fill: '#1e1c19', stroke: stoneLight, 'stroke-width': 2.5
    }, g);
    // 大佛身后雙重舟形火焰宝珠背光
    svgEl('ellipse', { cx: TX, cy: GROUND - 175, rx: 92, ry: 98, fill: 'none', stroke: goldTrim, 'stroke-width': 1.8, opacity: 0.55 }, g);
    svgEl('circle', { cx: TX, cy: GROUND - 205, r: 46, fill: 'none', stroke: goldTrim, 'stroke-width': 2.2, opacity: 0.7 }, g);
    // 卢舍那/云冈大佛法像剪影（螺髻肉髻、丰颐慈目、双肩宽厚）
    svgEl('path', {
      d: `M${TX - 92} ${GROUND - 35} Q${TX - 88} ${GROUND - 145} ${TX - 36} ${GROUND - 160} L${TX + 36} ${GROUND - 160} Q${TX + 88} ${GROUND - 145} ${TX + 92} ${GROUND - 35}Z`,
      fill: stoneMain, stroke: stoneLight, 'stroke-width': 1.2
    }, g);
    // 佛首与高肉髻
    svgEl('ellipse', { cx: TX, cy: GROUND - 198, rx: 28, ry: 34, fill: stoneLight }, g);
    svgEl('circle', { cx: TX, cy: GROUND - 236, r: 14, fill: stoneMain }, g);
    svgEl('circle', { cx: TX, cy: GROUND - 208, r: 2.5, fill: goldTrim }, g); // 白毫相光
    // 两侧崖壁三层千佛小龛
    [-215, -172, 172, 215].forEach((dx) => {
      [75, 130, 185].forEach((dy) => {
        svgEl('path', { d: `M${TX + dx - 11} ${GROUND - dy} L${TX + dx - 11} ${GROUND - dy - 22} A11 11 0 0 1 ${TX + dx + 11} ${GROUND - dy - 22} L${TX + dx + 11} ${GROUND - dy}Z`, fill: '#191714', stroke: stoneMain, 'stroke-width': 0.8 }, g);
      });
    });
  }

  // 17. 【敦煌莫高窟 · 鸣沙山千佛崖壁 + 依崖木构九层楼】
  else if (arch === 'arch_mogao') {
    const sandCliff = night ? '#473828' : '#a88962';
    // 鸣沙山东麓断崖与洞窟栈道
    svgEl('polygon', {
      points: `${TX - 320},${GROUND} ${TX - 305},${GROUND - 265} ${TX + 305},${GROUND - 285} ${TX + 320},${GROUND}`,
      fill: sandCliff, filter: 'url(#ink-rough)'
    }, g);
    // 崖壁两侧层叠洞窟门与木栈道
    [-235, -180, 180, 235].forEach((dx) => {
      [45, 110, 175].forEach((dy) => {
        svgEl('rect', { x: TX + dx - 14, y: GROUND - dy - 28, width: 28, height: 28, rx: 3, fill: '#1c1510', stroke: zhuWall, 'stroke-width': 1.5 }, g);
      });
    });
    // 中央依崖高耸的标志性「莫高窟九层楼」（五重/多层红色木构飞檐楼阁）
    const floors = [
      { y: GROUND,       w: 220, h: 52, rw: 264 },
      { y: GROUND - 58,  w: 188, h: 46, rw: 232 },
      { y: GROUND - 110, w: 156, h: 42, rw: 198 },
      { y: GROUND - 158, w: 126, h: 38, rw: 168 },
      { y: GROUND - 202, w: 98,  h: 36, rw: 138 },
      { y: GROUND - 244, w: 72,  h: 34, rw: 112 },
    ];
    floors.forEach((fl, idx) => {
      const topY = fl.y - fl.h;
      svgEl('rect', { x: TX - fl.w / 2, y: topY, width: fl.w, height: fl.h, fill: zhuWall, stroke: goldTrim, 'stroke-width': 0.8 }, g);
      drawRoof(g, TX, topY - 18, fl.rw, 22, idx === floors.length - 1);
    });
    drawPlaque(g, TX, GROUND - 220, banner, 98, 22);
  }
}
