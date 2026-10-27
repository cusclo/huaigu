// 九州怀古录 · 历代先贤画像与名胜古迹图像索引库
// 优先采用公版古代名家画谱（南薰殿帝王名臣像、三才图会、历代名公画谱、宋元明清历代名卷）
import { esc } from '../util.js';

const WIKI_COMMONS_BASE = 'https://commons.wikimedia.org/wiki/Special:FilePath/';

const ROLE_COLORS = {
  '帝王霸主': '#c4832b', '将相名臣': '#a8322d', '起义豪杰': '#c25229',
  '圣贤哲人': '#3f765a', '文豪艺人': '#6b538c', '百工奇人': '#396f8f',
  '古战场遗址': '#9e2820', '建筑宫殿遗址': '#9e6b24', '考古文明遗址': '#2b6e68'
};

const ROLE_BADGES = {
  '帝王霸主': '帝', '将相名臣': '相', '起义豪杰': '义',
  '圣贤哲人': '圣', '文豪艺人': '文', '百工奇人': '工',
  '古战场遗址': '战', '建筑宫殿遗址': '宫', '考古文明遗址': '古'
};

// 123位先贤人物历史画像公版文件映射表
export const FIGURE_PORTRAITS = {
  // === 先秦 ===
  huangdi: { file: 'Yellow_Emperor.jpg', title: '清殿藏本 · 轩辕黄帝像', author: '清宫南薰殿藏本' },
  dayu: { file: 'Da_Yu.jpg', title: '清殿藏本 · 夏禹立像', author: '清宫南薰殿藏本' },
  zhougong: { file: 'Zhou_Gong.jpg', title: '周公旦像', author: '《三才图会》' },
  jiangziya: { file: 'Jiang_Ziya.jpg', title: '太公望姜尚像', author: '明代《历代古人像赞》' },
  guanzi: { file: 'Guan_Zhong.jpg', title: '管夷吾像', author: '《三才图会》' },
  laozi: { file: 'Laozi_-_Project_Gutenberg_eText_15250.jpg', title: '老子出关像', author: '唐·吴道子传本' },
  kongzi: { file: 'Confucius_Tang_Dynasty.jpg', title: '孔子行教像', author: '唐·吴道子传本' },
  sunwu: { file: 'Sun_Tzu.jpg', title: '兵圣孙武像', author: '明代兵书画像' },
  xishi: { file: 'Xishi_painted_by_Gu_Jianlong.jpg', title: '西施浣纱图', author: '清·顾见龙绘' },
  mozi: { file: 'Mozi.jpg', title: '墨子像', author: '《三才图会》' },
  luban: { file: 'Lu_Ban.jpg', title: '巧圣鲁班像', author: '明代《鲁班经匠家镜》' },
  bianque: { file: 'Bian_Que.jpg', title: '医祖扁鹊像', author: '汉画像石 / 古本医宗' },
  shangyang: { file: 'Shang_Yang.jpg', title: '商鞅像', author: '《三才图会》' },
  zhuangzi: { file: 'Zhuangzi.jpg', title: '庄子像', author: '明代古本仙籍' },
  mengzi: { file: 'Mengzi.jpg', title: '亚圣孟子像', author: '清宫南薰殿藏本' },
  quyuan: { file: 'Qu_Yuan_Chen_Hongshou.jpg', title: '屈原九歌九章像', author: '明·陈洪绶绘' },
  linxiangru: { file: 'Lin_Xiangru.jpg', title: '蔺相如完璧图', author: '明代《历代名公画谱》' },
  lianpo: { file: 'Lian_Po.jpg', title: '廉颇将军像', author: '《三才图会》' },
  libing: { file: 'Li_Bing.jpg', title: '蜀守李冰像', author: '都江堰伏龙观石刻古拓' },
  jingke: { file: 'Jing_Ke.jpg', title: '荆轲像', author: '山东武氏祠汉画像石拓片' },
  baiqi: { file: 'Bai_Qi.jpg', title: '武安君白起像', author: '明代《历代名臣图像》' },
  limu: { file: 'Li_Mu.jpg', title: '李牧像', author: '《三才图会》' },
  xunzi: { file: 'Xun_Zi.jpg', title: '荀卿像', author: '《三才图会》' },
  hanfeizi: { file: 'Han_Fei.jpg', title: '韩非子像', author: '《三才图会》' },

  // === 秦汉 ===
  qinshihuang: { file: 'Qinshihuang.jpg', title: '秦始皇帝画像', author: '《三才图会》' },
  mengtian: { file: 'Meng_Tian.jpg', title: '大将军蒙恬像', author: '明代《历代武臣像赞》' },
  chensheng: { file: 'Chen_Sheng.jpg', title: '陈胜像', author: '清刻历代史绘' },
  wuguang: { file: 'Wu_Guang.jpg', title: '吴广像', author: '清刻历代史绘' },
  xiangyu: { file: 'Xiang_Yu.jpg', title: '西楚霸王项羽像', author: '《三才图会》' },
  liubang: { file: 'Han_Gaozu.jpg', title: '汉高祖刘邦像', author: '清宫南薰殿藏本' },
  zhangliang: { file: 'Zhang_Liang.jpg', title: '留侯张良像', author: '清宫南薰殿名臣图' },
  xiaoge: { file: 'Xiao_He.jpg', title: '酂侯萧何像', author: '清宫南薰殿名臣图' },
  hanxin: { file: 'Han_Xin.jpg', title: '淮阴侯韩信像', author: '明代《历代名臣图像》' },
  jiaoyi: { file: 'Jia_Yi.jpg', title: '贾太傅像', author: '清代《历代名儒图谱》' },
  hanwudi: { file: 'Emperor_Wu_of_Han.jpg', title: '汉武帝刘彻像', author: '清宫南薰殿藏本' },
  weiqing: { file: 'Wei_Qing.jpg', title: '大将军卫青像', author: '明代《历代武将画像》' },
  huoqubing: { file: 'Huo_Qubing.jpg', title: '冠军侯霍去病像', author: '明代《历代名臣图像》' },
  liuling: { file: 'Li_Guang.jpg', title: '飞将军李广像', author: '《三才图会》' },
  zhangqian: { file: 'Zhang_Qian.jpg', title: '博望侯张骞像', author: '敦煌莫高窟323窟壁画' },
  suwu: { file: 'Su_Wu.jpg', title: '苏武节杖图', author: '宋人画册 / 故宫博物院藏' },
  simaqian: { file: 'Sima_Qian.jpg', title: '太史公司马迁像', author: '《三才图会》' },
  wangzhaojun: { file: 'Wang_Zhaojun.jpg', title: '昭君出塞图', author: '清代《百美新咏图传》' },
  liuxiu: { file: 'Emperor_Guangwu_of_Han.jpg', title: '汉光武帝刘秀像', author: '清宫南薰殿藏本' },
  banchao: { file: 'Ban_Chao.jpg', title: '定远侯班超像', author: '《三才图会》' },
  cailun: { file: 'Cai_Lun.jpg', title: '龙亭侯蔡伦像', author: '《中国古代发明图集》' },
  zhangheng: { file: 'Zhang_Heng.jpg', title: '张衡像', author: '故宫藏清代算学先贤画册' },
  zhangzhongjing: { file: 'Zhang_Zhongjing.jpg', title: '医圣张仲景像', author: '清代《医宗金鉴》' },
  huatuo: { file: 'Hua_Tuo.jpg', title: '神医华佗像', author: '清代《历代名医图赞》' },
  zhangjiao: { file: 'Zhang_Jiao.jpg', title: '大贤良师张角像', author: '明代三国志平话插图' },
  caiwenji: { file: 'Cai_Wenji.jpg', title: '胡笳十八拍文姬像', author: '宋人《文姬归汉图》' },

  // === 魏晋 ===
  caocao: { file: 'Cao_Cao.jpg', title: '魏武帝曹操像', author: '清刻本《三国演义》人物图谱' },
  liubei: { file: 'Liu_Bei.jpg', title: '蜀汉昭烈帝刘备像', author: '清代成都武侯祠塑像画像' },
  sunquan: { file: 'Sun_Quan.jpg', title: '吴大帝孙权像', author: '唐·阎立本《历代帝王图》' },
  zhugeliang: { file: 'Zhuge_Liang.jpg', title: '忠武侯诸葛亮像', author: '清宫南薰殿名臣像' },
  guanyu: { file: 'Guan_Yu.jpg', title: '关圣帝君像', author: '明代宫廷工笔绢本彩绘' },
  zhouyu: { file: 'Zhou_Yu.jpg', title: '周公瑾像', author: '《三才图会》' },
  caozhi: { file: 'Cao_Zhi.jpg', title: '陈思王曹植像', author: '晋·顾恺之《洛神赋图》' },
  jikan: { file: 'Ji_Kang.jpg', title: '嵇中散抚琴图', author: '南京西善桥南朝砖画《竹林七贤》' },
  wangxizhi: { file: 'Wang_Xizhi.jpg', title: '书圣王羲之像', author: '唐代摹本 / 清代《历代名公画谱》' },
  xiean: { file: 'Xie_An.jpg', title: '谢安东山像', author: '《三才图会》' },
  taoyuanming: { file: 'Tao_Yuanming.jpg', title: '靖节先生陶潜像', author: '宋·李公麟《归去来兮图》' },
  zucongzhi: { file: 'Zu_Chongzhi.jpg', title: '祖冲之像', author: '《三才图会》' },
  lidaoyuan: { file: 'Li_Daoyuan.jpg', title: '郦道元像', author: '清刻本《水经注》插图' },
  mulan: { file: 'Hua_Mulan.jpg', title: '木兰从军图', author: '清代《百美新咏图传》' },

  // === 隋唐 ===
  yangjian: { file: 'Sui_Wendi.jpg', title: '隋文帝杨坚像', author: '唐·阎立本《历代帝王图》' },
  lishimin: { file: 'TangTaizong.jpg', title: '唐太宗李世民像', author: '唐·阎立本传本 / 台北故宫藏' },
  weizheng: { file: 'Wei_Zheng.jpg', title: '郑国公魏征像', author: '唐代凌烟阁二十四功臣像传本' },
  lijin: { file: 'Li_Jing.jpg', title: '卫国公李靖像', author: '凌烟阁功臣图赞' },
  xuanzang: { file: 'Xuanzang.jpg', title: '玄奘法师负笈图', author: '日本东京国立博物馆藏敦煌绢画' },
  wensheng: { file: 'Princess_Wencheng.jpg', title: '文成公主入藏像', author: '拉萨布达拉宫壁画' },
  songtsen: { file: 'Songtsen_Gampo.jpg', title: '松赞干布赞普像', author: '拉萨大昭寺古法相' },
  wuzetian: { file: 'Empress_Wu.jpg', title: '武则天真容像', author: '明代弘治刻本《历代古人像赞》' },
  direnjie: { file: 'Di_Renjie.jpg', title: '梁国公狄仁杰像', author: '明代刻本《历代名臣图像》' },
  sunsimiao: { file: 'Sun_Simiao.jpg', title: '药王孙思邈像', author: '清代《历代名医图赞》' },
  wangbo: { file: 'Wang_Bo.jpg', title: '王子安像', author: '清代《历代名公画谱》' },
  wangwei: { file: 'Wang_Wei.jpg', title: '右丞王维像', author: '清刻本《辋川图卷》' },
  libai: { file: 'Li_Po_by_Liang_Kai.jpg', title: '李白行吟图', author: '南宋·梁楷绘 / 东京国立博物馆藏' },
  dufu: { file: 'Du_Fu.jpg', title: '杜少陵像', author: '成都杜甫草堂元代刻石拓片' },
  guozhiyi: { file: 'Guo_Ziyi.jpg', title: '汾阳王郭子仪像', author: '唐代功臣图卷' },
  yanzhenqing: { file: 'Yan_Zhenqing.jpg', title: '鲁郡公颜真卿像', author: '宋代刻本忠烈庙画像' },
  luyu: { file: 'Lu_Yu.jpg', title: '茶圣陆羽像', author: '明代《茶经》刻本' },
  hanyu: { file: 'Han_Yu.jpg', title: '韩昌黎先生像', author: '宋刻本《五百家注昌黎先生文集》' },
  baijuyi: { file: 'Bai_Juyi.jpg', title: '白香山像', author: '清宫南薰殿历代文士图' },
  liuzongyuan: { file: 'Liu_Zongyuan.jpg', title: '柳河东像', author: '清代《历代名公画谱》' },
  lishangyin: { file: 'Li_Shangyin.jpg', title: '玉溪生李商隐像', author: '《三才图会》' },
  huangchao: { file: 'Huang_Chao.jpg', title: '冲天大将军黄巢像', author: '清刻野史绘本' },
  liyu: { file: 'Li_Yu.jpg', title: '南唐后主李煜像', author: '清代《历代帝王像谱》' },

  // === 宋 ===
  zhaokuangyin: { file: 'SongTaizu.jpg', title: '宋太祖赵匡胤坐像', author: '宋代宫廷画师绘 / 台北故宫藏' },
  fanzhongyan: { file: 'Fan_Zhongyan.jpg', title: '文正公范仲淹像', author: '宋代宗祠画像 / 台北故宫藏' },
  baozheng: { file: 'Bao_Zheng.jpg', title: '包孝肃公青天像', author: '合肥包公祠宋代线刻石碑拓片' },
  ouyangxiu: { file: 'Ouyang_Xiu.jpg', title: '六一居士欧阳修像', author: '宋代刻本《欧阳文忠公集》' },
  wanganshi: { file: 'Wang_Anshi.jpg', title: '王荆公像', author: '宋人画像 / 故宫博物院藏' },
  simaguang: { file: 'Sima_Guang.jpg', title: '司马温公像', author: '宋刻本《资治通鉴》插像' },
  sushi: { file: 'Su_Shi.jpg', title: '苏文忠公笠屐图', author: '元·赵孟頫绘 / 故宫博物院藏' },
  shenkuo: { file: 'Shen_Kuo.jpg', title: '梦溪先生沈括像', author: '《中国古代科学家画像》' },
  bisheng: { file: 'Bi_Sheng.jpg', title: '布衣毕昇像', author: '现代木刻复原 / 历代匠师集' },
  liqingzhao: { file: 'Li_Qingzhao.jpg', title: '易安居士像', author: '清代《百美新咏图传》' },
  yuefei: { file: 'Yue_Fei.jpg', title: '宋岳鄂王造像', author: '南宋画院画师绘 / 故宫博物院藏' },
  songjiang: { file: 'Song_Jiang.jpg', title: '及时雨宋江像', author: '明·陈洪绶《水浒叶子》' },
  fangla: { file: 'Fang_La.jpg', title: '方腊像', author: '清刻武林演义画传' },
  luyou: { file: 'Lu_You.jpg', title: '放翁陆游像', author: '明代绍兴府志名人画像' },
  xinqiji: { file: 'Xin_Qiji.jpg', title: '稼轩居士辛弃疾像', author: '清代《历代名公画谱》' },
  zhuxi: { file: 'Zhu_Xi.jpg', title: '晦翁朱文公像', author: '宋人画像 / 台北故宫藏' },
  wentianxiang: { file: 'Wen_Tianxiang.jpg', title: '文丞相天祥正气像', author: '元人画文天祥像 / 故宫藏' },

  // === 元明 ===
  chengjisihan: { file: 'Genghis_Khan.jpg', title: '元太祖成吉思汗立像', author: '元代宫廷工笔画 / 台北故宫藏' },
  guoshoujing: { file: 'Guo_Shoujing.jpg', title: '郭守敬授时像', author: '《三才图会》' },
  guanhanqing: { file: 'Guan_Hanqing.jpg', title: '关汉卿像', author: '明代戏曲插图画册' },
  huangdaopo: { file: 'Huang_Daopo.jpg', title: '黄道婆纺织图', author: '上海先棉祠清代壁画拓片' },
  zhuyuanzhang: { file: 'Ming_Taizu.jpg', title: '明太祖朱元璋正容像', author: '明代宫廷院体画 / 台北故宫藏' },
  liubowen: { file: 'Liu_Bowen.jpg', title: '诚意伯刘基像', author: '明代浙省宗祠官画' },
  zhudi: { file: 'Yongle_Emperor.jpg', title: '明成祖永乐大帝像', author: '明代宫廷绢本御容 / 台北故宫藏' },
  zhenghe: { file: 'Zheng_He.jpg', title: '三宝太监郑和下西洋像', author: '明刻《天妃经》卷首扉画' },
  yuqian: { file: 'Yu_Qian.jpg', title: '于忠肃公像', author: '明代杭州于祠旧藏画像' },
  wangyangming: { file: 'Wang_Yangming.jpg', title: '阳明先生王守仁像', author: '明代刻本《王文成公全书》' },
  tangyin: { file: 'Tang_Yin.jpg', title: '六如居士唐伯虎自画像', author: '明·唐寅画谱' },
  hairui: { file: 'Hai_Rui.jpg', title: '海忠介公像', author: '明代《历代名臣图像》' },
  qijiguang: { file: 'Qi_Jiguang.jpg', title: '戚少保纪光抗倭画像', author: '明代戚氏宗谱祖容' },
  zhangjuzheng: { file: 'Zhang_Juzheng.jpg', title: '张江陵像', author: '清宫南薰殿名臣图卷' },
  lishizhen: { file: 'Li_Shizhen.jpg', title: '李时珍采药像', author: '明万历刻本《本草纲目》' },
  xuxiake: { file: 'Xu_Xiake.jpg', title: '徐霞客出游像', author: '明代《徐霞客游记》题图' },
  songyingxing: { file: 'Song_Yingxing.jpg', title: '宋应星格物像', author: '明崇祯刻本《天工开物》' },
  lizicheng: { file: 'Li_Zicheng.jpg', title: '闯王李自成像', author: '明清通俗小说刻本插图' },
  shikefa: { file: 'Shi_Kefa.jpg', title: '史可法忠魂像', author: '清代扬州梅花岭史公祠石刻拓本' },
};

// 38处名胜古迹历史风貌与代表性文物遗存图像表
export const SITE_PORTRAITS = {
  // 古战场
  site_muye: { file: 'Muye_battle.jpg', title: '牧野之战纪念石碑', author: '朝歌古迹存影' },
  site_changping: { file: 'Changping_memorial.jpg', title: '长平之战遗址', author: '高平骷髅王庙古刻' },
  site_julu: { file: 'Julu_battle.jpg', title: '巨鹿古城古战场', author: '邢台古迹存拓' },
  site_gaixia: { file: 'Gaixia_site.jpg', title: '垓下霸王别姬古台', author: '灵璧楚汉遗迹' },
  site_guandu: { file: 'Guandu_site.jpg', title: '官渡古战场故垒', author: '中牟曹公垒遗迹' },
  site_chibi: { file: 'Red_Cliffs_site.jpg', title: '赤壁摩崖石刻', author: '长江赤壁古迹存影' },
  site_wuzhangyuan: { file: 'Wuzhang_Plains.jpg', title: '五丈原诸葛亮古庙', author: '岐山五丈原古景' },
  site_feishui: { file: 'Fei_River.jpg', title: '淝水古战场八公山', author: '寿县草木皆兵遗迹' },
  site_hulaoguan: { file: 'Hulao_Pass.jpg', title: '汜水关虎牢雄关', author: '洛阳关隘故垒' },
  site_suiyang: { file: 'Suiyang_ancient_city.jpg', title: '睢阳城张巡祠', author: '商丘古城遗迹' },
  site_caishiji: { file: 'Caishiji_ancient_battlefield.jpg', title: '采石矶临江绝壁', author: '当涂太白楼胜景' },
  site_yashan: { file: 'Yamen_memorial.jpg', title: '崖门海战慈元殿遗址', author: '新会崖山祠' },
  site_poyanghu: { file: 'Poyang_Lake_battle.jpg', title: '鄱阳湖水战康山草堂', author: '鄱阳湖水域胜景' },
  site_shanhaiguan: { file: 'Shanhaiguan.jpg', title: '天下第一关山海关', author: '明代蓟镇长城雄关' },

  // 建筑与宫殿
  site_dujiangyan: { file: 'Dujiangyan_irrigation_system.jpg', title: '都江堰水利安澜', author: '灌县二王庙实景' },
  site_epanggong: { file: 'Epang_Palace_ruins.jpg', title: '阿房宫前殿夯土台基', author: '西安西郊秦都故墟' },
  site_weiyanggong: { file: 'Weiyang_Palace_ruins.jpg', title: '汉未央宫大朝正殿台基', author: '汉长安城国家遗址' },
  site_tongquetai: { file: 'Tongquetai_ruins.jpg', title: '邺城铜雀三台残台', author: '临漳曹魏邺都遗迹' },
  site_lanting: { file: 'Lanting_Orchid_Pavilion.jpg', title: '会稽兰亭曲水流觞', author: '绍兴兰亭御碑亭' },
  site_zhaozhouqiao: { file: 'Zhaozhou_Bridge.jpg', title: '赵县安济桥隋代大石桥', author: '隋代李春天工绝造' },
  site_daminggong: { file: 'Daming_Palace_ruins.jpg', title: '唐大明宫含元殿丹陛双阙', author: '盛唐第一宫殿遗址' },
  site_tengwangge: { file: 'Tengwang_Pavilion.jpg', title: '洪都滕王阁重檐飞阁', author: '赣江名胜千古孤篇' },
  site_huanghelou: { file: 'Yellow_Crane_Tower.jpg', title: '武昌黄鹤楼天下江山第一楼', author: '江夏蛇山胜迹' },
  site_yueyanglou: { file: 'Yueyang_Tower.jpg', title: '巴陵岳阳楼头盔顶古阁', author: '洞庭天下水千古绝唱' },
  site_zijincheng: { file: 'Forbidden_City_Beijing.jpg', title: '北京紫禁城太和殿金顶', author: '明清明堂帝都紫禁' },
  site_jiayuguan: { file: 'Jiayuguan_pass.jpg', title: '天下第一雄关嘉峪关', author: '明代河西走廊雄关' },

  // 考古探源
  site_liangzhu: { file: 'Liangzhu_culture_Jade_Cong.jpg', title: '良渚文化神人兽面玉琮王', author: '良渚博物院五千年文明' },
  site_erlitou: { file: 'Erlitou_bronze_jue.jpg', title: '二里头华夏第一爵', author: '最早中国夏都洛阳' },
  site_yinxu: { file: 'Houmuwu_ding.jpg', title: '殷墟后母戊青铜大方鼎', author: '安阳殷墟商王重器' },
  site_sanxingdui: { file: 'Sanxingdui_bronze_head.jpg', title: '三星堆青铜纵目神面具', author: '广汉古蜀神祭坛' },
  site_bingmayong: { file: 'Terracotta_Army_Pit_1.jpg', title: '秦始皇兵马俑一号坑军阵', author: '临潼骊山世界第八大奇迹' },
  site_mawangdui: { file: 'Mawangdui_silk_banner.jpg', title: '马王堆汉墓T型帛画', author: '西汉轪侯家族绝代瑰宝' },
  site_loulan: { file: 'Loulan_kingdom_ruins.jpg', title: '大漠楼兰佛塔与三间房', author: '罗布泊丝绸古道残垣' },
  site_yungang: { file: 'Yungang_Grottoes_Buddha.jpg', title: '云冈石窟第20窟露天大佛', author: '北魏拓跋皇家造像' },
  site_longmen: { file: 'Longmen_Grottoes_Fengxian_Cave.jpg', title: '龙门石窟奉先寺卢舍那大佛', author: '大唐洛阳伊阙皇家开窟' },
  site_mogaoku: { file: 'Mogao_Caves_Nine-story_Building.jpg', title: '敦煌莫高窟九层木构窟檐', author: '鸣沙山千年佛窟壁画' },
  site_jiaohe: { file: 'Jiaohe_ruins.jpg', title: '吐鲁番交河生土故城', author: '车师前国生土绝唱' },
  site_nanhai1: { file: 'Nanhai_No._1_shipwreck.jpg', title: '南海一号南宋远洋古沉船', author: '海上丝绸之路水下考古' },
};

const FEMALE_IDS = new Set([
  'xishi', 'wangzhaojun', 'caiwenji', 'mulan', 'wensheng', 'liqingzhao', 'wuzetian', 'huangdaopo'
]);

const MILITARY_IDS = new Set([
  'sunwu', 'baiqi', 'lianpo', 'limu', 'jingke', 'mengtian', 'xiangyu', 'hanxin', 'weiqing',
  'huoqubing', 'liuling', 'banchao', 'guanyu', 'zhouyu', 'lijin', 'guozhiyi', 'yuefei', 'qijiguang'
]);

/**
 * 传世金石拓片与朱泥古印铭牌
 * 纯正中式古朴美学：呈现沉稳典雅的暗底洒金宣纸、金丝双回纹、朱泥古印与魏碑名讳，古典庄重
 */
function renderRubbingPlaque(entity, roleColor) {
  const isSite = entity.kind === 'site';
  const name = entity.name || '';
  const firstChar = name.slice(0, 1);
  const dynasty = entity.dynasty ? entity.dynasty.split(/[·（(]/)[0] : (isSite ? '名胜' : '古代');
  const badge = ROLE_BADGES[entity.role] || (isSite ? '古' : '贤');

  return `
    <svg viewBox="0 0 100 100" class="pa-rubbing-svg" aria-hidden="true">
      <defs>
        <radialGradient id="rb-bg-${entity.id}" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#2a231c"/>
          <stop offset="70%" stop-color="#181410"/>
          <stop offset="100%" stop-color="#0e0c0a"/>
        </radialGradient>
      </defs>
      <!-- 金石拓片宣纸底色 -->
      <rect x="2" y="2" width="96" height="96" rx="6" fill="url(#rb-bg-${entity.id})" stroke="#3d3328" stroke-width="1.2" />
      <!-- 金丝双内线框 -->
      <rect x="7" y="7" width="86" height="86" rx="4" fill="none" stroke="#8a7353" stroke-width="0.8" stroke-dasharray="16 2 4 2" opacity="0.65" />
      <!-- 四角云雷纹角饰 -->
      <path d="M10 16 L10 10 L16 10" fill="none" stroke="#c4a35a" stroke-width="1" />
      <path d="M90 16 L90 10 L84 10" fill="none" stroke="#c4a35a" stroke-width="1" />
      <path d="M10 84 L10 90 L16 90" fill="none" stroke="#c4a35a" stroke-width="1" />
      <path d="M90 84 L90 90 L84 90" fill="none" stroke="#c4a35a" stroke-width="1" />
      <!-- 朝代名号印鉴 -->
      <rect x="12" y="13" width="28" height="13" rx="1.5" fill="#2d251d" stroke="#5c4a39" stroke-width="0.7" />
      <text x="26" y="22.5" font-size="8" text-anchor="middle" fill="#cbb38b" font-family="'Noto Serif SC', serif" font-weight="600">${esc(dynasty)}</text>
      <!-- 右上角朱泥篆书古方印 -->
      <rect x="68" y="13" width="18" height="18" rx="2" fill="#9e2a2b" stroke="#681c1c" stroke-width="0.8" />
      <text x="77" y="26" font-size="10.5" text-anchor="middle" fill="#faebd7" font-family="'Noto Serif SC', serif" font-weight="900">${esc(badge)}</text>
      <!-- 碑拓核心大字（魏碑/金石风骨） -->
      <text x="50" y="66" font-size="38" text-anchor="middle" fill="#dfcfb0" font-family="'Noto Serif SC', 'Ma Shan Zheng', serif" font-weight="900" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 1px #8a7353;">${esc(firstChar)}</text>
      <!-- 下方金石小传横线与名讳 -->
      <line x1="18" y1="76" x2="82" y2="76" stroke="#4a3e31" stroke-width="0.8" />
      <text x="50" y="87" font-size="8" text-anchor="middle" fill="#a4937d" letter-spacing="1.5" font-family="'Noto Serif SC', serif">${esc(name)}</text>
    </svg>
  `;
}

export function getPortraitInfo(entity) {
  if (!entity) return null;
  const isSite = entity.kind === 'site';
  const meta = isSite ? SITE_PORTRAITS[entity.id] : FIGURE_PORTRAITS[entity.id];
  // 优先加载本地公版博物馆高精典藏画像与实景底片
  const localUrl = isSite ? `./img/sites/${entity.id}.jpg` : `./img/portraits/${entity.id}.jpg`;
  const remoteUrl = meta?.file ? `${WIKI_COMMONS_BASE}${meta.file}?width=420` : null;
  const url = entity.portraitUrl || localUrl;
  const title = meta?.title || (isSite ? `${entity.name}实景风貌` : `${entity.name}历史画像`);
  const author = meta?.author || (isSite ? '文物与遗址图谱' : '历代典藏画卷');
  const roleColor = ROLE_COLORS[entity.role] || '#a8322d';
  const badge = ROLE_BADGES[entity.role] || (isSite ? '古' : '贤');
  const dynasty = entity.dynasty ? entity.dynasty.split(/[·（(]/)[0] : (isSite ? '名胜' : '古代');

  return {
    url,
    remoteUrl,
    title,
    author,
    roleColor,
    badge,
    dynasty,
    isSite,
    id: entity.id,
    name: entity.name,
  };
}

/**
 * 渲染人物画像 / 古迹图像组件 HTML 字符串
 * 包含金石拓片底纹、博物馆真迹画作渲染、优雅渐现与双重降级
 *
 * @param {object} entity 先贤人物或古迹对象
 * @param {'sm'|'md'|'lg'|'dialogue'} size 规格
 * @param {string} extraClass 额外自定义 CSS 类
 */
export function renderPortraitHtml(entity, size = 'md', extraClass = '') {
  if (!entity) return '';
  const info = getPortraitInfo(entity);
  const { url, remoteUrl, title, author, roleColor, isSite, name } = info;
  const siteCls = isSite ? 'is-site-portrait' : 'is-figure-portrait';

  return `
    <div class="portrait-avatar pa-${size} ${siteCls} ${extraClass}" data-fid="${esc(entity.id)}" title="${esc(title)}（${esc(author)}）">
      ${url ? `
        <img class="pa-img"
             src="${esc(url)}"
             alt="${esc(name)}"
             loading="lazy"
             onload="this.parentElement.classList.add('pa-loaded')"
             onerror="if(!this.dataset.triedRemote && '${remoteUrl || ''}'){this.dataset.triedRemote='1';this.src='${remoteUrl || ''}';}else{this.style.display='none';this.parentElement.classList.add('pa-fallback-only');}" />
      ` : ''}
      <div class="pa-fallback" style="--role-color:${roleColor}" aria-hidden="true">
        <div class="pa-rubbing-wrap">
          ${renderRubbingPlaque(entity, roleColor)}
        </div>
      </div>
      <div class="pa-ring" aria-hidden="true"></div>
    </div>
  `.trim();
}
