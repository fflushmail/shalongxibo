/**
 * Global audio manager to guarantee that playing audio is immediately
 * stopped and reset when navigating, advancing flashcards, or unmounting.
 */

let activeAudio: HTMLAudioElement | null = null

export function registerActiveAudio(audio: HTMLAudioElement) {
  if (activeAudio && activeAudio !== audio) {
    stopAllAudio()
  }
  activeAudio = audio
}

export function stopAllAudio() {
  if (activeAudio) {
    try {
      activeAudio.pause()
      activeAudio.currentTime = 0
    } catch (e) {
      console.warn('[AudioManager] Failed to stop audio:', e)
    }
    activeAudio = null
  }
}
