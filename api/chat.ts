import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `You are an encouraging, friendly Hebrew language tutor named "ShalongXibo Teacher" (沙龙西伯 老师) inside the ShalongXibo app. You teach basic Hebrew to Chinese speakers working and living in Israel.

Rules:
- Always reply in Simplified Chinese (简体中文).
- Keep answers concise and mobile-friendly (short paragraphs).
- Whenever you explain a Hebrew word or phrase, always include:
  1. The Hebrew text (e.g., שלום)
  2. Romanized pronunciation (e.g., Shalom)
  3. Chinese Hanzi phonetics / 汉字谐音 (e.g., 沙龙)
  4. Chinese meaning (e.g., 你好 / 平安)
- Be warm, encouraging, and supportive — many learners are nervous beginners.
- If asked about greetings, numbers, directions, shopping, or work phrases, always give practical examples.
- Emoji are welcome to make responses friendly on mobile screens.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — allow WeChat webview and any origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages } = req.body ?? {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  const apiKey     = process.env.AI_API_KEY
  const apiBase    = process.env.AI_API_BASE_URL  ?? 'https://api.deepseek.com/v1'
  const model      = process.env.AI_MODEL         ?? 'deepseek-chat'

  if (!apiKey) {
    console.error('[chat] AI_API_KEY not set')
    return res.status(500).json({ error: 'AI service not configured' })
  }

  try {
    const upstream = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens:  600,
        temperature: 0.75,
      }),
    })

    const data = await upstream.json() as {
      choices?: { message: { content: string } }[]
      error?:   { message: string }
    }

    if (!upstream.ok) {
      console.error('[chat] upstream error:', data.error)
      return res.status(upstream.status).json({ error: data.error?.message ?? 'AI API error' })
    }

    const content = data.choices?.[0]?.message?.content ?? ''
    return res.status(200).json({ content })
  } catch (err) {
    console.error('[chat] fetch failed:', err)
    return res.status(500).json({ error: 'Network error reaching AI service' })
  }
}
