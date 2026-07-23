import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProgress } from '../contexts/ProgressContext'
import { VOCABULARY, TOPIC_META } from '../data/vocabulary'

export default function Profile() {
  const { user, signOut } = useAuth()
  const { learnedIds, totalLearned } = useProgress()
  const navigate = useNavigate()

  const total = VOCABULARY.length
  const pct = Math.round((totalLearned / total) * 100)

  const topicStats = [...new Set(VOCABULARY.map(w => w.topic))].map(topic => {
    const words = VOCABULARY.filter(w => w.topic === topic)
    const learned = words.filter(w => learnedIds.has(w.id)).length
    return { topic, total: words.length, learned }
  }).sort((a, b) => b.learned - a.learned)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 bg-sand">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <h2 className="chinese font-black text-deep-blue text-2xl mb-3">尚未登录</h2>
          <p className="chinese text-gray-500 mb-8">登录以同步你的学习进度到所有设备</p>
          <button onClick={() => navigate('/login')} className="btn-primary chinese w-full mb-3">登录 / 注册</button>
          <button onClick={() => navigate('/')} className="chinese text-gray-400 text-sm">返回首页</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-br from-deep-blue to-sky-blue px-5 pt-12 pb-10 safe-top">
        <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl overflow-hidden">
        {user.photoURL ? (
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
        ) : (
          <span>👤</span>
        )}
      </div>
          <div>
            <p className="text-white font-bold text-lg">{user.displayName || '学习者'}</p>
            <p className="text-white/60 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 -mt-4">
        {/* Overall progress */}
        <div className="glass-card p-5 mb-5">
          <p className="chinese font-bold text-gray-700 mb-4">📊 总体进度</p>
          <div className="flex items-center gap-5">
            {/* Ring */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#C9A84C" strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-black text-deep-blue text-xl leading-none">{pct}%</span>
              </div>
            </div>
            <div>
              <p className="chinese text-3xl font-black text-deep-blue">{totalLearned}</p>
              <p className="chinese text-gray-500">/ {total} 个单词</p>
              <p className="chinese text-gold text-sm mt-1">{'⭐'.repeat(Math.min(Math.floor(pct / 20), 5))}</p>
            </div>
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="glass-card p-5 mb-5">
          <p className="chinese font-bold text-gray-700 mb-4">📚 分类进度</p>
          <div className="space-y-3">
            {topicStats.slice(0, 8).map(({ topic, total: t, learned }) => {
              const meta = TOPIC_META[topic] || { emoji: '📝', labelZh: topic }
              const p = Math.round((learned / t) * 100)
              return (
                <div key={topic} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{meta.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="chinese text-gray-700 text-sm">{meta.labelZh}</span>
                      <span className="chinese text-gray-400 text-xs">{learned}/{t}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${p === 100 ? 'bg-gold' : 'bg-sky-blue'}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={() => navigate('/cards')} className="btn-primary w-full chinese">继续学习</button>
          <button
            onClick={handleSignOut}
            className="w-full py-3 rounded-xl text-red-500 bg-red-50 border border-red-100 chinese font-medium active:scale-95 transition-all"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}
