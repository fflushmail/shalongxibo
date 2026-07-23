import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type Tab = 'signin' | 'signup'

export default function Login() {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // ✅ FIXED: use useEffect for navigation, never navigate() in render
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true })
    }
  }, [user, authLoading, navigate])

  if (authLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-sand">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="chinese text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  const ERROR_MESSAGES: Record<string, string> = {
    'auth/user-not-found': '用户不存在，请注册',
    'auth/wrong-password': '密码错误，请重试',
    'auth/email-already-in-use': '该邮箱已注册，请直接登录',
    'auth/weak-password': '密码至少需要6位字符',
    'auth/invalid-email': '邮箱格式不正确',
    'auth/invalid-credential': '邮箱或密码错误',
    'auth/too-many-requests': '尝试次数太多，请稍后再试',
    'auth/network-request-failed': '网络连接失败，请检查网络',
    'auth/popup-blocked': '弹窗被阻止，请允许弹窗后重试',
    'auth/popup-closed-by-user': '登录窗口已关闭',
    'auth/cancelled-popup-request': '登录已取消',
    'auth/operation-not-allowed': '此登录方式未启用，请联系管理员',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'signin') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
      // navigation handled by useEffect above
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || ''
      setError(ERROR_MESSAGES[code] || `登录失败 (${code || '请重试'})`)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      // navigation handled by useEffect above
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || ''
      setError(ERROR_MESSAGES[code] || 'Google 登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-deep-blue to-sky-blue/30 overflow-y-auto">
      {/* Hero top */}
      <div className="pt-14 pb-8 px-6 text-center safe-top">
        <img src="/logo.png" alt="沙龙希伯" className="w-20 h-20 rounded-3xl shadow-2xl mx-auto mb-4 animate-float" />
        <h1 className="chinese text-white font-black text-3xl mb-1">沙龙希伯</h1>
        <p className="text-white/60 text-sm">שָׁלוֹם Shalong Xibo</p>
        <p className="chinese text-white/70 text-sm mt-1">登录以同步你的学习进度</p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-sand rounded-t-[2rem] px-6 pt-8 pb-10">

        {/* Setup reminder */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-6">
          <p className="chinese text-amber-700 text-xs leading-relaxed">
            💡 首次使用？请确保已在 Firebase 控制台中启用 <strong>邮箱/密码</strong> 和 <strong>Google</strong> 登录方式。
          </p>
        </div>

        {/* Tab toggle */}
        <div className="bg-gray-100 rounded-2xl p-1 flex mb-6">
          {(['signin', 'signup'] as Tab[]).map(t => (
            <button
              key={t}
              id={`auth-tab-${t}`}
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2.5 rounded-xl text-sm chinese font-semibold transition-all ${
                tab === t ? 'bg-white text-deep-blue shadow-md' : 'text-gray-500'
              }`}
            >
              {t === 'signin' ? '🔑 登录' : '📝 注册'}
            </button>
          ))}
        </div>

        {/* Google button */}
        <button
          id="google-signin-btn"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full mb-5 py-3.5 rounded-2xl bg-white shadow-md border border-gray-100
                     flex items-center justify-center gap-3 font-semibold text-gray-700
                     active:scale-95 transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="chinese">使用 Google 登录</span>
        </button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-sand px-4 text-gray-400 text-sm chinese">或者用邮箱</span>
          </div>
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="chinese text-sm text-gray-600 mb-1.5 block">邮箱地址</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-sky-blue
                         outline-none bg-white text-gray-800 transition-colors text-base"
            />
          </div>
          <div>
            <label className="chinese text-sm text-gray-600 mb-1.5 block">密码</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              minLength={6}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-sky-blue
                         outline-none bg-white text-gray-800 transition-colors text-base"
            />
            {tab === 'signup' && (
              <p className="chinese text-gray-400 text-xs mt-1 ml-1">密码至少6位字符</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
              <p className="chinese text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            id="submit-auth-btn"
            type="submit"
            disabled={loading}
            className="btn-primary w-full chinese disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                处理中...
              </>
            ) : tab === 'signin' ? '登录' : '创建账号'}
          </button>
        </form>

        {/* Guest continue */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="chinese text-gray-400 text-sm underline active:text-gray-600"
          >
            先不登录，继续使用 →
          </button>
        </div>
      </div>
    </div>
  )
}
