import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

const PROGRESS_KEY = 'shalong_xibo_progress'
const STATS_KEY    = 'shalong_xibo_stats'

interface QuizStats {
  totalQuizzes: number
  bestScore: number
  totalQuestions: number
  correctQuestions: number
}

interface ProgressContextType {
  learnedIds: Set<string>
  markLearned: (id: string) => void
  unmarkLearned: (id: string) => void
  isLearned: (id: string) => boolean
  totalLearned: number
  streak: number
  quizStats: QuizStats
  recordQuizResult: (score: number, total: number) => void
  resetAllProgress: () => void
}

const ProgressContext = createContext<ProgressContextType | null>(null)

function getTodayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function calculateStreak(lastDate: string | null, currentStreak: number): { streak: number; todayDate: string } {
  const today = getTodayString()
  if (!lastDate) return { streak: 1, todayDate: today }
  if (lastDate === today) return { streak: currentStreak, todayDate: today }

  const last = new Date(lastDate)
  const now = new Date(today)
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return { streak: currentStreak + 1, todayDate: today }
  } else {
    // Streak broken
    return { streak: 1, todayDate: today }
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  // 1. Learned words
  const [learnedIds, setLearnedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  // 2. Streak & study stats
  const [streak, setStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.streak || 1
      }
    } catch {}
    return 1
  })

  // 3. Quiz stats
  const [quizStats, setQuizStats] = useState<QuizStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.quizStats || { totalQuizzes: 0, bestScore: 0, totalQuestions: 0, correctQuestions: 0 }
      }
    } catch {}
    return { totalQuizzes: 0, bestScore: 0, totalQuestions: 0, correctQuestions: 0 }
  })

  // Update streak on app start
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY)
      const parsed = saved ? JSON.parse(saved) : {}
      const lastDate = parsed.lastDate || null
      const currentStreak = parsed.streak || 0

      const updated = calculateStreak(lastDate, currentStreak)
      setStreak(updated.streak)

      localStorage.setItem(
        STATS_KEY,
        JSON.stringify({
          ...parsed,
          streak: updated.streak,
          lastDate: updated.todayDate,
        })
      )
    } catch (err) {
      console.warn('Failed to update streak:', err)
    }
  }, [])

  // Persist learned words directly to localStorage
  const persistLearned = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify([...ids]))
    } catch (err) {
      console.warn('Failed to persist progress:', err)
    }
  }, [])

  const markLearned = useCallback((id: string) => {
    setLearnedIds(prev => {
      const next = new Set(prev)
      next.add(id)
      persistLearned(next)
      return next
    })
  }, [persistLearned])

  const unmarkLearned = useCallback((id: string) => {
    setLearnedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      persistLearned(next)
      return next
    })
  }, [persistLearned])

  const isLearned = useCallback((id: string) => learnedIds.has(id), [learnedIds])

  // Record quiz result
  const recordQuizResult = useCallback((score: number, total: number) => {
    setQuizStats(prev => {
      const next: QuizStats = {
        totalQuizzes: prev.totalQuizzes + 1,
        bestScore: Math.max(prev.bestScore, score),
        totalQuestions: prev.totalQuestions + total,
        correctQuestions: prev.correctQuestions + score,
      }
      try {
        const saved = localStorage.getItem(STATS_KEY)
        const parsed = saved ? JSON.parse(saved) : {}
        localStorage.setItem(
          STATS_KEY,
          JSON.stringify({
            ...parsed,
            quizStats: next,
          })
        )
      } catch {}
      return next
    })
  }, [])

  // Reset all progress
  const resetAllProgress = useCallback(() => {
    setLearnedIds(new Set())
    setStreak(1)
    setQuizStats({ totalQuizzes: 0, bestScore: 0, totalQuestions: 0, correctQuestions: 0 })
    localStorage.removeItem(PROGRESS_KEY)
    localStorage.removeItem(STATS_KEY)
  }, [])

  return (
    <ProgressContext.Provider
      value={{
        learnedIds,
        markLearned,
        unmarkLearned,
        isLearned,
        totalLearned: learnedIds.size,
        streak,
        quizStats,
        recordQuizResult,
        resetAllProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
