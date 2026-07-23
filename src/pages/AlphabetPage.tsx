import { useState, useRef, useEffect } from 'react'

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
  { id:'kaf', letter:'כ', name:'Kaf / Chaf', nameZh:'卡夫', sound:'K / Ch', soundZh:'有点时读 K；没有点时读 Ch（摩擦音，和 ח 同音）', romanized:'k / ch', numericalValue:20, finalForm:'ך', finalFormSound:'词末读 Ch（摩擦音）' },
  { id:'lamed', letter:'ל', name:'Lamed', nameZh:'拉梅德', sound:'L', soundZh:'像英语 "love" 中的 L', romanized:'l', numericalValue:30 },
  { id:'mem', letter:'מ', name:'Mem', nameZh:'梅姆', sound:'M', soundZh:'像英语 "mom" 中的 M', romanized:'m', numericalValue:40, finalForm:'ם', finalFormSound:'词末形，发音相同' },
  { id:'nun', letter:'נ', name:'Nun', nameZh:'农', sound:'N', soundZh:'像英语 "no" 中的 N', romanized:'n', numericalValue:50, finalForm:'ן', finalFormSound:'词末形，发音相同' },
  { id:'samech', letter:'ס', name:'Samech', nameZh:'萨梅赫', sound:'S', soundZh:'像英语 "sun" 中的 S，现代和 ש（sin）同音', romanized:'s', numericalValue:60 },
  { id:'ayin', letter:'ע', name:'Ayin', nameZh:'阿因', sound:'（无声/喉音）', soundZh:'古发音是喉咙浊摩擦音；现代大多数人与 א 同音（无声）', romanized:"'", numericalValue:70 },
  { id:'pe', letter:'פ', name:'Pe / Fe', nameZh:'佩', sound:'P / F', soundZh:'有点时读 P；没有点时读 F（像英语 "for"）', romanized:'p / f', numericalValue:80, finalForm:'ף', finalFormSound:'词末形，读 F（摩擦音）' },
  { id:'tsadi', letter:'צ', name:'Tsadi', nameZh:'扎迪', sound:'Ts', soundZh:'像英语 "cats" 结尾的 ts 连读', romanized:'ts / tz', numericalValue:90, finalForm:'ץ', finalFormSound:'词末形，发音相同', apostropheForm:'צ׳', apostropheSound:"Ch（像 'cheese'）" },
  { id:'kof', letter:'ק', name:'Kof', nameZh:'库夫', sound:'K', soundZh:'像英语 "king" 中的 K，现代发音与 כ（有点）相同', romanized:'k / q', numericalValue:100 },
  { id:'resh', letter:'ר', name:'Resh', nameZh:'雷什', sound:'R', soundZh:'喉咙里滚动的 R，类似法语的 R，不同于英语或中文的 R', romanized:'r', numericalValue:200 },
  { id:'shin', letter:'ש', name:'Shin / Sin', nameZh:'申/辛', sound:'Sh / S', soundZh:'右上点 שׁ 读 Sh（像 "shop"）；左上点 שׂ 读 S（像 "sun"）', romanized:'sh / s', numericalValue:300, specialNote:'同一字母，点的位置决定发音！' },
  { id:'tav', letter:'ת', name:'Tav', nameZh:'塔夫', sound:'T', soundZh:'像英语 "top" 中的 T，现代发音与 ט 相同', romanized:'t', numericalValue:400 },
]

const VOWELS = [
  { symbol: 'ָ',  name:'Kamatz',  nameZh:'卡玛茨', sound:'A（像 "father" 中的 ah）' },
  { symbol: 'ַ',  name:'Patach',  nameZh:'帕塔赫', sound:'A（短促）' },
  { symbol: 'ֵ',  name:'Tsere',   nameZh:'策雷',   sound:'EI/E（像 "hey" 中的 ei）' },
  { symbol: 'ִ',  name:'Chirik',  nameZh:'希里克', sound:'I（像 "see" 中的 ee）' },
  { symbol: 'ֹ',  name:'Cholam',  nameZh:'霍拉姆', sound:'O（像 "go" 中的 o）' },
  { symbol: 'ּו', name:'Shuruk',  nameZh:'舒鲁克', sound:'U（像 "moon" 中的 oo）' },
  { symbol: 'ֶ',  name:'Segol',   nameZh:'塞戈尔', sound:'E（像 "bed" 中的 e）' },
]

export default function AlphabetPage() {
  const [selected, setSelected] = useState<Letter | null>(null)
  const [showVowels, setShowVowels] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to detail panel when a letter is selected
  useEffect(() => {
    if (selected && detailRef.current) {
      // Small delay so the panel has time to render first
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }, [selected])

  const handleLetterClick = (l: Letter) => {
    setSelected(prev => prev?.id === l.id ? null : l)
  }

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 pt-12 pb-6 safe-top">
        <h1 className="chinese text-white font-black text-2xl">📖 希伯来字母表</h1>
        <p className="chinese text-white/70 text-sm mt-1">Hebrew Alphabet · האלפבית העברי</p>
        <p className="hebrew text-white/50 text-lg mt-1 text-right">א ב ג ד ה ו ז ח ט י</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Intro */}
        <div className="px-5 pt-5 pb-3">
          <div className="glass-card p-4 mb-4">
            <p className="chinese text-gray-700 text-sm leading-relaxed">
              💡 <strong>重要：</strong>希伯来语从<strong>右往左</strong>读写！共 <strong>22 个字母</strong>，全部是辅音。
              5 个字母在词尾有特殊写法（<strong>末尾形</strong>）。点击字母看详情。
            </p>
          </div>

          {/* Tab toggle */}
          <div className="bg-gray-100 rounded-2xl p-1 flex mb-4">
            {[false, true].map(v => (
              <button key={String(v)} onClick={() => { setShowVowels(v); setSelected(null) }}
                className={`flex-1 py-2 rounded-xl text-sm chinese font-semibold transition-all ${
                  showVowels === v ? 'bg-white text-deep-blue shadow-md' : 'text-gray-500'
                }`}>
                {v ? '🔤 元音符号' : '🔡 辅音字母'}
              </button>
            ))}
          </div>
        </div>

        {/* LETTERS GRID */}
        {!showVowels && (
          <div className="px-5 pb-6">
            <p className="chinese text-gray-500 text-xs mb-3">点击字母查看详情 ↓</p>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {ALPHABET.map(l => (
                <button
                  key={l.id}
                  onClick={() => handleLetterClick(l)}
                  className={`rounded-2xl p-3 flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${
                    selected?.id === l.id
                      ? 'bg-deep-blue text-white shadow-lg ring-2 ring-gold'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 hover:border-sky-blue/50'
                  }`}
                >
                  <span className="hebrew text-3xl font-black leading-none">{l.letter}</span>
                  <span className="chinese text-[10px] opacity-70">{l.nameZh}</span>
                  {l.finalForm && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full leading-tight ${
                      selected?.id === l.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>有末尾形</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Detail panel (auto-scrolled into view) ── */}
            {selected && (
              <div ref={detailRef} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mt-4 mb-4">
                {/* Detail header */}
                <div className="bg-gradient-to-r from-deep-blue to-sky-blue p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="chinese text-white/60 text-xs mb-1">数字值：{selected.numericalValue}</p>
                      <p className="font-bold text-white text-xl leading-tight">{selected.name}</p>
                      <p className="chinese text-gold text-lg">{selected.nameZh}</p>
                    </div>

                    {/* Two font displays side by side */}
                    <div className="flex gap-4 items-end">
                      <div className="text-center">
                        <span className="hebrew text-6xl font-black text-white leading-none block drop-shadow-lg">
                          {selected.letter}
                        </span>
                        <p className="text-white/50 text-[9px] mt-1 chinese">印刷体</p>
                      </div>
                      {/* Handwriting font (Dana Yad) */}
                      <div className="text-center">
                        <span className="hebrew-handwriting text-6xl text-gold/90 leading-none block drop-shadow-lg"
                          style={{ fontSize: '3.5rem' }}>
                          {selected.letter}
                        </span>
                        <p className="text-white/50 text-[9px] mt-1 chinese">手写体</p>
                      </div>
                      {selected.finalForm && (
                        <div className="text-center">
                          <span className="hebrew text-5xl font-black text-gold/80 leading-none block drop-shadow-lg">
                            {selected.finalForm}
                          </span>
                          <p className="text-white/50 text-[9px] mt-1 chinese">词尾形</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {/* Sound info */}
                  <div className="flex gap-2 flex-wrap">
                    <div className="bg-sky-blue/10 rounded-xl px-3 py-2 flex-1 min-w-0">
                      <p className="text-[10px] text-sky-blue chinese mb-1">发音</p>
                      <p className="font-bold text-deep-blue text-sm">{selected.sound}</p>
                    </div>
                    <div className="bg-gold/10 rounded-xl px-3 py-2 flex-1 min-w-0">
                      <p className="text-[10px] text-gold chinese mb-1">罗马化</p>
                      <p className="font-bold text-gray-700 text-sm">{selected.romanized}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3">
                    <p className="text-[10px] text-gray-400 chinese mb-1">📖 发音说明</p>
                    <p className="chinese text-gray-700 text-sm leading-relaxed">{selected.soundZh}</p>
                  </div>

                  {/* Font comparison */}
                  <div>
                    <p className="chinese text-gray-400 text-xs mb-2">字体对比：印刷体 vs 手写体</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
                        <span className="hebrew text-6xl font-black text-deep-blue leading-none block">
                          {selected.letter}
                        </span>
                        <p className="chinese text-gray-400 text-[10px] mt-2">印刷 / 打字体</p>
                        <p className="text-gray-300 text-[9px]">Frank Ruhl Libre</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-100 rounded-2xl p-4 text-center">
                        <span className="hebrew-handwriting text-deep-blue leading-none block"
                          style={{ fontSize: '3.5rem' }}>
                          {selected.letter}
                        </span>
                        <p className="chinese text-gray-500 text-[10px] mt-2">手写体</p>
                        <p className="text-amber-400 text-[9px]">Dana Yad ✍️</p>
                      </div>
                    </div>
                  </div>

                  {/* Final form */}
                  {selected.finalForm && (
                    <div className="bg-amber-50 rounded-2xl p-3">
                      <div className="flex items-center gap-3">
                        <span className="hebrew text-4xl text-amber-700 font-black leading-none">{selected.finalForm}</span>
                        <div>
                          <p className="chinese text-amber-700 font-semibold text-sm">末尾形（Sofit）</p>
                          <p className="chinese text-amber-600 text-xs">{selected.finalFormSound || '这个字母出现在词语末尾时，写成此形式'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Apostrophe variant */}
                  {selected.apostropheForm && (
                    <div className="bg-purple-50 rounded-2xl p-3">
                      <div className="flex items-center gap-3">
                        <span className="hebrew text-4xl text-purple-700 font-black leading-none">{selected.apostropheForm}</span>
                        <div>
                          <p className="chinese text-purple-700 font-semibold text-sm">撇号变体（Geresh）</p>
                          <p className="chinese text-purple-600 text-xs">{selected.apostropheSound}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special note */}
                  {selected.specialNote && (
                    <div className="bg-red-50 rounded-2xl p-3">
                      <p className="chinese text-red-600 text-sm">⚠️ {selected.specialNote}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setSelected(null)}
                    className="w-full py-2 rounded-xl text-gray-400 text-sm chinese hover:text-gray-600 transition-colors"
                  >
                    ✕ 关闭详情
                  </button>
                </div>
              </div>
            )}

            {/* Final forms quick reference */}
            <div className="glass-card p-4 mb-4">
              <p className="chinese font-bold text-gray-700 mb-3">✋ 5个末尾形字母</p>
              <p className="chinese text-gray-500 text-xs mb-3">这些字母出现在单词末尾时，形状会改变：</p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { normal:'כ', final:'ך', name:'卡夫' },
                  { normal:'מ', final:'ם', name:'梅姆' },
                  { normal:'נ', final:'ן', name:'农' },
                  { normal:'פ', final:'ף', name:'佩' },
                  { normal:'צ', final:'ץ', name:'扎迪' },
                ].map(({ normal, final, name }) => (
                  <div key={name} className="text-center bg-white rounded-2xl p-2 shadow-sm">
                    <div className="flex justify-center items-center gap-1">
                      <span className="hebrew text-2xl text-gray-700">{normal}</span>
                      <span className="text-gray-300 text-xs">→</span>
                      <span className="hebrew text-2xl text-gold">{final}</span>
                    </div>
                    <p className="chinese text-gray-500 text-[10px] mt-1">{name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="glass-card p-4 mb-2">
              <p className="chinese font-bold text-gray-700 mb-3">💡 学习小贴士</p>
              <div className="space-y-2">
                {[
                  '希伯来语从右向左书写和阅读',
                  '5个字母在词尾时形状改变（末尾形 Sofit）',
                  '现代以色列人书写时通常不写元音点',
                  'ח 和 כ（无点）发音相同；ט 和 ת 发音相同',
                  '字母 ב，כ，פ 各有两个发音（有点/无点）',
                  '每个字母都有数字值（用于犹太神秘学 Gematria）',
                ].map((tip, i) => (
                  <p key={i} className="chinese text-gray-600 text-sm flex gap-2">
                    <span className="text-gold flex-shrink-0">•</span>{tip}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VOWELS SECTION */}
        {showVowels && (
          <div className="px-5 pb-6">
            <div className="glass-card p-4 mb-4">
              <p className="chinese text-gray-600 text-sm leading-relaxed">
                希伯来语的元音用<strong>点和线</strong>（Nikud 尼库德）标在字母上方、下方或中间。
                现代日常书写通常<strong>不写这些符号</strong>，依靠上下文推断。
                儿童读物和学习材料会标注。
              </p>
            </div>

            <div className="space-y-3">
              {VOWELS.map(v => (
                <div key={v.name} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-deep-blue to-sky-blue rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="hebrew text-3xl text-white font-black">א{v.symbol}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-deep-blue">{v.name}</span>
                      <span className="chinese text-gold text-sm">{v.nameZh}</span>
                    </div>
                    <p className="text-gray-500 text-sm chinese">{v.sound}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-4 mt-4">
              <p className="chinese text-gray-500 text-sm leading-relaxed">
                📌 <strong>实用提示：</strong>对于在以色列工作的中国朋友来说，
                学会认读常见字母和词汇已经足够日常交流。完整的阅读系统可以慢慢学习！
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
