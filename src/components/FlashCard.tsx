import { useState } from 'react'
import type { Word } from '../types'
import AudioPlayer from './AudioPlayer'
import { useProgress } from '../contexts/ProgressContext'
import { TOPIC_META } from '../data/vocabulary'

interface FlashCardProps {
  word: Word
  style?: React.CSSProperties
  isDragging?: boolean
  dragOffset?: number
}

export default function FlashCard({ word, style, isDragging, dragOffset = 0 }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false)
  const { isLearned, markLearned, unmarkLearned } = useProgress()
  const learned = isLearned(word.id)
  const topic = TOPIC_META[word.topic] || { emoji: '📝', label: word.topic, labelZh: word.topic, color: 'bg-gray-500' }

  const toggleLearned = (e: React.MouseEvent) => {
    e.stopPropagation()
    learned ? unmarkLearned(word.id) : markLearned(word.id)
  }

  // Swipe hint opacity based on drag
  const leftOpacity = dragOffset < 0 ? Math.min(Math.abs(dragOffset) / 80, 1) : 0
  const rightOpacity = dragOffset > 0 ? Math.min(dragOffset / 80, 1) : 0

  const difficultyLabel = { beginner: '初级', intermediate: '中级', advanced: '高级' }[word.difficulty]
  const difficultyClass = {
    beginner: 'difficulty-beginner',
    intermediate: 'difficulty-intermediate',
    advanced: 'difficulty-advanced',
  }[word.difficulty]

  const hasPhonetic = word.hanziPhonetic && word.hanziPhonetic.trim().length > 1

  return (
    <div
      className="flip-card w-full cursor-pointer select-none"
      style={{ height: 500, ...style }}
      onClick={() => !isDragging && setFlipped(f => !f)}
    >
      {/* Swipe hints */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none z-20">
        <div className="swipe-hint-left px-3 py-1.5 bg-red-100 rounded-xl border-2 border-red-400 text-sm"
          style={{ opacity: leftOpacity }}>✕ 跳过</div>
        <div className="swipe-hint-right px-3 py-1.5 bg-emerald-100 rounded-xl border-2 border-emerald-400 text-sm"
          style={{ opacity: rightOpacity }}>✓ 学会了</div>
      </div>

      <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>

        {/* ═══════════ FRONT: Pronunciation side ═══════════ */}
        <div className="flip-card-front">
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-deep-blue/20 flex flex-col bg-white">

            {/* Image with Hebrew overlay */}
            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-deep-blue to-sky-blue flex-shrink-0">
              {word.imageUrl && (
                <img
                  src={word.imageUrl}
                  alt={word.hanzi}
                  className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/80 via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                <span className={`topic-badge ${topic.color}`}>{topic.emoji} {topic.labelZh}</span>
                <span className={difficultyClass}>{difficultyLabel}</span>
              </div>

              {/* Star */}
              <button onClick={toggleLearned}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm
                           flex items-center justify-center text-xl transition-transform active:scale-90">
                {learned ? '⭐' : '☆'}
              </button>

              {/* Hebrew word — on image */}
              <div className="absolute bottom-3 left-0 right-0 text-center px-4">
                <p className="hebrew text-4xl font-black text-white leading-none drop-shadow-lg">
                  {word.hebrew}
                </p>
              </div>
            </div>

            {/* MAIN CONTENT: Chinese phonetics */}
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-3 gap-2">

              {/* Romanization — main pronunciation */}
              <p className="text-sky-blue font-bold text-2xl tracking-widest">{word.romanized}</p>

              {/* Chinese Phonetic — how to say it in Chinese sounds */}
              {hasPhonetic ? (
                <div className="bg-gold/10 border-2 border-gold/30 rounded-2xl px-5 py-3 w-full text-center">
                  <p className="text-[10px] text-gold/70 chinese mb-1 tracking-widest uppercase">中文发音提示</p>
                  <p className="chinese text-deep-blue font-black text-3xl leading-tight">{word.hanziPhonetic}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl px-5 py-3 w-full text-center">
                  <p className="text-[10px] text-gray-400 chinese mb-1">参考发音</p>
                  <p className="text-gray-500 text-xl font-semibold">{word.romanized}</p>
                </div>
              )}

              {/* Audio */}
              <div className="flex items-center gap-3 mt-1">
                <AudioPlayer url={word.audioUrl} size="lg" />
                <p className="chinese text-gray-400 text-xs">点击听发音</p>
              </div>
            </div>

            {/* Flip hint */}
            <div className="pb-4 text-center border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 chinese">👆 点击翻转看中文意思</p>
            </div>
          </div>
        </div>

        {/* ═══════════ BACK: Meaning side ═══════════ */}
        <div className="flip-card-back">
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-deep-blue/20 flex flex-col
                          bg-gradient-to-br from-deep-blue via-[#1a5ba0] to-sky-blue">

            {/* Header row */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <div className="flex gap-2 flex-wrap">
                <span className={`topic-badge ${topic.color}`}>{topic.emoji}</span>
                <span className={difficultyClass}>{difficultyLabel}</span>
              </div>
              <AudioPlayer url={word.audioUrl} size="sm" />
            </div>

            {/* Hebrew (small reminder) + romanized */}
            <div className="px-6 text-center mb-1">
              <p className="hebrew text-2xl text-white/70 font-bold">{word.hebrew}</p>
              <p className="text-sky-blue/80 text-sm">{word.romanized}</p>
              {hasPhonetic && (
                <p className="chinese text-gold/80 text-sm mt-0.5">{word.hanziPhonetic}</p>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
              {/* BIG Chinese translation = the answer */}
              <div className="text-center">
                <p className="text-[11px] text-white/50 chinese tracking-widest mb-2">中文意思</p>
                <p className="chinese text-5xl font-black text-white leading-tight text-center">
                  {word.hanzi}
                </p>
              </div>

              {/* Explanation */}
              {word.explanation && word.explanation.trim() && (
                <div className="bg-white/10 rounded-2xl px-4 py-3 w-full">
                  <p className="text-xs text-gold mb-1 chinese">💡 小贴士</p>
                  <p className="chinese text-white/90 text-sm leading-relaxed">{word.explanation}</p>
                </div>
              )}
            </div>

            {/* Mark learned */}
            <div className="p-4 flex justify-center">
              <button
                onClick={toggleLearned}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium chinese text-sm
                  transition-all active:scale-95 ${
                    learned
                      ? 'bg-gold text-white shadow-lg shadow-gold/30'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
              >
                {learned ? '⭐ 已学会' : '☆ 标记为已学'}
              </button>
            </div>

            <div className="pb-4 text-center">
              <p className="text-xs text-white/40 chinese">👆 点击翻回去</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
