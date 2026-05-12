'use client'

import { init } from '@telegram-apps/sdk'

export type TelegramUser = {
  id: number
  first_name: string
  username?: string
  photo_url?: string
}

export function getTelegramUser(): TelegramUser | null {
  try {
    init()

    const tg = window.Telegram?.WebApp

    if (!tg) {
      return null
    }

    return tg.initDataUnsafe?.user || null
  } catch {
    return null
  }
}