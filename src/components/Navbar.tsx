import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',          icon: '🏠', label: '首页'   },
  { to: '/cards',     icon: '🃏', label: '单词卡'  },
  { to: '/games',     icon: '🎮', label: '游戏'   },
  { to: '/quiz',      icon: '🧠', label: '测验'   },
  { to: '/more',      icon: '☰',  label: '更多'   },
]

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 safe-bottom">
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl shadow-deep-blue/10">
        <div className="flex justify-around items-center px-1 pt-1.5 pb-1">
          {TABS.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  isActive
                    ? 'text-deep-blue bg-sky-blue/10'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    {tab.icon}
                  </span>
                  <span className={`text-[10px] font-medium chinese leading-none ${isActive ? 'text-deep-blue' : ''}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gold rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
