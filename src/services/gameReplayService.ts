// ── Types ──────────────────────────────────────────────────────────────────
export interface QuestionRecord {
  questionIndex: number
  hebrewWord: string      // The Hebrew word that was shown
  romanized: string       // Romanization shown alongside
  hanziPhonetic: string   // Phonetic hint shown
  correctAnswer: string   // The correct hanzi
  selectedAnswer: string  // What the user picked
  options: string[]       // Full list of 4 choices shown to the player
  timeToAnswerMs: number  // ms elapsed from question appearing to answer
  wasCorrect: boolean
}

export interface GameReplay {
  id: string
  userId: string
  displayName: string
  avatarEmoji: string     // human-style emoji (never 🤖)
  score: number
  totalQuestions: number
  accuracy: number
  avgResponseMs: number
  questions: QuestionRecord[]
  createdAt: number
}

const LOCAL_REPLAYS_KEY = 'shalong_local_game_replays'

// Human-style avatar emojis — never show a robot for real players
const HUMAN_AVATARS = ['🧑', '👨', '👩', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🏫', '👤']

export function randomHumanAvatar(): string {
  return HUMAN_AVATARS[Math.floor(Math.random() * HUMAN_AVATARS.length)]
}

// ── Save a replay locally in localStorage ──────────────────────────────────
export async function saveReplay(
  userId: string,
  displayName: string,
  questions: QuestionRecord[],
): Promise<void> {
  try {
    const score = questions.filter(q => q.wasCorrect).length
    const accuracy = questions.length > 0 ? score / questions.length : 0
    const avgResponseMs =
      questions.reduce((sum, q) => sum + q.timeToAnswerMs, 0) / (questions.length || 1)

    const newReplay: GameReplay = {
      id: 'replay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
      displayName: displayName || '学习者',
      avatarEmoji: randomHumanAvatar(),
      score,
      totalQuestions: questions.length,
      accuracy,
      avgResponseMs,
      questions,
      createdAt: Date.now(),
    }

    const saved = localStorage.getItem(LOCAL_REPLAYS_KEY)
    const list: GameReplay[] = saved ? JSON.parse(saved) : []
    // Keep last 30 replays
    list.unshift(newReplay)
    if (list.length > 30) list.length = 30
    localStorage.setItem(LOCAL_REPLAYS_KEY, JSON.stringify(list))
  } catch (err) {
    console.warn('Failed to save local replay:', err)
  }
}

// ── Fetch a random replay from local history ──────────────────────────────
export async function fetchRandomReplay(_currentUserId: string): Promise<GameReplay | null> {
  try {
    const saved = localStorage.getItem(LOCAL_REPLAYS_KEY)
    if (!saved) return null
    const list: GameReplay[] = JSON.parse(saved)
    if (!Array.isArray(list) || list.length === 0) return null

    // Pick a random replay
    const chosen = list[Math.floor(Math.random() * list.length)]
    return chosen
  } catch (err) {
    console.warn('Failed to fetch local replay:', err)
    return null
  }
}

// ── Generate a realistic fake human username (fallback) ───────────────────
const FAKE_NAMES = [
  '王小明', '李华', '张伟', '陈亮', '刘波',
  '杨帆', '赵磊', '孙明', '周强', '吴涛',
  '小静', '阿雅', '芳芳', '志强', '建国',
  '阿龙', '海燕', '晓东', '婷婷', '文博',
]

export function fakeBotName(): string {
  return FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]
}
