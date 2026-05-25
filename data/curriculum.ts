/**
 * 拼音魔法公主 - 完整课程大纲
 *
 * 覆盖小学拼音教学全部音素，按4个阶段组织：
 *   声调森林 → 声母城堡 → 韵母花园 → 认读圣殿
 *
 * 使用方式：
 *   import { getLevelById, getStageLevels, STAGES } from '@/data/curriculum';
 *   const level = getLevelById('b');
 */

import type { LevelData, StageInfo, StageId } from './types';

// ============================================================
// 阶段定义
// ============================================================

export const STAGES: StageInfo[] = [
  {
    id: 'tones-forest',
    name: '声调魔法森林',
    subtitle: '单韵母+声调',
    icon: '▲',
    iconBg: 'rgba(255,255,255,0.3)',
    barColor: '#0FBA82',
    textColor: '#0FBA82',
  },
  {
    id: 'consonant-castle',
    name: '声母魔法城堡',
    subtitle: '声母按部位',
    icon: '🏰',
    iconBg: 'rgba(255,255,255,0.3)',
    barColor: '#388ADE',
    textColor: '#388ADE',
  },
  {
    id: 'vowel-garden',
    name: '韵母魔法花园',
    subtitle: '复韵母+鼻韵母',
    icon: '🌸',
    iconBg: 'rgba(255,255,255,0.3)',
    barColor: '#ED4799',
    textColor: '#ED4799',
  },
  {
    id: 'reading-temple',
    name: '认读魔法圣殿',
    subtitle: '整体认读音节',
    icon: '🏛️',
    iconBg: 'rgba(255,255,255,0.3)',
    barColor: '#F59E0A',
    textColor: '#F59E0A',
  },
];

// ============================================================
// 完整课程数据
// ============================================================

const ALL_LEVELS: LevelData[] = [
  // ─── 第一阶段：声调魔法森林（单韵母）───
  {
    id: 'a', letter: 'a', pinyin: 'ā', type: 'single-final', tone: 1,
    example: '啊', word: '阿姨',
    mouthGuide: '嘴巴张大，舌头放平，像医生检查喉咙说"啊"',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '啊', quizWrong: ['哦', '鹅', '衣'],
    audioKey: 'a1', stageIndex: 0,
  },
  {
    id: 'o', letter: 'o', pinyin: 'ō', type: 'single-final', tone: 1,
    example: '哦', word: '喔喔叫',
    mouthGuide: '嘴巴圆圆，像公鸡打鸣"喔喔喔"',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '哦', quizWrong: ['啊', '鹅', '屋'],
    audioKey: 'o1', stageIndex: 1,
  },
  {
    id: 'e', letter: 'e', pinyin: 'ē', type: 'single-final', tone: 1,
    example: '鹅', word: '白鹅',
    mouthGuide: '嘴巴扁扁，舌头后缩，像大白鹅唱歌',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '鹅', quizWrong: ['啊', '哦', '鱼'],
    audioKey: 'e1', stageIndex: 2,
  },
  {
    id: 'i', letter: 'i', pinyin: 'ī', type: 'single-final', tone: 1,
    example: '衣', word: '衣服',
    mouthGuide: '牙齿对齐，嘴巴向两边咧开，舌尖抵住下牙',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '衣', quizWrong: ['屋', '鱼', '鹅'],
    audioKey: 'i1', stageIndex: 3,
  },
  {
    id: 'u', letter: 'u', pinyin: 'ū', type: 'single-final', tone: 1,
    example: '屋', word: '房屋',
    mouthGuide: '嘴巴向前凸起，双唇收圆，像吹蜡烛',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '屋', quizWrong: ['衣', '鱼', '啊'],
    audioKey: 'u1', stageIndex: 4,
  },
  {
    id: 'v', letter: 'ü', pinyin: 'ǖ', type: 'single-final', tone: 1,
    example: '鱼', word: '小鱼',
    mouthGuide: '嘴巴翘起像吹口哨，同时发出"鱼"的声音',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '鱼', quizWrong: ['衣', '屋', '鹅'],
    audioKey: 'v1', stageIndex: 5,
  },

  // ─── 第二阶段：声母魔法城堡（声母）───
  {
    id: 'b', letter: 'b', pinyin: 'bō', type: 'initial', tone: 1,
    example: '波', word: '波浪',
    mouthGuide: '双唇紧闭，突然张开，气流冲出，声带振动',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '波', quizWrong: ['泼', '摸', '佛'],
    audioKey: 'b', stageIndex: 0,
  },
  {
    id: 'p', letter: 'p', pinyin: 'pō', type: 'initial', tone: 1,
    example: '泼', word: '泼水',
    mouthGuide: '双唇紧闭，用力喷出气流，像吹灭蜡烛，声带不振动',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '泼', quizWrong: ['波', '摸', '佛'],
    audioKey: 'p', stageIndex: 1,
  },
  {
    id: 'm', letter: 'm', pinyin: 'mō', type: 'initial', tone: 1,
    example: '摸', word: '抚摸',
    mouthGuide: '双唇紧闭，气流从鼻子出来，声带振动，像小猫发出"喵"的前半段',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '摸', quizWrong: ['波', '佛', '呢'],
    audioKey: 'm', stageIndex: 2,
  },
  {
    id: 'f', letter: 'f', pinyin: 'fō', type: 'initial', tone: 1,
    example: '佛', word: '佛像',
    mouthGuide: '上牙轻轻咬住下唇，气流从齿缝挤出，声带不振动',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '佛', quizWrong: ['摸', '波', '喝'],
    audioKey: 'f', stageIndex: 3,
  },
  {
    id: 'd', letter: 'd', pinyin: 'dē', type: 'initial', tone: 1,
    example: '得', word: '得到',
    mouthGuide: '舌尖顶住上牙床，突然松开，气流冲出，声带振动',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '得', quizWrong: ['特', '呢', '了'],
    audioKey: 'd', stageIndex: 4,
  },
  {
    id: 't', letter: 't', pinyin: 'tē', type: 'initial', tone: 1,
    example: '特', word: '特别',
    mouthGuide: '舌尖顶住上牙床，用力送气，像拍皮球"t-t-t"',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '特', quizWrong: ['得', '呢', '了'],
    audioKey: 't', stageIndex: 5,
  },
  {
    id: 'n', letter: 'n', pinyin: 'nē', type: 'initial', tone: 1,
    example: '呢', word: '呢喃',
    mouthGuide: '舌尖顶住上牙床，气流从鼻子出来，声带振动',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '呢', quizWrong: ['了', '得', '特'],
    audioKey: 'n', stageIndex: 6,
  },
  {
    id: 'l', letter: 'l', pinyin: 'lē', type: 'initial', tone: 1,
    example: '了', word: '快乐',
    mouthGuide: '舌尖顶住上牙床，气流从舌头两边出来，声带振动',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '了', quizWrong: ['呢', '得', '特'],
    audioKey: 'l', stageIndex: 7,
  },
  {
    id: 'g', letter: 'g', pinyin: 'gē', type: 'initial', tone: 1,
    example: '歌', word: '唱歌',
    mouthGuide: '舌根抬高顶住软腭，突然松开，声带振动，像鸽子"咕咕"',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '歌', quizWrong: ['科', '喝', '哥'],
    audioKey: 'g', stageIndex: 8,
  },
  {
    id: 'k', letter: 'k', pinyin: 'kē', type: 'initial', tone: 1,
    example: '科', word: '科学',
    mouthGuide: '舌根抬高顶住软腭，用力送气，像咳嗽的声音',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '科', quizWrong: ['歌', '喝', '哥'],
    audioKey: 'k', stageIndex: 9,
  },
  {
    id: 'h', letter: 'h', pinyin: 'hē', type: 'initial', tone: 1,
    example: '喝', word: '喝水',
    mouthGuide: '舌根靠近软腭，气流从中间擦过，像轻轻哈气',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '喝', quizWrong: ['歌', '科', '哥'],
    audioKey: 'h', stageIndex: 10,
  },
  {
    id: 'j', letter: 'j', pinyin: 'jī', type: 'initial', tone: 1,
    example: '鸡', word: '小鸡',
    mouthGuide: '舌尖抵住下牙，舌面抬高靠近硬腭，气流挤出，像小鸡"叽叽"叫',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '鸡', quizWrong: ['七', '西', '机'],
    audioKey: 'j', stageIndex: 11,
  },
  {
    id: 'q', letter: 'q', pinyin: 'qī', type: 'initial', tone: 1,
    example: '七', word: '七个',
    mouthGuide: '嘴巴位置和 j 一样，但用力送气，像气球漏气"q-q-q"',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '七', quizWrong: ['鸡', '西', '机'],
    audioKey: 'q', stageIndex: 12,
  },
  {
    id: 'x', letter: 'x', pinyin: 'xī', type: 'initial', tone: 1,
    example: '西', word: '西瓜',
    mouthGuide: '嘴巴微笑状，舌尖抵住下牙，气流从舌面擦过',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '西', quizWrong: ['鸡', '七', '机'],
    audioKey: 'x', stageIndex: 13,
  },
  {
    id: 'zh', letter: 'zh', pinyin: 'zhī', type: 'initial', tone: 1,
    example: '知', word: '知道',
    mouthGuide: '舌尖翘起顶住硬腭前部，声带振动，像"知了"叫',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '知', quizWrong: ['吃', '诗', '日'],
    audioKey: 'zh', stageIndex: 14,
  },
  {
    id: 'ch', letter: 'ch', pinyin: 'chī', type: 'initial', tone: 1,
    example: '吃', word: '吃饭',
    mouthGuide: '舌头位置和 zh 一样，但用力送气',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '吃', quizWrong: ['知', '诗', '日'],
    audioKey: 'ch', stageIndex: 15,
  },
  {
    id: 'sh', letter: 'sh', pinyin: 'shī', type: 'initial', tone: 1,
    example: '诗', word: '诗歌',
    mouthGuide: '舌尖翘起靠近硬腭前部，气流从中间擦过，像"嘘"——让大家安静',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '诗', quizWrong: ['知', '吃', '日'],
    audioKey: 'sh', stageIndex: 16,
  },
  {
    id: 'r', letter: 'r', pinyin: 'rì', type: 'initial', tone: 4,
    example: '日', word: '太阳',
    mouthGuide: '舌头位置和 sh 一样，但声带振动，像温柔地卷舌',
    toneRhyme: '四声快快往下降',
    toneGesture: '右手从左上向右下快速下降',
    quizCorrect: '日', quizWrong: ['知', '诗', '资'],
    audioKey: 'r', stageIndex: 17,
  },
  {
    id: 'z', letter: 'z', pinyin: 'zī', type: 'initial', tone: 1,
    example: '资', word: '资源',
    mouthGuide: '舌尖平伸，顶住上牙背，气流冲出，声带振动',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '资', quizWrong: ['雌', '思', '知'],
    audioKey: 'z', stageIndex: 18,
  },
  {
    id: 'c', letter: 'c', pinyin: 'cī', type: 'initial', tone: 1,
    example: '雌', word: '雌雄',
    mouthGuide: '舌头位置和 z 一样，但用力送气',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '雌', quizWrong: ['资', '思', '吃'],
    audioKey: 'c', stageIndex: 19,
  },
  {
    id: 's', letter: 's', pinyin: 'sī', type: 'initial', tone: 1,
    example: '思', word: '思考',
    mouthGuide: '舌尖靠近上牙背，气流从中间挤过，像蛇发出的嘶嘶声',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '思', quizWrong: ['资', '雌', '诗'],
    audioKey: 's', stageIndex: 20,
  },
  {
    id: 'y', letter: 'y', pinyin: 'yī', type: 'initial', tone: 1,
    example: '一', word: '一个',
    mouthGuide: '嘴巴微微张开，舌面抬高，气流轻轻流出',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '一', quizWrong: ['衣', '鱼', '屋'],
    audioKey: 'y', stageIndex: 21,
  },
  {
    id: 'w', letter: 'w', pinyin: 'wū', type: 'initial', tone: 1,
    example: '乌', word: '乌鸦',
    mouthGuide: '双唇收圆向前，声带振动，像刮风"呜——"',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '乌', quizWrong: ['屋', '衣', '鱼'],
    audioKey: 'w', stageIndex: 22,
  },

  // ─── 第三阶段：韵母魔法花园（复韵母 + 鼻韵母）───
  {
    id: 'ai', letter: 'ai', pinyin: 'āi', type: 'compound-final', tone: 1,
    example: '挨', word: '挨着',
    mouthGuide: '从 a 滑向 i，嘴巴从大变小，舌头从低到高',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '挨', quizWrong: ['诶', '凹', '欧'],
    audioKey: 'ai', stageIndex: 0,
  },
  {
    id: 'ei', letter: 'ei', pinyin: 'ēi', type: 'compound-final', tone: 1,
    example: '诶', word: '（语气词）',
    mouthGuide: '从 e 滑向 i，嘴巴慢慢咧开，像用力搬东西发出的声音',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '诶', quizWrong: ['挨', '凹', '欧'],
    audioKey: 'ei', stageIndex: 1,
  },
  {
    id: 'ui', letter: 'ui', pinyin: 'uī', type: 'compound-final', tone: 1,
    example: '威', word: '威风',
    mouthGuide: '从 u 滑向 i，嘴唇从圆变扁，像微笑的动作',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '威', quizWrong: ['挨', '凹', '欧'],
    audioKey: 'ui', stageIndex: 2,
  },
  {
    id: 'ao', letter: 'ao', pinyin: 'āo', type: 'compound-final', tone: 1,
    example: '凹', word: '凹凸',
    mouthGuide: '从 a 滑向 o，嘴巴从大圆变小圆，下巴上收',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '凹', quizWrong: ['欧', '挨', '诶'],
    audioKey: 'ao', stageIndex: 3,
  },
  {
    id: 'ou', letter: 'ou', pinyin: 'ōu', type: 'compound-final', tone: 1,
    example: '欧', word: '欧洲',
    mouthGuide: '从 o 滑向 u，嘴唇从小圆变得更圆更小',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '欧', quizWrong: ['凹', '挨', '诶'],
    audioKey: 'ou', stageIndex: 4,
  },
  {
    id: 'iu', letter: 'iu', pinyin: 'iū', type: 'compound-final', tone: 1,
    example: '优', word: '优秀',
    mouthGuide: '从 i 滑向 u，嘴巴从咧开到撅起，像小火车"呜——"',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '优', quizWrong: ['挨', '威', '欧'],
    audioKey: 'iu', stageIndex: 5,
  },
  {
    id: 'ie', letter: 'ie', pinyin: 'iē', type: 'compound-final', tone: 1,
    example: '耶', word: '（欢呼声）',
    mouthGuide: '从 i 滑向 e，舌头在口腔里从上滑到中',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '耶', quizWrong: ['月', '挨', '优'],
    audioKey: 'ie', stageIndex: 6,
  },
  {
    id: 've', letter: 'üe', pinyin: 'üē', type: 'compound-final', tone: 1,
    example: '月', word: '月亮',
    mouthGuide: '从 ü 滑向 e，嘴唇从翘起圆唇到扁唇',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '月', quizWrong: ['耶', '挨', '优'],
    audioKey: 've', stageIndex: 7,
  },
  {
    id: 'er', letter: 'er', pinyin: 'ér', type: 'compound-final', tone: 2,
    example: '儿', word: '儿童',
    mouthGuide: '发 e 的同时把舌尖卷起来，像小花猫舔嘴巴',
    toneRhyme: '二声就像上山坡',
    toneGesture: '右手从左下向右上扬起',
    quizCorrect: '儿', quizWrong: ['鹅', '耳', '二'],
    audioKey: 'er', stageIndex: 8,
  },
  {
    id: 'an', letter: 'an', pinyin: 'ān', type: 'nasal-final', tone: 1,
    example: '安', word: '安全',
    mouthGuide: '从 a 滑向 n，舌尖顶住上牙床，气流从鼻子出来',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '安', quizWrong: ['恩', '昂', '嗯'],
    audioKey: 'an', stageIndex: 9,
  },
  {
    id: 'en', letter: 'en', pinyin: 'ēn', type: 'nasal-final', tone: 1,
    example: '恩', word: '感恩',
    mouthGuide: '从 e 滑向 n，舌尖顶上牙床，气流走鼻子',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '恩', quizWrong: ['安', '昂', '嗯'],
    audioKey: 'en', stageIndex: 10,
  },
  {
    id: 'in', letter: 'in', pinyin: 'yīn', type: 'nasal-final', tone: 1,
    example: '音', word: '音乐',
    mouthGuide: '从 i 滑向 n，舌尖顶上牙床，保持微笑嘴型',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '音', quizWrong: ['因', '英', '安'],
    audioKey: 'in', stageIndex: 11,
  },
  {
    id: 'ang', letter: 'ang', pinyin: 'āng', type: 'nasal-final', tone: 1,
    example: '昂', word: '昂首',
    mouthGuide: '从 a 滑向 ng，舌根抬高堵住气流，从鼻子发声',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '昂', quizWrong: ['安', '恩', '嗯'],
    audioKey: 'ang', stageIndex: 12,
  },
  {
    id: 'eng', letter: 'eng', pinyin: 'ēng', type: 'nasal-final', tone: 1,
    example: '哼', word: '哼哼',
    mouthGuide: '从 e 滑向 ng，舌根抬高，用鼻子哼出来',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '哼', quizWrong: ['恩', '昂', '安'],
    audioKey: 'eng', stageIndex: 13,
  },

  // ─── 第四阶段：认读魔法圣殿（整体认读音节）───
  {
    id: 'zhi', letter: 'zhi', pinyin: 'zhī', type: 'whole-syllable', tone: 1,
    example: '知', word: '知识',
    mouthGuide: '直接读"知"，不用拼，一口读出',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '知', quizWrong: ['吃', '诗', '日'],
    audioKey: 'zhi', stageIndex: 0,
  },
  {
    id: 'chi', letter: 'chi', pinyin: 'chī', type: 'whole-syllable', tone: 1,
    example: '吃', word: '吃饭',
    mouthGuide: '直接读"吃"，不用拼，一口读出',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '吃', quizWrong: ['知', '诗', '资'],
    audioKey: 'chi', stageIndex: 1,
  },
  {
    id: 'shi', letter: 'shi', pinyin: 'shī', type: 'whole-syllable', tone: 1,
    example: '诗', word: '诗歌',
    mouthGuide: '直接读"诗"，不用拼，一口读出',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '诗', quizWrong: ['知', '吃', '思'],
    audioKey: 'shi', stageIndex: 2,
  },
  {
    id: 'ri', letter: 'ri', pinyin: 'rì', type: 'whole-syllable', tone: 4,
    example: '日', word: '日光',
    mouthGuide: '直接读"日"，不用拼，一口读出',
    toneRhyme: '四声快快往下降',
    toneGesture: '右手从左上向右下快速下降',
    quizCorrect: '日', quizWrong: ['知', '诗', '资'],
    audioKey: 'ri', stageIndex: 3,
  },
  {
    id: 'zi', letter: 'zi', pinyin: 'zì', type: 'whole-syllable', tone: 4,
    example: '字', word: '汉字',
    mouthGuide: '直接读"字"，不用拼，一口读出',
    toneRhyme: '四声快快往下降',
    toneGesture: '右手从左上向右下快速下降',
    quizCorrect: '字', quizWrong: ['自', '知', '思'],
    audioKey: 'zi', stageIndex: 4,
  },
  {
    id: 'ci', letter: 'ci', pinyin: 'cí', type: 'whole-syllable', tone: 2,
    example: '词', word: '词语',
    mouthGuide: '直接读"词"，不用拼，一口读出',
    toneRhyme: '二声就像上山坡',
    toneGesture: '右手从左下向右上扬起',
    quizCorrect: '词', quizWrong: ['字', '吃', '思'],
    audioKey: 'ci', stageIndex: 5,
  },
  {
    id: 'si', letter: 'si', pinyin: 'sī', type: 'whole-syllable', tone: 1,
    example: '丝', word: '丝线',
    mouthGuide: '直接读"丝"，不用拼，一口读出',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '丝', quizWrong: ['诗', '字', '知'],
    audioKey: 'si', stageIndex: 6,
  },
  {
    id: 'yi', letter: 'yi', pinyin: 'yī', type: 'whole-syllable', tone: 1,
    example: '一', word: '第一',
    mouthGuide: '直接读"一"，不用拼，一口读出',
    toneRhyme: '一声高高平又平',
    toneGesture: '右手平伸，从胸前平稳滑向右侧',
    quizCorrect: '一', quizWrong: ['衣', '鱼', '屋'],
    audioKey: 'yi', stageIndex: 7,
  },
  {
    id: 'wu', letter: 'wu', pinyin: 'wú', type: 'whole-syllable', tone: 2,
    example: '无', word: '无数',
    mouthGuide: '直接读"无"，不用拼，一口读出',
    toneRhyme: '二声就像上山坡',
    toneGesture: '右手从左下向右上扬起',
    quizCorrect: '无', quizWrong: ['屋', '鱼', '一'],
    audioKey: 'wu', stageIndex: 8,
  },
  {
    id: 'yu', letter: 'yu', pinyin: 'yǔ', type: 'whole-syllable', tone: 3,
    example: '雨', word: '下雨',
    mouthGuide: '直接读"雨"，不用拼，一口读出',
    toneRhyme: '三声下坡又上坡',
    toneGesture: '右手先向下再向上，画一个对勾',
    quizCorrect: '雨', quizWrong: ['鱼', '衣', '一'],
    audioKey: 'yu', stageIndex: 9,
  },
  {
    id: 'ye', letter: 'ye', pinyin: 'yè', type: 'whole-syllable', tone: 4,
    example: '夜', word: '夜晚',
    mouthGuide: '直接读"夜"，不用拼，一口读出',
    toneRhyme: '四声快快往下降',
    toneGesture: '右手从左上向右下快速下降',
    quizCorrect: '夜', quizWrong: ['耶', '月', '一'],
    audioKey: 'ye', stageIndex: 10,
  },
];

// ============================================================
// 查询函数
// ============================================================

/** 根据 ID 获取关卡数据 */
export function getLevelById(id: string): LevelData | undefined {
  return ALL_LEVELS.find((l) => l.id === id);
}

/** 获取某个阶段的所有关卡 */
export function getStageLevels(stageId: StageId): LevelData[] {
  const stageIndex = STAGES.findIndex((s) => s.id === stageId);
  // 映射到 ALL_LEVELS 中对应阶段的数据
  if (stageIndex === 0) {
    return ALL_LEVELS.filter((l) => l.type === 'single-final');
  }
  if (stageIndex === 1) {
    return ALL_LEVELS.filter((l) => l.type === 'initial');
  }
  if (stageIndex === 2) {
    return ALL_LEVELS.filter((l) => l.type === 'compound-final' || l.type === 'nasal-final');
  }
  if (stageIndex === 3) {
    return ALL_LEVELS.filter((l) => l.type === 'whole-syllable');
  }
  return [];
}

/** 获取所有关卡 */
export function getAllLevels(): LevelData[] {
  return ALL_LEVELS;
}

/** 总关卡数 */
export const TOTAL_LEVELS = ALL_LEVELS.length;

/** 根据阶段获取关卡列表（带序号重映射） */
export function getStageLevelsWithIndex(stageId: StageId): LevelData[] {
  return getStageLevels(stageId).map((l, i) => ({ ...l, stageIndex: i }));
}

/** 获取下一个要学的关卡（用于"下一关"导航） */
export function getNextLevel(currentId: string): LevelData | undefined {
  const idx = ALL_LEVELS.findIndex((l) => l.id === currentId);
  if (idx >= 0 && idx < ALL_LEVELS.length - 1) {
    return ALL_LEVELS[idx + 1];
  }
  return undefined;
}
