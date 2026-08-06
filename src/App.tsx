import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import AuthGate from './components/AuthGate'
import AIChatModal from './components/AIChatModal'
import Home from './pages/Home'
import Flashcards from './pages/Flashcards'
import Quiz from './pages/Quiz'
import Topics from './pages/Topics'
import Login from './pages/Login'
import Profile from './pages/Profile'
import AlphabetPage from './pages/AlphabetPage'
import CommunityPage from './pages/CommunityPage'
import SuggestWord from './pages/SuggestWord'
import MorePage from './pages/MorePage'
import GamesPage from './pages/GamesPage'
import DialoguesPage from './pages/DialoguesPage'
import SupportPage from './pages/SupportPage'

/** All routes except /login are behind the auth gate */
function ProtectedApp() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <AuthGate>
      <div className="min-h-screen bg-sand flex flex-col max-w-lg mx-auto relative">
        <main className="flex-1 overflow-hidden pb-20">
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/cards"      element={<Flashcards />} />
            <Route path="/cards/:topic" element={<Flashcards />} />
            <Route path="/quiz"       element={<Quiz />} />
            <Route path="/games"      element={<GamesPage />} />
            <Route path="/dialogues"  element={<DialoguesPage />} />
            <Route path="/support"    element={<SupportPage />} />
            <Route path="/topics"     element={<Topics />} />
            <Route path="/alphabet"   element={<AlphabetPage />} />
            <Route path="/community"  element={<CommunityPage />} />
            <Route path="/suggest"    element={<SuggestWord />} />
            <Route path="/more"       element={<MorePage />} />
            <Route path="/profile"    element={<Profile />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Navbar />

        {/* Floating AI Tutor button — above navbar */}
        <button
          id="ai-tutor-fab"
          onClick={() => setChatOpen(true)}
          aria-label="问 AI 导师"
          className="fixed bottom-24 right-4 z-40
                     bg-gradient-to-br from-deep-blue to-sky-blue text-white
                     rounded-2xl px-4 py-3 shadow-xl shadow-deep-blue/30
                     flex items-center gap-2
                     hover:brightness-110 hover:shadow-2xl hover:-translate-y-0.5
                     active:scale-95 transition-all duration-200"
          style={{ maxWidth: 'calc(min(100vw, 512px) - 2rem)' }}
        >
          <span className="text-xl leading-none">💬</span>
          <span className="chinese font-bold text-sm whitespace-nowrap">问 AI 导师</span>
        </button>

        {/* Chat modal (portal-like, rendered in DOM but z-indexed above everything) */}
        {chatOpen && <AIChatModal onClose={() => setChatOpen(false)} />}
      </div>
    </AuthGate>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Login is public — no auth gate */}
      <Route path="/login" element={
        <div className="min-h-screen bg-sand flex flex-col max-w-lg mx-auto relative">
          <main className="flex-1 overflow-hidden">
            <Login />
          </main>
        </div>
      } />
      {/* Everything else requires login */}
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  )
}
