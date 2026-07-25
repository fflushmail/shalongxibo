import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProgress } from '../contexts/ProgressContext'
import { VOCABULARY } from '../data/vocabulary'

// Update this URL when the bug-report WhatsApp group is ready
const BUG_REPORT_WHATSAPP = 'https://chat.whatsapp.com/CzP0TemXmRuGybBstuhmZg' // replace with bug-report group URL

export default function MorePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { totalLearned } = useProgress()

  const MENU_ITEMS = [
    {
      id: 'dialogues',
      icon: '💬',
      label: '实用对话',
      sublabel: 'Daily Scenarios',
      color: 'from-sky-blue to-deep-blue',
      onClick: () => navigate('/dialogues'),
    },
    {
      id: 'alphabet',
      icon: '📖',
      label: '希伯来字母表',
      sublabel: 'Hebrew Alphabet',
      color: 'from-purple-500 to-purple-700',
      onClick: () => navigate('/alphabet'),
    },
    {
      id: 'community',
      icon: '🌐',
      label: '学习社区',
      sublabel: 'WhatsApp Group',
      color: 'from-[#25D366] to-[#128C7E]',
      onClick: () => navigate('/community'),
    },
    {
      id: 'bug-report',
      icon: '🐛',
      label: '反馈问题 / Bug',
      sublabel: '发现 Bug？告诉我们！',
      color: 'from-orange-400 to-red-500',
      onClick: () => window.open(BUG_REPORT_WHATSAPP, '_blank', 'noopener,noreferrer'),
    },
  ]

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 page-header safe-top">
        <div className="flex items-center justify-between">
          <h1 className="chinese text-white font-black text-2xl">☰ 更多</h1>
          {/* Login always in header */}
          <button
            onClick={() => navigate(user ? '/profile' : '/login')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-white text-sm chinese active:scale-95 transition-all hover:bg-white/30"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL} alt="" referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : null}
            <span>{user ? (user.displayName?.split(' ')[0] || '我的') : '登录 / 注册'}</span>
            {!user && <span>🔑</span>}
          </button>
        </div>
        {user && (
          <p className="chinese text-white/70 text-sm mt-1">
            你好，{user.displayName || user.email?.split('@')[0] || '朋友'} 👋
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">

        {/* Stats mini card */}
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-deep-blue to-sky-blue flex items-center justify-center text-white font-black text-lg flex-shrink-0">
            {totalLearned}
          </div>
          <div>
            <p className="chinese font-bold text-gray-800">已学 {totalLearned} / {VOCABULARY.length} 词</p>
            <p className="chinese text-gray-400 text-sm">{Math.round((totalLearned / VOCABULARY.length) * 100)}% 完成</p>
          </div>
          <button onClick={() => navigate('/profile')} className="ml-auto text-sky-blue text-sm chinese flex-shrink-0">
            详情 →
          </button>
        </div>

        {/* Menu items */}
        {MENU_ITEMS.map(item => (
          <button
            key={item.id}
            id={`more-${item.id}-btn`}
            onClick={item.onClick}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm
                       hover:shadow-md hover:bg-gray-50 active:scale-[0.98] transition-all text-left border border-gray-100"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
              {item.icon}
            </div>
            <div>
              <p className="chinese font-bold text-gray-800">{item.label}</p>
              <p className="text-gray-400 text-sm">{item.sublabel}</p>
            </div>
            <span className="ml-auto text-gray-300 text-xl">›</span>
          </button>
        ))}

        {/* Community tip */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="chinese font-bold text-gray-800 text-sm mb-1">想建议新词汇？</p>
            <p className="chinese text-gray-600 text-sm leading-relaxed">
              在我们的 WhatsApp 学习群里提问就好！
              群里有管理员和希伯来语母语者，大家一起帮你！
            </p>
            <button
              onClick={() => navigate('/community')}
              className="mt-2 text-[#25D366] text-sm chinese font-semibold"
            >
              加入 WhatsApp 群 →
            </button>
          </div>
        </div>

        {/* Milktea / Ko-fi */}
        <button
          onClick={() => navigate('/support')}
          id="milktea-btn"
          className="w-full rounded-2xl overflow-hidden active:scale-[0.98] transition-all hover:shadow-md"
        >
          <div className="bg-gradient-to-r from-[#FF5E78] to-[#FF8E53] p-4 flex items-center gap-4">
            <div className="text-3xl flex-shrink-0">🧋</div>
            <div className="flex-1 text-left">
              <p className="font-black text-white chinese">请我喝杯奶茶</p>
              <p className="text-white/80 text-sm">支持沙龙希伯继续免费更新！</p>
            </div>
            <span className="text-white/80 text-xl">›</span>
          </div>
        </button>

        {/* Sign out */}
        {user && (
          <button
            onClick={async () => { await signOut(); navigate('/') }}
            className="w-full py-3 rounded-2xl text-red-500 bg-red-50 border border-red-100 chinese font-medium active:scale-95 transition-all hover:bg-red-100"
          >
            退出登录
          </button>
        )}

        <p className="text-center text-gray-300 text-xs chinese pb-2">
          沙龙希伯 v1.0 · 为在以色列的中国朋友而制作 🇮🇱🇨🇳
        </p>
      </div>
    </div>
  )
}
