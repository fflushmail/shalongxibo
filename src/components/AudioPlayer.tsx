import { useRef, useState, useCallback } from 'react'

interface AudioPlayerProps {
  url: string
  size?: 'sm' | 'md' | 'lg'
}

// Convert github.com raw URLs to raw.githubusercontent.com (CORS-friendly)
function normalizeAudioUrl(url: string): string {
  if (!url) return url
  // Pattern: https://github.com/{user}/{repo}/raw/refs/heads/{branch}/{file}
  // → https://raw.githubusercontent.com/{user}/{repo}/refs/heads/{branch}/{file}
  return url
    .replace(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/raw\/refs\/heads\/([^/]+)\//,
      'https://raw.githubusercontent.com/$1/$2/refs/heads/$3/'
    )
    // Also handle: https://github.com/{user}/{repo}/raw/{branch}/{file}
    .replace(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/raw\/(?!refs)([^/]+)\//,
      'https://raw.githubusercontent.com/$1/$2/$3/'
    )
}

export default function AudioPlayer({ url, size = 'md' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)
  const fixedUrl = normalizeAudioUrl(url)

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-xl',
  }

  const play = useCallback(async () => {
    if (!fixedUrl) return
    setError(false)

    // Stop any currently playing audio
    if (audioRef.current && playing) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
      return
    }

    // Create a fresh Audio instance each time (avoids src reassignment bugs)
    const audio = new Audio(fixedUrl)
    audioRef.current = audio

    audio.onended = () => setPlaying(false)
    audio.onerror = () => { setPlaying(false); setError(true) }

    try {
      await audio.play()
      setPlaying(true)
    } catch (err) {
      console.warn('Audio play failed:', fixedUrl, err)
      setError(true)
      setPlaying(false)
    }
  }, [fixedUrl, playing])

  if (!fixedUrl) return null

  return (
    <button
      onClick={(e) => { e.stopPropagation(); play() }}
      className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center
        transition-all duration-200 active:scale-90 focus:outline-none flex-shrink-0
        ${error
          ? 'bg-red-100 text-red-400 cursor-not-allowed'
          : playing
          ? 'bg-sky-blue text-white shadow-lg shadow-sky-blue/40'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      aria-label="播放音频"
      title={error ? '音频加载失败' : '播放 / Play'}
    >
      {playing && (
        <span className={`audio-ring bg-sky-blue/30 ${sizeClasses[size]} rounded-full absolute`} />
      )}
      <span className="relative z-10">
        {error ? '⚠️' : playing ? '⏸' : '🔊'}
      </span>
    </button>
  )
}
