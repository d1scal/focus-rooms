'use client'

import { useEffect, useState } from 'react'

type Props = {
  roomName: string
  onLeave: () => void
}

export default function RoomScreen({
  roomName,
  onLeave,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 25 * 60
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="relative flex h-[340px] w-[340px] items-center justify-center rounded-full border border-neutral-800 bg-neutral-950 shadow-[0_0_120px_rgba(34,197,94,0.15)]">
        <div className="absolute h-[280px] w-[280px] rounded-full bg-green-500/10 blur-3xl" />

        <div className="z-10 flex flex-col items-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-500">
            Focus session
          </p>

          <h1 className="text-7xl font-semibold tracking-tight">
            {formattedTime}
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