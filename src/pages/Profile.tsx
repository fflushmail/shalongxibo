import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProgress } from '../contexts/ProgressContext'
import { VOCABULARY, TOPIC_META } from '../data/vocabulary'

export default function Profile() {
  const { user, updateDisplayName } = useAuth()
  const { learnedIds, totalLearned, streak, quizStats, resetAllProgress } = useProgress()
  const navigate = useNavigate()

  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(user?.displayName || '学习者')

  const total = VOCABULARY.length
  const pct = Math.round((totalLearned / total) * 100)

  const topicStats = [...new Set(VOCABULARY.map(w => w.topic))].map(topic => {
    const words = VOCABULARY.filter(w => w.topic === topic)
    const learned = words.filter(w => learnedIds.has(w.id)).length
    return { topic, total: words.length, learned }
  }).sort((a, b) => b.learned - a.learned)

  const handleSaveName = () => {
    updateDisplayName(nameInput)
    setIsEditingName(false)
  }

  const handleReset = () => {
    if (window.confirm('确定要清除所有学习记录吗？此操作将重置已背单词与测验成绩。')) {
      resetAllProgress()
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-br from-deep-blue to-sky-blue px-5 page-header safe-top">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl overflow-hidden shadow-inner flex-shrink-0">
            <span>👤</span>
          </div>
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="bg-white/20 text-white rounded-lg px-2.5 py-1 text-base font-bold focus:outline-none focus:bg-white/30 w-32 chinese"
                  maxLength={12}
                />
                <button
                  onClick={handleSaveName}
                  className="bg-gold text-white text-xs px-2.5 py-1 rounded-lg font-bold chinese active:scale-95"
                >
                  保存
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-white font-black text-xl truncate chinese">{user?.displayName || '学习者'}</p>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-white/60 hover:text-white text-xs chinese bg-white/10 px-2 py-0.5 rounded-full"
                >
                  ✏️ 修改
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white/80 text-xs chinese">📱 本机离线档案</span>
              <span className="text-gold font-bold text-xs">🔥 连续 {streak} 天</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Overall progress */}
        <div className="glass-card p-5 mb-4 shadow-sm">
          <p className="chinese font-bold text-gray-700 mb-4 flex items-center justify-between">
            <span>📊 学习总览</span>
            <span className="text-xs text-sky-blue font-normal">已掌握 {totalLearned} / {total} 词</span>
          </p>
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
            <div className="flex-1">
              <p className="chinese text-3xl font-black text-deep-blue">{totalLearned}</p>
              <p className="chinese text-gray-500 text-xs">总词汇完成度</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold chinese">
                  🔥 连续学习 {streak} 天
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz performance */}
        <div className="glass-card p-4 mb-4 shadow-sm">
          <p className="chinese font-bold text-gray-700 text-sm mb-3">📝 测验战绩</p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-xs text-gray-400 chinese">完成测验</p>
              <p className="text-xl font-black text-deep-blue mt-0.5">{quizStats.totalQuizzes} 次</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-xs text-gray-400 chinese">最高单次得分</p>
              <p className="text-xl font-black text-gold mt-0.5">{quizStats.bestScore} 分</p>
            </div>
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="glass-card p-5 mb-5 shadow-sm">
          <p className="chinese font-bold text-gray-700 mb-4">📚 各分类掌握情况</p>
          <div className="space-y-3">
            {topicStats.slice(0, 10).map(({ topic, total: t, learned }) => {
              const meta = TOPIC_META[topic] || { emoji: '📝', labelZh: topic }
              const p = Math.round((learned / t) * 100)
              return (
                <div key={topic} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{meta.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="chinese text-gray-700 text-xs font-semibold">{meta.labelZh}</span>
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
        <div className="space-y-3 pb-6">
          <button
            onClick={() => navigate('/cards')}
            className="btn-primary w-full chinese shadow-md py-3 text-sm"
          >
            🃏 继续学习单词卡
          </button>
          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-xl text-gray-400 hover:text-red-500 bg-transparent chinese text-xs active:scale-95 transition-all text-center"
          >
            ⚠️ 清除本地学习进度重置
          </button>
        </div>
      </div>
    </div>
  )
}
