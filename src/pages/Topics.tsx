import { useNavigate } from 'react-router-dom'
import { VOCABULARY, TOPICS, TOPIC_META } from '../data/vocabulary'
import { useProgress } from '../contexts/ProgressContext'

export default function Topics() {
  const navigate = useNavigate()
  const { learnedIds } = useProgress()

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 pt-12 pb-6 safe-top">
        <h1 className="chinese text-white font-black text-2xl">📂 分类目录</h1>
        <p className="chinese text-white/70 text-sm mt-1">选择一个主题开始学习</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* All Words card */}
        <button
          id="topic-all-btn"
          onClick={() => navigate('/cards')}
          className="w-full glass-card p-4 mb-4 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-deep-blue to-sky-blue flex items-center justify-center text-2xl shadow-lg">
            📚
          </div>
          <div className="flex-1">
            <p className="chinese font-bold text-gray-800 text-lg">所有单词</p>
            <p className="text-gray-500 text-sm">{VOCABULARY.length} 个单词</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-deep-blue text-sm">{learnedIds.size}</p>
            <p className="text-gray-400 text-xs chinese">已学</p>
          </div>
        </button>

        {/* Topic grid */}
        <div className="grid grid-cols-1 gap-3">
          {TOPICS.map(topic => {
            const meta = TOPIC_META[topic] || { emoji: '📝', label: topic, labelZh: topic, color: 'bg-gray-500' }
            const topicWords = VOCABULARY.filter(w => w.topic === topic)
            const learnedCount = topicWords.filter(w => learnedIds.has(w.id)).length
            const pct = topicWords.length > 0 ? Math.round((learnedCount / topicWords.length) * 100) : 0

            return (
              <button
                key={topic}
                id={`topic-dir-${topic}-btn`}
                onClick={() => navigate(`/cards/${topic}`)}
                className="glass-card p-4 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
              >
                <div className={`w-14 h-14 rounded-2xl ${meta.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                  {meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="chinese font-bold text-gray-800">{meta.labelZh}</p>
                    <p className="text-gray-400 text-xs">{meta.label}</p>
                  </div>
                  {/* Mini progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-gold' : 'bg-sky-blue'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-1 chinese">
                    {learnedCount}/{topicWords.length} 词 · {pct}%
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {pct === 100 ? (
                    <span className="text-gold text-xl">⭐</span>
                  ) : (
                    <span className="text-gray-400 text-lg">›</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 glass-card p-4">
          <p className="chinese font-medium text-gray-700 mb-3 text-sm">难度说明</p>
          <div className="flex gap-3">
            <span className="difficulty-beginner">初级</span>
            <span className="difficulty-intermediate">中级</span>
            <span className="difficulty-advanced">高级</span>
          </div>
        </div>
      </div>
    </div>
  )
}
