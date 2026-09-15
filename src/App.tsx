import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Flashcards from './pages/Flashcards'
import Quiz from './pages/Quiz'
import Topics from './pages/Topics'
import Profile from './pages/Profile'
import AlphabetPage from './pages/AlphabetPage'
import CommunityPage from './pages/CommunityPage'
import SuggestWord from './pages/SuggestWord'
import MorePage from './pages/MorePage'
import GamesPage from './pages/GamesPage'
import DialoguesPage from './pages/DialoguesPage'
import SupportPage from './pages/SupportPage'
import { initDailyNotifications } from './services/notificationService'
import { stopAllAudio } from './utils/audioManager'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // 1. Request notification permissions & setup daily notifications on startup
  useEffect(() => {
    initDailyNotifications()
  }, [])

  // 2. Audio Cleanup: stop all active audio immediately on route changes
  useEffect(() => {
    stopAllAudio()
  }, [location.pathname])

  // 3. Android Back Button listener via @capacitor/app
  useEffect(() => {
    let handle: { remove: () => void } | null = null

    CapApp.addListener('backButton', ({ canGoBack }) => {
      // Immediately kill any playing audio when pressing back
      stopAllAudio()

      // At home root, exit app
      if (location.pathname === '/') {
        CapApp.exitApp()
      } else if (canGoBack || (window.history.state && window.history.state.idx > 0)) {
        navigate(-1)
      } else {
        navigate('/')
      }
    }).then(listener => {
      handle = listener
    })

    return () => {
      if (handle) {
        handle.remove()
      }
    }
  }, [navigate, location.pathname])

  return (
    <div className="min-h-screen bg-sand flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 overflow-hidden pb-20">
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/cards"        element={<Flashcards />} />
          <Route path="/cards/:topic" element={<Flashcards />} />
          <Route path="/quiz"         element={<Quiz />} />
          <Route path="/games"        element={<GamesPage />} />
          <Route path="/dialogues"    element={<DialoguesPage />} />
          <Route path="/support"      element={<SupportPage />} />
          <Route path="/topics"       element={<Topics />} />
          <Route path="/alphabet"     element={<AlphabetPage />} />
          <Route path="/community"    element={<CommunityPage />} />
          <Route path="/suggest"      element={<SuggestWord />} />
          <Route path="/more"         element={<MorePage />} />
          <Route path="/profile"      element={<Profile />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Navbar />
    </div>
  )
}
