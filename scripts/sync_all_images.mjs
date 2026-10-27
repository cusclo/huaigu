// 精准同步全量历史画像与名胜遗址实景图片
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PORTRAITS_DIR = path.join(ROOT, 'public', 'img', 'portraits');
const SITES_DIR = path.join(ROOT, 'public', 'img', 'sites');

if (!fs.existsSync(PORTRAITS_DIR)) fs.mkdirSync(PORTRAITS_DIR, { recursive: true });
if (!fs.existsSync(SITES_DIR)) fs.mkdirSync(SITES_DIR, { recursive: true });

// 精准定向词库
const QUERY_MAP = {
  // 先贤
  libing: '李冰',
  mengtian: '蒙恬',
  chensheng: '陈胜',
  wuguang: '吴广',
  weiqing: '卫青',
  guanyu: '关羽',
  zhouyu: '周瑜',
  caozhi: '曹植',
  jikan: '嵇康',
  wangxizhi: '王羲之',
  xiean: '谢安',
  taoyuanming: '陶渊明',
  zucongzhi: '祖冲之',
  lidaoyuan: '郦道元',
  mulan: '花木兰',
  yangjian: '隋文帝',
  lishimin: '唐太宗',
  weizheng: '魏徵',
  lijin: '李靖',
  xuanzang: '玄奘',
  wensheng: '文成公主',
  songtsen: '松赞干布',
  wuzetian: '武则天',
  direnjie: '狄仁杰',
  sunsimiao: '孙思邈',
  wangbo: '王勃',
  wangwei: '王维',
  dufu: '杜甫',
  guozhiyi: '郭子仪',
  yanzhenqing: '颜真卿',
  luyu: '陆羽',
  hanyu: '韩愈',
  baijuyi: '白居易',
  liuzongyuan: '柳宗元',
  lishangyin: '李商隐',
  huangchao: '黄巢',
  liyu: '李煜',
  zhaokuangyin: '宋太祖',
  fanzhongyan: '范仲淹',
  baozheng: '包拯',
  ouyangxiu: '欧阳修',
  wanganshi: '王安石',
  simaguang: '司马光',
  sushi: '苏轼',
  shenkuo: '沈括',
  bisheng: '毕昇',
  liqingzhao: '李清照',
  yuefei: '岳飞',
  songjiang: '宋江',
  fangla: '方腊',
  luyou: '陆游',
  xinqiji: '辛弃疾',
  zhuxi: '朱熹',
  wentianxiang: '文天祥',
  chengjisihan: '成吉思汗',
  guoshoujing: '郭守敬',
  guanhanqing: '关汉卿',
  huangdaopo: '黄道婆',
  zhuyuanzhang: '朱元璋',
  liubowen: '刘基',
  zhudi: '明成祖',
  zhenghe: '郑和',
  yuqian: '于谦',
  wangyangming: '王阳明',
  tangyin: '唐寅',
  hairui: '海瑞',
  qijiguang: '戚继光',
  zhangjuzheng: '张居正',
  lishizhen: '李时珍',
  xuxiake: '徐霞客',
  songyingxing: '宋应星',
  lizicheng: '李自成',
  shikefa: '史可法',

  // 古迹与名胜
  site_muye: '牧野之战',
  site_changping: '长平之战',
  site_julu: '巨鹿之战',
  site_gaixia: '垓下之战',
  site_guandu: '官渡之战',
  site_chibi: '赤壁之战',
  site_wuzhangyuan: '五丈原',
  site_feishui: '淝水之战',
  site_hulaoguan: '虎牢关',
  site_suiyang: '睢阳城',
  site_caishiji: '采石矶',
  site_yashan: '崖门海战',
  site_poyanghu: '鄱阳湖之战',
  site_shanhaiguan: '山海关',
  site_dujiangyan: '都江堰',
  site_epanggong: '阿房宫',
  site_weiyanggong: '未央宫',
  site_tongquetai: '铜雀台',
  site_lanting: '兰亭',
  site_zhaozhouqiao: '赵州桥',
  site_daminggong: '大明宫',
  site_tengwangge: '滕王阁',
  site_huanghelou: '黄鹤楼',
  site_yueyanglou: '岳阳楼',
  site_zijincheng: '故宫',
  site_jiayuguan: '嘉峪关',
  site_liangzhu: '良渚遗址',
  site_erlitou: '二里头遗址',
  site_yinxu: '殷墟',
  site_sanxingdui: '三星堆遗址',
  site_bingmayong: '秦始皇兵马俑',
  site_mawangdui: '马王堆汉墓',
  site_loulan: '楼兰',
  site_yungang: '云冈石窟',
  site_longmen: '龙门石窟',
  site_mogaoku: '莫高窟',
  site_jiaohe: '交河故城',
  site_nanhai1: '南海一号',
};

async function downloadUrl(url, dest) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1500) throw new Error(`Too small (${buf.length} bytes)`);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function fetchThumbForTitle(title) {
  // 1. 中文维基 pageimages 查询
  try {
    const url = `https://zh.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&redirects=1&prop=pageimages&format=json&pithumbsize=460`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'HuaiguSync/1.0 (cusclo@github)' }
    });
    if (res.ok) {
      const data = await res.json();
      const pages = Object.values(data?.query?.pages || {});
      for (const p of pages) {
        if (p?.thumbnail?.source) return p.thumbnail.source;
      }
    }
  } catch {}

  // 2. 搜索备选
  try {
    const sUrl = `https://zh.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(title)}&gsrlimit=2&prop=pageimages&format=json&pithumbsize=460`;
    const res = await fetch(sUrl, {
      headers: { 'User-Agent': 'HuaiguSync/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      const pages = Object.values(data?.query?.pages || {});
      for (const p of pages) {
        if (p?.thumbnail?.source) return p.thumbnail.source;
      }
    }
  } catch {}

  return null;
}

async function run() {
  const dataModule = await import('../public/js/data.js');
  const all = dataModule.FIGURES;

  console.log(`[怀古] 开始同步图像资源，全库共 ${all.length} 项`);

  let fetched = 0, skipped = 0, failed = [];

  for (const item of all) {
    const isSite = item.kind === 'site';
    const dest = path.join(isSite ? SITES_DIR : PORTRAITS_DIR, `${item.id}.jpg`);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
      skipped++;
      continue;
    }

    const query = QUERY_MAP[item.id] || item.name;
    const thumbUrl = await fetchThumbForTitle(query);

    if (thumbUrl) {
      try {
        const sz = await downloadUrl(thumbUrl, dest);
        console.log(`✓ [收录] ${item.name} (${query}) -> ${(sz / 1024).toFixed(1)} KB`);
        fetched++;
      } catch (err) {
        console.warn(`✗ [下载异常] ${item.name}: ${err.message}`);
        failed.push(item.name);
      }
    } else {
      console.warn(`? [未找到画像] ${item.name} (${query})`);
      failed.push(item.name);
    }

    // 平稳延迟，防止触发频率限制
    await new Promise(r => setTimeout(r, 120));
  }

  console.log(`\n========================================`);
  console.log(`同步完成: 新收录 ${fetched}, 原有 ${skipped}, 待补充 ${failed.length}`);
  if (failed.length > 0) {
    console.log(`未完成项:`, failed.join(', '));
  }
}

run().catch(console.error);
