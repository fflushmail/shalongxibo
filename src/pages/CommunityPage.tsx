import { useNavigate } from 'react-router-dom'

const whatsappUrl = 'https://chat.whatsapp.com/CzP0TemXmRuGybBstuhmZg'

export default function CommunityPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-full flex flex-col bg-sand">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-sky-blue px-5 pt-12 pb-8 safe-top">
        <h1 className="chinese text-white font-black text-2xl">🌐 学习社区</h1>
        <p className="chinese text-white/70 text-sm mt-1">和其他中国朋友一起学希伯来语！</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">

        {/* ── Suggest a Word — prominent CTA ── */}
        <div className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] rounded-3xl p-5 shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl flex-shrink-0">💡</span>
            <div>
              <p className="chinese font-black text-white text-lg leading-tight">想学某个词？</p>
              <p className="chinese text-white/85 text-sm mt-1">
                在 WhatsApp 群里提问！群里有管理员和其他同学帮你。
              </p>
            </div>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="suggest-word-whatsapp-btn"
            className="flex items-center justify-center gap-2 w-full bg-white text-[#92400E] font-bold py-3 rounded-2xl chinese text-base
                       active:scale-95 transition-all shadow-md hover:bg-amber-50"
          >
            💬 去 WhatsApp 群提问 →
          </a>
        </div>

        {/* ── WhatsApp Group ── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
          <div className="bg-[#25D366] p-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-9 h-9 fill-[#25D366]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-xl">WhatsApp 群</p>
                <p className="text-white/80 text-sm chinese">沙龙希伯学习群</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <ul className="space-y-2 mb-5">
              {[
                '和其他在以色列工作的中国朋友互动',
                '群里有希伯来语母语者，可以直接提问！',
                '提问工作和生活中的希伯来语问题',
                '分享学习心得，互相帮助',
                '想学新词？直接在群里问管理员！',
              ].map((item, i) => (
                <li key={i} className="chinese text-gray-600 text-sm flex gap-2">
                  <span className="text-[#25D366] flex-shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="whatsapp-join-btn"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl
                         bg-[#25D366] text-white font-bold chinese text-base
                         active:scale-95 transition-all shadow-lg shadow-green-200 hover:bg-[#22C55E]"
            >
              立即加入 WhatsApp 群 →
            </a>
          </div>
        </div>

        {/* Community rules */}
        <div className="glass-card p-5">
          <p className="chinese font-bold text-gray-700 mb-3">📋 群规</p>
          {[
            '请用中文或希伯来语交流',
            '互相尊重，友善交流',
            '可以分享学习希伯来语相关内容',
            '禁止广告和无关信息',
            '如有问题欢迎提问，大家互相帮助！',
          ].map((rule, i) => (
            <p key={i} className="chinese text-gray-600 text-sm flex gap-2 mb-1.5">
              <span className="text-sky-blue flex-shrink-0">{i + 1}.</span>{rule}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
