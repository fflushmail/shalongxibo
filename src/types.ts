export interface Word {
  id: string
  hebrew: string
  romanized: string
  hanzi: string
  hanziPhonetic: string
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  audioUrl: string
  imageUrl: string
  explanation: string
}

export type Topic =
  | 'greetings'
  | 'daily'
  | 'food'
  | 'work'
  | 'numbers'
  | 'slang'
  | 'shopping'
  | 'transportation'
  | 'health'
  | 'emergency'
  | 'directions'
  | 'rules'
  | 'verbs'
  | 'money'

export interface UserProgress {
  learnedIds: string[]
  lastUpdated: number
}
