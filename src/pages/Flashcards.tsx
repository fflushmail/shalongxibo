import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import { VOCABULARY, getWordsByTopic, TOPIC_META } from '../data/vocabulary'
import { useProgress } from '../contexts/ProgressContext'
import FlashCard from '../components/FlashCard'
import type { Word } from '../types'

export default function Flashcards() {
  const { topic } = useParams<{ topic?: string }>()
  const navigate = useNavigate()
  const { markLearned, isLearned } = useProgress()

  const words: Word[] = topic ? getWordsByTopic(topic) : VOCABULARY
  const topicMeta = topic ? TOPIC_META[topic] : null

  const [index, setIndex] = useState(0)
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unlearned'>('all')

  const filtered = filter === 'unlearned' ? words.filter(w => !isLearned(w.id)) : words
  const current = filtered[index]
  const progress = filtered.length > 0 ? (index / filtered.length) * 100 : 0

  const advance = useCallback((dir: 'left' | 'right') => {
    if (!current) return
    if (dir === 'right') markLearned(current.id)
    setExitDir(dir)
    setTimeout(() => {
      setIndex(i => Math.min(i + 1, filtered.length))
      setExitDir(null)
      setDragX(0)
    }, 300)
  }, [current, markLearned, filtered.length])

  const handlers = useSwipeable({
    onSwipedLeft: () => advance('left'),
    onSwipedRight: () => advance('right'),
    onSwiping: (e) => { setDragX(e.deltaX); setIsDragging(true) },
    onSwiped: () => { setIsDragging(false) },
    trackMouse: true,
    delta: 50,
  })

  // Reset index when topic/filter changes
  useEffect(() => { setIndex(0) }, [topic, filter])

  const cardStyle: React.CSSProperties = exitDir
    ? {
        transform: exitDir === 'left'
          ? 'translateX(-130%) rotate(-20deg)'
          : 'translateX(130%) rotate(20deg)',
        opacity: 0,
        transition: 'transform 0.3s ease-in, opacity 0.25s ease-in',
      }
    : isDragging
    ? {
        transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
        transition: 'none',
      }
    : {}

  const done = index >= filtered.length

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 pt-12 pb-5 safe-top">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-white/80 text-2xl w-8">‹</button>
          <div className="flex-1">
            <h1 className="chinese text-white font-bold text-lg leading-tight">
              {topicMeta ? `${topicMeta.emoji} ${topicMeta.labelZh}` : '🃏 所有单词'}
            </h1>
            <p className="text-white/60 text-xs">{filtered.length} 张卡片</p>
          </div>
          <button
            onClick={() => setFilter(f => f === 'all' ? 'unlearned' : 'all')}
            className={`text-xs px-3 py-1.5 rounded-full chinese transition-all flex-shrink-0 ${
              filter === 'unlearned' ? 'bg-gold text-white' : 'bg-white/20 text-white'
            }`}
          >
            {filter === 'all' ? '全部' : '未学'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-1.5">
          <div
            className="bg-gold h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white/60 text-xs mt-1 text-right">{index} / {filtered.length}</p>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-start px-5 pt-4 pb-2 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <p className="text-5xl mb-4">🎉</p>
            <p className="chinese font-bold text-gray-700 text-xl mb-2">没有单词了！</p>
            <p className="chinese text-gray-500 text-sm mb-6">切换到"全部"模式看全部单词</p>
            <button onClick={() => setFilter('all')} className="btn-primary chinese text-sm">显示全部单词</button>
          </div>
        ) : done ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 animate-fade-in">
            <p className="text-7xl mb-4">⭐</p>
            <p className="chinese font-black text-deep-blue text-2xl mb-2">完成了！</p>
            <p className="chinese text-gray-500 mb-8">你学完了这一组单词！</p>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={() => setIndex(0)} className="btn-primary chinese">重新开始</button>
              <button onClick={() => navigate('/quiz')} className="btn-gold chinese">去测验 →</button>
            </div>
          </div>
        ) : (
          <div
            {...handlers}
            className="w-full relative"
            style={{ touchAction: 'pan-y' }}
          >
            {/* KEY = word.id so React UNMOUNTS and remounts FlashCard when word changes,
                resetting the flip state to front (Hebrew side) automatically */}
            <FlashCard
              key={current.id}
              word={current}
              style={cardStyle}
              isDragging={isDragging}
              dragOffset={dragX}
            />
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!done && filtered.length > 0 && (
        <div className="px-5 pb-3 flex gap-3">
          <button
            onClick={() => advance('left')}
            id="skip-card-btn"
            className="flex-1 py-3 rounded-2xl bg-red-50 text-red-500 font-semibold chinese text-sm
                       border border-red-100 active:scale-95 transition-all"
          >
            ✕ 跳过
          </button>
          <button
            onClick={() => advance('right')}
            id="learned-card-btn"
            className="flex-1 py-3 rounded-2xl bg-emerald-50 text-emerald-600 font-semibold chinese text-sm
                       border border-emerald-100 active:scale-95 transition-all"
          >
            ✓ 学会了
          </button>
        </div>
      )}

      {/* Topic filter pills */}
      {!topic && !done && filtered.length > 0 && (
        <div className="px-5 pb-5 overflow-x-auto">
          <div className="flex gap-2 whitespace-nowrap pb-1">
            {['all', 'greetings', 'daily', 'food', 'work', 'slang', 'numbers', 'verbs', 'health'].map(t => (
              <button
                key={t}
                onClick={() => navigate(t === 'all' ? '/cards' : `/cards/${t}`)}
                className={`px-3 py-1.5 rounded-full text-xs chinese transition-all flex-shrink-0 ${
                  (topic || 'all') === t
                    ? 'bg-deep-blue text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {t === 'all' ? '全部' : (TOPIC_META[t]?.labelZh || t)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
