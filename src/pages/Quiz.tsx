import { useState, useEffect, useCallback } from 'react'
import { VOCABULARY } from '../data/vocabulary'
import { useProgress } from '../contexts/ProgressContext'
import AudioPlayer from '../components/AudioPlayer'
import type { Word } from '../types'

type QuizMode = 'multiple-choice' | 'self-assess'
type QuestionType = 'phonetic-to-meaning' | 'meaning-to-phonetic'
type SelfRating = 'know' | 'unsure' | 'no'

interface MCQuestion {
  word: Word
  type: QuestionType
  choices: string[]
  correct: string
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildMCQuestions(words: Word[], count = 10): MCQuestion[] {
  const pool = shuffle(words).slice(0, count)
  return pool.map((word, i) => {
    // Alternate question types: even = phonetic→meaning, odd = meaning→phonetic
    const type: QuestionType = i % 3 === 2 ? 'meaning-to-phonetic' : 'phonetic-to-meaning'

    const sameTopicWrong = shuffle(words.filter(w => w.id !== word.id && w.topic === word.topic))
    const anyWrong = shuffle(words.filter(w => w.id !== word.id))

    if (type === 'phonetic-to-meaning') {
      // Q: Hebrew + Chinese phonetics → pick the correct Chinese meaning
      const wrongHanzi = [...sameTopicWrong.slice(0, 2), ...anyWrong]
        .filter(w => w.hanzi !== word.hanzi)
        .slice(0, 3)
        .map(w => w.hanzi)
      const choices = shuffle([word.hanzi, ...wrongHanzi].slice(0, 4))
      return { word, type, choices, correct: word.hanzi }
    } else {
      // Q: Chinese meaning → pick the correct Chinese phonetics
      const hasPhonetic = word.hanziPhonetic?.trim().length > 1
      const correctAnswer = hasPhonetic ? word.hanziPhonetic : word.romanized
      const wrongAnswers = [...sameTopicWrong, ...anyWrong]
        .filter(w => {
          const ans = w.hanziPhonetic?.trim().length > 1 ? w.hanziPhonetic : w.romanized
          return ans !== correctAnswer
        })
        .slice(0, 3)
        .map(w => w.hanziPhonetic?.trim().length > 1 ? w.hanziPhonetic : w.romanized)
      const choices = shuffle([correctAnswer, ...wrongAnswers].slice(0, 4))
      return { word, type, choices, correct: correctAnswer }
    }
  })
}

export default function Quiz() {
  const [mode, setMode] = useState<QuizMode>('multiple-choice')
  const { markLearned } = useProgress()

  // MC state
  const [questions, setQuestions] = useState<MCQuestion[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  // Self-assess state
  const [saWords, setSaWords] = useState<Word[]>([])
  const [saIndex, setSaIndex] = useState(0)
  const [saFlipped, setSaFlipped] = useState(false)
  const [saResults, setSaResults] = useState<Record<string, SelfRating>>({})
  const [saFinished, setSaFinished] = useState(false)

  const startMC = useCallback(() => {
    setQuestions(buildMCQuestions(VOCABULARY, 10))
    setQIndex(0); setSelected(null); setScore(0); setFinished(false)
  }, [])

  const startSA = useCallback(() => {
    setSaWords(shuffle(VOCABULARY).slice(0, 15))
    setSaIndex(0); setSaFlipped(false); setSaResults({}); setSaFinished(false)
  }, [])

  useEffect(() => { if (mode === 'multiple-choice') startMC(); else startSA() }, [mode])

  const handleChoice = (choice: string) => {
    if (selected) return
    setSelected(choice)
    const q = questions[qIndex]
    if (choice === q.correct) {
      setScore(s => s + 1)
      markLearned(q.word.id)
    }
    setTimeout(() => {
      if (qIndex + 1 >= questions.length) setFinished(true)
      else { setQIndex(i => i + 1); setSelected(null) }
    }, 1100)
  }

  const handleSARating = (rating: SelfRating) => {
    const word = saWords[saIndex]
    setSaResults(prev => ({ ...prev, [word.id]: rating }))
    if (rating === 'know') markLearned(word.id)
    if (saIndex + 1 >= saWords.length) setSaFinished(true)
    else { setSaIndex(i => i + 1); setSaFlipped(false) }
  }

  const q = questions[qIndex]
  const saWord = saWords[saIndex]

  const choiceClass = (choice: string) => {
    if (!selected) return 'bg-white border-2 border-gray-100 text-gray-800 hover:border-sky-blue hover:bg-sky-blue/5 active:scale-95'
    if (choice === q?.correct) return 'bg-emerald-500 border-2 border-emerald-500 text-white scale-[1.02]'
    if (choice === selected) return 'bg-red-500 border-2 border-red-500 text-white'
    return 'bg-white border-2 border-gray-100 text-gray-400 opacity-50'
  }

  const scoreEmoji = score >= 8 ? '🏆' : score >= 6 ? '🌟' : score >= 4 ? '💪' : '📖'
  const scoreMsg = score >= 8 ? '太棒了！' : score >= 6 ? '不错！继续加油！' : score >= 4 ? '还不错，多练练！' : '需要多复习！'

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 pt-12 pb-5 safe-top">
        <h1 className="chinese text-white font-black text-2xl mb-4">🧠 测验</h1>
        <div className="bg-white/20 rounded-2xl p-1 flex gap-1">
          {(['multiple-choice', 'self-assess'] as QuizMode[]).map(m => (
            <button
              key={m}
              id={`quiz-mode-${m}`}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-sm chinese font-semibold transition-all ${
                mode === m ? 'bg-white text-deep-blue shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              {m === 'multiple-choice' ? '🎯 选择题' : '🔄 自我评估'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">

        {/* ── MULTIPLE CHOICE ── */}
        {mode === 'multiple-choice' && (
          <>
            {finished ? (
              <div className="text-center py-10 animate-fade-in">
                <div className="text-7xl mb-4">{scoreEmoji}</div>
                <p className="chinese font-black text-deep-blue text-4xl mb-1">{score}<span className="text-2xl text-gray-400"> / {questions.length}</span></p>
                <p className="chinese text-gray-500 text-lg mb-8">{scoreMsg}</p>
                <button onClick={startMC} className="btn-primary chinese w-full mb-3">🔄 再来一次</button>
                <button onClick={() => setMode('self-assess')} className="btn-gold chinese w-full">试试自我评估 →</button>
              </div>
            ) : q ? (
              <>
                {/* Progress */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-sky-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(qIndex / questions.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 chinese flex-shrink-0">{qIndex + 1}/{questions.length}</span>
                </div>

                {/* Question type badge */}
                <div className="flex justify-center mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full chinese font-medium ${
                    q.type === 'phonetic-to-meaning'
                      ? 'bg-sky-blue/10 text-sky-blue'
                      : 'bg-gold/10 text-yellow-700'
                  }`}>
                    {q.type === 'phonetic-to-meaning' ? '🔊 听发音 → 选意思' : '📖 看意思 → 选发音'}
                  </span>
                </div>

                {/* Question card */}
                <div className="glass-card p-5 mb-5 text-center">
                  {q.type === 'phonetic-to-meaning' ? (
                    <>
                      {/* Show Hebrew + Chinese phonetics as the question */}
                      <p className="chinese text-gray-500 text-sm mb-3">这个词怎么读？选择正确的中文意思：</p>
                      <p className="hebrew text-4xl font-black text-deep-blue mb-2 leading-tight">{q.word.hebrew}</p>
                      <p className="text-sky-blue font-semibold text-lg mb-2">{q.word.romanized}</p>
                      {q.word.hanziPhonetic?.trim().length > 1 && (
                        <div className="inline-block bg-gold/10 border border-gold/30 rounded-xl px-4 py-2 mb-3">
                          <p className="chinese text-deep-blue font-black text-2xl">{q.word.hanziPhonetic}</p>
                        </div>
                      )}
                      <div className="flex justify-center">
                        <AudioPlayer url={q.word.audioUrl} size="md" />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Show Chinese meaning as the question → pick phonetics */}
                      <p className="chinese text-gray-500 text-sm mb-3">这个词是什么意思？选择正确的中文发音：</p>
                      <p className="chinese text-5xl font-black text-deep-blue mb-3">{q.word.hanzi}</p>
                      <div className="flex items-center justify-center gap-2">
                        <AudioPlayer url={q.word.audioUrl} size="sm" />
                        <span className="text-gray-400 text-sm chinese">（点击可听音）</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Answer choices */}
                <div className="grid grid-cols-2 gap-3">
                  {q.choices.map((choice, i) => (
                    <button
                      key={i}
                      id={`choice-${i}`}
                      onClick={() => handleChoice(choice)}
                      disabled={!!selected}
                      className={`${choiceClass(choice)} rounded-2xl py-4 px-3 chinese font-semibold text-base
                                  transition-all duration-200 leading-tight`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>

                <div className="mt-5 text-center">
                  <p className="chinese text-gray-400 text-sm">
                    得分: <span className="text-deep-blue font-bold text-lg">{score}</span>
                  </p>
                </div>
              </>
            ) : null}
          </>
        )}

        {/* ── SELF ASSESS ── */}
        {mode === 'self-assess' && (
          <>
            {saFinished ? (
              <div className="text-center py-10 animate-fade-in">
                <div className="text-6xl mb-4">📊</div>
                <p className="chinese font-black text-deep-blue text-2xl mb-5">评估完成！</p>
                {(() => {
                  const know = Object.values(saResults).filter(r => r === 'know').length
                  const unsure = Object.values(saResults).filter(r => r === 'unsure').length
                  const no = Object.values(saResults).filter(r => r === 'no').length
                  return (
                    <div className="glass-card p-5 mb-8 space-y-4 text-left">
                      {[
                        { label: '✅ 已掌握', count: know, color: 'text-emerald-600' },
                        { label: '🤔 不太确定', count: unsure, color: 'text-amber-500' },
                        { label: '❌ 需要复习', count: no, color: 'text-red-500' },
                      ].map(({ label, count, color }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className={`chinese font-medium ${color}`}>{label}</span>
                          <span className={`chinese font-black text-lg ${color}`}>{count} 词</span>
                        </div>
                      ))}
                    </div>
                  )
                })()}
                <button onClick={startSA} className="btn-primary chinese w-full mb-3">🔄 重新评估</button>
                <button onClick={() => setMode('multiple-choice')} className="btn-gold chinese w-full">试试选择题 →</button>
              </div>
            ) : saWord ? (
              <>
                {/* Progress */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(saIndex / saWords.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 chinese flex-shrink-0">{saIndex + 1}/{saWords.length}</span>
                </div>

                {/* Card */}
                <div
                  className="glass-card overflow-hidden mb-5 cursor-pointer active:scale-[0.99] transition-all"
                  onClick={() => setSaFlipped(f => !f)}
                >
                  {!saFlipped ? (
                    /* Front: Chinese phonetics (the pronunciation side) */
                    <div className="p-7 text-center">
                      <p className="text-xs text-gray-400 chinese mb-3 tracking-widest">你知道这个怎么读吗？</p>
                      <p className="hebrew text-5xl font-black text-deep-blue mb-3">{saWord.hebrew}</p>
                      <p className="text-sky-blue text-xl font-semibold mb-3">{saWord.romanized}</p>

                      {saWord.hanziPhonetic?.trim().length > 1 && (
                        <div className="bg-gold/10 border border-gold/30 rounded-2xl px-5 py-3 mb-4 inline-block">
                          <p className="chinese text-deep-blue font-black text-3xl">{saWord.hanziPhonetic}</p>
                        </div>
                      )}

                      <div className="flex justify-center gap-3 items-center mb-4">
                        <AudioPlayer url={saWord.audioUrl} size="lg" />
                      </div>
                      <p className="chinese text-gray-400 text-sm">👆 点击查看中文意思</p>
                    </div>
                  ) : (
                    /* Back: Chinese meaning (the answer) */
                    <div className="p-7 text-center bg-gradient-to-br from-deep-blue to-sky-blue">
                      <p className="hebrew text-2xl text-white/60 mb-1">{saWord.hebrew}</p>
                      <p className="text-sky-blue/70 text-sm mb-1">{saWord.romanized}</p>
                      {saWord.hanziPhonetic?.trim().length > 1 && (
                        <p className="chinese text-gold/80 text-lg mb-3">{saWord.hanziPhonetic}</p>
                      )}
                      <p className="text-xs text-white/50 chinese mb-2 tracking-widest">中文意思</p>
                      <p className="chinese text-5xl font-black text-white mb-3">{saWord.hanzi}</p>
                      {saWord.explanation?.trim() && (
                        <p className="chinese text-white/70 text-xs leading-relaxed mt-2">{saWord.explanation}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Rating */}
                {saFlipped ? (
                  <div className="grid grid-cols-3 gap-3 animate-slide-up">
                    {[
                      { rating: 'no' as SelfRating, label: '❌ 不会', cls: 'bg-red-50 text-red-500 border-red-100' },
                      { rating: 'unsure' as SelfRating, label: '🤔 模糊', cls: 'bg-amber-50 text-amber-500 border-amber-100' },
                      { rating: 'know' as SelfRating, label: '✅ 会了', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                    ].map(({ rating, label, cls }) => (
                      <button
                        key={rating}
                        onClick={() => handleSARating(rating)}
                        className={`py-3 rounded-2xl border ${cls} chinese text-sm font-semibold active:scale-95 transition-all`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="chinese text-gray-400 text-sm text-center">先思考，再翻看答案评估自己</p>
                )}
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
