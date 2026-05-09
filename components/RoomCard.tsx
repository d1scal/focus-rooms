type Room = {
  id: string
  name: string
  online_count: number
}

export default function RoomCard({
  room,
  onJoin,
}: {
  room: Room
  onJoin: () => void
}) {
  const fakeUsers = [
    {
      name: 'Alex',
      status: 'Focusing',
      active: true,
    },
    {
      name: 'Anna',
      status: 'Break',
      active: false,
    },
    {
      name: 'Mike',
      status: 'Focusing',
      active: true,
    },
    {
      name: 'Kate',
      status: 'Focus',
      active: true,
    },
    {
      name: 'John',
      status: 'Idle',
      active: false,
    },
    {
      name: 'Leo',
      status: 'Break',
      active: false,
    },
  ]

  return (
    <div className="rounded-3xl border border-neutral-800 bg-[#0a0a0f] p-6 shadow-[0_0_60px_rgba(0,255,120,0.03)]">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            {room.name}
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            {room.online_count} people online
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-sm font-medium text-white">
          Y
        </div>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full w-1/2 rounded-full bg-green-400" />
      </div>

      <div className="mb-6 rounded-3xl border border-neutral-800 bg-[#11111a] p-5">
        <div className="grid grid-cols-2 gap-4">
          {fakeUsers.map((user) => (
            <div
              key={user.name}
              className="rounded-2xl bg-[#1a1a26] p-4 text-center"
            >
              <div
                className={`mx-auto mb-2 h-2 w-2 rounded-full ${
                  user.active
                    ? 'bg-green-400'
                    : 'bg-yellow-400'
                }`}
              />

              <p className="text-sm font-medium text-white">
                {user.name}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {user.status}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center">
          <div className="rounded-full bg-black px-4 py-2 text-xs text-green-400">
            ● Focus session active
          </div>
        </div>
      </div>

      <button
        onClick={onJoin}
        className="w-full rounded-2xl bg-white py-4 font-medium text-black transition hover:bg-neutral-200"
      >
        Join Focus Session
      </button>
    </div>
  )
}