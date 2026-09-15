import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * AuthGate — shows a spinner while Firebase resolves the session.
 *
 * Offline / China firewall resilience:
 * - If Firebase Auth doesn't respond within 7 s, AuthContext sets
 *   `networkUnavailable = true` and `loading = false`.
 * - In that case we show a non-blocking banner and let users access
 *   flashcards, quizzes, and games in guest/offline mode.
 * - Authenticated users who already have a cached session will still
 *   be recognized via Firebase's local persistence.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, networkUnavailable } = useAuth()

  // Still waiting for Firebase to respond
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <img src="/logo.png" alt="沙龙希伯" className="w-16 h-16 rounded-2xl shadow-lg animate-pulse" />
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#2563EB]"
              style={{ animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </div>
        <p className="chinese text-[#64748B] text-sm">正在加载...</p>
      </div>
    )
  }

  // Network unavailable (firewall / offline) — let user in as guest
  if (networkUnavailable && !user) {
    return (
      <>
        {/* Non-blocking offline banner at top */}
        <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white text-center py-2 px-4 text-xs chinese">
          ⚠️ 网络连接受限 — 以离线模式浏览（单词卡、测验、游戏可正常使用）
        </div>
        <div className="pt-9">{children}</div>
      </>
    )
  }

  // Not authenticated and network is fine — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
