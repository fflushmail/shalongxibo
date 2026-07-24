import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { VOCABULARY, TOPIC_META } from '../data/vocabulary'
import { getDailyDialogue } from '../data/dialogues'
import { useProgress } from '../contexts/ProgressContext'
import { useAuth } from '../contexts/AuthContext'
import AudioPlayer from '../components/AudioPlayer'

// ─── Daily notification logic ────────────────────────────────────────────────
const DAILY_NOTIF_KEY = 'shalong_last_notif_day'

async function requestAndShowDailyNotification(dialogue: ReturnType<typeof getDailyDialogue>) {
  if (!('Notification' in window)) return
  const todayStr = new Date().toISOString().slice(0, 10)
  if (localStorage.getItem(DAILY_NOTIF_KEY) === todayStr) return
  let permission = Notification.permission
  if (permission === 'default') permission = await Notification.requestPermission()
  if (permission === 'granted') {
    const line = dialogue.lines[0]
    new Notification('沙龙希伯 · 今日对话 🇮🇱', {
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
    // Light seamless background — same as all other pages
    <div className="min-h-full bg-[#F8FAFC] overflow-y-auto">

      {/* ── Top bar ── */}
      <div className="px-5 pt-12 pb-4 safe-top flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="沙龙希伯" className="w-11 h-11 rounded-2xl shadow-md" />
          <div>
            <h1 className="font-bold text-[#0F172A] text-lg leading-none chinese">沙龙希伯</h1>
            <p className="text-[#64748B] text-xs mt-0.5">Shalom Xibo</p>
          </div>
        </div>

        {/* Login always in header */}
        <button
          onClick={() => navigate(user ? '/profile' : '/login')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0]
                     text-[#0F172A] text-sm chinese font-medium shadow-sm
                     hover:bg-[#EFF6FF] hover:border-[#2563EB]/30 active:scale-95 transition-all"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : null}
          <span>{user ? (user.displayName?.split(' ')[0] || '我的') : '登录'}</span>
          {!user && <span className="text-[#2563EB]">🔑</span>}
        </button>
      </div>

      {/* ── Hero tagline ── */}
      <div className="px-5 pb-5">
        <h2 className="text-[#0F172A] text-3xl font-black leading-tight chinese">
          学希伯来语，<br />
          <span className="text-[#D97706]">从今天开始</span>
        </h2>
        <p className="text-[#64748B] text-sm chinese mt-2">专为在以色列的中国朋友设计 🇮🇱🇨🇳</p>
      </div>

      {/* ── Progress Card ── */}
      <div className="px-5 pb-5">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-4 flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#2563EB" strokeWidth="3"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[#0F172A] font-black text-base leading-none">{pct}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[#0F172A] font-bold text-base chinese">{totalLearned} / {total} 词</p>
            <p className="text-[#64748B] text-sm chinese">已学习单词</p>
            {!user && (
              <button onClick={() => navigate('/login')}
                className="mt-1 text-[#2563EB] text-xs chinese underline">
                登录以同步进度 →
              </button>
            )}
          </div>
          <button
            onClick={() => navigate('/cards')}
            className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] text-xs chinese font-semibold
                       hover:bg-[#DBEAFE] active:scale-95 transition-all flex-shrink-0"
          >
            继续学习 →
          </button>
        </div>
      </div>

      {/* ── Quick Action Cards ── */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 gap-3">
          {/* Flashcards */}
          <button
            onClick={() => navigate('/cards')}
            id="start-flashcards-btn"
            className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex flex-col items-center gap-2
                       hover:bg-[#DBEAFE] hover:border-[#93C5FD] hover:shadow-md
                       active:scale-95 transition-all duration-150 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-150">🃏</span>
            <span className="chinese text-xs font-bold text-[#1D4ED8] leading-tight">单词卡</span>
            <span className="text-[#64748B] text-[10px]">Flashcards</span>
          </button>

          {/* Quiz */}
          <button
            onClick={() => navigate('/quiz')}
            id="start-quiz-btn"
            className="bg-[#FAF5FF] border border-[#DDD6FE] rounded-2xl p-4 flex flex-col items-center gap-2
                       hover:bg-[#EDE9FE] hover:border-[#C4B5FD] hover:shadow-md
                       active:scale-95 transition-all duration-150 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-150">🧠</span>
            <span className="chinese text-xs font-bold text-[#6D28D9] leading-tight">测验</span>
            <span className="text-[#64748B] text-[10px]">Quiz</span>
          </button>

          {/* Games */}
          <button
            onClick={() => navigate('/games')}
            id="start-games-btn"
            className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 flex flex-col items-center gap-2
                       hover:bg-[#D1FAE5] hover:border-[#6EE7B7] hover:shadow-md
                       active:scale-95 transition-all duration-150 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-150">🎮</span>
            <span className="chinese text-xs font-bold text-[#065F46] leading-tight">游戏</span>
            <span className="text-[#64748B] text-[10px]">Games</span>
          </button>
        </div>
      </div>

      {/* ── Hot Topics ── */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="chinese font-bold text-[#0F172A] text-base">🔥 热门分类</h3>
          <button onClick={() => navigate('/topics')}
            className="text-[#2563EB] text-sm chinese hover:text-[#1D4ED8] transition-colors">
            全部 →
          </button>
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
                className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3
                           hover:border-[#93C5FD] hover:shadow-sm hover:bg-[#F8FAFC]
                           active:scale-95 transition-all duration-150 text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>
                  {meta.emoji}
                </div>
                <div>
                  <p className="chinese font-semibold text-[#0F172A] text-sm">{meta.labelZh}</p>
                  <p className="text-[#64748B] text-xs">{count} 词</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Daily Dialogue Card ── */}
      <div className="px-5 pb-8">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <span className="text-xl">{dailyDialogue.scenarioEmoji}</span>
              <div>
                <p className="chinese font-bold text-[#0F172A] text-sm">{dailyDialogue.titleZh}</p>
                <p className="text-[#64748B] text-xs">今日情景对话 · 每天更新</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem(DAILY_NOTIF_KEY)
                requestAndShowDailyNotification(dailyDialogue)
              }}
              className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-base
                         hover:bg-[#E2E8F0] active:scale-90 transition-all"
              title="开启每日通知"
            >
              🔔
            </button>
          </div>

          {/* First dialogue line preview */}
          <div className="px-4 py-3 bg-[#F8FAFC]">
            <p className="hebrew text-xl text-[#0F172A] font-bold leading-relaxed text-right mb-1">
              {dailyDialogue.lines[0].hebrew}
            </p>
            <p className="text-[#2563EB] text-sm italic mb-0.5">{dailyDialogue.lines[0].romanized}</p>
            {dailyDialogue.lines[0].hanziPhonetic && (
              <p className="chinese text-[#D97706] text-sm mb-0.5">{dailyDialogue.lines[0].hanziPhonetic}</p>
            )}
            <p className="chinese text-[#0F172A] font-semibold text-base">{dailyDialogue.lines[0].hanzi}</p>
            {dailyDialogue.lines[0].audioUrl && (
              <div className="mt-2">
                <AudioPlayer url={dailyDialogue.lines[0].audioUrl} size="sm" />
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/dialogues')}
            className="w-full py-3 text-center chinese text-[#2563EB] text-sm font-medium
                       hover:bg-[#EFF6FF] active:bg-[#DBEAFE] transition-colors border-t border-[#F1F5F9]"
          >
            查看完整对话 + 所有情景 →
          </button>
        </div>
      </div>
    </div>
  )
}
