type Participant = {
  id: string
  username: string
  status: string
  avatar_url?: string
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
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14">
          <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.35em] text-neutral-500">
            Deep Work Space
          </div>

          <h1 className="text-7xl font-semibold tracking-tight">
            {room.name}
          </h1>

          <p className="mt-5 text-xl text-neutral-500">
            {room.online_count} people focusing now
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.8)]" />

                <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                  Live
                </p>
              </div>

              <div className="mt-6 flex flex-col items-center">
                {participant.avatar_url ? (
                  <img
                    src={participant.avatar_url}
                    alt={participant.username}
                    className="h-20 w-20 rounded-full border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold">
                    {participant.username[0]}
                  </div>
                )}

                <h2 className="mt-5 text-xl font-medium">
                  @{participant.username}
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  {participant.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {participants.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-24 text-center text-neutral-500">
            No one is here yet
          </div>
        )}

        <div className="mt-14 flex justify-center">
          <button
            onClick={onJoinFocus}
            className="rounded-2xl bg-white px-10 py-5 text-lg font-medium text-black transition hover:scale-[1.02] hover:bg-neutral-200"
          >
            Join Focus Session
          </button>
        </div>
      </div>
    </main>
  )
}