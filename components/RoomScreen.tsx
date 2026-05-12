'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Session = {
  mode: 'focus' | 'break'
  started_at: string
  duration: number
}

type Props = {
  roomName: string
  session: Session
  onLeave: () => void
  onSwitchMode: () => void
}

export default function RoomScreen({
  roomName,
  session,
  onLeave,
  onSwitchMode,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(session.duration)

  const [stats, setStats] = useState({
    totalHours: 0,
    sessions: 0,
    streak: 0,
  })

  const completedRef = useRef(false)

  const username =
    typeof window !== 'undefined'
      ? localStorage.getItem('focus_username') || ''
      : ''

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    completedRef.current = false

    const interval = setInterval(async () => {
      const start = new Date(session.started_at).getTime()

      const now = Date.now()

      const diff = Math.floor((now - start) / 1000)

      const remaining = session.duration - diff

      if (remaining <= 0) {
        if (
          session.mode === 'focus' &&
          !completedRef.current
        ) {
          completedRef.current = true

          await completeFocusSession()
        }

        onSwitchMode()

        return
      }

      setSecondsLeft(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [session])

  async function loadStats() {
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('username', username)
      .single()

    if (!data) {
      await supabase
        .from('user_stats')
        .insert({
          username,
        })

      return
    }

    setStats({
      totalHours: Math.floor(
        data.total_focus_seconds / 3600
      ),
      sessions: data.completed_sessions,
      streak: data.streak,
    })
  }

  async function completeFocusSession() {
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('username', username)
      .single()

    if (!data) return

    const lastCompleted = data.last_completed_at
      ? new Date(data.last_completed_at)
      : null

    const now = new Date()

    let nextStreak = data.streak

    if (lastCompleted) {
      const diff =
        now.getTime() - lastCompleted.getTime()

      const days = Math.floor(
        diff / (1000 * 60 * 60 * 24)
      )

      if (days >= 1 && days <= 2) {
        nextStreak += 1
      }

      if (days > 2) {
        nextStreak = 1
      }
    } else {
      nextStreak = 1
    }

    await supabase
      .from('user_stats')
      .update({
        total_focus_seconds:
          data.total_focus_seconds + 1500,

        completed_sessions:
          data.completed_sessions + 1,

        streak: nextStreak,

        last_completed_at:
          new Date().toISOString(),
      })
      .eq('username', username)

    await loadStats()
  }

  const minutes = Math.floor(secondsLeft / 60)

  const seconds = secondsLeft % 60

  const formatted = `${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`

  const isFocus = session.mode === 'focus'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
      <div className="mb-10 flex gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Streak
          </p>

          <h2 className="mt-2 text-3xl font-semibold">
            {stats.streak}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Sessions
          </p>

          <h2 className="mt-2 text-3xl font-semibold">
            {stats.sessions}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Hours
          </p>

          <h2 className="mt-2 text-3xl font-semibold">
            {stats.totalHours}
          </h2>
        </div>
      </div>

      <div className="relative flex h-[340px] w-[340px] items-center justify-center rounded-full border border-neutral-800 bg-neutral-950 shadow-[0_0_120px_rgba(34,197,94,0.15)]">
        <div className="absolute h-[280px] w-[280px] rounded-full bg-green-500/10 blur-3xl" />

        <div className="z-10 flex flex-col items-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-500">
            {isFocus
              ? 'Focus Session'
              : 'Break Time'}
          </p>

          <h1 className="text-7xl font-semibold tracking-tight">
            {formatted}
          </h1>

          <p className="mt-5 text-xl text-neutral-300">
            {roomName}
          </p>
        </div>
      </div>

      <button
        onClick={onLeave}
        className="mt-14 rounded-2xl border border-neutral-800 px-8 py-4 text-sm text-neutral-300 transition hover:border-red-500 hover:text-red-400"
      >
        Leave Session
      </button>
    </main>
  )
}