import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { VOCABULARY, TOPICS, TOPIC_META } from '../data/vocabulary'
import { useProgress } from '../contexts/ProgressContext'
import { useAuth } from '../contexts/AuthContext'

// ─── True date-based daily word (changes every calendar day) ─────────────────
function getDailyWord(words: typeof VOCABULARY) {
  if (words.length === 0) return null
  // days since epoch — changes every calendar day, not every 7 days
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  return words[dayIndex % words.length]
}

// ─── Daily notification logic ────────────────────────────────────────────────
const DAILY_NOTIF_KEY = 'shalong_last_notif_day'

async function requestAndShowDailyNotification(word: { hebrew: string; romanized: string; hanzi: string; hanziPhonetic: string }) {
  if (!('Notification' in window)) return

  // Only show once per calendar day
  const todayStr = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
  const lastNotifDay = localStorage.getItem(DAILY_NOTIF_KEY)
  if (lastNotifDay === todayStr) return

  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }

  if (permission === 'granted') {
    new Notification('沙龙希伯 · 今日俚语 🇮🇱', {
      body: `${word.hebrew}  ${word.romanized}\n${word.hanziPhonetic}  →  ${word.hanzi}`,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'daily-slang',
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
  const slangWords = VOCABULARY.filter(w => w.topic === 'slang')
  const dailySlang = getDailyWord(slangWords)

  // Show daily notification when app opens (once per day)
  useEffect(() => {
    if (dailySlang) {
      // Slight delay so the app finishes loading first
      const t = setTimeout(() => requestAndShowDailyNotification(dailySlang), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <div className="min-h-full bg-gradient-to-b from-deep-blue via-deep-blue/95 to-sand overflow-y-auto">
      {/* Hero Header */}
      <div className="relative px-5 pt-12 pb-8 safe-top">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="沙龙希伯" className="w-12 h-12 rounded-2xl shadow-lg" />
            <div>
              <h1 className="text-white font-bold text-xl leading-none chinese">沙龙希伯</h1>
              <p className="text-sky-blue/80 text-xs">Shalong Xibo</p>
            </div>
          </div>
          <button
            onClick={() => navigate(user ? '/more' : '/login')}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-lg overflow-hidden"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const t = e.currentTarget
                  t.style.display = 'none'
                  t.parentElement!.textContent = '👤'
                }}
              />
            ) : user ? '👤' : '🔑'}
          </button>
        </div>

        {/* Tagline */}
        <div className="text-center mb-8">
          <p className="text-white/60 text-sm chinese mb-2">שָׁלוֹם × 你好</p>
          <h2 className="text-white text-3xl font-black leading-tight mb-2">
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
              <button
                onClick={() => navigate('/login')}
                className="mt-2 text-gold text-xs chinese underline"
              >
                登录以同步进度 →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Start Buttons */}
      <div className="px-5 pb-6 -mt-2">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/cards')}
            id="start-flashcards-btn"
            className="btn-primary py-4 rounded-2xl flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🃏</span>
            <span className="chinese text-sm font-semibold">开始练习</span>
            <span className="text-xs opacity-80">Flashcards</span>
          </button>
          <button
            onClick={() => navigate('/quiz')}
            id="start-quiz-btn"
            className="btn-gold py-4 rounded-2xl flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🧠</span>
            <span className="chinese text-sm font-semibold">开始测验</span>
            <span className="text-xs opacity-80">Quiz</span>
          </button>
        </div>
      </div>

      {/* Featured Topics */}
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="chinese font-bold text-gray-800 text-lg">热门分类</h3>
          <button onClick={() => navigate('/topics')} className="text-sky-blue text-sm chinese">查看全部 →</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featuredTopics.map(topic => {
            const meta = TOPIC_META[topic] || { emoji: '📝', label: topic, labelZh: topic, color: 'bg-gray-500' }
            const count = VOCABULARY.filter(w => w.topic === topic).length
            return (
              <button
                key={topic}
                id={`topic-${topic}-btn`}
                onClick={() => navigate(`/cards/${topic}`)}
                className="glass-card p-4 flex items-center gap-3 active:scale-95 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center text-xl shadow-md`}>
                  {meta.emoji}
                </div>
                <div>
                  <p className="chinese font-semibold text-gray-800 text-sm">{meta.labelZh}</p>
                  <p className="text-gray-500 text-xs">{count} 单词</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Daily Slang */}
      <div className="px-5 pb-8">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-sky-blue to-deep-blue p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">😎</span>
            <div>
              <p className="chinese text-white font-bold">今日俚语</p>
              <p className="text-white/60 text-xs">每天更新 · Daily Slang</p>
            </div>
            {/* Notification bell */}
            <button
              onClick={() => {
                if (dailySlang) requestAndShowDailyNotification({
                  ...dailySlang,
                  // force resend by clearing stored date
                  hebrew: dailySlang.hebrew,
                }).then(() => {
                  localStorage.removeItem(DAILY_NOTIF_KEY)
                  if (dailySlang) requestAndShowDailyNotification(dailySlang)
                })
              }}
              className="ml-auto w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-lg
                         active:scale-90 transition-transform"
              title="开启每日通知"
            >
              🔔
            </button>
          </div>
          {dailySlang ? (
            <button
              onClick={() => navigate('/cards/slang')}
              className="w-full text-left"
            >
              <p className="hebrew text-4xl text-white font-black mb-1 leading-none">{dailySlang.hebrew}</p>
              <p className="text-sky-blue/80 text-base mb-1">{dailySlang.romanized}</p>
              {dailySlang.hanziPhonetic?.trim().length > 1 && (
                <p className="chinese text-gold/80 text-lg mb-1">{dailySlang.hanziPhonetic}</p>
              )}
              <p className="chinese text-white text-2xl font-black">{dailySlang.hanzi}</p>
              <p className="chinese text-white/60 text-xs mt-2">点击学习更多俚语 →</p>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
