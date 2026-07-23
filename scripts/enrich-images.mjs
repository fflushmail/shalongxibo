#!/usr/bin/env node
/**
 * Unsplash Image Enrichment Script
 * 
 * Usage: node scripts/enrich-images.mjs
 * 
 * This script reads Word_data.csv, queries the Unsplash API for each word,
 * and outputs an enriched JSON file at public/vocabulary.json with imageUrl populated.
 * 
 * Set UNSPLASH_ACCESS_KEY in your .env.local before running.
 * Get a free key at: https://unsplash.com/developers
 * 
 * Free plan: 50 requests/hour — the script batches and rate-limits automatically.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// Load .env.local manually
const envPath = path.join(ROOT, '.env.local')
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const [k, v] = line.split('=')
    if (k && v) process.env[k.trim()] = v.trim()
  }
}

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY
if (!UNSPLASH_KEY) {
  console.error('❌ Missing UNSPLASH_ACCESS_KEY in .env.local')
  console.error('   Get a free key at https://unsplash.com/developers')
  process.exit(1)
}

const DELAY_MS = 1300 // ~46 req/min to stay under 50/hour free limit
const CACHE_PATH = path.join(ROOT, 'scripts', 'image-cache.json')
const OUT_PATH = path.join(ROOT, 'public', 'vocabulary.json')
const CSV_PATH = path.join(ROOT, 'Word_data.csv')

// Fallback search terms per topic
const TOPIC_FALLBACKS = {
  greetings: 'hello handshake',
  daily: 'everyday life',
  food: 'fresh food',
  work: 'construction work',
  numbers: 'numbers math',
  slang: 'friends talking',
  shopping: 'market shopping',
  transportation: 'bus train',
  health: 'medical health',
  emergency: 'emergency siren',
  directions: 'street map',
  rules: 'sign rules',
  verbs: 'action people',
  money: 'coins currency',
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  // Header: difficulty,image,romanized,,audio_recording,translation_hanzi,topic,pronunciation_hanzi,explanation,id,...
  const words = []
  for (let i = 1; i < lines.length; i++) {
    // Parse respecting quoted fields
    const cols = []
    let cur = ''
    let inQ = false
    for (const ch of lines[i]) {
      if (ch === '"') { inQ = !inQ; continue }
      if (ch === ',' && !inQ) { cols.push(cur); cur = ''; continue }
      cur += ch
    }
    cols.push(cur)
    if (cols.length < 10) continue
    words.push({
      difficulty: cols[0]?.trim() || 'beginner',
      imageUrl: cols[1]?.trim() || '',
      romanized: cols[2]?.trim() || '',
      audioUrl: cols[4]?.trim() || '',
      hebrew: cols[5]?.trim() || '',
      topic: cols[6]?.trim() || 'daily',
      hanziPhonetic: cols[7]?.trim() || '',
      explanation: cols[8]?.trim() || '',
      id: cols[9]?.trim() || `word-${i}`,
      hanzi: cols[5]?.trim() || '',
      // Note: the CSV format has translation_hanzi at index 5 — we re-read carefully
    })
  }
  return words
}

// Re-parse with correct column mapping from actual CSV structure
function parseCSVCorrect(text) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  const words = []
  for (let i = 1; i < lines.length; i++) {
    const cols = []
    let cur = ''
    let inQ = false
    for (const ch of lines[i]) {
      if (ch === '"') { inQ = !inQ; continue }
      if (ch === ',' && !inQ) { cols.push(cur); cur = ''; continue }
      cur += ch
    }
    cols.push(cur)
    if (cols.length < 10) continue
    // difficulty[0], image[1], romanized[2], ???[3], audio[4], hebrew[5], topic[6], hanziPhonetic[7], explanation[8], id[9]
    // Wait — translation_hanzi is actually separate from hebrew. Let's check CSV header again.
    // Header: difficulty,image,romanized,,audio_recording,translation_hanzi,topic,pronunciation_hanzi,explanation,id
    // So: col[5] = translation_hanzi (Chinese meaning), col[4] = audio_recording (which is the Hebrew URL)
    // But audio_recording IS the audio URL, and translation_hanzi is the Chinese
    // The hebrew word itself appears in the audio URL filename...
    // Actually looking at line 2: intermediate,,ahi,[audio_url],אחי,兄弟,slang,...
    // So col[2]=romanized, col[3]=empty, col[4]=audio_url, col[5]=hebrew(אחי), col[6]=hanzi(兄弟), col[7]=topic... wait
    // Let me re-read the header more carefully:
    // difficulty,image,romanized,,audio_recording,translation_hanzi,topic,pronunciation_hanzi,explanation,id
    // col[0]=difficulty, col[1]=image, col[2]=romanized, col[3]=(empty), col[4]=audio_recording(URL), col[5]=translation_hanzi(Hebrew word), col[6]=hanzi(Chinese), col[7]=topic, col[8]=pronunciation_hanzi, col[9]=explanation, col[10]=id
    // Hmm let me count again from line 2:
    // intermediate,,ahi,https://...אחי.m4a,אחי,兄弟,slang,阿 hi,俚语...,6a3d76bf...
    // col[0]=intermediate, col[1]='', col[2]=ahi, col[3]=https://...url, col[4]=אחי(hebrew), col[5]=兄弟(hanzi), col[6]=slang, col[7]=阿 hi(phonetic), col[8]=explanation, col[9]=id
    // So: difficulty[0], image[1], romanized[2], audioUrl[3], hebrew[4], hanzi[5], topic[6], hanziPhonetic[7], explanation[8], id[9]
    words.push({
      id: cols[9]?.trim() || `word-${i}`,
      difficulty: (cols[0]?.trim() || 'beginner'),
      imageUrl: cols[1]?.trim() || '',
      romanized: cols[2]?.trim() || '',
      audioUrl: cols[3]?.trim() || '',
      hebrew: cols[4]?.trim() || '',
      hanzi: cols[5]?.trim() || '',
      topic: cols[6]?.trim() || 'daily',
      hanziPhonetic: cols[7]?.trim() || '',
      explanation: cols[8]?.trim() || '',
    })
  }
  return words
}

async function fetchUnsplashImage(query, cache) {
  if (cache[query]) return cache[query]
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_KEY}`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`  ⚠️  Unsplash ${res.status} for "${query}"`)
      return ''
    }
    const data = await res.json()
    const imgUrl = data?.urls?.regular || data?.urls?.small || ''
    cache[query] = imgUrl
    return imgUrl
  } catch (err) {
    console.warn(`  ⚠️  Network error for "${query}": ${err.message}`)
    return ''
  }
}

async function main() {
  console.log('🌟 Shalong Xibo — Unsplash Image Enrichment')
  console.log('==========================================')

  const csvText = readFileSync(CSV_PATH, 'utf8')
  const words = parseCSVCorrect(csvText)
  console.log(`📚 Parsed ${words.length} words from CSV`)

  // Load cache
  let cache = {}
  if (existsSync(CACHE_PATH)) {
    cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
    console.log(`💾 Loaded ${Object.keys(cache).length} cached image URLs`)
  }

  let enriched = 0
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    if (word.imageUrl) continue // already has image

    // Build search query: try hanzi first, then romanized, then topic fallback
    const queries = [
      word.hanzi.split(' /')[0].trim(), // primary Chinese meaning
      word.romanized,
      TOPIC_FALLBACKS[word.topic] || word.topic,
    ]

    let found = false
    for (const q of queries) {
      if (!q) continue
      process.stdout.write(`[${i+1}/${words.length}] "${word.romanized}" → searching "${q}"... `)
      const imgUrl = await fetchUnsplashImage(q, cache)
      if (imgUrl) {
        word.imageUrl = imgUrl
        console.log('✅')
        enriched++
        found = true
        await sleep(DELAY_MS)
        break
      }
    }
    if (!found) {
      console.log('❌ no image found')
    }
    // Save cache every 10 words
    if (i % 10 === 0) {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
    }
  }

  // Final save
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  writeFileSync(OUT_PATH, JSON.stringify(words, null, 2))

  console.log('')
  console.log(`✅ Enriched ${enriched} new image URLs`)
  console.log(`📄 Output written to: public/vocabulary.json`)
  console.log(`💾 Cache saved to: scripts/image-cache.json`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
