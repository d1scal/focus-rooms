type Props = {
  room: any
  onStart: () => void
}

export default function RoomLobby({
  room,
  onStart,
}: Props) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-bold">
          {room.name}
        </h1>

        <p className="mt-3 text-neutral-500">
          {room.online_count} people online
        </p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div className="h-full w-1/2 rounded-full bg-green-400" />
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-800 bg-[#0b0b14] p-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Alex', 'Focusing'],
              ['Anna', 'Break'],
              ['Mike', 'Focusing'],
              ['Kate', 'Focus'],
              ['John', 'Idle'],
              ['Leo', 'Break'],
            ].map(([name, status]) => (
              <div
                key={name}
                className="rounded-2xl bg-[#151524] p-4 text-center"
              >
                <div className="mx-auto mb-2 h-2 w-2 rounded-full bg-green-400" />

                <p className="text-sm font-medium">
                  {name}
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  {status}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <div className="rounded-full bg-black px-4 py-2 text-sm text-green-400">
              ● Focus session active
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="mt-8 w-full rounded-2xl bg-white py-4 text-lg font-medium text-black transition hover:bg-neutral-200"
        >
          Join Focus Session
        </button>
      </div>
    </div>
  )
}