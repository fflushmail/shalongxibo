import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/** Shows a full-screen loader while Firebase resolves the session.
 *  Redirects to /login if the user is not authenticated. */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <img src="/logo.png" alt="沙龙希伯" className="w-16 h-16 rounded-2xl shadow-lg animate-pulse" />
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#2563EB]"
              style={{ animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
        <p className="chinese text-[#64748B] text-sm">正在加载...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
