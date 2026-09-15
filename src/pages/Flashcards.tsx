import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import { VOCABULARY, getWordsByTopic, TOPIC_META } from '../data/vocabulary'
import { useProgress } from '../contexts/ProgressContext'
import FlashCard from '../components/FlashCard'
import { stopAllAudio } from '../utils/audioManager'
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

  // Stop audio on unmount or card advance
  useEffect(() => {
    return () => {
      stopAllAudio()
    }
  }, [])

  const advance = useCallback((dir: 'left' | 'right') => {
    if (!current) return
    // Immediately stop any playing audio when card advances
    stopAllAudio()

    if (dir === 'right') markLearned(current.id)
    setExitDir(dir)
    setTimeout(() => {
      setIndex(i => Math.min(i + 1, filtered.length))
      setExitDir(null)
      setDragX(0)
    }, 280)
  }, [current, markLearned, filtered.length])

  const handlers = useSwipeable({
    onSwipedLeft: () => advance('left'),
    onSwipedRight: () => advance('right'),
    onSwiping: (e) => { setDragX(e.deltaX); setIsDragging(true) },
    onSwiped: () => { setIsDragging(false) },
    trackMouse: true,
    delta: 50,
  })

  // Reset index and stop audio when topic/filter changes
  useEffect(() => {
    stopAllAudio()
    setIndex(0)
  }, [topic, filter])

  const cardStyle: React.CSSProperties = exitDir
    ? {
        transform: exitDir === 'left'
          ? 'translateX(-130%) rotate(-20deg)'
          : 'translateX(130%) rotate(20deg)',
        opacity: 0,
        transition: 'transform 0.28s ease-in, opacity 0.25s ease-in',
      }
    : isDragging
    ? {
        transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
        transition: 'none',
      }
    : {}

  const done = index >= filtered.length

  const TOPICS_LIST = [
    { key: 'all', label: '全部' },
    { key: 'greetings', label: TOPIC_META['greetings']?.labelZh || '问候' },
    { key: 'daily', label: TOPIC_META['daily']?.labelZh || '日常' },
    { key: 'food', label: TOPIC_META['food']?.labelZh || '食物' },
    { key: 'work', label: TOPIC_META['work']?.labelZh || '工作' },
    { key: 'slang', label: TOPIC_META['slang']?.labelZh || '俚语' },
    { key: 'numbers', label: TOPIC_META['numbers']?.labelZh || '数字' },
    { key: 'verbs', label: TOPIC_META['verbs']?.labelZh || '动词' },
    { key: 'health', label: TOPIC_META['health']?.labelZh || '健康' },
    { key: 'shopping', label: TOPIC_META['shopping']?.labelZh || '购物' },
    { key: 'transportation', label: TOPIC_META['transportation']?.labelZh || '交通' },
    { key: 'directions', label: TOPIC_META['directions']?.labelZh || '方向' },
  ]

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* 1. Top Header Banner */}
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 page-header safe-top">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => { stopAllAudio(); navigate(-1) }}
            className="text-white/80 text-2xl w-8 active:scale-90 transition-transform"
          >
            ‹
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="chinese text-white font-bold text-lg leading-tight truncate">
              {topicMeta ? `${topicMeta.emoji} ${topicMeta.labelZh}` : '🃏 所有单词 - 单词卡'}
            </h1>
            <p className="text-white/60 text-xs">{filtered.length} 张卡片</p>
          </div>
          <button
            onClick={() => setFilter(f => f === 'all' ? 'unlearned' : 'all')}
            className={`text-xs px-3 py-1.5 rounded-full chinese transition-all flex-shrink-0 ${
              filter === 'unlearned' ? 'bg-gold text-white shadow-sm' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {filter === 'all' ? '全部' : '未学'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gold h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-white/60 text-[11px] mt-1">
          <span>{topicMeta ? topicMeta.label : 'Flashcards'}</span>
          <span>{Math.min(index + 1, filtered.length)} / {filtered.length}</span>
        </div>
      </div>

      {/* 2. Category Selection Bar directly beneath Header Banner in document flow */}
      <div className="bg-sand border-b border-gray-200/70 py-2.5 px-4 shadow-sm z-10 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {TOPICS_LIST.map(t => {
            const isActive = (topic || 'all') === t.key
            return (
              <button
                key={t.key}
                onClick={() => {
                  stopAllAudio()
                  navigate(t.key === 'all' ? '/cards' : `/cards/${t.key}`)
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold chinese transition-all flex-shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-deep-blue text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-blue/40'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Main Vocabulary Flashcard Area positioned immediately below category bar */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="glass-card p-8 text-center max-w-xs mx-auto">
            <p className="text-5xl mb-3">🎉</p>
            <p className="chinese font-bold text-gray-800 text-lg mb-1">没有单词了！</p>
            <p className="chinese text-gray-500 text-sm mb-5">切换到"全部"模式查看所有词卡</p>
            <button onClick={() => setFilter('all')} className="btn-primary chinese text-sm py-2 px-6">
              显示全部单词
            </button>
          </div>
        ) : done ? (
          <div className="glass-card p-8 text-center max-w-xs mx-auto animate-fade-in">
            <p className="text-6xl mb-3">⭐</p>
            <p className="chinese font-black text-deep-blue text-2xl mb-1">太棒了！</p>
            <p className="chinese text-gray-600 text-sm mb-6">你学完了这一组单词卡！</p>
            <div className="flex flex-col gap-2.5 w-full">
              <button onClick={() => setIndex(0)} className="btn-primary chinese text-sm py-2.5">
                🔄 重新开始
              </button>
              <button onClick={() => { stopAllAudio(); navigate('/quiz') }} className="btn-gold chinese text-sm py-2.5">
                📝 去测验 →
              </button>
            </div>
          </div>
        ) : (
          <div
            {...handlers}
            className="w-full relative flex items-center justify-center my-auto"
            style={{ touchAction: 'pan-y' }}
          >
            {/* Key = current.id ensures card resets to Hebrew front side on word change */}
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

      {/* 4. Action Buttons at bottom of card deck */}
      {!done && filtered.length > 0 && (
        <div className="px-5 pt-1 pb-3 flex gap-3 flex-shrink-0">
          <button
            onClick={() => advance('left')}
            id="skip-card-btn"
            className="flex-1 py-3.5 rounded-2xl bg-red-50 text-red-500 font-bold chinese text-sm
                       border border-red-100 active:scale-95 hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>✕</span>
            <span>跳过</span>
          </button>
          <button
            onClick={() => advance('right')}
            id="learned-card-btn"
            className="flex-1 py-3.5 rounded-2xl bg-emerald-50 text-emerald-600 font-bold chinese text-sm
                       border border-emerald-100 active:scale-95 hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>✓</span>
            <span>学会了</span>
          </button>
        </div>
      )}
    </div>
  )
}
