import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { VOCABULARY, TOPIC_META } from '../data/vocabulary'
import { DIALOGUES, getDailyDialogue } from '../data/dialogues'
import { useProgress } from '../contexts/ProgressContext'
import { useAuth } from '../contexts/AuthContext'
import AudioPlayer from '../components/AudioPlayer'

// ─── Daily notification logic ────────────────────────────────────────────────
const DAILY_NOTIF_KEY = 'shalong_last_notif_day'

async function requestAndShowDailyNotification(dialogue: ReturnType<typeof getDailyDialogue>) {
  if (!('Notification' in window)) return
  const todayStr = new Date().toISOString().slice(0, 10)
  const lastNotifDay = localStorage.getItem(DAILY_NOTIF_KEY)
  if (lastNotifDay === todayStr) return
  let permission = Notification.permission
  if (permission === 'default') permission = await Notification.requestPermission()
  if (permission === 'granted') {
    const line = dialogue.lines[0]
    new Notification(`沙龙希伯 · 今日对话 🇮🇱`, {
      body: `${line.hebrew}\n${line.romanized} — ${line.hanzi}`,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'daily-dialogue',
    })
    localStorage.setItem(DAILY_NOTIF_KEY, todayStr)
  }
}

export default function Home() {
  const navigate = useNavigate()
  const { totalLearned } = useProgress()
  const { user } = useAuth()
  const total = VOCABULARY.length
  const pct = Math.round((totalLearned / total) * 100)

  const featuredTopics = ['greetings', 'slang', 'work', 'food']
  const dailyDialogue = getDailyDialogue()

  useEffect(() => {
    const t = setTimeout(() => requestAndShowDailyNotification(dailyDialogue), 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-full bg-gradient-to-b from-deep-blue via-deep-blue/95 to-sand overflow-y-auto">
      {/* ── Hero Header ── */}
      <div className="relative px-5 pt-12 pb-6 safe-top">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="沙龙希伯" className="w-12 h-12 rounded-2xl shadow-lg" />
            <div>
              <h1 className="text-white font-bold text-xl leading-none chinese">沙龙希伯</h1>
              <p className="text-sky-blue/80 text-xs">Shalong Xibo</p>
            </div>
          </div>
          {/* Login / avatar always visible in header */}
          <button
            onClick={() => navigate(user ? '/profile' : '/login')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm
                       text-white text-sm chinese font-medium active:scale-95 transition-all overflow-hidden"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL} alt="" referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : null}
            <span>{user ? (user.displayName?.split(' ')[0] || '我的') : '登录'}</span>
            {!user && <span>🔑</span>}
          </button>
        </div>

        {/* Tagline */}
        <div className="text-center mb-6">
          <p className="text-white/60 text-sm chinese mb-1">שָׁלוֹם × 你好</p>
          <h2 className="text-white text-3xl font-black leading-tight mb-2 chinese">
            学希伯来语<br />
            <span className="gradient-text-gold">从今天开始</span>
          </h2>
          <p className="text-white/70 text-sm chinese">专为在以色列的中国朋友设计</p>
        </div>

        {/* Progress Ring */}
        <div className="glass-card-dark mx-4 p-5 flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#C9A84C" strokeWidth="2.5"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-black text-lg leading-none">{pct}%</span>
              <span className="text-white/50 text-[9px]">完成</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-lg chinese">{totalLearned} / {total}</p>
            <p className="text-white/60 text-sm chinese">已学习单词</p>
            {!user && (
              <button onClick={() => navigate('/login')} className="mt-2 text-gold text-xs chinese underline">
                登录以同步进度 →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Start Buttons ── */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/cards')}
            id="start-flashcards-btn"
            className="btn-primary py-4 rounded-2xl flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🃏</span>
            <span className="chinese text-xs font-semibold">单词卡</span>
          </button>
          <button
            onClick={() => navigate('/quiz')}
            id="start-quiz-btn"
            className="py-4 rounded-2xl flex flex-col items-center gap-1
                       bg-[#2E6DB4] text-white active:scale-95 transition-all shadow-lg shadow-[#2E6DB4]/30"
          >
            <span className="text-2xl">🧠</span>
            <span className="chinese text-xs font-semibold">测验</span>
          </button>
          <button
            onClick={() => navigate('/games')}
            id="start-games-btn"
            className="py-4 rounded-2xl flex flex-col items-center gap-1
                       bg-emerald-600 text-white active:scale-95 transition-all shadow-lg shadow-emerald-600/30"
          >
            <span className="text-2xl">🎮</span>
            <span className="chinese text-xs font-semibold">游戏</span>
          </button>
        </div>
      </div>

      {/* ── Featured Topics (white section, high-contrast header) ── */}
      <div className="bg-sand px-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="chinese font-bold text-gray-800 text-base">🔥 热门分类</h3>
          <button onClick={() => navigate('/topics')} className="text-sky-blue text-sm chinese">全部 →</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featuredTopics.map(topic => {
            const meta = TOPIC_META[topic] || { emoji: '📝', labelZh: topic, color: 'bg-gray-500' }
            const count = VOCABULARY.filter(w => w.topic === topic).length
            return (
              <button
                key={topic}
                id={`topic-${topic}-btn`}
                onClick={() => navigate(`/cards/${topic}`)}
                className="glass-card p-4 flex items-center gap-3 active:scale-95 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                  {meta.emoji}
                </div>
                <div>
                  <p className="chinese font-semibold text-gray-800 text-sm">{meta.labelZh}</p>
                  <p className="text-gray-400 text-xs">{count} 词</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Daily Dialogue Card (replaces daily slang) ── */}
      <div className="px-5 pb-8">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-deep-blue to-[#1565C0]">
          {/* Header row */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{dailyDialogue.scenarioEmoji}</span>
              <div>
                <p className="chinese text-white font-bold text-base">{dailyDialogue.titleZh}</p>
                <p className="text-white/50 text-xs">今日情景对话 · 每天更新</p>
              </div>
            </div>
            <button
              onClick={() => requestAndShowDailyNotification(dailyDialogue).then(() => {
                localStorage.removeItem(DAILY_NOTIF_KEY)
                requestAndShowDailyNotification(dailyDialogue)
              })}
              className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-lg active:scale-90 transition-transform"
              title="开启每日通知"
            >
              🔔
            </button>
          </div>

          {/* Preview: first line of dialogue */}
          <div className="px-5 pb-4">
            <div className="bg-white/10 rounded-2xl p-4 space-y-1.5">
              <p className="hebrew text-2xl text-white font-bold leading-tight text-right">
                {dailyDialogue.lines[0].hebrew}
              </p>
              <p className="text-sky-blue/80 text-sm italic">{dailyDialogue.lines[0].romanized}</p>
              {dailyDialogue.lines[0].hanziPhonetic && (
                <p className="chinese text-gold/80 text-sm">{dailyDialogue.lines[0].hanziPhonetic}</p>
              )}
              <p className="chinese text-white font-semibold text-base">{dailyDialogue.lines[0].hanzi}</p>
              {dailyDialogue.lines[0].audioUrl && (
                <AudioPlayer url={dailyDialogue.lines[0].audioUrl} size="sm" />
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/dialogues')}
            className="w-full bg-white/10 hover:bg-white/15 active:bg-white/20 transition-colors
                       py-3 text-center chinese text-white/80 text-sm font-medium"
          >
            查看完整对话 + 所有情景 →
          </button>
        </div>
      </div>
    </div>
  )
}
