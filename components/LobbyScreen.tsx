type Participant = {
  id: string
  username: string
  status: string
}

type Props = {
  room: {
    id: string
    name: string
    online_count: number
  }

  participants: Participant[]

  onJoinFocus: () => void
}

export default function LobbyScreen({
  room,
  participants,
  onJoinFocus,
}: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-5xl font-semibold">
          {room.name}
        </h1>

        <p className="mb-6 text-neutral-500">
          {room.online_count} people online
        </p>

        <div className="mb-8 h-2 overflow-hidden rounded-full bg-neutral-800">
          <div className="h-full w-1/2 rounded-full bg-emerald-400" />
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-gradient-to-b from-[#0d1020] to-black p-5">
          <div className="grid grid-cols-2 gap-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="rounded-2xl bg-white/5 p-5 text-center"
              >
                <div className="mx-auto mb-3 h-2 w-2 rounded-full bg-emerald-400" />

                <p className="text-lg font-medium">
                  {participant.username}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  {participant.status}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <div className="rounded-full bg-black px-4 py-2 text-sm text-emerald-400">
              ● Focus session active
            </div>
          </div>
        </div>

        <button
          onClick={onJoinFocus}
          className="mt-6 w-full rounded-2xl bg-white px-6 py-4 text-lg font-medium text-black transition hover:bg-neutral-200"
        >
          Join Focus Session
        </button>
      </div>
    </main>
  )
}