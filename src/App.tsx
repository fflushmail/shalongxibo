import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
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

export default function App() {
  return (
    <div className="min-h-screen bg-sand flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 overflow-hidden pb-20">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/cards"      element={<Flashcards />} />
          <Route path="/cards/:topic" element={<Flashcards />} />
          <Route path="/quiz"       element={<Quiz />} />
          <Route path="/games"      element={<GamesPage />} />
          <Route path="/dialogues"  element={<DialoguesPage />} />
          <Route path="/topics"     element={<Topics />} />
          <Route path="/alphabet"   element={<AlphabetPage />} />
          <Route path="/community"  element={<CommunityPage />} />
          <Route path="/suggest"    element={<SuggestWord />} />
          <Route path="/more"       element={<MorePage />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/profile"    element={<Profile />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Navbar />
    </div>
  )
}
