import { useState } from 'react'

export default function SuggestWord() {
  const [chineseWord, setChineseWord] = useState('')
  const [context, setContext] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chineseWord.trim()) {
      setError('请输入你想学的中文词语')
      return
    }
    setError('')

    const subject = encodeURIComponent(`沙龙希伯 新词建议：${chineseWord}`)
    const body = encodeURIComponent(
`亲爱的沙龙希伯管理员，

有用户建议添加以下词汇：

━━━━━━━━━━━━━━━━
用户想学的词：${chineseWord}
使用场景说明：${context || '（未填写）'}
提交者：${submitterName || '匿名用户'}
━━━━━━━━━━━━━━━━

请添加对应的希伯来语翻译、发音和音频，谢谢！

（此邮件由沙龙希伯 App 自动生成）`
    )

    window.location.href = `mailto:elianahaddad12@gmail.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  const reset = () => {
    setChineseWord(''); setContext(''); setSubmitterName(''); setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 bg-sand text-center">
        <div className="text-6xl mb-4">📧</div>
        <h2 className="chinese font-black text-deep-blue text-2xl mb-3">谢谢你！</h2>
        <p className="chinese text-gray-500 mb-2 leading-relaxed">
          你的邮件应用已经打开了，<br />请点击发送！
        </p>
        <p className="chinese text-gray-400 text-sm mb-8">
          管理员会检查你建议的词，<br />通过审核后就会加入到 App 里！
        </p>
        <button onClick={reset} className="btn-primary chinese w-full max-w-xs">
          再提交一个 →
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 pt-12 pb-6 safe-top">
        <h1 className="chinese text-white font-black text-2xl">💡 建议新词汇</h1>
        <p className="chinese text-white/70 text-sm mt-1">有想学的词语？告诉我们！</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-10 flex flex-col items-center">

        {/* Simple illustration */}
        <div className="text-7xl mb-4 mt-2">🗣️</div>

        <div className="glass-card p-5 mb-6 w-full">
          <p className="chinese text-gray-700 text-base leading-relaxed text-center">
            在以色列工作中遇到了<strong>不知道怎么说</strong>的词？<br />
            告诉我们，我们来帮你！
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 w-full">

          {/* MAIN: Just the Chinese word */}
          <div>
            <label className="chinese text-base font-bold text-gray-700 mb-2 block text-center">
              你想学什么词？ <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={chineseWord}
              onChange={e => setChineseWord(e.target.value)}
              required
              autoFocus
              placeholder="例：电梯、安全帽、工资..."
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-sky-blue
                         outline-none bg-white text-gray-800 transition-colors chinese text-xl text-center"
            />
            <p className="chinese text-gray-400 text-xs text-center mt-2">
              用中文写就好，不需要写希伯来语
            </p>
          </div>

          {/* Optional: Context */}
          <div>
            <label className="chinese text-sm font-medium text-gray-600 mb-2 block">
              在哪里用到这个词？（选填）
            </label>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder={'例：在工地上想说"小心！"但不知道希伯来语怎么说...'}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-sky-blue
                         outline-none bg-white text-gray-700 transition-colors chinese resize-none text-sm"
            />
          </div>

          {/* Optional: Name */}
          <div>
            <label className="chinese text-sm font-medium text-gray-600 mb-2 block">
              你的名字（选填）
            </label>
            <input
              type="text"
              value={submitterName}
              onChange={e => setSubmitterName(e.target.value)}
              placeholder="可以匿名"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-sky-blue
                         outline-none bg-white text-gray-700 transition-colors chinese"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="chinese text-red-600 text-sm">⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            id="submit-suggestion-btn"
            className="btn-primary w-full chinese text-lg py-4"
          >
            📧 发送给管理员
          </button>

          <p className="chinese text-gray-300 text-xs text-center">
            点击后会打开你的邮件应用，发送给管理员即可。<br />
            我们会尽快把这个词加入 App！
          </p>
        </form>
      </div>
    </div>
  )
}
