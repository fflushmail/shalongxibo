import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const GREETING: Message = {
  role: 'assistant',
  content:
    '你好！我是你的希伯来语 AI 导师 👋\n\n' +
    '有什么想问我的吗？比如：\n' +
    '• "אחי" 是什么意思？\n' +
    '• 怎么用希伯来语打招呼？\n' +
    '• 在超市怎么问价格？\n\n' +
    '尽管问，我随时在！😊',
}

const QUICK_PROMPTS = [
  '"你好" 用希伯来语怎么说？',
  '解释一下 "באסה"',
  '数字 1–10 怎么说？',
  '怎么用希伯来语问路？',
  '工地上常用的词有哪些？',
  '"谢谢" 和 "不客气" 怎么说？',
]

interface Props {
  onClose: () => void
}

export default function AIChatModal({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError(null)

    // Only send last 8 messages to keep context short (avoid token bloat)
    const payload = next.slice(-8).map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: payload }),
      })

      const data = await res.json() as { content?: string; error?: string }

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.content ?? '' }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误'
      setError(`连接失败，请稍后再试。(${msg})`)
      // Remove the optimistically added user message on hard failure
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }, [messages, loading])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Panel */}
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{ height: '88dvh', maxHeight: '88dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-deep-blue to-sky-blue
                          flex items-center justify-center text-xl flex-shrink-0 shadow-md">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <p className="chinese font-black text-gray-900 text-base leading-tight">希伯来语 AI 导师</p>
            <p className="text-gray-400 text-xs">ShalongXibo Teacher · 沙龙西伯 老师</p>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center
                       text-gray-500 hover:bg-gray-200 active:scale-95 transition-all flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-deep-blue to-sky-blue
                                flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5">
                  🤖
                </div>
              )}
              <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-deep-blue text-white rounded-br-md chinese'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md chinese'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-deep-blue to-sky-blue
                              flex items-center justify-center text-sm flex-shrink-0">🤖</div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-400"
                    style={{ animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite` }} />
                ))}
                <span className="chinese text-gray-500 text-xs ml-1">AI 导师正在思考...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-center">
              <p className="chinese text-red-500 text-sm">⚠️ {error}</p>
              <button onClick={() => setError(null)} className="chinese text-red-400 text-xs mt-1 underline">
                关闭
              </button>
            </div>
          )}

          {/* Quick prompts — show only on first message */}
          {messages.length === 1 && !loading && (
            <div className="pt-1">
              <p className="chinese text-gray-400 text-xs mb-2 pl-9">💡 快速提问：</p>
              <div className="flex flex-wrap gap-2 pl-9">
                {QUICK_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => send(p)}
                    className="chinese text-xs bg-sky-blue/10 text-sky-blue border border-sky-blue/20
                               px-3 py-1.5 rounded-full hover:bg-sky-blue/20 active:scale-95 transition-all text-left">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0 safe-bottom">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="问我任何希伯来语问题… (Enter 发送)"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50
                         px-4 py-3 text-sm chinese text-gray-800 placeholder-gray-400
                         focus:outline-none focus:border-sky-blue focus:bg-white transition-all
                         disabled:opacity-50"
              style={{ maxHeight: '120px', minHeight: '44px' }}
              onInput={e => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              id="ai-chat-send-btn"
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-deep-blue to-sky-blue
                         text-white text-xl flex items-center justify-center flex-shrink-0
                         disabled:opacity-40 active:scale-95 hover:brightness-110 transition-all shadow-md"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
