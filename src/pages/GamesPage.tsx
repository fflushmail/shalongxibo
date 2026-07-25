import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { VOCABULARY } from '../data/vocabulary'

// ── Shared helpers ────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildChoices(correct: string, all: string[], count = 4): string[] {
  const wrong = shuffle(all.filter(x => x !== correct)).slice(0, count - 1)
  return shuffle([correct, ...wrong])
}

// ── SPEED MATCH GAME ─────────────────────────────────────────────────────────
function SpeedMatch({ onBack }: { onBack: () => void }) {
  const words = VOCABULARY.filter(w => w.hanziPhonetic && w.hanziPhonetic.trim().length > 1)
  const allHanzi = words.map(w => w.hanzi)

  type Phase = 'countdown' | 'playing' | 'result'
  const [phase, setPhase] = useState<Phase>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [qIndex, setQIndex] = useState(0)
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [answered, setAnswered] = useState<'correct' | 'wrong' | null>(null)
  const [aiAnswered, setAiAnswered] = useState<'correct' | 'wrong' | null>(null)
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null)
  const WIN_SCORE = 10
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentWord = words[qIndex % words.length]

  // Compute choices deterministically from qIndex — no useState lag
  const choices = useMemo(() => {
    if (!currentWord) return []
    return buildChoices(currentWord.hanzi, allHanzi)
  }, [qIndex])

  const nextQuestion = useCallback(() => {
    setAnswered(null)
    setAiAnswered(null)
    setQIndex(i => i + 1)
  }, [])

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) { setPhase('playing'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // AI behavior
  useEffect(() => {
    if (phase !== 'playing' || answered !== null) return
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    const delay = 1500 + Math.random() * 2000
    const aiCorrect = Math.random() < 0.78
    aiTimerRef.current = setTimeout(() => {
      if (answered !== null) return
      setAiAnswered(aiCorrect ? 'correct' : 'wrong')
      if (aiCorrect) {
        setAiScore(s => {
          const next = s + 1
          if (next >= WIN_SCORE) { setWinner('ai'); setPhase('result') }
          return next
        })
      }
      setTimeout(nextQuestion, 800)
    }, delay)
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current) }
  }, [qIndex, phase, answered])

  const handleChoice = (choice: string) => {
    if (answered || phase !== 'playing') return
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    const correct = choice === currentWord.hanzi
    setAnswered(correct ? 'correct' : 'wrong')
    if (correct) {
      setPlayerScore(s => {
        const next = s + 1
        if (next >= WIN_SCORE) { setWinner('player'); setPhase('result') }
        return next
      })
    }
    setTimeout(nextQuestion, 900)
  }

  const restart = () => {
    setPhase('countdown'); setCountdown(3)
    setQIndex(0); setPlayerScore(0); setAiScore(0)
    setAnswered(null); setAiAnswered(null); setWinner(null)
  }

  if (phase === 'countdown') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-6">
      <div className="text-6xl mb-2">⚡</div>
      <h2 className="chinese font-black text-deep-blue text-2xl">1v1 速度对决</h2>
      <p className="chinese text-gray-500 text-sm">最先答对 {WIN_SCORE} 题获胜！</p>
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-deep-blue to-sky-blue
                      flex items-center justify-center shadow-2xl shadow-deep-blue/30">
        <span className="text-white font-black text-6xl leading-none">
          {countdown === 0 ? '开始!' : countdown}
        </span>
      </div>
      <p className="chinese text-gray-400 text-sm">AI 对手正在等待...</p>
    </div>
  )

  if (phase === 'result') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5">
      <div className="text-7xl">{winner === 'player' ? '🏆' : '🤖'}</div>
      <h2 className="chinese font-black text-deep-blue text-3xl">
        {winner === 'player' ? '你赢了！' : 'AI 赢了！'}
      </h2>
      <div className="flex gap-6 items-center">
        <div className="text-center">
          <p className="text-3xl font-black text-deep-blue">{playerScore}</p>
          <p className="chinese text-gray-500 text-sm">👤 你</p>
        </div>
        <div className="text-gray-300 text-2xl">VS</div>
        <div className="text-center">
          <p className="text-3xl font-black text-sky-blue">{aiScore}</p>
          <p className="chinese text-gray-500 text-sm">🤖 AI</p>
        </div>
      </div>
      {winner === 'player' && <p className="chinese text-emerald-600 text-sm">太棒了！你比 AI 反应更快！</p>}
      {winner === 'ai' && <p className="chinese text-gray-500 text-sm">别灰心！再练练，你一定能赢！</p>}
      <button onClick={restart} className="btn-primary chinese w-full max-w-xs">🔄 再来一局</button>
      <button onClick={onBack} className="text-gray-400 chinese text-sm">← 返回游戏菜单</button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-black text-deep-blue">{playerScore}</p>
          <p className="chinese text-gray-500 text-xs">👤 你</p>
        </div>
        <div className="text-center">
          <p className="chinese text-gray-400 text-xs">先到 {WIN_SCORE} 分</p>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: WIN_SCORE }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${
                i < playerScore ? 'bg-deep-blue' : i < aiScore ? 'bg-sky-blue' : 'bg-gray-200'
              }`} />
            ))}
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-sky-blue">{aiScore}</p>
          <p className="chinese text-gray-500 text-xs">🤖 AI</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">
        <div className={`text-xs px-3 py-1 rounded-full chinese transition-all ${
          aiAnswered === 'correct' ? 'bg-blue-100 text-blue-600' :
          aiAnswered === 'wrong' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'
        }`}>
          {aiAnswered === 'correct' ? '🤖 AI 答对了！' :
           aiAnswered === 'wrong' ? '🤖 AI 答错了！' : '🤖 AI 正在思考...'}
        </div>

        <div className="w-full bg-gradient-to-br from-deep-blue to-sky-blue rounded-3xl p-8 text-center shadow-2xl shadow-deep-blue/20">
          <p className="text-white/60 text-xs chinese mb-3">这个词是什么意思？</p>
          <p className="hebrew text-5xl font-black text-white mb-3 leading-tight">{currentWord?.hebrew}</p>
          <p className="text-sky-blue/80 text-lg">{currentWord?.romanized}</p>
          {(currentWord?.hanziPhonetic?.trim().length ?? 0) > 1 && (
            <p className="chinese text-gold/80 text-lg mt-1">{currentWord?.hanziPhonetic}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {choices.map((choice, i) => {
            const isCorrect = choice === currentWord?.hanzi
            const isSelected = answered !== null
            let cls = 'bg-white border-2 border-gray-100 text-gray-800 hover:border-sky-blue/50'
            if (isSelected) {
              if (isCorrect) cls = 'bg-emerald-500 border-emerald-500 text-white scale-[1.03]'
              else cls = 'bg-gray-100 border-gray-200 text-gray-400'
            }
            return (
              <button
                key={i}
                onClick={() => handleChoice(choice)}
                disabled={!!answered}
                className={`${cls} rounded-2xl py-5 px-3 chinese font-bold text-lg
                             transition-all duration-150 active:scale-95 leading-tight`}
              >
                {choice}
              </button>
            )
          })}
        </div>
        <p className="chinese text-gray-300 text-xs">快点！AI 也在答题</p>
      </div>
    </div>
  )
}

// ── WORD MARATHON GAME ────────────────────────────────────────────────────────
const QUESTION_TIME = 8   // seconds each question stays before auto-advance
const FEEDBACK_DELAY = 1800 // ms of result display before moving on

function WordMarathon({ onBack }: { onBack: () => void }) {
  // Shuffle words once on mount, stable ref
  const words = useRef(shuffle(VOCABULARY).slice(0, 80)).current
  const allHanzi = useMemo(() => VOCABULARY.map(w => w.hanzi), [])

  type Phase = 'ready' | 'playing' | 'result'
  const [phase, setPhase] = useState<Phase>('ready')
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)         // overall 60-sec timer
  const [qTimeLeft, setQTimeLeft] = useState(QUESTION_TIME) // per-question timer
  const [distance, setDistance] = useState(0)
  const [streak, setStreak] = useState(0)
  const [answered, setAnswered] = useState<string | null>(null)  // which choice was picked
  const [transitioning, setTransitioning] = useState(false)       // locked during feedback
  const MAX_DIST = 100

  const currentWord = words[qIndex % words.length]

  // ── Choices computed in sync with currentWord — no useEffect lag ──
  const choices = useMemo(() => {
    if (!currentWord) return []
    return buildChoices(currentWord.hanzi, allHanzi)
  }, [qIndex, allHanzi])

  const goNextQuestion = useCallback(() => {
    setAnswered(null)
    setTransitioning(false)
    setQTimeLeft(QUESTION_TIME)
    setQIndex(i => i + 1)
  }, [])

  // Overall 60-second countdown (pauses during feedback transition)
  useEffect(() => {
    if (phase !== 'playing' || transitioning) return
    if (timeLeft <= 0) { setPhase('result'); return }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft, transitioning])

  // Per-question countdown (resets when question changes)
  useEffect(() => {
    if (phase !== 'playing' || transitioning) return
    if (qTimeLeft <= 0) {
      // Time's up for this question — count as wrong, brief pause
      setAnswered('__timeout__')
      setTransitioning(true)
      setStreak(0)
      setTimeout(goNextQuestion, FEEDBACK_DELAY)
      return
    }
    const t = setTimeout(() => setQTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, qTimeLeft, transitioning])

  const handleChoice = (choice: string) => {
    if (answered || phase !== 'playing' || transitioning) return
    const correct = choice === currentWord.hanzi
    setAnswered(choice)
    setTransitioning(true)

    if (correct) {
      const newDist = Math.min(distance + 5, MAX_DIST)
      setDistance(newDist)
      setStreak(s => s + 1)
      if (newDist >= MAX_DIST) {
        setTimeout(() => setPhase('result'), FEEDBACK_DELAY)
        return
      }
    } else {
      setStreak(0)
    }
    setTimeout(goNextQuestion, FEEDBACK_DELAY)
  }

  const restart = () => {
    setPhase('ready'); setQIndex(0); setTimeLeft(60); setQTimeLeft(QUESTION_TIME)
    setDistance(0); setStreak(0); setAnswered(null); setTransitioning(false)
  }

  const distancePct = (distance / MAX_DIST) * 100
  const qTimePct = (qTimeLeft / QUESTION_TIME) * 100

  const runnerEmoji = (answered && answered !== currentWord.hanzi) ? '😵'
    : streak >= 5 ? '🔥' : '🏃'

  const grade = distance >= 90 ? '🥇 冠军!' : distance >= 70 ? '🥈 很棒!'
    : distance >= 50 ? '🥉 不错!' : '💪 继续练!'

  const timerColor = timeLeft <= 10 ? 'text-red-500' : timeLeft <= 20 ? 'text-amber-500' : 'text-[#0F172A]'

  // ── READY ─────────────────────────────────────────────────────────────────
  if (phase === 'ready') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-6">
      <div className="text-6xl">🏃</div>
      <h2 className="chinese font-black text-deep-blue text-2xl">单词马拉松</h2>
      <div className="glass-card p-5 w-full text-left space-y-2">
        {[
          `⏱️ 60秒总时间，每题最多 ${QUESTION_TIME} 秒`,
          '✅ 答对 → 小人向前跑 5 米',
          '❌ 答错或超时 → 跑道暂停',
          '🏁 跑满 100 米 → 提前通关！',
        ].map((rule, i) => (
          <p key={i} className="chinese text-gray-600 text-sm">{rule}</p>
        ))}
      </div>
      <button onClick={() => setPhase('playing')} className="btn-primary chinese w-full max-w-xs text-lg py-4">
        🏁 出发！
      </button>
    </div>
  )

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5">
      <div className="text-6xl">{grade.split(' ')[0]}</div>
      <h2 className="chinese font-black text-deep-blue text-3xl">{grade.split(' ').slice(1).join(' ')}</h2>
      <div className="flex gap-6">
        <div>
          <p className="text-3xl font-black text-deep-blue">{distance}<span className="text-lg text-gray-400">米</span></p>
          <p className="chinese text-gray-500 text-sm">跑步距离</p>
        </div>
        <div>
          <p className="text-3xl font-black text-sky-blue">{qIndex}</p>
          <p className="chinese text-gray-500 text-sm">答题数</p>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-sky-blue to-deep-blue rounded-full transition-all duration-700"
          style={{ width: `${distancePct}%` }} />
        <span className="absolute" style={{ left: `${Math.min(distancePct, 88)}%`, top: '-2px', fontSize: '1.4rem' }}>🏃</span>
      </div>
      <button onClick={restart} className="btn-primary chinese w-full max-w-xs">🔄 再跑一次</button>
      <button onClick={onBack} className="text-gray-400 chinese text-sm">← 返回游戏菜单</button>
    </div>
  )

  // ── PLAYING ────────────────────────────────────────────────────────────────
  const isAnsweredCorrect = answered !== null && answered !== '__timeout__' && answered === currentWord?.hanzi
  const isAnsweredWrong = answered !== null && (answered === '__timeout__' || answered !== currentWord?.hanzi)

  return (
    <div className="flex-1 flex flex-col">
      {/* Top stats bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <div className="text-center">
          <p className={`text-2xl font-black tabular-nums ${timerColor}`}>{timeLeft}</p>
          <p className="chinese text-gray-400 text-xs">总时间</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-gold">{streak > 0 ? `🔥×${streak}` : '—'}</p>
          <p className="chinese text-gray-400 text-xs">连击</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-emerald-600">{distance}<span className="text-sm">m</span></p>
          <p className="chinese text-gray-400 text-xs">距离</p>
        </div>
      </div>

      {/* Running track */}
      <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
        <div className="relative w-full bg-emerald-200/50 rounded-full h-7 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${distancePct}%` }} />
          <div
            className={`absolute top-0.5 transition-all duration-500`}
            style={{ left: `calc(${Math.min(distancePct, 88)}% - 14px)`, fontSize: '1.4rem', lineHeight: 1 }}
          >
            {runnerEmoji}
          </div>
          <span className="absolute right-1 top-0.5 text-xl">🏁</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-emerald-600 chinese">出发</span>
          <span className="text-xs text-emerald-600 chinese">{distance}/100m</span>
          <span className="text-xs text-emerald-600 chinese">终点</span>
        </div>
      </div>

      {/* Question + choices */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
        {/* Feedback banners */}
        {isAnsweredCorrect && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 w-full text-center">
            <p className="chinese text-emerald-600 font-bold text-sm">✅ 答对了！+5 米</p>
          </div>
        )}
        {isAnsweredWrong && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 w-full text-center">
            <p className="chinese text-red-500 text-sm">
              {answered === '__timeout__' ? '⏰ 超时了！' : '❌ 答错了！'}
              &nbsp;正确答案：<strong>{currentWord?.hanzi}</strong>
            </p>
          </div>
        )}

        {/* Per-question countdown bar (only visible while unanswered) */}
        {!answered && (
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 linear ${
                  qTimeLeft <= 2 ? 'bg-red-400' : qTimeLeft <= 4 ? 'bg-amber-400' : 'bg-sky-blue'
                }`}
                style={{ width: `${qTimePct}%` }}
              />
            </div>
            <span className={`text-xs tabular-nums font-bold w-4 text-right ${
              qTimeLeft <= 2 ? 'text-red-500' : 'text-gray-400'
            }`}>{qTimeLeft}</span>
          </div>
        )}

        {/* Hebrew word */}
        <div className="w-full bg-gradient-to-br from-deep-blue to-sky-blue rounded-3xl p-6 text-center">
          <p className="text-white/60 text-xs chinese mb-2">这个词是什么意思？</p>
          <p className="hebrew text-4xl font-black text-white mb-2 leading-tight">{currentWord?.hebrew}</p>
          <p className="text-sky-blue/80 text-base">{currentWord?.romanized}</p>
          {(currentWord?.hanziPhonetic?.trim().length ?? 0) > 1 && (
            <p className="chinese text-gold/80 text-sm mt-1">{currentWord?.hanziPhonetic}</p>
          )}
        </div>

        {/* 4 choices */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {choices.map((choice, i) => {
            const isCorrect = choice === currentWord?.hanzi
            let cls = 'bg-white border-2 border-gray-100 text-gray-800 hover:border-sky-blue/40'
            if (answered) {
              if (isCorrect) cls = 'bg-emerald-500 border-emerald-500 text-white'
              else if (choice === answered) cls = 'bg-red-400 border-red-400 text-white'
              else cls = 'bg-gray-100 border-gray-200 text-gray-400'
            }
            return (
              <button
                key={i}
                onClick={() => handleChoice(choice)}
                disabled={!!answered}
                className={`${cls} rounded-2xl py-4 px-3 chinese font-bold text-lg
                             transition-all duration-150 active:scale-95`}
              >
                {choice}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── GAMES HUB ────────────────────────────────────────────────────────────────
type GameView = 'hub' | 'speed-match' | 'marathon'

export default function GamesPage() {
  const [view, setView] = useState<GameView>('hub')

  if (view === 'speed-match') return (
    <div className="min-h-full flex flex-col bg-sand">
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 page-header safe-top">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('hub')} className="text-white/80 text-2xl">‹</button>
          <h1 className="chinese text-white font-black text-xl">⚡ 1v1 速度对决</h1>
        </div>
      </div>
      <SpeedMatch onBack={() => setView('hub')} />
    </div>
  )

  if (view === 'marathon') return (
    <div className="min-h-full flex flex-col bg-sand">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 px-5 page-header safe-top">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('hub')} className="text-white/80 text-2xl">‹</button>
          <h1 className="chinese text-white font-black text-xl">🏃 单词马拉松</h1>
        </div>
      </div>
      <WordMarathon onBack={() => setView('hub')} />
    </div>
  )

  return (
    <div className="min-h-full flex flex-col bg-sand">
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 page-header safe-top">
        <h1 className="chinese text-white font-black text-2xl">🎮 游戏练习</h1>
        <p className="text-white/70 text-sm mt-1">Games · 边玩边学希伯来语！</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <button
          onClick={() => setView('speed-match')}
          id="game-speed-match-btn"
          className="w-full rounded-3xl overflow-hidden shadow-lg active:scale-[0.98] hover:shadow-xl transition-all"
        >
          <div className="bg-gradient-to-br from-deep-blue via-[#1a5ba0] to-sky-blue p-6 text-left">
            <div className="flex items-start justify-between mb-4">
              <span className="text-5xl">⚡</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full chinese">2人 / VS AI</span>
            </div>
            <h2 className="chinese text-white font-black text-2xl mb-1">1v1 速度对决</h2>
            <p className="chinese text-white/70 text-sm mb-4">看希伯来语，比 AI 更快选出中文意思！先到10分获胜。</p>
            <div className="flex gap-3 flex-wrap">
              {['⚡ 反应速度', '🧠 记忆训练', '🏆 竞技对战'].map(tag => (
                <span key={tag} className="text-xs bg-white/15 text-white px-3 py-1 rounded-full chinese">{tag}</span>
              ))}
            </div>
          </div>
          <div className="bg-white px-6 py-3 flex items-center justify-between">
            <span className="chinese text-deep-blue font-bold">立即挑战</span>
            <span className="text-deep-blue text-xl">›</span>
          </div>
        </button>

        <button
          onClick={() => setView('marathon')}
          id="game-marathon-btn"
          className="w-full rounded-3xl overflow-hidden shadow-lg active:scale-[0.98] hover:shadow-xl transition-all"
        >
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-left">
            <div className="flex items-start justify-between mb-4">
              <span className="text-5xl">🏃</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full chinese">{QUESTION_TIME}秒/题</span>
            </div>
            <h2 className="chinese text-white font-black text-2xl mb-1">单词马拉松</h2>
            <p className="chinese text-white/70 text-sm mb-4">
              60秒快速答题！每题有 {QUESTION_TIME} 秒读题时间。
              每答对一题，小人就向前跑。跑完100米你就赢了！
            </p>
            <div className="flex gap-3 flex-wrap">
              {['🏃 跑步赛跑', '⏱️ 限时挑战', '🔥 连击奖励'].map(tag => (
                <span key={tag} className="text-xs bg-white/15 text-white px-3 py-1 rounded-full chinese">{tag}</span>
              ))}
            </div>
          </div>
          <div className="bg-white px-6 py-3 flex items-center justify-between">
            <span className="chinese text-emerald-700 font-bold">开始赛跑</span>
            <span className="text-emerald-700 text-xl">›</span>
          </div>
        </button>

        <div className="glass-card p-5 text-center opacity-60">
          <p className="text-3xl mb-2">🚧</p>
          <p className="chinese font-bold text-gray-600">更多游戏即将上线</p>
          <p className="chinese text-gray-400 text-sm mt-1">单词拼写、听写训练...</p>
        </div>
      </div>
    </div>
  )
}
