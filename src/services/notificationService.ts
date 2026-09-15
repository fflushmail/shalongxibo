import { LocalNotifications } from '@capacitor/local-notifications'
import { VOCABULARY } from '../data/vocabulary'

const NOTIFICATION_STORAGE_KEY = 'shalong_daily_notifications_enabled'
const NOTIFICATION_ID_BASE = 1000

/**
 * Get random word from VOCABULARY
 */
function getRandomWord() {
  const index = Math.floor(Math.random() * VOCABULARY.length)
  return VOCABULARY[index]
}

/**
 * Check if notifications are enabled in user preferences
 */
export function isDailyNotificationEnabled(): boolean {
  const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
  // Default to true if not explicitly set
  return saved === null ? true : saved === 'true'
}

/**
 * Set user preference for daily notifications
 */
export async function setDailyNotificationEnabled(enabled: boolean): Promise<boolean> {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, String(enabled))
  if (enabled) {
    return await scheduleDailyNotifications()
  } else {
    await cancelDailyNotifications()
    return true
  }
}

/**
 * Cancel existing scheduled daily notifications
 */
export async function cancelDailyNotifications() {
  try {
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications })
    }
  } catch (err) {
    console.warn('[NotificationService] Cancel failed:', err)
  }
}

/**
 * Schedule daily notifications for the upcoming 7 days at 09:00 AM,
 * each with a fresh random vocabulary word.
 */
export async function scheduleDailyNotifications(): Promise<boolean> {
  try {
    // Check permission
    let perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions()
    }
    if (perm.display !== 'granted') {
      console.info('[NotificationService] Notification permission not granted')
      return false
    }

    // Cancel old ones first
    await cancelDailyNotifications()

    // Pre-schedule for the next 7 days at 09:00
    const notifications = []
    const now = new Date()

    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const scheduledDate = new Date()
      scheduledDate.setDate(now.getDate() + dayOffset)
      scheduledDate.setHours(9, 0, 0, 0)

      const word = getRandomWord()
      notifications.push({
        id: NOTIFICATION_ID_BASE + dayOffset,
        title: '沙龙希伯 · 每日希伯来语',
        body: `✨ 今天的新单词：${word.hebrew} (${word.romanized}) - ${word.hanzi}`,
        schedule: {
          at: scheduledDate,
          allowWhileIdle: true,
        },
        sound: undefined,
        smallIcon: 'ic_launcher',
        extra: {
          wordId: word.id,
        },
      })
    }

    await LocalNotifications.schedule({ notifications })
    console.info('[NotificationService] Scheduled 7 days of daily vocabulary notifications')
    return true
  } catch (err) {
    console.warn('[NotificationService] Schedule failed:', err)
    return false
  }
}

/**
 * Send an immediate test notification so user can verify notifications work
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    let perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions()
    }
    if (perm.display !== 'granted') return false

    const word = getRandomWord()
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9999,
          title: '沙龙希伯 · 测试推送',
          body: `✨ 今天的新单词：${word.hebrew} (${word.romanized}) - ${word.hanzi}`,
          schedule: { at: new Date(Date.now() + 1500) },
          smallIcon: 'ic_launcher',
        },
      ],
    })
    return true
  } catch (err) {
    console.warn('[NotificationService] Test notification failed:', err)
    return false
  }
}

/**
 * Initialize on app launch: requests permission and ensures daily schedule is active
 */
export async function initDailyNotifications() {
  if (isDailyNotificationEnabled()) {
    await scheduleDailyNotifications()
  }
}
