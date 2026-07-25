import { useNavigate } from 'react-router-dom'

export default function SupportPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF5E78] to-[#FF8E53] px-5 page-header safe-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white/80 text-2xl">‹</button>
          <div>
            <h1 className="chinese text-white font-black text-2xl">🧋 请我喝杯奶茶</h1>
            <p className="text-white/70 text-sm">支持沙龙希伯 · Buy Me a Milk Tea</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Chinese explanation */}
        <div className="px-5 py-4 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="chinese text-gray-800 font-bold text-base mb-2">
              沙龙希伯是完全免费的！🎉
            </p>
            <p className="chinese text-gray-600 text-sm leading-relaxed">
              这个应用是我们用心为在以色列的中国朋友制作的，
              完全免费使用。如果它帮助了你，可以请我们喝杯奶茶表示支持！
              你的每一份支持都让我们能继续更新和改进这个应用。
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="chinese text-amber-800 text-sm leading-relaxed">
              ☕ 下面的页面是英文的，点击 <strong>"Support"</strong> 或
              <strong> "Buy X a coffee"</strong> 按钮就可以捐款了。
              你可以选择捐多少，不强制！
            </p>
          </div>
        </div>

        {/* Ko-fi iframe */}
        <div className="px-5">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <iframe
              id="kofiframe"
              src="https://ko-fi.com/ailixibo/?hidefeed=true&widget=true&embed=true&preview=true"
              style={{
                border: 'none',
                width: '100%',
                padding: '4px',
                background: '#f9f9f9',
              }}
              height="712"
              title="ailixibo"
            />
          </div>
        </div>

        {/* Footer note */}
        <div className="px-5 pt-4">
          <p className="chinese text-gray-400 text-xs text-center">
            谢谢你的支持！你的每一杯奶茶都是对我们最大的鼓励 🧋❤️
          </p>
        </div>
      </div>
    </div>
  )
}
