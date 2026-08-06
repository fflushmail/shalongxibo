import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { VOCABULARY } from '../data/vocabulary'
import { useAuth } from '../contexts/AuthContext'
import {
  saveReplay,
  fetchRandomReplay,
  fakeBotName,
  type QuestionRecord,
  type GameReplay,
} from '../services/gameReplayService'

// ── Shared helpers ────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildChoices(correct: string, all: string[], count = 4): string[] {
  const wrong = shuffle(all.filter(x => x !== correct)).slice(0, count - 1)
  return shuffle([correct, ...wrong])
}

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

// ── Bot difficulty configs ────────────────────────────────────────────────────
export type BotLevel = 'beginner' | 'intermediate' | 'expert'

const BOT_CONFIG: Record<BotLevel, { label: string; emoji: string; color: string; delayMs: [number, number]; accuracy: number; description: string }> = {
  beginner: {
    label: '初级', emoji: '🐢', color: 'from-emerald-400 to-emerald-600',
    delayMs: [3500, 5000], accuracy: 0.50,
    description: '反应慢，只答对一半，适合新手练习',
  },
  intermediate: {
    label: '中级', emoji: '🦊', color: 'from-amber-400 to-orange-500',
    delayMs: [2000, 3500], accuracy: 0.85,
    description: '速度中等，大部分答对，有挑战性',
  },
  expert: {
    label: '专家', emoji: '🤖', color: 'from-red-500 to-rose-700',
    delayMs: [1000, 1800], accuracy: 1.0,
    description: '超快速度，全部答对，极难击败！',
  },
}

// ── Opponent interface (unified for bot + ghost) ───────────────────────────────
interface Opponent {
  name: string
  isGhost: boolean  // true = real player replay
  // For ghost: pre-computed timing per question index
  ghostAnswerMs?: number[]   // ms delay per question
  ghostAccuracy?: boolean[]  // correct or not per question
}

// ── SPEED MATCH ───────────────────────────────────────────────────────────────
type SpeedPhase = 'mode-select' | 'difficulty-select' | 'loading' | 'countdown' | 'playing' | 'result'

function SpeedMatch({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const allWords = useMemo(() =>
    VOCABULARY.filter(w => w.hanziPhonetic && w.hanziPhonetic.trim().length > 1), [])
  const allHanzi = useMemo(() => allWords.map(w => w.hanzi), [allWords])

  const WIN_SCORE = 10

  const [phase, setPhase]         = useState<SpeedPhase>('mode-select')
  const [botLevel, setBotLevel]   = useState<BotLevel>('intermediate')
  const [opponent, setOpponent]   = useState<Opponent | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [qIndex, setQIndex]       = useState(0)
  const [playerScore, setPlayerScore] = useState(0)
  const [oppScore, setOppScore]   = useState(0)
  const [answered, setAnswered]   = useState<'correct' | 'wrong' | null>(null)
  const [oppAnswered, setOppAnswered] = useState<'correct' | 'wrong' | null>(null)
  const [winner, setWinner]       = useState<'player' | 'opponent' | null>(null)
  const [questionStartMs, setQuestionStartMs] = useState(0)
  // Replay telemetry for current session
  const replayLog = useRef<QuestionRecord[]>([])

  const oppTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentWord = allWords[qIndex % allWords.length]
  const choices = useMemo(() => {
    if (!currentWord) return []
    return buildChoices(currentWord.hanzi, allHanzi)
  }, [qIndex, allHanzi])

  // ── Mode selection handlers ──────────────────────────────────────────────
  const startBotMode = () => setPhase('difficulty-select')

  const startWithBot = (level: BotLevel) => {
    setBotLevel(level)
    setOpponent({ name: `${BOT_CONFIG[level].emoji} ${BOT_CONFIG[level].label} AI`, isGhost: false })
    resetGame()
    setPhase('countdown')
  }

  const startPlayerMode = async () => {
    setPhase('loading')
    try {
      const replay = await fetchRandomReplay(user?.uid ?? '')
      if (replay && replay.questions.length >= WIN_SCORE) {
        // Build per-question timing/accuracy from replay
        const ms = replay.questions.map(q => q.timeToAnswerMs)
        const acc = replay.questions.map(q => q.wasCorrect)
        setOpponent({
          name: replay.displayName,
          isGhost: true,
          ghostAnswerMs: ms,
          ghostAccuracy: acc,
        })
      } else {
        // Fallback: intermediate bot disguised as a real player
        const fakeName = fakeBotName()
        setOpponent({ name: fakeName, isGhost: false })
        setBotLevel('intermediate')
      }
    } catch {
      const fakeName = fakeBotName()
      setOpponent({ name: fakeName, isGhost: false })
      setBotLevel('intermediate')
    }
    resetGame()
    setPhase('countdown')
  }

  function resetGame() {
    setCountdown(3); setQIndex(0); setPlayerScore(0); setOppScore(0)
    setAnswered(null); setOppAnswered(null); setWinner(null)
    replayLog.current = []
  }

  const restart = () => setPhase('mode-select')

  // ── Countdown ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) { setPhase('playing'); setQuestionStartMs(Date.now()); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // ── Opponent AI / ghost behavior ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || answered !== null || !opponent) return
    if (oppTimerRef.current) clearTimeout(oppTimerRef.current)

    let delay: number
    let correct: boolean

    if (opponent.isGhost && opponent.ghostAnswerMs && opponent.ghostAccuracy) {
      // Use real recorded timing from the ghost player
      delay = opponent.ghostAnswerMs[qIndex % opponent.ghostAnswerMs.length] ?? 2500
      correct = opponent.ghostAccuracy[qIndex % opponent.ghostAccuracy.length] ?? true
    } else {
      // Bot: use config for selected level
      const cfg = BOT_CONFIG[botLevel]
      delay = randBetween(...cfg.delayMs)
      correct = Math.random() < cfg.accuracy
    }

    oppTimerRef.current = setTimeout(() => {
      if (answered !== null) return // player already answered
      setOppAnswered(correct ? 'correct' : 'wrong')
      if (correct) {
        setOppScore(s => {
          const next = s + 1
          if (next >= WIN_SCORE) { setWinner('opponent'); setPhase('result') }
          return next
        })
      }
      setTimeout(nextQuestion, 800)
    }, delay)

    return () => { if (oppTimerRef.current) clearTimeout(oppTimerRef.current) }
  }, [qIndex, phase, answered, opponent, botLevel])

  // Track question start time when qIndex changes
  useEffect(() => {
    if (phase === 'playing') setQuestionStartMs(Date.now())
  }, [qIndex])

  const nextQuestion = useCallback(() => {
    setAnswered(null); setOppAnswered(null); setQIndex(i => i + 1)
  }, [])

  const handleChoice = (choice: string) => {
    if (answered || phase !== 'playing') return
    if (oppTimerRef.current) clearTimeout(oppTimerRef.current)
    const correct = choice === currentWord.hanzi
    const elapsed = Date.now() - questionStartMs
    setAnswered(correct ? 'correct' : 'wrong')

    // Log for replay saving
    replayLog.current.push({
      questionIndex: qIndex,
      hebrewWord: currentWord.hebrew,
      correctAnswer: currentWord.hanzi,
      selectedAnswer: choice,
      timeToAnswerMs: elapsed,
      wasCorrect: correct,
    })

    if (correct) {
      setPlayerScore(s => {
        const next = s + 1
        if (next >= WIN_SCORE) {
          // Save replay before result screen
          if (user) saveReplay(user.uid, user.displayName || user.email || '玩家', replayLog.current)
          setWinner('player')
          setPhase('result')
        }
        return next
      })
    }
    setTimeout(nextQuestion, 900)
  }

  // ── Screens ──────────────────────────────────────────────────────────────

  // Mode selection
  if (phase === 'mode-select') return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
      <div className="text-6xl">⚡</div>
      <h2 className="chinese font-black text-deep-blue text-2xl text-center">选择对战模式</h2>
      <div className="w-full space-y-3">
        <button
          onClick={startBotMode}
          className="w-full bg-gradient-to-r from-deep-blue to-sky-blue text-white rounded-2xl p-5
                     flex items-center gap-4 active:scale-[0.98] hover:brightness-105 transition-all shadow-lg"
        >
          <span className="text-3xl flex-shrink-0">🤖</span>
          <div className="text-left">
            <p className="chinese font-black text-lg">vs 机器人</p>
            <p className="chinese text-white/70 text-sm">选择难度，随时开始</p>
          </div>
          <span className="ml-auto text-white/60 text-2xl">›</span>
        </button>

        <button
          onClick={startPlayerMode}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-5
                     flex items-center gap-4 active:scale-[0.98] hover:brightness-105 transition-all shadow-lg"
        >
          <span className="text-3xl flex-shrink-0">👥</span>
          <div className="text-left">
            <p className="chinese font-black text-lg">vs 真实玩家</p>
            <p className="chinese text-white/70 text-sm">匹配其他用户的录像对战</p>
          </div>
          <span className="ml-auto text-white/60 text-2xl">›</span>
        </button>
      </div>
      <button onClick={onBack} className="text-gray-400 chinese text-sm mt-2">← 返回游戏菜单</button>
    </div>
  )

  // Difficulty selection
  if (phase === 'difficulty-select') return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
      <div className="text-5xl">🤖</div>
      <h2 className="chinese font-black text-deep-blue text-xl text-center">选择机器人难度</h2>
      <div className="w-full space-y-3">
        {(Object.entries(BOT_CONFIG) as [BotLevel, typeof BOT_CONFIG[BotLevel]][]).map(([level, cfg]) => (
          <button
            key={level}
            onClick={() => startWithBot(level)}
            className={`w-full bg-gradient-to-r ${cfg.color} text-white rounded-2xl p-5
                         flex items-center gap-4 active:scale-[0.98] hover:brightness-105 transition-all shadow-lg`}
          >
            <span className="text-3xl flex-shrink-0">{cfg.emoji}</span>
            <div className="text-left flex-1">
              <p className="chinese font-black text-lg">{cfg.label}</p>
              <p className="chinese text-white/80 text-sm">{cfg.description}</p>
            </div>
            <span className="ml-auto text-white/60 text-2xl">›</span>
          </button>
        ))}
      </div>
      <button onClick={() => setPhase('mode-select')} className="text-gray-400 chinese text-sm">← 返回</button>
    </div>
  )

  // Loading (fetching ghost replay)
  if (phase === 'loading') return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-6xl">🔍</div>
      <h2 className="chinese font-black text-deep-blue text-xl">正在寻找对手...</h2>
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-3 h-3 rounded-full bg-sky-blue"
            style={{ animation: `bounce 0.8s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <p className="chinese text-gray-400 text-sm">正在匹配其他学习者的录像</p>
    </div>
  )

  // Countdown
  if (phase === 'countdown') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5">
      <div className="text-5xl">⚡</div>
      <p className="chinese text-gray-500 text-sm">
        {opponent?.isGhost ? '👥 对战真实玩家录像' : '🤖 对战机器人'} · 先到 {WIN_SCORE} 分获胜
      </p>
      <div className="bg-deep-blue/10 rounded-2xl px-5 py-3 flex items-center gap-2">
        <span className="text-xl">{opponent?.isGhost ? '👥' : '🤖'}</span>
        <span className="chinese font-bold text-deep-blue text-lg">{opponent?.name}</span>
        {opponent?.isGhost && <span className="text-xs bg-purple-100 text-purple-600 chinese px-2 py-0.5 rounded-full">真实玩家</span>}
      </div>
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-deep-blue to-sky-blue
                      flex items-center justify-center shadow-2xl shadow-deep-blue/30">
        <span className="text-white font-black text-6xl leading-none">
          {countdown === 0 ? '开始!' : countdown}
        </span>
      </div>
    </div>
  )

  // Result
  if (phase === 'result') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5">
      <div className="text-7xl">{winner === 'player' ? '🏆' : (opponent?.isGhost ? '👥' : '🤖')}</div>
      <h2 className="chinese font-black text-deep-blue text-3xl">
        {winner === 'player' ? '你赢了！' : `${opponent?.name} 赢了！`}
      </h2>
      <div className="flex gap-6 items-center">
        <div className="text-center">
          <p className="text-3xl font-black text-deep-blue">{playerScore}</p>
          <p className="chinese text-gray-500 text-sm">👤 你</p>
        </div>
        <div className="text-gray-300 text-2xl font-light">VS</div>
        <div className="text-center">
          <p className="text-3xl font-black text-purple-600">{oppScore}</p>
          <p className="chinese text-gray-500 text-sm">
            {opponent?.isGhost ? '👥' : '🤖'} {opponent?.name}
          </p>
        </div>
      </div>
      {winner === 'player' && <p className="chinese text-emerald-600 text-sm">太棒了！继续保持！</p>}
      {winner === 'opponent' && <p className="chinese text-gray-500 text-sm">别灰心！再练练，你一定能赢！</p>}
      <button onClick={restart} className="btn-primary chinese w-full max-w-xs">🔄 再来一局</button>
      <button onClick={onBack} className="text-gray-400 chinese text-sm">← 返回游戏菜单</button>
    </div>
  )

  // Playing screen
  return (
    <div className="flex-1 flex flex-col">
      {/* Score header */}
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
                i < playerScore ? 'bg-deep-blue' : i < oppScore ? 'bg-purple-500' : 'bg-gray-200'
              }`} />
            ))}
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-purple-600">{oppScore}</p>
          <p className="chinese text-gray-500 text-xs truncate max-w-[70px]">
            {opponent?.isGhost ? '👥' : '🤖'} {opponent?.name?.split(' ')[0]}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">
        {/* Opponent status */}
        <div className={`text-xs px-3 py-1 rounded-full chinese transition-all ${
          oppAnswered === 'correct' ? 'bg-purple-100 text-purple-600' :
          oppAnswered === 'wrong'   ? 'bg-red-100 text-red-500'       : 'bg-gray-100 text-gray-400'
        }`}>
          {oppAnswered === 'correct' ? `${opponent?.isGhost ? '👥' : '🤖'} ${opponent?.name} 答对了！` :
           oppAnswered === 'wrong'   ? `${opponent?.isGhost ? '👥' : '🤖'} ${opponent?.name} 答错了！` :
           `${opponent?.isGhost ? '👥' : '🤖'} ${opponent?.name} 正在思考...`}
        </div>

        {/* Hebrew word */}
        <div className="w-full bg-gradient-to-br from-deep-blue to-sky-blue rounded-3xl p-8 text-center shadow-2xl shadow-deep-blue/20">
          <p className="text-white/60 text-xs chinese mb-3">这个词是什么意思？</p>
          <p className="hebrew text-5xl font-black text-white mb-3 leading-tight">{currentWord?.hebrew}</p>
          <p className="text-sky-blue/80 text-lg">{currentWord?.romanized}</p>
          {(currentWord?.hanziPhonetic?.trim().length ?? 0) > 1 && (
            <p className="chinese text-gold/80 text-lg mt-1">{currentWord?.hanziPhonetic}</p>
          )}
        </div>

        {/* Choices */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {choices.map((choice, i) => {
            const isCorrect = choice === currentWord?.hanzi
            let cls = 'bg-white border-2 border-gray-100 text-gray-800 hover:border-sky-blue/50'
            if (answered) {
              if (isCorrect) cls = 'bg-emerald-500 border-emerald-500 text-white scale-[1.03]'
              else           cls = 'bg-gray-100 border-gray-200 text-gray-400'
            }
            return (
              <button key={i} onClick={() => handleChoice(choice)} disabled={!!answered}
                className={`${cls} rounded-2xl py-5 px-3 chinese font-bold text-lg transition-all duration-150 active:scale-95 leading-tight`}>
                {choice}
              </button>
            )
          })}
        </div>
        <p className="chinese text-gray-300 text-xs">快点！对手也在答题</p>
      </div>
    </div>
  )
}

// ── WORD MARATHON ─────────────────────────────────────────────────────────────
const QUESTION_TIME = 8
const FEEDBACK_DELAY = 1800

function WordMarathon({ onBack }: { onBack: () => void }) {
  const words = useRef(shuffle(VOCABULARY).slice(0, 80)).current
  const allHanzi = useMemo(() => VOCABULARY.map(w => w.hanzi), [])

  type Phase = 'ready' | 'playing' | 'result'
  const [phase, setPhase]           = useState<Phase>('ready')
  const [qIndex, setQIndex]         = useState(0)
  const [timeLeft, setTimeLeft]     = useState(60)
  const [qTimeLeft, setQTimeLeft]   = useState(QUESTION_TIME)
  const [distance, setDistance]     = useState(0)
  const [streak, setStreak]         = useState(0)
  const [answered, setAnswered]     = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const MAX_DIST = 100

  const currentWord = words[qIndex % words.length]
  const choices = useMemo(() => {
    if (!currentWord) return []
    return buildChoices(currentWord.hanzi, allHanzi)
  }, [qIndex, allHanzi])

  const goNextQuestion = useCallback(() => {
    setAnswered(null); setTransitioning(false); setQTimeLeft(QUESTION_TIME); setQIndex(i => i + 1)
  }, [])

  useEffect(() => {
    if (phase !== 'playing' || transitioning) return
    if (timeLeft <= 0) { setPhase('result'); return }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft, transitioning])

  useEffect(() => {
    if (phase !== 'playing' || transitioning) return
    if (qTimeLeft <= 0) {
      setAnswered('__timeout__'); setTransitioning(true); setStreak(0)
      setTimeout(goNextQuestion, FEEDBACK_DELAY)
      return
    }
    const t = setTimeout(() => setQTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, qTimeLeft, transitioning])

  const handleChoice = (choice: string) => {
    if (answered || phase !== 'playing' || transitioning) return
    const correct = choice === currentWord.hanzi
    setAnswered(choice); setTransitioning(true)
    if (correct) {
      const newDist = Math.min(distance + 5, MAX_DIST)
      setDistance(newDist); setStreak(s => s + 1)
      if (newDist >= MAX_DIST) { setTimeout(() => setPhase('result'), FEEDBACK_DELAY); return }
    } else {
      setStreak(0)
    }
    setTimeout(goNextQuestion, FEEDBACK_DELAY)
  }

  const restart = () => {
    setPhase('ready'); setQIndex(0); setTimeLeft(60); setQTimeLeft(QUESTION_TIME)
    setDistance(0); setStreak(0); setAnswered(null); setTransitioning(false)
  }

  const distancePct   = (distance / MAX_DIST) * 100
  const qTimePct      = (qTimeLeft / QUESTION_TIME) * 100
  const runnerEmoji   = answered && answered !== currentWord.hanzi ? '😵' : streak >= 5 ? '🔥' : '🏃'
  const timerColor    = timeLeft <= 10 ? 'text-red-500' : timeLeft <= 20 ? 'text-amber-500' : 'text-[#0F172A]'
  const grade         = distance >= 90 ? '🥇 冠军!' : distance >= 70 ? '🥈 很棒!' : distance >= 50 ? '🥉 不错!' : '💪 继续练!'
  const isCorrect     = answered !== null && answered !== '__timeout__' && answered === currentWord?.hanzi
  const isWrong       = answered !== null && (answered === '__timeout__' || answered !== currentWord?.hanzi)

  if (phase === 'ready') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-6">
      <div className="text-6xl">🏃</div>
      <h2 className="chinese font-black text-deep-blue text-2xl">单词马拉松</h2>
      <div className="glass-card p-5 w-full text-left space-y-2">
        {[`⏱️ 60秒总时间，每题最多 ${QUESTION_TIME} 秒`,
          '✅ 答对 → 小人向前跑 5 米',
          '❌ 答错或超时 → 跑道暂停',
          '🏁 跑满 100 米 → 提前通关！'
        ].map((rule, i) => <p key={i} className="chinese text-gray-600 text-sm">{rule}</p>)}
      </div>
      <button onClick={() => setPhase('playing')} className="btn-primary chinese w-full max-w-xs text-lg py-4">
        🏁 出发！
      </button>
    </div>
  )

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
      {/* RTL track — runner right, flag left */}
      <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden relative" style={{ transform: 'scaleX(-1)' }}>
        <div className="h-full bg-gradient-to-r from-sky-blue to-deep-blue rounded-full transition-all duration-700"
          style={{ width: `${distancePct}%` }} />
        <span className="absolute" style={{ left: `${Math.min(distancePct, 90)}%`, top: '-2px', fontSize: '1.4rem', transform: 'scaleX(-1)', display: 'inline-block' }}>🏃</span>
      </div>
      <button onClick={restart} className="btn-primary chinese w-full max-w-xs">🔄 再跑一次</button>
      <button onClick={onBack} className="text-gray-400 chinese text-sm">← 返回游戏菜单</button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col">
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

      {/* RTL running track — runner on right, flag on left */}
      <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
        <div className="relative w-full bg-emerald-200/50 rounded-full h-7 overflow-hidden" style={{ transform: 'scaleX(-1)' }}>
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${distancePct}%` }} />
          <div className="absolute top-0.5 transition-all duration-500"
            style={{ left: `calc(${Math.min(distancePct, 88)}% - 14px)`, fontSize: '1.4rem', lineHeight: 1, transform: 'scaleX(-1)' }}>
            {runnerEmoji}
          </div>
          <span className="absolute right-1 top-0.5 text-xl" style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>🏁</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-emerald-600 chinese">终点</span>
          <span className="text-xs text-emerald-600 chinese">{distance}/100m</span>
          <span className="text-xs text-emerald-600 chinese">出发</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
        {isCorrect && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 w-full text-center">
            <p className="chinese text-emerald-600 font-bold text-sm">✅ 答对了！+5 米</p>
          </div>
        )}
        {isWrong && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 w-full text-center">
            <p className="chinese text-red-500 text-sm">
              {answered === '__timeout__' ? '⏰ 超时了！' : '❌ 答错了！'}
              &nbsp;正确答案：<strong>{currentWord?.hanzi}</strong>
            </p>
          </div>
        )}
        {!answered && (
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 linear ${
                qTimeLeft <= 2 ? 'bg-red-400' : qTimeLeft <= 4 ? 'bg-amber-400' : 'bg-sky-blue'
              }`} style={{ width: `${qTimePct}%` }} />
            </div>
            <span className={`text-xs tabular-nums font-bold w-4 text-right ${qTimeLeft <= 2 ? 'text-red-500' : 'text-gray-400'}`}>
              {qTimeLeft}
            </span>
          </div>
        )}
        <div className="w-full bg-gradient-to-br from-deep-blue to-sky-blue rounded-3xl p-6 text-center">
          <p className="text-white/60 text-xs chinese mb-2">这个词是什么意思？</p>
          <p className="hebrew text-4xl font-black text-white mb-2 leading-tight">{currentWord?.hebrew}</p>
          <p className="text-sky-blue/80 text-base">{currentWord?.romanized}</p>
          {(currentWord?.hanziPhonetic?.trim().length ?? 0) > 1 && (
            <p className="chinese text-gold/80 text-sm mt-1">{currentWord?.hanziPhonetic}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          {choices.map((choice, i) => {
            const correct = choice === currentWord?.hanzi
            let cls = 'bg-white border-2 border-gray-100 text-gray-800 hover:border-sky-blue/40'
            if (answered) {
              if (correct)              cls = 'bg-emerald-500 border-emerald-500 text-white'
              else if (choice === answered) cls = 'bg-red-400 border-red-400 text-white'
              else                      cls = 'bg-gray-100 border-gray-200 text-gray-400'
            }
            return (
              <button key={i} onClick={() => handleChoice(choice)} disabled={!!answered}
                className={`${cls} rounded-2xl py-4 px-3 chinese font-bold text-lg transition-all duration-150 active:scale-95`}>
                {choice}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── GAMES HUB ─────────────────────────────────────────────────────────────────
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
        <button onClick={() => setView('speed-match')} id="game-speed-match-btn"
          className="w-full rounded-3xl overflow-hidden shadow-lg active:scale-[0.98] hover:shadow-xl transition-all">
          <div className="bg-gradient-to-br from-deep-blue via-[#1a5ba0] to-sky-blue p-6 text-left">
            <div className="flex items-start justify-between mb-4">
              <span className="text-5xl">⚡</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full chinese">vs Bot / 真人</span>
            </div>
            <h2 className="chinese text-white font-black text-2xl mb-1">1v1 速度对决</h2>
            <p className="chinese text-white/70 text-sm mb-4">vs 机器人（3难度）或对战真实玩家录像！先到10分获胜。</p>
            <div className="flex gap-2 flex-wrap">
              {['⚡ 反应速度', '🤖 3种难度', '👥 真人对战'].map(tag => (
                <span key={tag} className="text-xs bg-white/15 text-white px-3 py-1 rounded-full chinese">{tag}</span>
              ))}
            </div>
          </div>
          <div className="bg-white px-6 py-3 flex items-center justify-between">
            <span className="chinese text-deep-blue font-bold">立即挑战</span>
            <span className="text-deep-blue text-xl">›</span>
          </div>
        </button>

        <button onClick={() => setView('marathon')} id="game-marathon-btn"
          className="w-full rounded-3xl overflow-hidden shadow-lg active:scale-[0.98] hover:shadow-xl transition-all">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-left">
            <div className="flex items-start justify-between mb-4">
              <span className="text-5xl">🏃</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full chinese">{QUESTION_TIME}秒/题</span>
            </div>
            <h2 className="chinese text-white font-black text-2xl mb-1">单词马拉松</h2>
            <p className="chinese text-white/70 text-sm mb-4">
              60秒快速答题！每题 {QUESTION_TIME} 秒。答对一题小人跑 5 米，跑满 100 米通关！
            </p>
            <div className="flex gap-2 flex-wrap">
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
