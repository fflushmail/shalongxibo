import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DIALOGUES, getDailyDialogue } from '../data/dialogues'
import type { Dialogue } from '../data/dialogues'
import AudioPlayer from '../components/AudioPlayer'

function DialogueCard({ dialogue, isDaily }: { dialogue: Dialogue; isDaily?: boolean }) {
  const [expanded, setExpanded] = useState(isDaily ?? false)

  const diffColor = dialogue.difficulty === 'beginner'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-amber-100 text-amber-700'
  const diffLabel = dialogue.difficulty === 'beginner' ? '初级' : '中级'

  return (
    <div className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all ${
      isDaily ? 'border-sky-blue/40 shadow-sky-blue/10 shadow-lg' : 'border-gray-100'
    }`}>
      {/* Card header — tap to expand/collapse */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-blue/20 to-deep-blue/20
                        flex items-center justify-center text-2xl flex-shrink-0">
          {dialogue.scenarioEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {isDaily && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-blue text-white chinese font-semibold flex-shrink-0">
                今日对话
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full chinese flex-shrink-0 ${diffColor}`}>
              {diffLabel}
            </span>
          </div>
          <p className="chinese font-bold text-gray-800 text-sm leading-tight">{dialogue.titleZh}</p>
          <p className="text-gray-400 text-xs">{dialogue.scenario}</p>
        </div>
        <span className={`text-gray-400 text-xl transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>›</span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-5 pt-4 space-y-3">
          {dialogue.lines.map((line, i) => (
            <div key={i} className={`rounded-2xl p-4 ${
              i % 2 === 0
                ? 'bg-gradient-to-r from-deep-blue/5 to-sky-blue/5 border border-sky-blue/10'
                : 'bg-gray-50 border border-gray-100 ml-4'
            }`}>
              {/* Speaker indicator */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400 chinese">
                  {i % 2 === 0 ? '👷 甲：' : '🧑 乙：'}
                </span>
                {line.audioUrl && <AudioPlayer url={line.audioUrl} size="sm" />}
              </div>

              {/* Hebrew with nikud - large and clear */}
              <p className="hebrew text-2xl font-bold text-deep-blue mb-1 leading-relaxed text-right">
                {line.hebrew}
              </p>

              {/* Romanization */}
              <p className="text-sky-blue/80 text-sm font-medium mb-1 italic">
                {line.romanized}
              </p>

              {/* Chinese phonetics (if available) */}
              {line.hanziPhonetic && (
                <p className="chinese text-gold/80 text-sm mb-1">{line.hanziPhonetic}</p>
              )}

              {/* Chinese translation */}
              <p className="chinese text-gray-700 font-semibold text-base">{line.hanzi}</p>
            </div>
          ))}

          {/* Practice CTA */}
          <div className="pt-1 text-center">
            <p className="chinese text-gray-400 text-xs">💡 多读几遍，尝试记住！</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DialoguesPage() {
  const navigate = useNavigate()
  const daily = getDailyDialogue()
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate'>('all')

  const filtered = filter === 'all'
    ? DIALOGUES
    : DIALOGUES.filter(d => d.difficulty === filter)

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 pt-12 pb-6 safe-top">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate(-1)} className="text-white/80 text-2xl">‹</button>
          <div>
            <h1 className="chinese text-white font-black text-2xl">💬 实用对话</h1>
            <p className="text-white/60 text-sm">Daily Scenarios · 工作生活情景</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Today's dialogue pinned at top */}
        <div>
          <p className="chinese text-xs text-gray-400 mb-2 font-medium tracking-widest uppercase">📅 今日对话</p>
          <DialogueCard dialogue={daily} isDaily />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {(['all', 'beginner', 'intermediate'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs chinese font-medium transition-all ${
                filter === f
                  ? 'bg-deep-blue text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'beginner' ? '初级' : '中级'}
            </button>
          ))}
        </div>

        {/* All dialogues */}
        <div>
          <p className="chinese text-xs text-gray-400 mb-2 font-medium tracking-widest uppercase">📚 所有情景</p>
          <div className="space-y-3">
            {filtered.map(d => (
              <DialogueCard key={d.id} dialogue={d} />
            ))}
          </div>
        </div>

        {/* Tip box */}
        <div className="glass-card p-4">
          <p className="chinese text-gray-600 text-sm leading-relaxed">
            💡 <strong>学习建议：</strong>每天练习一个情景对话，大声朗读！
            听音频模仿发音是最快的学习方法。
          </p>
        </div>
      </div>
    </div>
  )
}
