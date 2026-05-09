'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

import RoomCard from '@/components/RoomCard'
import LobbyScreen from '@/components/LobbyScreen'
import FocusScreen from '@/components/FocusScreen'

type Room = {
  id: string
  name: string
  online_count: number
}

type Participant = {
  id: string
  username: string
  status: string
  joined_at: string
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const [participants, setParticipants] = useState<
    Participant[]
  >([])

  const [isInFocus, setIsInFocus] = useState(false)

  useEffect(() => {
    fetchRooms()

    const channel = supabase
      .channel('rooms-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        () => {
          fetchRooms()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (!selectedRoom) return

    fetchParticipants(selectedRoom.id)

    const channel = supabase
      .channel(`participants-${selectedRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
        },
        () => {
          fetchParticipants(selectedRoom.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRoom])

  async function fetchRooms() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      setRooms(data)
    }
  }

  async function fetchParticipants(roomId: string) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', roomId)

    if (!error && data) {
      setParticipants(data)
    }
  }

  async function handleJoin(room: Room) {
    const updatedCount = room.online_count + 1

    await supabase
      .from('rooms')
      .update({
        online_count: updatedCount,
      })
      .eq('id', room.id)

    await supabase.from('participants').insert({
      room_id: room.id,
      username: `User ${Math.floor(
        Math.random() * 1000
      )}`,
      status: 'focusing',
    })

    setSelectedRoom({
      ...room,
      online_count: updatedCount,
    })

    setIsInFocus(false)
  }

  async function handleLeave() {
    if (!selectedRoom) return

    const updatedCount = Math.max(
      0,
      selectedRoom.online_count - 1
    )

    await supabase
      .from('rooms')
      .update({
        online_count: updatedCount,
      })
      .eq('id', selectedRoom.id)

    setSelectedRoom(null)
    setParticipants([])
    setIsInFocus(false)
  }

  if (selectedRoom && isInFocus) {
    return (
      <FocusScreen
        roomName={selectedRoom.name}
        participants={participants}
        onLeave={handleLeave}
      />
    )
  }

  if (selectedRoom) {
    return (
      <LobbyScreen
        room={selectedRoom}
        participants={participants}
        onJoinFocus={() => setIsInFocus(true)}
      />
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14">
          <div className="mb-4 inline-flex rounded-full border border-neutral-800 bg-neutral-900 px-4 py-1 text-xs uppercase tracking-[0.25em] text-neutral-400">
            Live Deep Work Sessions
          </div>

          <h1 className="text-6xl font-semibold tracking-tight">
            Focus Rooms
          </h1>

          <p className="mt-4 text-neutral-500">
            Join a live focus session and work together in
            silence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={() => handleJoin(room)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}