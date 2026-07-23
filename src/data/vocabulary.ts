import Papa from 'papaparse'
import type { Word } from '../types'

// Topic to emoji mapping for UI
export const TOPIC_META: Record<string, { emoji: string; label: string; labelZh: string; color: string }> = {
  greetings:      { emoji: '👋', label: 'Greetings',     labelZh: '问候',   color: 'bg-emerald-500' },
  daily:          { emoji: '🌅', label: 'Daily Life',     labelZh: '日常',   color: 'bg-sky-500' },
  food:           { emoji: '🥙', label: 'Food',           labelZh: '食物',   color: 'bg-orange-500' },
  work:           { emoji: '🔨', label: 'Work',           labelZh: '工作',   color: 'bg-amber-600' },
  numbers:        { emoji: '🔢', label: 'Numbers',        labelZh: '数字',   color: 'bg-violet-500' },
  slang:          { emoji: '😎', label: 'Slang',          labelZh: '俚语',   color: 'bg-pink-500' },
  shopping:       { emoji: '🛒', label: 'Shopping',       labelZh: '购物',   color: 'bg-teal-500' },
  transportation: { emoji: '🚌', label: 'Transport',      labelZh: '交通',   color: 'bg-blue-500' },
  health:         { emoji: '🏥', label: 'Health',         labelZh: '健康',   color: 'bg-red-500' },
  emergency:      { emoji: '🚨', label: 'Emergency',      labelZh: '紧急',   color: 'bg-red-700' },
  directions:     { emoji: '🗺️', label: 'Directions',    labelZh: '方向',   color: 'bg-indigo-500' },
  rules:          { emoji: '⚠️', label: 'Rules & Signs', labelZh: '规则',   color: 'bg-yellow-600' },
  verbs:          { emoji: '⚡', label: 'Verbs',          labelZh: '动词',   color: 'bg-cyan-600' },
  money:          { emoji: '💰', label: 'Money',          labelZh: '金钱',   color: 'bg-lime-600' },
}

// Word-specific curated Unsplash images keyed by romanized pronunciation
const WORD_IMAGES: Record<string, string> = {
  // FOOD
  'banana':           'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&q=80',
  'agvaniya':         'https://images.unsplash.com/photo-1546470427-0ca9b21c8168?w=500&q=80',
  'mayim':            'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500&q=80',
  'kafe':             'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80',
  'lehem':            'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80',
  'halav':            'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80',
  'beitsa':           'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=500&q=80',
  'basar':            'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500&q=80',
  'dag':              'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=500&q=80',
  'orez':             'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&q=80',
  'salat':            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
  'marak':            'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80',
  'uga':              'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&q=80',
  'mits':             'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80',
  'glida':            'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80',
  'te':               'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80',
  'of':               'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&q=80',
  'batzal':           'https://images.unsplash.com/photo-1508747703725-719777637510?w=500&q=80',
  'gezer':            'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&q=80',
  'melafefon':        'https://images.unsplash.com/photo-1449300079323-02847be96222?w=500&q=80',
  "tapu'ah":          'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&q=80',
  "tapu'ah adama":    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80',
  'pri':              'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&q=80',
  'yerek':            'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80',
  'shum':             'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=500&q=80',
  'pita':             'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80',
  'hummus':           'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80',
  'falafel':          'https://images.unsplash.com/photo-1642559543885-9960ee2d35b4?w=500&q=80',
  'salat katzutz':    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
  // GREETINGS
  'shalom':           'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&q=80',
  'toda':             'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=500&q=80',
  'sliha':            'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=500&q=80',
  'bevakasha':        'https://images.unsplash.com/photo-1504615755583-2916b52192a3?w=500&q=80',
  'boker tov':        'https://images.unsplash.com/photo-1484627147104-f5197bcd6651?w=500&q=80',
  'layla tov':        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
  'erev tov':         'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=80',
  'baruh aba':        'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=500&q=80',
  'lehitraot':        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
  'ken':              'https://images.unsplash.com/photo-1492681290082-e932832941e6?w=500&q=80',
  'lo':               'https://images.unsplash.com/photo-1531259736756-6caccf485f0d?w=500&q=80',
  // DAILY
  'bayit':            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80',
  'dira':             'https://images.unsplash.com/photo-1522708323474-3b0fe8cbdd7b?w=500&q=80',
  'mishpacha':        'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=500&q=80',
  'mazgan':           'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=80',
  'kesef':            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&q=80',
  'kanyon':           'https://images.unsplash.com/photo-1555529669-e69bf541120c?w=500&q=80',
  'lishon':           'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&q=80',
  'ani oleh lishon':  'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&q=80',
  'ani same\'ah me\'od': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80',
  'Bete a von':       'https://images.unsplash.com/photo-1543353071-087092ec393a?w=500&q=80',
  'dai':              'https://images.unsplash.com/photo-1575414003246-73ab56685c26?w=500&q=80',
  // WORK
  'avoda':            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80',
  'misrad':           'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80',
  'maskoret':         'https://images.unsplash.com/photo-1559526324-593bc073d938?w=500&q=80',
  'binyan':           'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80',
  'atar':             'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80',
  'patish':           'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&q=80',
  'kova':             'https://images.unsplash.com/photo-1567793151945-b6b90d5f82c8?w=500&q=80',
  'bitu\'ah':         'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&q=80',
  // HEALTH
  'rofe':             'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&q=80',
  'beit holim':       'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&q=80',
  'beit holim magen david': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&q=80',
  'terufa':           'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80',
  // EMERGENCY
  'mishtara':         'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?w=500&q=80',
  'magen david adom': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&q=80',
  'sakana':           'https://images.unsplash.com/photo-1534796636912-3b95919ab1b2?w=500&q=80',
  'esh':              'https://images.unsplash.com/photo-1534315251175-7a9e60cf6e6a?w=500&q=80',
  'ezra':             'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&q=80',
  // TRANSPORT
  'otobus':           'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&q=80',
  'rakevet':          'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=500&q=80',
  'monit':            'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80',
  // SHOPPING
  'shuk':             'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
  'makolet':          'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80',
  'shekel':           'https://images.unsplash.com/photo-1591696331111-ef9586a5b17a?w=500&q=80',
  // SLANG
  'yalla':            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&q=80',
  'sababa':           'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80',
  'ahi':              'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&q=80',
  'basa':             'https://images.unsplash.com/photo-1542893783-b2ef1e9e24b3?w=500&q=80',
  'halas':            'https://images.unsplash.com/photo-1575414003246-73ab56685c26?w=500&q=80',
  'walla':            'https://images.unsplash.com/photo-1492681290082-e932832941e6?w=500&q=80',
  // DIRECTIONS
  'smola':            'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80',
  'yemina':           'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80',
  'yashar':           'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80',
  'rehov':            'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=80',
}

// Fallback Unsplash images by topic (so the app works even without running the enrich script)
const TOPIC_FALLBACK_IMAGES: Record<string, string> = {
  greetings:      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  daily:          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  food:           'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&q=80',
  work:           'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
  numbers:        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80',
  slang:          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  shopping:       'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80',
  transportation: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80',
  health:         'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
  emergency:      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
  directions:     'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
  rules:          'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
  verbs:          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
  money:          'https://images.unsplash.com/photo-1559526324-593bc073d938?w=600&q=80',
}

const RAW_CSV = `difficulty,image,romanized,,audio_recording,translation_hanzi,topic,pronunciation_hanzi,explanation,id,created_date,updated_date,created_by_id,created_by,is_sample
intermediate,,ahi,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%97%D7%99.m4a,אחי,兄弟,slang,阿 hi,"俚语，用来称呼朋友或任何人，类似英语里的'bro'。不一定真的是兄弟。可以像'哥们儿'一样用的。",6a3d76bf9ab921c25ea1654d,2026-06-25 18:43:12,2026-06-25 20:38:28,6a3d744fb60a7a4c61d29100,elianahaddad12@gmail.com,FALSE
beginner,,ahot,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%97%D7%95%D7%AA.m4a,אחות,姐妹,daily,阿后特,如果想说"我的姐妹"要说 "阿后体" ahoti.,6a3ea39dde603ecc64e89125
beginner,,agvaniya,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A2%D7%92%D7%91%D7%A0%D7%99%D7%99%D7%94.m4a,עגבניה,西红柿,food,阿格瓦尼娅,,6a3ea657eba303645aaa3db9
beginner,,ani,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%A0%D7%99.m4a,אני,我,daily,阿尼,,6a3ea657eba303645aaa3d72
beginner,,ani ayef,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%A0%D7%99%20%D7%A2%D7%99%D7%99%D7%A3.m4a,אני עייף,我很累（男的）,daily, ,,6a3ea657eba303645aaa3d7d
beginner,,ani oleh lishon,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%A0%D7%99%20%D7%94%D7%95%D7%9C%D7%9A%20%D7%9C%D7%99%D7%A9%D7%95%D7%9F.m4a,אני הולך לישון,我去睡觉,daily,阿尼 霍列赫 丽顺,,6a3ea657eba303645aaa3d79
beginner,,ani same'ah me'od,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%A0%D7%99%20%D7%A9%D7%9E%D7%97%20%D7%9E%D7%90%D7%95%D7%93.m4a,אני שמח מאוד,我很高兴,daily,阿尼 萨梅阿赫 梅奥德,,6a3ea657eba303645aaa3d7a
beginner,,arba,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%A8%D7%91%D7%A2.m4a,ארבע,四,numbers,阿尔巴,,word-arba
beginner,,asur,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%A1%D7%95%D7%A8.m4a,אסור,禁止,rules,阿苏尔,例如：asur le'ashen (禁止吸烟),6a3ea657eba303645aaa3dad
beginner,,at,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%AA.m4a,את,你 （对女生）,daily,阿特,,6a3ea657eba303645aaa3d73
beginner,,ata,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%AA%D7%94.m4a,אתה,你 （对男生）,daily,阿塔,,6a3ea657eba303645aaa3d74
beginner,,atem,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%AA%D7%9D.m4a,אתם,你们,daily,阿特姆,,6a3ea657eba303645aaa3d75
beginner,,avoda,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A2%D7%91%D7%95%D7%93%D7%94.m4a,עבודה,工作,work,阿波达,,6a3ea657eba303645aaa3d85
beginner,,ayef,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A2%D7%99%D7%99%D7%A3.m4a,עייף,累 （男的）,daily,阿耶夫,,6a3ea657eba303645aaa3d7b
beginner,,ayefa,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A2%D7%99%D7%99%D7%A4%D7%94.m4a,עייפה,累（女的）,daily,阿耶法,,6a3ea657eba303645aaa3d7c
beginner,,banana,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%A0%D7%A0%D7%94.m4a,בננה,香蕉,food,巴拿拿,,6a3ea657eba303645aaa3db8
beginner,,baruh aba,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%A8%D7%95%D7%9A%20%D7%94%D7%91%D7%90.m4a,ברוך הבא,欢迎,greetings,巴鲁赫 啊巴,,6a3ea657eba303645aaa3d83
beginner,,basa,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%90%D7%A1%D7%94.m4a,באסה,真糟糕 / 扫兴,slang,巴萨,"表示失望或扫兴。例如：错过了公交车，可以说 ""eize ba'asa"" (真扫兴/太糟糕了)。",6a3ea657eba303645aaa3d8c
beginner,,basar,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%A9%D7%A8.m4a,בשר,肉,food,巴萨尔,,6a3ea657eba303645aaa3db3
beginner,,batzal,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%A6%D7%9C.m4a,בצל,洋葱,food,巴察尔,,6a3ea657eba303645aaa3dbc
beginner,,bayit,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%99%D7%AA.m4a,בית,家 / 房子,daily,巴伊特,,6a3ea657eba303645aaa3da0
beginner,,beitsa,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%99%D7%A6%D7%94.m4a,ביצה,鸡蛋,food,贝察,,6a3ea657eba303645aaa3db6
beginner,,Bete a von,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%AA%D7%90%D7%91%D7%95%D7%9F.m4a,בתאבון,祝你胃口好,daily,被忒阿否呢,如果你跟别人一起吃饭，或者看别人吃饭， 一定要对他们说 bete avon,6a3ea3382c1054799d7dbf8b
beginner,,bitu'ah,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%99%D7%98%D7%95%D7%97.m4a,ביטוח,保险,work,比图阿赫,,6a3ea657eba303645aaa3da6
beginner,,boker tov,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%95%D7%A7%D7%A8%20%D7%98%D7%95%D7%91.m4a,בוקר טוב,早上好,greetings,波克 托夫,,6a3ea657eba303645aaa3d93
beginner,,hamesh,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%97%D7%9E%D7%A9.m4a,חמש,五,numbers,哈梅什,,word-hamesh
beginner,,dag,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%93%D7%92.m4a,דג,鱼,food,达格,,6a3ea657eba303645aaa3db5
beginner,,dai,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%93%D7%99.m4a,די,够了,daily,带,,6a3ea3e564a9e1e30880ad7e
beginner,,dira,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%93%D7%99%D7%A8%D7%94.m4a,דירה,公寓,daily,迪拉,,6a3ea657eba303645aaa3da1
beginner,,efes,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%A4%D7%A1.m4a,אפס,零,numbers,埃菲斯,,word-efes
beginner,,ehad,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%97%D7%93.m4a,אחת,一,numbers,欸哈德,,word-ehad
beginner,,eize,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%99%D7%96%D7%94.m4a,איזה,哪个 / 真... (感叹),daily,埃泽,例如：ezeh yofi (真漂亮/太好了)，ezeh ba'asa (真扫兴),6a3ea657eba303645aaa3db0
beginner,,erev tov,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A2%D7%A8%D7%91%20%D7%98%D7%95%D7%91.m4a,ערב טוב,晚上好,greetings,欸类v 托v,这个我不知道好用汉字可以怎么写，因为有很多中文里不存在的声音,6a3ea62731e0fb2fb3278f19
beginner,,eser,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A2%D7%A9%D7%A8.m4a,עשר,十,numbers,埃塞,在以色列，不像在中国可以用单手比划数字（比如6到10），在这里比划大于5的数字需要用双手。,word-eser
beginner,,gam,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%92%D7%9D.m4a,גם,也,daily,嘎m,,6a3ea657eba303645aaa3d7e
beginner,,gam ani,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%92%D7%9D%20%D7%90%D7%A0%D7%99.m4a,גם אני,我也,daily,嘎m 阿尼,,6a3ea657eba303645aaa3d7f
beginner,,gezer,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%92%D7%96%D7%A8.m4a,גזר,胡萝卜,food,盖泽尔,,6a3ea657eba303645aaa3dbb
beginner,,glida,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%92%D7%9C%D7%99%D7%93%D7%94.m4a,גלידה,冰淇淋,food,格丽达,,6a3ea657eba303645aaa3dc8
beginner,,hag same'ah,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%97%D7%92%20%D7%A9%D7%9E%D7%97.m4a,חג שמח,节日快乐,greetings,哈格 萨梅阿赫,,6a3ea657eba303645aaa3d80
beginner,,halas,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%97%D7%9C%D7%90%D7%A1.m4a,חלאס,够了,slang,哈拉斯,哈拉斯这个词稍微生硬一些,6a3ea4456422c7e7fb6df8fe
beginner,,halav,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%97%D7%9C%D7%91.m4a,חלב,牛奶,food,哈拉夫,,6a3ea657eba303645aaa3db2
beginner,,hashmal,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%97%D7%A9%D7%9E%D7%9C.m4a,חשמל,电,daily,哈什玛尔,,6a3ea657eba303645aaa3d9c
beginner,,hofesh,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%97%D7%95%D7%A4%D7%A9.m4a,חופש,假期 / 休息,work,霍费什,,6a3ea657eba303645aaa3dab
beginner,,hole,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%97%D7%95%D7%9C%D7%94.m4a,חולה,生病,health,霍列,,6a3ea657eba303645aaa3d8e
beginner,,kafe,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A7%D7%A4%D7%94.m4a,קפה,咖啡,food,卡费,,6a3ea657eba303645aaa3dc4
beginner,,kama ze ole,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9B%D7%9E%D7%94%20%D7%96%D7%94%20%D7%A2%D7%95%D7%9C%D7%94.m4a,כמה זה עולה,这个多少钱,shopping,卡玛 泽 奥列,,6a3ea657eba303645aaa3d95
beginner,,kanyon,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A7%D7%A0%D7%99%D7%95%D7%9F.m4a,קניון,购物中心,daily,坎永,,6a3ea657eba303645aaa3d91
beginner,,ken,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9B%D7%9F.m4a,כן,是,greetings,肯,,6a3d76bf9ab921c25ea16542
beginner,,kesef,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9B%D7%A1%D7%A3.m4a,כסף,钱,daily,克塞夫,,6a3ea657eba303645aaa3d86
beginner,,kupa,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A7%D7%95%D7%A4%D7%94.m4a,קופה,收银台,shopping,库帕,,6a3ea657eba303645aaa3da4
intermediate,,la'anot,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A2%D7%A0%D7%95%D7%AA.m4a,לענות,回答,verbs,拉阿诺特,,6a3ea657eba303645aaa3dd6
beginner,,la'avod,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A2%D7%91%D7%95%D7%93.m4a,לעבוד,工作,verbs,拉阿沃德,,6a3ea657eba303645aaa3dcc
intermediate,,lada'at,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%93%D7%A2%D7%AA.m4a,לדעת,知道,verbs,拉达阿特,,6a3ea657eba303645aaa3dd8
intermediate,,lahshov,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%97%D7%A9%D7%95%D7%91.m4a,לחשוב,想,verbs,拉赫绍夫,,6a3ea657eba303645aaa3dd7
beginner,,lakum,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A7%D7%95%D7%9D.m4a,לקום,起床,verbs,拉库姆,,6a3ea657eba303645aaa3dcd
beginner,,lalehet,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%9C%D7%9B%D7%AA.m4a,ללכת,走 / 去,verbs,拉列赫特,,6a3ea657eba303645aaa3dcb
beginner,,layla tov,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%99%D7%9C%D7%94%20%D7%98%D7%95%D7%91.m4a,לילה טוב,晚安,greetings,来啦 托 v,英语的 'v' ,6a3ea5aa17b190bd7f48b6ef
beginner,,le'ehol,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%90%D7%9B%D7%95%D7%9C.m4a,לאכול,吃,verbs,莱埃霍尔,,6a3ea657eba303645aaa3dc9
intermediate,,le'agiya,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%94%D7%92%D7%99%D7%A2.m4a,להגיע,到达,verbs,莱哈吉亚,,6a3ea657eba303645aaa3dd9
intermediate,,le'amshih,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%94%D7%9E%D7%A9%D7%99%D7%9A.m4a,להמשיך,继续,verbs,莱哈姆希赫,,6a3ea657eba303645aaa3dd3
intermediate,,le'argish,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%94%D7%A8%D7%92%D7%99%D7%A9.m4a,להרגיש,感觉,verbs,莱哈尔吉什,,6a3ea657eba303645aaa3dd1
intermediate,,le'athil,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%94%D7%AA%D7%97%D7%99%D7%9C.m4a,להתחיל,开始,verbs,莱哈特希尔,,6a3ea657eba303645aaa3dd2
intermediate,,le'avin,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%94%D7%91%D7%99%D7%9F.m4a,להבין,明白 / 理解,verbs,莱哈文,,6a3ea657eba303645aaa3dd0
intermediate,,le'azmin,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%94%D7%96%D7%9E%D7%99%D7%9F.m4a,להזמין,点菜 / 邀请,verbs,莱哈兹明,,6a3ea657eba303645aaa3dd4
beginner,,lehem,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%97%D7%9D.m4a,לחם,面包,food,列赫姆,,6a3ea657eba303645aaa3db1
beginner,,liknot,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A7%D7%A0%D7%95%D7%AA.m4a,לקנות,买,verbs,利克诺特,,6a3ea657eba303645aaa3dce
beginner,,lir'ot,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A8%D7%90%D7%95%D7%AA.m4a,לראות,看,verbs,利尔奥特,,6a3ea657eba303645aaa3dcf
intermediate,,lishol,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A9%D7%90%D7%95%D7%9C.m4a,לשאול,问,verbs,利什奥尔,,6a3ea657eba303645aaa3dd5
beginner,,lishon,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%99%D7%A9%D7%95%D7%9F.m4a,לישון,睡觉,daily,丽顺,,6a3ea657eba303645aaa3d78
beginner,,lishtot,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A9%D7%AA%D7%95%D7%AA.m4a,לשתות,喝,verbs,利什托特,,6a3ea657eba303645aaa3dca
beginner,,lo,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%90.m4a,לא,不,greetings,咯 (lo),,6a3d76bf9ab921c25ea16543
beginner,,ma asha'a,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%94%20%D7%94%D7%A9%D7%A2%D7%94.m4a,מה השעה,几点了,daily,玛 哈沙阿,,6a3ea657eba303645aaa3d92
beginner,,ma'asik,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A2%D7%A1%D7%99%D7%A7.m4a,מעסיק,雇主,work,玛阿西克,,6a3ea657eba303645aaa3da9
beginner,,ma itha,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%94%20%D7%90%D7%99%D7%AA%D7%9A.m4a,מה איתך,你呢,greetings,玛 伊特哈,,6a3ea657eba303645aaa3d81
beginner,,ma kore,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%94%20%D7%A7%D7%95%D7%A8%D7%94.m4a,מה קורה,怎么了 / 最近怎样,greetings,玛 科雷,,6a3ea657eba303645aaa3d94
beginner,,ma nishma,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%94%20%D7%A0%D7%A9%D7%9E%D7%A2.m4a,מה נשמע,你好吗 / 最近怎么样,greetings,玛 尼什玛,,6a3ea657eba303645aaa3d89
beginner,,mahala,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%97%D7%9C%D7%94.m4a,מחלה,疾病 / 病假,health,玛哈拉,,6a3ea657eba303645aaa3dac
beginner,,makolet,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%9B%D7%95%D7%9C%D7%AA.m4a,מכולת,杂货店,shopping,玛科列特,,6a3ea657eba303645aaa3da2
beginner,,marak,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A8%D7%A7.m4a,מרק,汤,food,玛拉克,,6a3ea657eba303645aaa3dbf
beginner,,maskoret,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A9%D7%9B%D7%95%D7%A8%D7%AA.m4a,משכורת,工资,work,玛斯柯列特,,6a3ea657eba303645aaa3daa
beginner,,mayim,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%99%D7%9D.m4a,מים,水,food,蚂蚁么,,6a3d76bf9ab921c25ea16545
beginner,,mazgan,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%96%D7%92%D7%9F.m4a,מזגן,空调,daily,玛兹干,,6a3ea657eba303645aaa3d9b
beginner,,me'od,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%90%D7%95%D7%93.m4a,מאוד,很,daily,梅奥德,,6a3ea657eba303645aaa3d76
beginner,,melafefon,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%9C%D7%A4%D7%A4%D7%95%D7%9F.m4a,מלפפון,黄瓜,food,梅拉费丰,,6a3ea657eba303645aaa3dba
beginner,,mena'el,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A0%D7%94%D7%9C.m4a,מנהל,经理,work,梅纳赫尔,,6a3ea657eba303645aaa3da8
beginner,,mis'ada,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A1%D7%A2%D7%93%D7%94.m4a,מסעדה,餐厅,food,米斯阿达,,6a3ea657eba303645aaa3d9e
beginner,,mishpacha,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A9%D7%A4%D7%97%D7%94.m4a,משפחה,家庭,daily,米什帕哈,,6a3ea657eba303645aaa3d8d
beginner,,mishtara,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A9%D7%98%D7%A8%D7%94.m4a,משטרה,警察,emergency,米什塔拉,,6a3ea657eba303645aaa3da5
beginner,,misrad,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A9%D7%A8%D7%93.m4a,משרד,办公室,work,米斯拉德,,6a3ea657eba303645aaa3da7
beginner,,mits,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%99%D7%A5.m4a,מיץ,果汁,food,米茨,,6a3ea657eba303645aaa3dc6
beginner,,mutar,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%95%D7%AA%D7%A8.m4a,מותר,允许,rules,穆塔尔,,6a3ea657eba303645aaa3dae
beginner,,of,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A2%D7%95%D7%A3.m4a,עוף,鸡肉,food,奥夫,,6a3ea657eba303645aaa3db4
beginner,,ohel,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%95%D7%9B%D7%9C.m4a,אוכל,食物 / 吃,food,奥赫尔,,6a3ea657eba303645aaa3d90
beginner,,olech,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%94%D7%95%D7%9C%D7%9A.m4a,הולך,去 / 走路,daily,霍列赫,,6a3ea657eba303645aaa3d77
beginner,,orez,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%95%D7%A8%D7%96.m4a,אורז,米饭,food,奥雷兹,,6a3ea657eba303645aaa3dbe
beginner,,otobus,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%95%D7%98%D7%95%D7%91%D7%95%D7%A1.m4a,אוטובוס,公交车,transportation,奥托布斯,,6a3ea657eba303645aaa3d99
beginner,,po,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A4%D7%94.m4a,פה,这里,daily,坡,,6a3ea657eba303645aaa3d87
beginner,,pri,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A4%D7%A8%D7%99.m4a,פרי,水果,food,普里,,6a3ea657eba303645aaa3dc2
beginner,,rakevet,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A8%D7%9B%D7%91%D7%AA.m4a,רכבת,火车,transportation,拉凯维特,,6a3ea657eba303645aaa3d9a
beginner,,rehov,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A8%D7%97%D7%95%D7%91.m4a,רחוב,街道,directions,惹霍夫,,6a3ea657eba303645aaa3d9f
beginner,,rofe,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A8%D7%95%D7%A4%D7%90.m4a,רופא,医生,health,罗非,,6a3ea657eba303645aaa3d8f
beginner,,sababa,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A1%D7%91%D7%91%D7%94.m4a,סבבה,好的 / 没问题,slang,萨巴巴,"非常常用的口语，表示同意或感觉不错。例如：别人提议去吃饭，回答 ""sababa"" (好的/没问题)；问你感觉如何，回答 ""sababa"" (挺好的)。",6a3ea657eba303645aaa3d8a
beginner,,sakana,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A1%D7%9B%D7%A0%D7%94.m4a,סכנה,危险,emergency,萨卡纳,,6a3ea657eba303645aaa3daf
beginner,,salat,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A1%D7%9C%D7%98.m4a,סלט,沙拉,food,萨拉特,,6a3ea657eba303645aaa3dc0
beginner,,same'ah,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%9E%D7%97.m4a,שמח,高兴 / 快乐 （男的）,daily,萨梅阿赫,,6a3ea657eba303645aaa3d70
beginner,,shalom,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%9C%D7%95%D7%9D.m4a,שלום,你好 （和平）,greetings,沙罗么,"这个词既可以表示'你好'，也可以表示'再见'，还有'和平'的意思。根据上下文判断。以色列人也会常常说'嗨'。",6a3d76bf9ab921c25ea16540
beginner,,shalosh,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%9C%D7%95%D7%A9.m4a,שלוש,三,numbers,沙洛什,,word-shalosh
beginner,,sham,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%9D.m4a,שם,那里,daily,沙姆,,6a3ea657eba303645aaa3d88
beginner,,shekel,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%A7%D7%9C.m4a,שקל,谢克尔 (货币),money,谢克尔,,6a3ea657eba303645aaa3d9d
beginner,,shesh,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%A9.m4a,שש,六,numbers,谢什,在以色列，比划大于5的数字需要用双手。,word-shesh
beginner,,sheva,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%91%D7%A2.m4a,שבע,七,numbers,谢瓦,在以色列，比划大于5的数字需要用双手。,word-sheva
beginner,,shmonei,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%9E%D7%95%D7%A0%D7%94.m4a,שמונה,八,numbers,什莫内,在以色列，比划大于5的数字需要用双手。,word-shmonei
beginner,,shtayim,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%AA%D7%99%D7%99%D7%9D.m4a,שתיים,二,numbers,什塔伊姆,,word-shtayim
beginner,,shuk,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%95%D7%A7.m4a,שוק,市场,shopping,舒克,,6a3ea657eba303645aaa3da3
beginner,,shum,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%95%D7%9D.m4a,שום,大蒜,food,舒姆,,6a3ea657eba303645aaa3dbd
beginner,,sliha,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A1%D7%9C%D7%99%D7%97%D7%94.m4a,סליחה,对不起 / 不好意思,greetings,斯利哈,"既可以表示'对不起'，也可以用来引起注意。",6a3d76bf9ab921c25ea16544
beginner,,smeha,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%9E%D7%97%D7%94.m4a,שמחה,高兴 / 快乐 （女的）,daily,斯梅哈,,6a3ea657eba303645aaa3d71
beginner,,smola,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%9E%D7%90%D7%9C%D7%94.m4a,שמאלה,左边,directions,斯莫拉,,6a3ea657eba303645aaa3d98
beginner,,tapu'ah,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%AA%D7%A4%D7%95%D7%97.m4a,תפוח,苹果,food,塔普阿赫,,6a3ea657eba303645aaa3db7
beginner,,tapu'ah adama,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%AA%D7%A4%D7%95%D7%97%20%D7%90%D7%93%D7%9E%D7%94.m4a,תפוח אדמה,土豆,food,塔普阿赫 阿达玛,,6a3ea657eba303645aaa3dc1
beginner,,te,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%AA%D7%94.m4a,תה,茶,food,特,,6a3ea657eba303645aaa3dc5
beginner,,teisha,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%AA%D7%A9%D7%A2.m4a,תשע,九,numbers,特沙,在以色列，比划大于5的数字需要用双手。,word-teisha
beginner,,toda,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%AA%D7%95%D7%93%D7%94.m4a,תודה,谢谢,greetings,托达,"多谢" 是 "托达 拉吧" toda raba.,6a3d76bf9ab921c25ea16541
beginner,,tov,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%98%D7%95%D7%91.m4a,טוב,好 / 行,daily,托夫,,6a3ea657eba303645aaa3d6e
beginner,,tsa'o ra yim to vim,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A6%D7%94%D7%A8%D7%99%D7%99%D7%9D%20%D7%98%D7%95%D7%91%D7%99%D7%9D.m4a,צהריים טובים,中午好 / 下午好,greetings,草拉伊么 托vim,这个有点儿难，不过其实很多人就会说"沙罗么",6a3ea546164232c12539930f
beginner,,uga,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A2%D7%95%D7%92%D7%94.m4a,עוגה,蛋糕,food,乌加,,6a3ea657eba303645aaa3dc7
beginner,,yafa,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%99%D7%A4%D7%94.m4a,יפה,漂亮 （女的）,daily,雅法,,6a3ea657eba303645aaa3d84
beginner,,yafe,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%99%D7%A4%D7%94.m4a,יפה,漂亮 （男的） / 很好,daily,雅菲,,6a3ea657eba303645aaa3d82
beginner,,yalla,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%99%D7%90%D7%9C%D7%9C%D7%94.m4a,יאללה,走吧 / 快点,slang,雅拉,"根据语气有多种意思：可以催促 ""nu, yalla!"" (快点，走吧)；可以表示结束 ""yalla, zehu"" (好了，就这样)；也可以道别 ""yalla bye"" (拜拜)。",6a3ea657eba303645aaa3d8b
beginner,,yashar,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%99%D7%A9%D7%A8.m4a,ישר,直走,directions,雅沙尔,,6a3ea657eba303645aaa3d96
beginner,,yemina,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%99%D7%9E%D7%99%D7%A0%D7%94.m4a,ימינה,右边,directions,耶米纳,,6a3ea657eba303645aaa3d97
beginner,,yerek,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%99%D7%A9%D7%A8.m4a,ירק,蔬菜,food,耶雷克,,6a3ea657eba303645aaa3dc3
beginner,,kol hakavod,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9B%D7%9C%20%D7%94%D7%9B%D7%91%D7%95%D7%93.m4a,כל הכבוד,干得好 / 太棒了,slang,科尔 哈卡沃德,,f00000000000000000000001
beginner,,sahtein,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A1%D7%97%D7%AA%D7%99%D7%99%D7%9F.m4a,סחתיין,漂亮 / 干得漂亮,slang,萨赫坦,,f00000000000000000000002
beginner,,super,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A1%D7%95%D7%A4%D7%A8.m4a,סופר,超市,daily,苏佩尔,,f00000000000000000000003
beginner,,bevakasha,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%91%D7%A7%D7%A9%D7%94.m4a,בבקשה,请 / 不客气,greetings,贝瓦卡沙,,f00000000000000000000005
beginner,,ma shlomcha,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%94%20%D7%A9%D7%9C%D7%95%D7%9E%D7%9A.m4a,מה שלומך,你好吗 (对男),greetings,玛 什洛姆哈,,f00000000000000000000006
beginner,,me'ule,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A2%D7%95%D7%9C%D7%94.m4a,מעולה,极好,daily,梅乌列,,f00000000000000000000007
beginner,,beseder,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%A1%D7%93%D7%A8.m4a,בסדר,好的 / 没问题,daily,贝塞德尔,,f00000000000000000000008
beginner,,nachon,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A0%D7%9B%D7%95%D7%9F.m4a,נכון,对的,daily,纳洪,,f00000000000000000000010
beginner,,yofi,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%99%D7%95%D7%A4%D7%99.m4a,יופי,太好了 / 漂亮,daily,约菲,,f00000000000000000000011
beginner,,eifo,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%99%D7%A4%D7%94.m4a,איפה,在哪里,daily,埃佛,,f00000000000000000000012
beginner,,matai,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%AA%D7%99.m4a,מתי,什么时候,daily,玛泰,,f00000000000000000000013
beginner,,lama,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%9E%D7%94.m4a,למה,为什么,daily,拉玛,,f00000000000000000000014
beginner,,eich,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%99%D7%9A.m4a,איך,怎么,daily,埃赫,,f00000000000000000000015
beginner,,mi,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%99.m4a,מי,谁,daily,米,,f00000000000000000000016
beginner,,mah,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%94.m4a,מה,什么,daily,玛,,f00000000000000000000017
beginner,,ahshav,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A2%D7%9B%D7%A9%D7%99%D7%95.m4a,עכשיו,现在,daily,阿赫沙夫,,f00000000000000000000019
beginner,,yom,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%99%D7%95%D7%9D.m4a,יום,天,daily,约姆,,f00000000000000000000020
intermediate,,po'el,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A4%D7%95%D7%A2%D7%9C.m4a,פועל,工人,work,坡埃尔,,f00000000000000000000021
intermediate,,kablan,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A7%D7%91%D7%9C%D7%9F.m4a,קבלן,承包商,work,卡布兰,,f00000000000000000000022
intermediate,,zehirut,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%96%D7%94%D7%99%D7%A8%D7%95%D7%AA.m4a,זהירות,小心,rules,泽希鲁特,,f00000000000000000000024
intermediate,,betihut,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%98%D7%99%D7%97%D7%95%D7%AA.m4a,בטיחות,安全,rules,贝蒂胡特,,f00000000000000000000025
intermediate,,kova,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9B%D7%95%D7%91%D7%A2.m4a,כובע,帽子 (安全帽),work,科瓦,,f00000000000000000000026
intermediate,,keilim,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9B%D7%9C%D7%99%D7%9D.m4a,כלים,工具,work,凯林,,f00000000000000000000029
intermediate,,patish,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A4%D7%98%D7%99%D7%A9.m4a,פטיש,锤子,work,帕蒂什,,f00000000000000000000030
intermediate,,masmer,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A1%D7%9E%D7%A8.m4a,מסמר,钉子,work,玛斯梅尔,,f00000000000000000000031
intermediate,,binyan,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%A0%D7%99%D7%99%D7%9F.m4a,בניין,建筑,work,宾扬,,f00000000000000000000032
intermediate,,atar,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%AA%D7%A8.m4a,אתר,工地,work,阿塔尔,,f00000000000000000000033
intermediate,,hafsaqah,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%94%D7%A4%D7%A1%D7%A7%D7%94.m4a,הפסקה,休息,work,哈夫萨卡,,f00000000000000000000034
intermediate,,mishmeret,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A9%D7%9E%D7%A8%D7%AA.m4a,משמרת,班次,work,米什梅列特,,f00000000000000000000035
intermediate,,beit cholim,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%91%D7%99%D7%AA%20%D7%97%D7%95%D7%9C%D7%99%D7%9D.m4a,בית חולים,医院,health,贝特 霍林,,f00000000000000000000038
intermediate,,mirpa'a,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A8%D7%A4%D7%90%D7%94.m4a,מרפאה,诊所,health,米尔帕阿,,f00000000000000000000039
intermediate,,terufa,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%AA%D7%A8%D7%95%D7%A4%D7%94.m4a,תרופה,药,health,特鲁法,,f00000000000000000000040
intermediate,,ke'ev,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9B%D7%90%D7%91.m4a,כאב,疼痛,health,凯埃夫,,f00000000000000000000041
intermediate,,p'tsi'a,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A4%D7%A6%D7%99%D7%A2%D7%94.m4a,פציעה,受伤,health,普齐阿,,f00000000000000000000042
intermediate,,mada,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%93%D7%90.m4a,מדא,救护车,emergency,玛达,,f00000000000000000000043
intermediate,,esh,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%90%D7%A9.m4a,אש,火,emergency,埃什,,f00000000000000000000044
intermediate,,sheka,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%A9%D7%A7%D7%A2.m4a,שקע,插座,daily,谢卡,,f00000000000000000000045
intermediate,,delet,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%93%D7%9C%D7%AA.m4a,דלת,门,daily,德列特,,f00000000000000000000047
intermediate,,halon,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%97%D7%9C%D7%95%D7%9F.m4a,חלון,窗户,daily,哈隆,,f00000000000000000000048
intermediate,,mafteach,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A4%D7%AA%D7%97.m4a,מפתח,钥匙,daily,玛夫泰阿赫,,f00000000000000000000049
intermediate,,mispar,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9E%D7%A1%D7%A4%D7%A8.m4a,מספר,数字 / 号码,daily,米斯帕尔,,f00000000000000000000050
advanced,,le'argen,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%90%D7%A8%D7%92%D7%9F.m4a,לארגן,组织 / 安排,verbs,莱阿尔根,,f00000000000000000000051
advanced,,letaken,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%AA%D7%A7%D7%9F.m4a,לתקן,修理,verbs,莱塔肯,,f00000000000000000000052
advanced,,livnot,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%91%D7%A0%D7%95%D7%AA.m4a,לבנות,建造,verbs,利夫诺特,,f00000000000000000000053
advanced,,la'asot,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A2%D7%A9%D7%95%D7%AA.m4a,לעשות,做,verbs,拉阿索特,,f00000000000000000000054
advanced,,lehakin,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%94%D7%9B%D7%99%D7%9F.m4a,להכין,准备,verbs,莱哈金,,f00000000000000000000055
advanced,,lishbor,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A9%D7%91%D7%95%D7%A8.m4a,לשבור,打破,verbs,利什波尔,,f00000000000000000000056
advanced,,liftoach,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A4%D7%AA%D7%95%D7%97.m4a,לפתוח,打开,verbs,利夫托阿赫,,f00000000000000000000057
advanced,,lisgor,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A1%D7%92%D7%95%D7%A8.m4a,לסגור,关闭,verbs,利斯戈尔,,f00000000000000000000058
advanced,,lehavi,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%94%D7%91%D7%99%D7%90.m4a,להביא,带来,verbs,莱哈维,,f00000000000000000000059
advanced,,lakachat,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A7%D7%97%D7%AA.m4a,לקחת,拿走,verbs,拉卡哈特,,f00000000000000000000060
advanced,,latet,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%AA%D7%AA.m4a,לתת,给,verbs,拉泰特,,f00000000000000000000061
advanced,,la'azor,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A2%D7%96%D7%95%D7%A8.m4a,לעזור,帮助,verbs,拉阿佐尔,,f00000000000000000000062
advanced,,lishloach,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A9%D7%9C%D7%95%D7%97.m4a,לשלוח,发送 / 派送,verbs,利什洛阿赫,,f00000000000000000000063
advanced,,levashel,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%91%D7%A9%D7%9C.m4a,לבשל,煮饭,verbs,莱瓦谢尔,,f00000000000000000000064
advanced,,lenakot,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A0%D7%A7%D7%95%D7%AA.m4a,לנקות,打扫,verbs,莱纳科特,,f00000000000000000000065
advanced,,lishtof,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A9%D7%98%D7%95%D7%A3.m4a,לשטוף,洗,verbs,利什托夫,,f00000000000000000000066
advanced,,lechakot,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%97%D7%9B%D7%95%D7%AA.m4a,לחכות,等待,verbs,莱哈科特,,f00000000000000000000067
advanced,,lemaher,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%9E%D7%94%D7%A8.m4a,למהר,赶快,verbs,莱玛赫尔,,f00000000000000000000068
advanced,,le'acher,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%90%D7%97%D7%A8.m4a,לאחר,迟到,verbs,莱阿赫尔,,f00000000000000000000069
advanced,,lishkoach,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A9%D7%9B%D7%95%D7%97.m4a,לשכוח,忘记,verbs,利什科阿赫,,f00000000000000000000070
advanced,,lizkor,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%96%D7%9B%D7%95%D7%A8.m4a,לזכור,记得,verbs,利兹科尔,,f00000000000000000000071
advanced,,lehasbir,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%94%D7%A1%D7%91%D7%99%D7%A8.m4a,להסביר,解释,verbs,莱哈斯比尔,,f00000000000000000000072
advanced,,lishmoa,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%A9%D7%9E%D7%95%D7%A2.m4a,לשמוע,听,verbs,利什莫阿,,f00000000000000000000073
advanced,,ledaber,https://github.com/fflushmail/xibo/raw/refs/heads/main/%D7%9C%D7%93%D7%91%D7%A8.m4a,לדבר,说话,verbs,莱达贝尔,,f00000000000000000000074`

function parseVocabulary(): Word[] {
  const result = Papa.parse<string[]>(RAW_CSV, { skipEmptyLines: true })
  const rows = result.data.slice(1) // skip header

  return rows.map((cols, i) => {
    const difficulty = (cols[0]?.trim() || 'beginner') as Word['difficulty']
    const romanized = cols[2]?.trim() || ''
    const audioUrl = cols[3]?.trim() || ''
    const hebrew = cols[4]?.trim() || ''
    const hanzi = cols[5]?.trim() || ''
    const topic = cols[6]?.trim() || 'daily'
    const hanziPhonetic = cols[7]?.trim() || ''
    const explanation = cols[8]?.trim() || ''
    const id = cols[9]?.trim() || `word-${i}`

    return {
      id,
      hebrew,
      romanized,
      hanzi,
      hanziPhonetic,
      topic,
      difficulty,
      audioUrl,
      imageUrl: WORD_IMAGES[romanized] || TOPIC_FALLBACK_IMAGES[topic] || TOPIC_FALLBACK_IMAGES.daily,
      explanation,
    } satisfies Word
  }).filter(w => w.hebrew && w.hanzi)
}

export const VOCABULARY: Word[] = parseVocabulary()

export const TOPICS = [...new Set(VOCABULARY.map(w => w.topic))].sort()

export function getWordsByTopic(topic: string): Word[] {
  return VOCABULARY.filter(w => w.topic === topic)
}

export function getRandomWords(count: number, exclude?: string[]): Word[] {
  const pool = exclude ? VOCABULARY.filter(w => !exclude.includes(w.id)) : [...VOCABULARY]
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
