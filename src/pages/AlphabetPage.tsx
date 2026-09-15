import { useState, useRef, useEffect } from 'react'
import AudioPlayer from '../components/AudioPlayer'
import { stopAllAudio } from '../utils/audioManager'

interface Letter {
  id: string
  letter: string
  name: string
  nameZh: string
  sound: string
  soundZh: string
  romanized: string
  numericalValue: number
  finalForm?: string | null
  finalFormSound?: string
  apostropheForm?: string | null
  apostropheSound?: string
  specialNote?: string
}

const ALPHABET: Letter[] = [
  { id:'alef', letter:'א', name:'Alef', nameZh:'阿列夫', sound:'Silent', soundZh:'无声音（喉塞音），充当元音的载体', romanized:'-', numericalValue:1 },
  { id:'bet', letter:'ב', name:'Bet / Vet', nameZh:'贝特', sound:'B / V', soundZh:'有点 (dagesh) 时读 B；没有点时读 V', romanized:'b / v', numericalValue:2 },
  { id:'gimel', letter:'ג', name:'Gimel', nameZh:'吉梅尔', sound:'G', soundZh:'像英语 "good" 中的 G', romanized:'g', numericalValue:3, apostropheForm:'ג׳', apostropheSound:'J（像 "jungle"）' },
  { id:'dalet', letter:'ד', name:'Dalet', nameZh:'达列特', sound:'D', soundZh:'像英语 "door" 中的 D', romanized:'d', numericalValue:4 },
  { id:'he', letter:'ה', name:'He', nameZh:'黑', sound:'H', soundZh:'像英语 "hello" 中的 H；词尾时通常不发音', romanized:'h', numericalValue:5 },
  { id:'vav', letter:'ו', name:'Vav', nameZh:'瓦夫', sound:'V / U / O', soundZh:'辅音时读 V；作为元音读 U 或 O', romanized:'v / u / o', numericalValue:6 },
  { id:'zayin', letter:'ז', name:'Zayin', nameZh:'扎因', sound:'Z', soundZh:'像英语 "zoo" 中的 Z', romanized:'z', numericalValue:7, apostropheForm:'ז׳', apostropheSound:'Zh（像 "measure" 中的 zh）' },
  { id:'chet', letter:'ח', name:'Chet', nameZh:'黑特', sound:'Ch (摩擦)', soundZh:'喉咙深处的摩擦音，像德语 "Bach"，比中文的 h 更有力', romanized:'ch / h', numericalValue:8 },
  { id:'tet', letter:'ט', name:'Tet', nameZh:'泰特', sound:'T', soundZh:'像英语 "top" 中的 T，现代发音与 ת 相同', romanized:'t', numericalValue:9 },
  { id:'yod', letter:'י', name:'Yod', nameZh:'尤德', sound:'Y / I', soundZh:'辅音时像 "yes" 中的 Y；也作为元音 I/EE 的载体', romanized:'y / i', numericalValue:10 },
  { id:'kaf', letter:'כ', name:'Kaf / Chaf', nameZh:'卡夫', sound:'K / Ch', soundZh:'有点时读 K；没有点时读 Ch（摩擦音，和 ח 同音）', romanized:'k / ch', numericalValue:20, finalForm:'ך', finalFormSound:'词末读 Ch（长尾下伸，摩擦音）' },
  { id:'lamed', letter:'ל', name:'Lamed', nameZh:'拉梅德', sound:'L', soundZh:'像英语 "love" 中的 L', romanized:'l', numericalValue:30 },
  { id:'mem', letter:'מ', name:'Mem', nameZh:'梅姆', sound:'M', soundZh:'像英语 "mom" 中的 M', romanized:'m', numericalValue:40, finalForm:'ם', finalFormSound:'词末形（闭合方框），发音相同 M' },
  { id:'nun', letter:'נ', name:'Nun', nameZh:'农', sound:'N', soundZh:'像英语 "no" 中的 N', romanized:'n', numericalValue:50, finalForm:'ן', finalFormSound:'词末形（长竖垂直向下延伸），发音相同 N' },
  { id:'samech', letter:'ס', name:'Samech', nameZh:'萨梅赫', sound:'S', soundZh:'像英语 "sun" 中的 S，现代和 ש（sin）同音', romanized:'s', numericalValue:60 },
  { id:'ayin', letter:'ע', name:'Ayin', nameZh:'阿因', sound:'（无声/喉音）', soundZh:'古发音是喉咙浊摩擦音；现代大多数人与 א 同音（无声）', romanized:"'", numericalValue:70 },
  { id:'pe', letter:'פ', name:'Pe / Fe', nameZh:'佩', sound:'P / F', soundZh:'有点时读 P；没有点时读 F（像英语 "for"）', romanized:'p / f', numericalValue:80, finalForm:'ף', finalFormSound:'词末形（带长尾垂线），读 F（摩擦音）' },
  { id:'tsadi', letter:'צ', name:'Tsadi', nameZh:'扎迪', sound:'Ts', soundZh:'像英语 "cats" 结尾的 ts 连读', romanized:'ts / tz', numericalValue:90, finalForm:'ץ', finalFormSound:'词末形（手写体为典型向下长垂线），发音相同 Ts', apostropheForm:'צ׳', apostropheSound:"Ch（像 'cheese'）" },
  { id:'kof', letter:'ק', name:'Kof', nameZh:'库夫', sound:'K', soundZh:'像英语 "king" 中的 K，现代发音与 כ（有点）相同', romanized:'k / q', numericalValue:100 },
  { id:'resh', letter:'ר', name:'Resh', nameZh:'雷什', sound:'R', soundZh:'喉咙里滚动的 R，类似法语的 R，不同于英语或中文的 R', romanized:'r', numericalValue:200 },
  { id:'shin', letter:'ש', name:'Shin / Sin', nameZh:'申/辛', sound:'Sh / S', soundZh:'右上点 שׁ 读 Sh（像 "shop"）；左上点 שׂ 读 S（像 "sun"）', romanized:'sh / s', numericalValue:300, specialNote:'同一字母，点的位置决定发音！' },
  { id:'tav', letter:'ת', name:'Tav', nameZh:'塔夫', sound:'T', soundZh:'像英语 "top" 中的 T，现代发音与 ט 相同', romanized:'t', numericalValue:400 },
]

interface VowelInfo {
  name: string
  nameHebrew: string
  nameZh: string
  displayChar: string   // The canonical display glyph on a base letter or Vav
  baseLetterNote: string
  sound: string
  soundZh: string
  exampleWord: string
  exampleWordMeaning: string
  exampleRomanized: string
  isShva?: boolean
  shvaNachWord?: string
  shvaNachMeaning?: string
  shvaNachNote?: string
  shvaNaWord?: string
  shvaNaMeaning?: string
  shvaNaNote?: string
}

const VOWELS: VowelInfo[] = [
  {
    name: 'Shuruk',
    nameHebrew: 'שׁוּרוּק',
    nameZh: '舒鲁克 (וּ)',
    displayChar: 'וּ',
    baseLetterNote: '置于辅音字母 Vav (ו) 上，圆点位于字母正中间',
    sound: 'U（长元音，像 "moon" 中的 "oo"）',
    soundZh: '圆唇长乌音 "呜"。由字母 Vav (ו) 配合中间的圆点构成。',
    exampleWord: 'הוּא',
    exampleWordMeaning: '他 (Hu)',
    exampleRomanized: 'Hu',
  },
  {
    name: 'Cholam Male',
    nameHebrew: 'חוֹלָם מָלֵא',
    nameZh: '全霍拉姆 (וֹ)',
    displayChar: 'וֹ',
    baseLetterNote: '置于辅音字母 Vav (ו) 上，圆点位于字母顶端正上方',
    sound: 'O（长元音，像 "go" 中的 "o"）',
    soundZh: '圆唇长欧音 "喔"。由字母 Vav (ו) 配合顶端的圆点构成。',
    exampleWord: 'שָׁלוֹם',
    exampleWordMeaning: '你好 / 平安 (Shalom)',
    exampleRomanized: 'Shalom',
  },
  {
    name: 'Shva',
    nameHebrew: 'שְׁוָא',
    nameZh: '什瓦 (בְּ / ◌ְ)',
    displayChar: 'בְּ',
    baseLetterNote: '标在辅音字母下方，由上下两颗垂直对齐的圆点组成 (בְּ / ◌ְ)',
    sound: '静音停顿 (Shva Nach) 或 弱元音 e (Shva Na)',
    soundZh: '希伯来语中最特殊的符号，分为两种发音情况：\n• 静音停顿 (Shva Nach)：完全不发元音，仅用于闭合音节或停顿（如 מִכְתָּב Mikhtav 中的 כְ）；\n• 弱元音 e (Shva Na)：出现在部分词首或特定语法位置，发极轻微、短促的 "e" 弱音（如 בְּבַקָּשָׁה Bevakasha 中的 בְ）。',
    exampleWord: 'בְּבַקָּשָׁה',
    exampleWordMeaning: '请 / 不客气 (Bevakasha)',
    exampleRomanized: 'Bevakasha',
    isShva: true,
    shvaNachWord: 'מִכְתָּב',
    shvaNachMeaning: '信件 (Mikhtav)',
    shvaNachNote: 'כְ 为静音停顿 (Shva Nach)，不发元音，闭合音节',
    shvaNaWord: 'בְּבַקָּשָׁה',
    shvaNaMeaning: '请 / 不客气 (Bevakasha)',
    shvaNaNote: 'בְ 为弱元音 (Shva Na)，发极短促的轻弱 e',
  },
  {
    name: 'Kubutz',
    nameHebrew: 'קֻבּוּץ',
    nameZh: '库布茨 (בֻּ / ◌ֻ)',
    displayChar: 'בֻּ',
    baseLetterNote: '标在辅音字母下方，由三颗沿对角线倾斜排列的点组成 (בֻּ / ◌ֻ)',
    sound: 'U（短促，像 "put" 中的 "u"）',
    soundZh: '短元音 "乌"，用于辅音字母下方表示短促的 U 音。',
    exampleWord: 'כֻּלָּם',
    exampleWordMeaning: '所有人 / 大家 (Kulam)',
    exampleRomanized: 'Kulam',
  },
  {
    name: 'Kamatz',
    nameHebrew: 'קָמָץ',
    nameZh: '卡玛茨 (בָּ / ◌ָ)',
    displayChar: 'בָּ',
    baseLetterNote: '标在辅音字母下方，形似微型 "T" 字 (בָּ / ◌ָ)',
    sound: 'A（长元音，像 "father" 中的 ah）',
    soundZh: '开门音 "阿"，嘴型自然张大。',
    exampleWord: 'אַבָּא',
    exampleWordMeaning: '爸爸 (Aba)',
    exampleRomanized: 'Aba',
  },
  {
    name: 'Patach',
    nameHebrew: 'פַּתַח',
    nameZh: '帕塔赫 (בַּ / ◌ַ)',
    displayChar: 'בַּ',
    baseLetterNote: '标在辅音字母下方，为一条短横线 (בַּ / ◌ַ)',
    sound: 'A（短元音，短促有力）',
    soundZh: '短促清脆的 "阿"，像 "cup" 或 "car" 前半。',
    exampleWord: 'יָד',
    exampleWordMeaning: '手 (Yad)',
    exampleRomanized: 'Yad',
  },
  {
    name: 'Tsere',
    nameHebrew: 'צֵירֵי',
    nameZh: '策雷 (בֵּ / ◌ֵ)',
    displayChar: 'בֵּ',
    baseLetterNote: '标在辅音字母下方，由两颗水平并排的点组成 (בֵּ / ◌ֵ)',
    sound: 'EI / E（像 "hey" 中的 ei）',
    soundZh: '类似双元音 "欸"，嘴角向两边微拉。',
    exampleWord: 'כֵּן',
    exampleWordMeaning: '是 / 对 (Ken)',
    exampleRomanized: 'Ken',
  },
  {
    name: 'Segol',
    nameHebrew: 'סֶגוֹל',
    nameZh: '塞戈尔 (בֶּ / ◌ֶ)',
    displayChar: 'בֶּ',
    baseLetterNote: '标在辅音字母下方，由三颗点构成倒三角形 (בֶּ / ◌ֶ)',
    sound: 'E（短元音，像 "bed" 中的 e）',
    soundZh: '短促的 "诶"，常见于词中音节。',
    exampleWord: 'כֶּלֶב',
    exampleWordMeaning: '狗 (Kelev)',
    exampleRomanized: 'Kelev',
  },
  {
    name: 'Chirik',
    nameHebrew: 'חִירִיק',
    nameZh: '希里克 (בִּ / ◌ִ)',
    displayChar: 'בִּ',
    baseLetterNote: '标在辅音字母正下方，为单颗圆点 (בִּ / ◌ִ)',
    sound: 'I（像 "see" 中的 ee）',
    soundZh: '高前元音 "衣"，有时后接 Yod 构成长音。',
    exampleWord: 'אִמָּא',
    exampleWordMeaning: '妈妈 (Ima)',
    exampleRomanized: 'Ima',
  },
]

// Detailed mapping for the 5 Sofit (final) letters with authentic Ktav Yad notes
const FINAL_LETTERS_DATA = [
  {
    normal: 'כ',
    normalName: 'Kaf / Chaf',
    final: 'ך',
    finalName: 'Final Chaf (Chaf Sofit)',
    nameZh: '卡夫 (Kaf)',
    sound: 'Ch (清软腭摩擦音)',
    cursiveScriptNote: '末尾手写体：起笔向下画直长下延线，低于基准线',
  },
  {
    normal: 'מ',
    normalName: 'Mem',
    final: 'ם',
    finalName: 'Final Mem (Mem Sofit)',
    nameZh: '梅姆 (Mem)',
    sound: 'M (双唇鼻音)',
    cursiveScriptNote: '末尾手写体：完整的闭合圆环或微方圆环，立于基准线上',
  },
  {
    normal: 'נ',
    normalName: 'Nun',
    final: 'ן',
    finalName: 'Final Nun (Nun Sofit)',
    nameZh: '农 (Nun)',
    sound: 'N (齿龈鼻音)',
    cursiveScriptNote: '末尾手写体：垂直向下的一道长直垂线，明显探出基准线下方',
  },
  {
    normal: 'פ',
    normalName: 'Pe / Fe',
    final: 'ף',
    finalName: 'Final Fe (Fe Sofit)',
    nameZh: '佩 (Pe/Fe)',
    sound: 'F (唇齿摩擦音)',
    cursiveScriptNote: '末尾手写体：顶部圆弯连接向下倾泻垂下的长直线',
  },
  {
    normal: 'צ',
    normalName: 'Tsadi',
    final: 'ץ',
    finalName: 'Final Tsadi (Tsadi Sofit)',
    nameZh: '扎迪 (Tsadi)',
    sound: 'Ts (清齿龈塞擦音)',
    cursiveScriptNote: '末尾手写体：经典行草长垂笔！起笔在顶部，向右下弯转后直贯而下，深深下延过基准线',
    isSpecialTsadi: true,
  },
]

export default function AlphabetPage() {
  const [selected, setSelected] = useState<Letter | null>(null)
  const [showVowels, setShowVowels] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      stopAllAudio()
    }
  }, [])

  // Auto-scroll to detail panel when a letter is selected
  useEffect(() => {
    if (selected && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }, [selected])

  const handleLetterClick = (l: Letter) => {
    stopAllAudio()
    setSelected(prev => prev?.id === l.id ? null : l)
  }

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 page-header safe-top">
        <h1 className="chinese text-white font-black text-2xl">📖 希伯来字母与发音</h1>
        <p className="chinese text-white/70 text-sm mt-1">Hebrew Alphabet & Nikud · האלפבית והניקוד</p>
        <p className="hebrew text-white/50 text-base mt-1 text-right">א ב ג ד ה ו ז ח ט י כ ל מ נ ס ע פ צ ק ר ש ת</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Intro */}
        <div className="px-5 pt-4 pb-2">
          <div className="glass-card p-4 mb-3">
            <p className="chinese text-gray-700 text-sm leading-relaxed">
              💡 <strong>希伯来语从右往左阅读与书写！</strong>共 <strong>22 个辅音字母</strong>。
              其中 5 个字母在词尾有特殊的<strong>末尾形 (Sofit)</strong>。在以色列日常生活中，<strong>印刷体</strong>用于报刊标语，<strong>手写体 (Ktav Yad)</strong> 用于日常书写。
            </p>
          </div>

          {/* Tab toggle */}
          <div className="bg-gray-200/80 rounded-2xl p-1 flex mb-3">
            {[false, true].map(v => (
              <button
                key={String(v)}
                onClick={() => {
                  stopAllAudio()
                  setShowVowels(v)
                  setSelected(null)
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm chinese font-bold transition-all ${
                  showVowels === v ? 'bg-white text-deep-blue shadow-md' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v ? '🔤 元音符号 (Nikud)' : '🔡 字母表与末尾形'}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONSONANT LETTERS & SOFIT GRID ── */}
        {!showVowels && (
          <div className="px-5 pb-6">
            <p className="chinese text-gray-500 text-xs mb-2.5">点击字母查看详情、印刷体与手写体对比 ↓</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {ALPHABET.map(l => (
                <button
                  key={l.id}
                  onClick={() => handleLetterClick(l)}
                  className={`rounded-2xl p-2.5 flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${
                    selected?.id === l.id
                      ? 'bg-deep-blue text-white shadow-lg ring-2 ring-gold'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 hover:border-sky-blue/50'
                  }`}
                >
                  <span className="hebrew text-3xl font-black leading-none">{l.letter}</span>
                  <span className="chinese text-[10px] opacity-80">{l.nameZh}</span>
                  {l.finalForm && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full leading-tight font-medium ${
                      selected?.id === l.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      末尾 {l.finalForm}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Detail Panel ── */}
            {selected && (
              <div ref={detailRef} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6 animate-fade-in">
                {/* Detail Header Banner */}
                <div className="bg-gradient-to-r from-deep-blue to-sky-blue p-5 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white/70 text-xs">Gematria 数值：{selected.numericalValue}</p>
                      <p className="font-black text-2xl leading-tight mt-0.5">{selected.name}</p>
                      <p className="chinese text-gold text-lg font-bold">{selected.nameZh}</p>
                    </div>

                    {/* Standard Letter Print vs Cursive */}
                    <div className="flex items-end gap-3 bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm">
                      <div className="text-center">
                        <span className="hebrew text-4xl font-black block leading-none">{selected.letter}</span>
                        <p className="text-[10px] text-white/70 mt-1 chinese">印刷体</p>
                      </div>
                      <div className="text-center">
                        <span className="hebrew-handwriting text-5xl text-gold block leading-none" style={{ fontSize: '2.8rem' }}>
                          {selected.letter}
                        </span>
                        <p className="text-[10px] text-white/70 mt-1 chinese">手写体</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Pronunciation Badges */}
                  <div className="flex gap-2">
                    <div className="bg-sky-blue/10 rounded-xl px-3 py-2 flex-1">
                      <p className="text-[10px] text-sky-blue chinese mb-0.5">发音 Sound</p>
                      <p className="font-bold text-deep-blue text-sm">{selected.sound}</p>
                    </div>
                    <div className="bg-gold/10 rounded-xl px-3 py-2 flex-1">
                      <p className="text-[10px] text-gold chinese mb-0.5">罗马注音 Romanized</p>
                      <p className="font-bold text-gray-700 text-sm">{selected.romanized}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                    <p className="text-xs text-gray-500 chinese font-bold mb-1">📖 发音要领</p>
                    <p className="chinese text-gray-700 text-sm leading-relaxed">{selected.soundZh}</p>
                  </div>

                  {/* Standard vs Cursive Comparison Cards */}
                  <div>
                    <p className="chinese text-gray-600 font-bold text-xs mb-2">✍️ 字体对比 (Print vs Cursive)</p>
                    <div className={`grid ${selected.finalForm ? 'grid-cols-2 gap-2.5' : 'grid-cols-2 gap-3'}`}>
                      <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-center">
                        <span className="hebrew text-5xl font-black text-deep-blue block">{selected.letter}</span>
                        <p className="chinese text-gray-500 text-xs mt-1.5 font-semibold">常规印刷体</p>
                        <p className="text-gray-400 text-[10px]">Standard Block</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/70 rounded-2xl p-3 text-center">
                        <span className="hebrew-handwriting text-deep-blue block" style={{ fontSize: '3.2rem' }}>
                          {selected.letter}
                        </span>
                        <p className="chinese text-amber-800 text-xs mt-1.5 font-bold">常规手写体</p>
                        <p className="text-amber-600 text-[10px]">Ktav Yad</p>
                      </div>

                      {/* If this letter has a final form, show both print and cursive final versions */}
                      {selected.finalForm && (
                        <>
                          <div className="bg-white border-2 border-gold/40 rounded-2xl p-3 text-center">
                            <span className="hebrew text-5xl font-black text-gold block">{selected.finalForm}</span>
                            <p className="chinese text-gray-600 text-xs mt-1.5 font-bold">词尾印刷体 (Sofit)</p>
                            <p className="text-gray-400 text-[10px]">Final Block Form</p>
                          </div>
                          <div className="bg-gradient-to-br from-gold/10 to-amber-100 border-2 border-gold rounded-2xl p-3 text-center shadow-sm">
                            <span className="hebrew-handwriting text-deep-blue block" style={{ fontSize: '3.4rem' }}>
                              {selected.finalForm}
                            </span>
                            <p className="chinese text-deep-blue text-xs mt-1.5 font-black">词尾手写体 (Ktav Yad)</p>
                            <p className="text-amber-700 text-[10px]">Final Cursive Script</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Special final form notes if applicable */}
                  {selected.finalForm && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                      <p className="chinese text-amber-800 font-bold text-xs mb-1">✋ 词尾变体规则：</p>
                      <p className="chinese text-amber-700 text-xs leading-relaxed">
                        当该字母位于单词末尾时，必须转换为词尾形：印刷体 <strong>{selected.finalForm}</strong>，
                        手写体呈现流畅的行草笔画 <strong>{selected.finalForm}</strong>。{selected.finalFormSound}
                      </p>
                    </div>
                  )}

                  {/* Close button */}
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm chinese hover:bg-gray-200 transition-colors font-semibold"
                  >
                    ✕ 收起详情
                  </button>
                </div>
              </div>
            )}

            {/* ── 5 SOFIT FINAL LETTERS COMPREHENSIVE CARD ── */}
            <div className="glass-card p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="chinese font-black text-deep-blue text-base">✋ 5 个词尾形字母 (אותיות סופיות)</p>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full chinese">
                  印刷体 + 行草手写体
                </span>
              </div>
              <p className="chinese text-gray-600 text-xs leading-relaxed mb-3">
                这 5 个字母在词尾时形态会改变，手写体（Ktav Yad）尤其独具特色：
              </p>

              <div className="space-y-3">
                {FINAL_LETTERS_DATA.map(item => (
                  <div
                    key={item.final}
                    className={`bg-white rounded-2xl p-3.5 shadow-sm border ${
                      item.isSpecialTsadi ? 'border-amber-300 ring-2 ring-amber-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="chinese font-bold text-gray-800 text-sm">{item.nameZh}</span>
                          <span className="text-xs text-gray-400">({item.normalName})</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 chinese">发音：{item.sound}</p>
                      </div>

                      {item.isSpecialTsadi && (
                        <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full chinese font-bold">
                          重点关注 ץ
                        </span>
                      )}
                    </div>

                    {/* 4 glyph side-by-side comparison */}
                    <div className="grid grid-cols-4 gap-2 text-center items-center">
                      <div className="bg-gray-50 rounded-xl p-2">
                        <span className="hebrew text-2xl font-black text-gray-700 block leading-none">{item.normal}</span>
                        <p className="chinese text-[10px] text-gray-400 mt-1">常规印刷</p>
                      </div>

                      <div className="bg-amber-50/70 rounded-xl p-2">
                        <span className="hebrew-handwriting text-3xl text-gray-700 block leading-none">{item.normal}</span>
                        <p className="chinese text-[10px] text-amber-700 mt-1">常规手写</p>
                      </div>

                      <div className="bg-gold/10 rounded-xl p-2">
                        <span className="hebrew text-2xl font-black text-deep-blue block leading-none">{item.final}</span>
                        <p className="chinese text-[10px] text-deep-blue font-bold mt-1">词尾印刷</p>
                      </div>

                      <div className="bg-amber-100 rounded-xl p-2 shadow-inner">
                        <span className="hebrew-handwriting text-3xl text-deep-blue block leading-none" style={{ fontSize: '2rem' }}>
                          {item.final}
                        </span>
                        <p className="chinese text-[10px] text-amber-900 font-black mt-1">词尾手写 ✍️</p>
                      </div>
                    </div>

                    {/* Authentic cursive description */}
                    <div className="mt-2.5 bg-gray-50 rounded-xl px-3 py-1.5 text-left">
                      <p className="chinese text-xs text-gray-600 leading-normal">
                        ✍️ <span className="font-semibold text-gray-700">笔画特征：</span>{item.cursiveScriptNote}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Learning Tips */}
            <div className="glass-card p-4 mb-2">
              <p className="chinese font-bold text-gray-800 text-sm mb-2.5">💡 希伯来语书写速成小技巧</p>
              <div className="space-y-1.5">
                {[
                  '希伯来文从右向左书写，手写字母彼此独立不连写',
                  '5 个词尾字母（ך, ם, ן, ף, ץ）中，除 ם 为闭合方框外，其余 4 个手写体的尾笔都向下贯通延伸低于基准线',
                  '词尾 Tsadi (ץ) 的手写体长垂线非常突出，在以色列手写菜单、收据和路标中极为常见',
                  '字母 ב，כ，פ 在词首常带点读爆破音 (B, K, P)，无点时读擦音 (V, Ch, F)',
                ].map((tip, i) => (
                  <p key={i} className="chinese text-gray-600 text-xs flex gap-2 items-start leading-relaxed">
                    <span className="text-gold font-bold flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NIKUD VOWELS SECTION (Refined) ── */}
        {showVowels && (
          <div className="px-5 pb-6">
            <div className="glass-card p-4 mb-3 border-l-4 border-l-sky-blue">
              <p className="chinese text-gray-800 text-sm font-bold mb-1">
                希伯来语元音符号规则说明
              </p>
              <p className="chinese text-gray-600 text-xs leading-relaxed">
                现代希伯来语报纸、手机和街头招牌通常<strong>不标写元音符号</strong>（无点文本 Ktiv Chaser），
                元音符号（Nikud）主要用于初学教学、字典及儿童读物。<br />
                <strong>字母 Vav 构成的元音：</strong>元音 <strong>Shuruk (וּ)</strong> 和 <strong>Cholam Male (וֹ)</strong> 直接标记在辅音字母 <strong>Vav (ו)</strong> 上，点分别置于 Vav 的中间与顶端。
              </p>
            </div>

            <div className="space-y-3">
              {VOWELS.map(v => (
                <div key={v.name} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3.5">
                    {/* Large Vowel Display Box */}
                    <div className="w-16 h-16 bg-gradient-to-br from-deep-blue to-sky-blue rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="hebrew text-4xl text-white font-black leading-none drop-shadow">
                        {v.displayChar}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-deep-blue text-base">{v.name}</span>
                          <span className="hebrew text-sm text-gray-400 font-bold">{v.nameHebrew}</span>
                        </div>
                        <span className="chinese text-gold font-bold text-xs flex-shrink-0">{v.nameZh}</span>
                      </div>

                      <p className="chinese text-[11px] text-sky-blue font-semibold mb-1">{v.baseLetterNote}</p>
                      <p className="chinese text-gray-600 text-xs leading-relaxed whitespace-pre-line">{v.soundZh}</p>
                    </div>
                  </div>

                  {/* If this is Shva, show the two distinct sub-categories clearly: Shva Nach vs Shva Na */}
                  {v.isShva ? (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-[11px] text-gray-500 chinese font-bold">📖 两种不同用法示例对照：</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Shva Nach */}
                        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-amber-800 chinese">静音停顿 (Shva Nach)</span>
                            <span className="hebrew text-lg font-black text-deep-blue">{v.shvaNachWord}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 chinese">{v.shvaNachMeaning}</p>
                          <p className="text-[10px] text-amber-700 mt-0.5 chinese">{v.shvaNachNote}</p>
                        </div>

                        {/* Shva Na */}
                        <div className="bg-sky-50/70 border border-sky-200/60 rounded-xl p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-sky-800 chinese">弱元音 e (Shva Na)</span>
                            <span className="hebrew text-lg font-black text-deep-blue">{v.shvaNaWord}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 chinese">{v.shvaNaMeaning}</p>
                          <p className="text-[10px] text-sky-700 mt-0.5 chinese">{v.shvaNaNote}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Standard Example Word Display (clean text without standalone audio button) */
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between bg-sand/60 rounded-xl px-3.5 py-2.5">
                      <div>
                        <span className="text-[10px] text-gray-400 chinese block">实用词例 Example</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="hebrew text-xl font-black text-gray-800">{v.exampleWord}</span>
                          <span className="chinese text-xs text-gray-600">({v.exampleWordMeaning})</span>
                        </div>
                      </div>
                      <span className="text-xs text-deep-blue/80 font-mono bg-white px-2.5 py-1 rounded-md border border-gray-200">
                        /{v.exampleRomanized}/
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="glass-card p-4 mt-4 bg-sky-50/70 border border-sky-100">
              <p className="chinese font-bold text-deep-blue text-xs mb-1">
                📌 学习总结与母语者发音规律：
              </p>
              <ul className="chinese text-gray-600 text-xs space-y-1.5 list-disc list-inside leading-relaxed">
                <li><strong>Kamatz (בָּ / ◌ָ) 与 Patach (בַּ / ◌ַ)</strong>：现代希伯来语发音一致，均发 "A" 开口音。</li>
                <li><strong>Tsere (בֵּ / ◌ֵ) 与 Segol (בֶּ / ◌ֶ)</strong>：现代希伯来语发音一致，均发 "E" 音。</li>
                <li><strong>Shuruk (וּ) 与 Kubutz (בֻּ / ◌ֻ)</strong>：均发 "U" 音，Shuruk 置于字母 Vav (ו) 上，Kubutz 为斜排三点。</li>
                <li><strong>Shva (בְּ / ◌ְ)</strong>：词中闭音节为静音停顿 (Shva Nach)，词首等位置为短促轻弱 e (Shva Na)。</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
