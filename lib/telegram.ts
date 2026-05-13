declare global {

  interface Window {

    Telegram?: {

      WebApp?: any

    }

  }

}

'use client'

import { init } from '@telegram-apps/sdk'

export type TelegramUser = {

  id: number

  first_name: string

  username?: string

  photo_url?: string

}

export function getTelegramUser(): TelegramUser | null {

  if (typeof window === 'undefined') {

    return null

  }

  try {

    init()

    const tg = window.Telegram?.WebApp

    if (!tg) {

      return {

        id: 1,

        first_name: 'Guest',

      }

    }

    return (

      tg.initDataUnsafe?.user || {

        id: 1,

        first_name: 'Guest',

      }

    )

  } catch {

    return {

      id: 1,

      first_name: 'Guest',

    }

  }

}