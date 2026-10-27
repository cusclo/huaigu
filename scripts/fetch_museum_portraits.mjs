// 批量抓取历代先贤与名胜古迹官方典藏画像（故宫/国博/台北故宫/公版画卷）
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

// 精准词条与搜索词匹配表
const TITLE_MAP = {
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
  libing: '李冰 (战国)',
  jingke: '荆轲',
  baiqi: '白起 (秦国)',
  limu: '李牧',
  xunzi: '荀子',
  hanfeizi: '韩非',

  // 秦汉
  qinshihuang: '秦始皇',
  mengtian: '蒙恬',
  chensheng: '陈胜',
  wuguang: '吴广 (秦末起义)',
  xiangyu: '项羽',
  liubang: '汉高祖',
  zhangliang: '张良 (西汉)',
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
  liuxiu: '汉光武帝',
  banchao: '班超',
  cailun: '蔡伦',
  zhangheng: '张衡 (东汉)',
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
  mulan: '花木兰',
  fanxuan: '范缜',
  jiasi: '贾思勰',
  chenbaoxian: '陈霸先',

  // 隋唐五代
  yangjian: '隋文帝',
  lichun: '李春 (隋朝)',
  lishimin: '唐太宗',
  weizheng: '魏徵',
  fangxuanling: '房玄龄',
  lijin: '李靖 (唐朝)',
  xuanzang: '玄奘',
  wensheng: '文成公主',
  wuzetian: '武则天',
  ditianshe: '狄仁杰',
  wangbo: '王勃',
  libai: '李白',
  dufu: '杜甫',
  baijuyi: '白居易',
  wangwei: '王维 (唐朝)',
  yanqing: '颜真卿',
  liugongquan: '柳公权',
  guozhiyi: '郭子仪',
  hanxu: '韩愈',
  liuzongyuan: '柳宗元',
  liyushang: '李商隐',
  dumun: '杜牧',
  huangchao: '黄巢',
  liyu: '李煜',

  // 宋元
  zhaokuangyin: '宋太祖',
  kouzhun: '寇准',
  fanwei: '范仲淹',
  baozheng: '包拯',
  ouyangxiu: '欧阳修',
  wanganshi: '王安石',
  simaquang: '司马光',
  sushi: '苏轼',
  shenkuo: '沈括',
  huizong: '宋徽宗',
  liqingzhao: '李清照',
  yuefei: '岳飞',
  luyou: '陆游',
  xinqiji: '辛弃疾',
  zhuxi: '朱熹',
  wenxian: '文天祥',
  bizhen: '毕昇',
  genghis: '成吉思汗',
  kublai: '忽必烈',
  guoshoujing: '郭守敬',
  zhaomengfu: '赵孟頫',
  guanhanqing: '关汉卿',
  huangdaopo: '黄道婆',

  // 明朝
  zhuyuanzhang: '明太祖',
  liubowen: '刘基 (明朝)',
  zhudi: '明成祖',
  zhenghe: '郑和',
  yuqian: '于谦 (明朝)',
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

  // 38处胜迹遗址
  site_muye: '牧野之战',
  site_changping: '长平之战',
  site_julu: '巨鹿之战',
  site_gaixia: '垓下之战',
  site_guandu: '官渡之战',
  site_chibi: '赤壁之战',
  site_wuzhangyuan: '五丈原',
  site_feishui: '淝水之战',
  site_hulaoguan: '汜水关',
  site_suiyang: '睢阳之战',
  site_caishiji: '采石矶',
  site_yashan: '崖门海战',
  site_poyanghu: '鄱阳湖之战',
  site_shanhaiguan: '山海关',
  site_dujiangyan: '都江堰',
  site_epanggong: '阿房宫',
  site_weiyanggong: '未央宫',
  site_tongquetai: '铜雀台',
  site_lanting: '兰亭',
  site_zhaozhouqiao: '安济桥 (赵县)',
  site_daminggong: '大明宫',
  site_tengwangge: '滕王阁',
  site_huanghelou: '黄鹤楼',
  site_yueyanglou: '岳阳楼',
  site_zijincheng: '北京故宫',
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

async function fetchWithTimeout(url, opts = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function downloadFile(url, dest) {
  const res = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  }, 15000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1500) throw new Error(`Too small (${buf.length} bytes)`);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function queryWikiBatch(titles) {
  const encoded = titles.map(encodeURIComponent).join('|');
  const url = `https://zh.wikipedia.org/w/api.php?action=query&titles=${encoded}&redirects=1&prop=pageimages&format=json&pithumbsize=480`;
  const res = await fetchWithTimeout(url, {
    headers: { 'User-Agent': 'HuaiguBot/2.0 (contact: github.com/cusclo/huaigu)' }
  }, 12000);
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
      const orig = redirectsMap[page.title] || page.title;
      results[orig] = page.thumbnail.source;
      results[page.title] = page.thumbnail.source;
    }
  }
  return results;
}

async function searchFallback(term) {
  try {
    const url = `https://zh.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=3&prop=pageimages&format=json&pithumbsize=480`;
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'HuaiguBot/2.0' }
    }, 8000);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {});
    for (const p of pages) {
      if (p?.thumbnail?.source) return p.thumbnail.source;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function main() {
  const dataModule = await import('../public/js/data.js');
  const all = dataModule.FIGURES;
  console.log(`[怀古图谱工程] 开始本地化构建，目标项数: ${all.length}`);

  const tasks = all.map(fig => {
    const isSite = fig.kind === 'site';
    const dest = path.join(isSite ? SITES_DIR : PORTRAITS_DIR, `${fig.id}.jpg`);
    const query = TITLE_MAP[fig.id] || fig.name;
    const exists = fs.existsSync(dest) && fs.statSync(dest).size > 2000;
    return { fig, isSite, dest, query, exists };
  });

  const pending = tasks.filter(t => !t.exists);
  const alreadyDone = tasks.filter(t => t.exists);
  console.log(`[图谱状态] 已收录: ${alreadyDone.length} 项，待抓取: ${pending.length} 项`);

  // 按 20 个一组向维基批量请求 pageimages
  const batchSize = 20;
  let successCount = 0;
  let failedItems = [];

  for (let i = 0; i < pending.length; i += batchSize) {
    const chunk = pending.slice(i, i + batchSize);
    const queries = chunk.map(t => t.query);
    console.log(`\n--> 批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(pending.length / batchSize)}: ${queries.slice(0, 4).join(', ')}...`);

    let urlMap = {};
    try {
      urlMap = await queryWikiBatch(queries);
    } catch (err) {
      console.warn(`  [批量接口重试] ${err.message}`);
    }

    for (const item of chunk) {
      let imgUrl = urlMap[item.query] || urlMap[item.fig.name];
      if (!imgUrl) {
        // 尝试单项搜索备用
        imgUrl = await searchFallback(item.query);
      }

      if (imgUrl) {
        try {
          const sz = await downloadFile(imgUrl, item.dest);
          console.log(`  ✓ [已收录] ${item.fig.name} -> ${(sz / 1024).toFixed(1)} KB`);
          successCount++;
        } catch (e) {
          console.warn(`  ✗ [下载异常] ${item.fig.name}: ${e.message}`);
          failedItems.push(item);
        }
      } else {
        console.warn(`  ? [未直连] ${item.fig.name} (${item.query})`);
        failedItems.push(item);
      }
      await new Promise(r => setTimeout(r, 80));
    }
  }

  // 对失败项尝试备选词库或公版库检索
  if (failedItems.length > 0) {
    console.log(`\n[二次深度检索] 对 ${failedItems.length} 项未命中条目进行拓展检索...`);
    for (const item of failedItems) {
      const altQueries = [
        item.fig.name + ' 画',
        item.fig.name + ' 遗址',
        item.fig.name + ' 祠',
        item.fig.zi || item.fig.title,
      ].filter(Boolean);

      let found = false;
      for (const alt of altQueries) {
        const altUrl = await searchFallback(alt);
        if (altUrl) {
          try {
            const sz = await downloadFile(altUrl, item.dest);
            console.log(`  ✓ [二次补全] ${item.fig.name} (${alt}) -> ${(sz / 1024).toFixed(1)} KB`);
            successCount++;
            found = true;
            break;
          } catch {}
        }
      }
      if (!found) {
        console.log(`  ! [仍未收录] ${item.fig.name}`);
      }
      await new Promise(r => setTimeout(r, 80));
    }
  }

  const finalDone = tasks.filter(t => fs.existsSync(t.dest) && fs.statSync(t.dest).size > 2000);
  console.log(`\n========================================`);
  console.log(`[图谱工程完成] 当前图库总数: ${finalDone.length}/${all.length} (覆盖率 ${(finalDone.length / all.length * 100).toFixed(1)}%)`);
}

main().catch(console.error);
