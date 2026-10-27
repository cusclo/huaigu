// 怀古 · 全量先贤典藏画像与名胜古迹实景本地化抓取器
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

const UA = 'HuaiguCulturalProject/1.0 (https://github.com/cusclo/huaigu; contact_huaigu@example.org)';

// 规范搜索名映射
const QUERY_MAP = {
  // 先秦
  huangdi: '黄帝',
  dayu: '禹',
  zhougong: '周公旦',
  jiangziya: '姜子牙',
  guanzi: '管仲',
  laozi: '老子',
  kongzi: '孔子',
  sunwu: '孙武',
  xishi: '西施',
  mozi: '墨子',
  luban: '鲁班',
  bianque: '扁鹊',
  shangyang: '商鞅',
  zhuangzi: '庄子',
  mengzi: '孟子',
  quyuan: '屈原',
  linxiangru: '蔺相如',
  lianpo: '廉颇',
  libing: '李冰',
  jingke: '荆轲',
  baiqi: '白起',
  limu: '李牧',
  xunzi: '荀子',
  hanfeizi: '韩非',

  // 秦汉
  qinshihuang: '秦始皇',
  mengtian: '蒙恬',
  chensheng: '陈胜',
  wuguang: '吴广',
  xiangyu: '项羽',
  liubang: '刘邦',
  zhangliang: '张良',
  xiaoge: '萧何',
  hanxin: '韩信',
  jiaoyi: '贾谊',
  hanwudi: '汉武帝',
  weiqing: '卫青',
  huoqubing: '霍去病',
  liuling: '李广',
  zhangqian: '张骞',
  suwu: '苏武',
  simaqian: '司马迁',
  wangzhaojun: '王昭君',
  liuxiu: '刘秀',
  banchao: '班超',
  cailun: '蔡伦',
  zhangheng: '张衡',
  zhangzhongjing: '张仲景',
  huatuo: '华佗',
  zhangjiao: '张角',
  caiwenji: '蔡琰',

  // 三国两晋南北朝
  caocao: '曹操',
  liubei: '刘备',
  sunquan: '孙权',
  zhugeliang: '诸葛亮',
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
  fanzhen: '范缜',
  jiasixie: '贾思勰',
  chenbaxian: '陈霸先',

  // 隋唐五代
  yangjian: '隋文帝',
  lichun: '李春',
  lishimin: '李世民',
  weizheng: '魏徵',
  fangxuanling: '房玄龄',
  lijin: '李靖',
  xuanzang: '玄奘',
  wensheng: '文成公主',
  songtsen: '松赞干布',
  wuzetian: '武则天',
  direnjie: '狄仁杰',
  sunsimiao: '孙思邈',
  wangbo: '王勃',
  wangwei: '王维',
  libai: '李白',
  dufu: '杜甫',
  baijuyi: '白居易',
  guozhiyi: '郭子仪',
  yanzhenqing: '颜真卿',
  liugongquan: '柳公权',
  luyu: '陆羽',
  hanyu: '韩愈',
  liuzongyuan: '柳宗元',
  lishangyin: '李商隐',
  dumu: '杜牧',
  huangchao: '黄巢',
  liyu: '李煜',

  // 宋元
  zhaokuangyin: '宋太祖',
  kouzhun: '寇准',
  fanzhongyan: '范仲淹',
  baozheng: '包拯',
  ouyangxiu: '欧阳修',
  wanganshi: '王安石',
  simaguang: '司马光',
  sushi: '苏轼',
  shenkuo: '沈括',
  songhuizong: '宋徽宗',
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
  hubilie: '忽必烈',
  guoshoujing: '郭守敬',
  zhaomengfu: '赵孟頫',
  guanhanqing: '关汉卿',
  huangdaopo: '黄道婆',

  // 明
  zhuyuanzhang: '朱元璋',
  liubowen: '刘基',
  zhudi: '明成祖',
  zhenghe: '郑和',
  yuqian: '于谦',
  wangyangming: '王守仁',
  tangyin: '唐寅',
  hairui: '海瑞',
  qijiguang: '戚继光',
  zhangjuzheng: '张居正',
  lishizhen: '李时珍',
  xuxiake: '徐霞客',
  songyingxing: '宋应星',
  lizicheng: '李自成',
  shikefa: '史可法',

  // 38处名胜古迹
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

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1500) throw new Error(`Too small (${buf.length} bytes)`);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function queryWikiBatch(titles) {
  const encoded = titles.map(encodeURIComponent).join('|');
  const url = `https://zh.wikipedia.org/w/api.php?action=query&titles=${encoded}&redirects=1&prop=pageimages&format=json&pithumbsize=480`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return {};
  const data = await res.json();

  const redirectsMap = {};
  if (data?.query?.redirects) {
    for (const r of data.query.redirects) {
      redirectsMap[r.to] = r.from;
    }
  }

  const results = {};
  const pages = data?.query?.pages || {};
  for (const page of Object.values(pages)) {
    if (page?.thumbnail?.source) {
      results[page.title] = page.thumbnail.source;
      const orig = redirectsMap[page.title];
      if (orig) results[orig] = page.thumbnail.source;
    }
  }
  return results;
}

async function searchFallback(term) {
  try {
    const sUrl = `https://zh.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=3&prop=pageimages&format=json&pithumbsize=480`;
    const res = await fetch(sUrl, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {});
    for (const p of pages) {
      if (p?.thumbnail?.source) return p.thumbnail.source;
    }
  } catch {}
  return null;
}

async function main() {
  const dataModule = await import('../public/js/data.js');
  const all = dataModule.FIGURES;

  const items = all.map(fig => {
    const isSite = fig.kind === 'site';
    const dest = path.join(isSite ? SITES_DIR : PORTRAITS_DIR, `${fig.id}.jpg`);
    const exists = fs.existsSync(dest) && fs.statSync(dest).size > 2000;
    const query = QUERY_MAP[fig.id] || fig.name;
    return { fig, isSite, dest, exists, query };
  });

  const pending = items.filter(t => !t.exists);
  console.log(`[全量同步] 目标总数: ${all.length}, 已就绪: ${items.length - pending.length}, 待抓取: ${pending.length}`);

  const batchSize = 25;
  for (let i = 0; i < pending.length; i += batchSize) {
    const chunk = pending.slice(i, i + batchSize);
    const queries = chunk.map(t => t.query);
    console.log(`\n批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(pending.length / batchSize)}: ${queries.slice(0, 5).join(', ')}...`);

    const urlMap = await queryWikiBatch(queries);

    for (const item of chunk) {
      let url = urlMap[item.query] || urlMap[item.fig.name];
      if (!url) {
        url = await searchFallback(item.query + (item.isSite ? ' 遗址' : ''));
      }

      if (url) {
        try {
          const sz = await downloadFile(url, item.dest);
          console.log(`  ✓ [已就绪] ${item.fig.name} -> ${(sz / 1024).toFixed(1)} KB`);
        } catch (e) {
          console.warn(`  ✗ [下载失败] ${item.fig.name}: ${e.message}`);
        }
      } else {
        console.warn(`  ? [未命中] ${item.fig.name} (${item.query})`);
      }
      await new Promise(r => setTimeout(r, 150));
    }
  }

  const doneCount = items.filter(t => fs.existsSync(t.dest) && fs.statSync(t.dest).size > 2000).length;
  console.log(`\n========================================`);
  console.log(`[同步完成] 当前收录: ${doneCount}/${all.length} (覆盖率 ${(doneCount / all.length * 100).toFixed(1)}%)`);
}

main().catch(console.error);
