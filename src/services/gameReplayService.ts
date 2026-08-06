import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// ── Types ──────────────────────────────────────────────────────────────────
export interface QuestionRecord {
  questionIndex: number
  hebrewWord: string     // The Hebrew word that was shown
  correctAnswer: string  // The correct hanzi
  selectedAnswer: string // What the user picked (or '__bot__' for AI)
  timeToAnswerMs: number // ms elapsed from question appearing to answer
  wasCorrect: boolean
}

export interface GameReplay {
  id: string
  userId: string
  displayName: string   // shown as opponent name in ghost match
  score: number
  totalQuestions: number
  accuracy: number      // 0–1
  avgResponseMs: number
  questions: QuestionRecord[]
  createdAt: Timestamp | null
}

const REPLAYS_COL = 'game_replays'

// ── Save a replay after a match ───────────────────────────────────────────
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

    await addDoc(collection(db, REPLAYS_COL), {
      userId,
      displayName,
      score,
      totalQuestions: questions.length,
      accuracy,
      avgResponseMs,
      questions,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    // Non-fatal — replay saving should never break gameplay
    console.warn('Failed to save replay:', err)
  }
}

// ── Fetch a random replay from another user ───────────────────────────────
export async function fetchRandomReplay(currentUserId: string): Promise<GameReplay | null> {
  try {
    // Fetch up to 20 recent replays from other users
    const q = query(
      collection(db, REPLAYS_COL),
      where('userId', '!=', currentUserId),
      orderBy('userId'),          // required for inequality filter
      orderBy('createdAt', 'desc'),
      limit(20),
    )
    const snap = await getDocs(q)
    if (snap.empty) return null

    // Pick a random one from the results
    const docs = snap.docs
    const chosen = docs[Math.floor(Math.random() * docs.length)]
    const data = chosen.data()

    return {
      id: chosen.id,
      userId: data.userId,
      displayName: data.displayName || '真实玩家',
      score: data.score ?? 0,
      totalQuestions: data.totalQuestions ?? 0,
      accuracy: data.accuracy ?? 0.75,
      avgResponseMs: data.avgResponseMs ?? 2500,
      questions: data.questions ?? [],
      createdAt: data.createdAt ?? null,
    } satisfies GameReplay
  } catch (err) {
    console.warn('Failed to fetch replay:', err)
    return null
  }
}

// ── Generate a realistic fake bot username (fallback) ────────────────────
const FAKE_NAMES = [
  '王小明', '李华', '张伟', '陈亮', '刘波',
  '杨帆', '赵磊', '孙明', '周强', '吴涛',
  '郑建国', '冯永', '林晓', '何勇', '谢峰',
]
export function fakeBotName(): string {
  return FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]
}
