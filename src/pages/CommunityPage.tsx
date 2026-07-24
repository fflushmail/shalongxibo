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

        {/* ── SUGGEST A WORD (prominent CTA at top) ── */}
        <div className="bg-gradient-to-r from-gold to-yellow-500 rounded-3xl p-5 shadow-lg shadow-gold/20">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl flex-shrink-0">💡</span>
            <div>
              <p className="chinese font-black text-white text-lg leading-tight">建议新词汇</p>
              <p className="chinese text-white/80 text-sm mt-0.5">
                遇到不知道的希伯来语词？告诉我们，我们来帮你！
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/suggest')}
            id="suggest-word-cta-btn"
            className="w-full bg-white text-yellow-700 font-bold py-3 rounded-2xl chinese text-base
                       active:scale-95 transition-all shadow-md"
          >
            📝 我想学这个词 →
          </button>
          <p className="chinese text-white/60 text-xs text-center mt-2">
            在社群中提问，或直接提交给管理员
          </p>
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
                '提问工作和生活中的希伯来语问题',
                '分享学习心得，互相帮助',
                '发现 App 没有的词？在群里提问！',
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
                         active:scale-95 transition-all shadow-lg shadow-green-200"
            >
              立即加入 WhatsApp 群 →
            </a>
          </div>
        </div>

        {/* ── WeChat Group ── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
          <div className="bg-[#07C160] p-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-9 h-9 fill-[#07C160]">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c-.276-.94-.418-1.92-.418-2.93 0-3.83 3.412-6.94 7.617-6.94 0 0 .055 0 .082.003C15.492 4.022 12.32 2.188 8.69 2.188zm-1.53 3.296a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75zm4.378 0a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75zM24 14.37c0-3.382-3.24-6.124-7.23-6.124-4.006 0-7.23 2.742-7.23 6.124 0 3.382 3.224 6.123 7.23 6.123.836 0 1.636-.13 2.373-.358a.717.717 0 0 1 .611.082l1.58.924a.268.268 0 0 0 .14.047c.135 0 .244-.11.244-.246a.411.411 0 0 0-.04-.176l-.326-1.23a.49.49 0 0 1 .18-.555C23.07 18.18 24 16.37 24 14.37zm-9.884-.646a.73.73 0 1 1 0-1.46.73.73 0 0 1 0 1.46zm5.308 0a.73.73 0 1 1 0-1.46.73.73 0 0 1 0 1.46z"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-xl">微信群</p>
                <p className="text-white/80 text-sm chinese">沙龙希伯 WeChat</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center mb-4">
              <p className="text-4xl mb-2">📱</p>
              <p className="chinese text-gray-400 text-sm">微信群二维码即将上线</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="chinese text-gray-500 text-sm">微信搜索管理员：</p>
              <p className="font-bold text-deep-blue text-lg mt-1">ShalongXibo</p>
              <p className="chinese text-gray-400 text-xs mt-1">（功能即将开放）</p>
            </div>
          </div>
        </div>

        {/* ── Second suggest CTA at bottom ── */}
        <div className="glass-card p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🗣️</span>
            <div className="flex-1">
              <p className="chinese font-bold text-gray-800 mb-1">遇到不认识的词？</p>
              <p className="chinese text-gray-500 text-sm mb-3">
                直接提交给我们的管理员，我们会把它加入词库！
              </p>
              <button
                onClick={() => navigate('/suggest')}
                className="btn-primary chinese text-sm py-2.5 w-full"
              >
                💡 建议新词汇 →
              </button>
            </div>
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
