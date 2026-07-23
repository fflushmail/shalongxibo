import { useRef, useState, useCallback } from 'react'

interface AudioPlayerProps {
  url: string
  size?: 'sm' | 'md' | 'lg'
}

export default function AudioPlayer({ url, size = 'md' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-xl',
  }

  const play = useCallback(async () => {
    if (!url) return
    setError(false)

    if (!audioRef.current) {
      audioRef.current = new Audio(url)
      audioRef.current.onended = () => setPlaying(false)
      audioRef.current.onerror = () => { setPlaying(false); setError(true) }
    }

    if (playing) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
    } else {
      try {
        audioRef.current.src = url
        await audioRef.current.play()
        setPlaying(true)
      } catch {
        setError(true)
        setPlaying(false)
      }
    }
  }, [url, playing])

  if (!url) return null

  return (
    <button
      onClick={(e) => { e.stopPropagation(); play() }}
      className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center
        transition-all duration-200 active:scale-90 focus:outline-none
        ${error
          ? 'bg-red-100 text-red-400'
          : playing
          ? 'bg-sky-blue text-white shadow-lg shadow-sky-blue/40'
          : 'bg-deep-blue/10 text-deep-blue hover:bg-deep-blue/20'
        }`}
      aria-label="播放音频"
      title="播放 / Play"
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
