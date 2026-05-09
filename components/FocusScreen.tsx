'use client'

import { useEffect, useState } from 'react'

type Participant = {
  id: string
  username: string
  status: string
  joined_at: string
}

type Props = {
  roomName: string
  participants: Participant[]
  onLeave: () => void
}

export default function FocusScreen({
  roomName,
  participants,
  onLeave,
}: Props) {
  const [sessionSeconds, setSessionSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const hours = Math.floor(sessionSeconds / 3600)
  const minutes = Math.floor((sessionSeconds % 3600) / 60)
  const seconds = sessionSeconds % 60

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      <div className="absolute h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-neutral-500">
            Live Focus Session
          </p>

          <div className="text-7xl font-semibold tracking-tight">
            {String(hours).padStart(2, '0')}:
            {String(minutes).padStart(2, '0')}:
            {String(seconds).padStart(2, '0')}
          </div>

          <p className="mt-4 text-2xl text-neutral-300">
            {roomName}
          </p>

          <p className="mt-3 text-sm text-emerald-400">
            Session currently active
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-white/5 p-6 backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Working now
            </h2>

            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-sm font-medium text-emerald-300">
                {participants.length} online
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {participants.map((participant) => {
              const focusedMinutes = Math.floor(
                (Date.now() -
                  new Date(
                    participant.joined_at
                  ).getTime()) /
                  60000
              )

              return (
                <div
                  key={participant.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />

                    <div>
                      <p className="font-medium text-white">
                        {participant.username}
                      </p>

                      <p className="text-sm text-neutral-500">
                        {participant.status}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {focusedMinutes}m
                    </p>

                    <p className="text-xs text-neutral-500">
                      focused
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={onLeave}
          className="mt-8 w-full rounded-2xl border border-neutral-800 px-6 py-4 text-sm font-medium text-neutral-300 transition hover:border-neutral-700 hover:bg-white/5"
        >
          Leave Session
        </button>
      </div>
    </main>
  )
}