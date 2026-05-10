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
  is_online: boolean
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] =
    useState<Room | null>(null)

  const [participants, setParticipants] = useState<
    Participant[]
  >([])

  const [participantId, setParticipantId] = useState<
    string | null
  >(null)

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
          fetchRooms()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRoom])

  async function fetchRooms() {
    const { data: roomsData, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: true })

    if (error || !roomsData) {
      console.log(error)
      return
    }

    const updatedRooms = await Promise.all(
      roomsData.map(async (room) => {
        const { count, error: countError } =
          await supabase
            .from('participants')
            .select('*', {
              count: 'exact',
              head: true,
            })
            .eq('room_id', room.id)
            .eq('is_online', true)

        if (countError) {
          console.log(countError)
        }

        return {
          ...room,
          online_count: count || 0,
        }
      })
    )

    setRooms(updatedRooms)
  }

  async function fetchParticipants(roomId: string) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_online', true)

    if (error) {
      console.log(error)
      return
    }

    if (data) {
      setParticipants(data)
    }
  }

  async function handleJoin(room: Room) {
    console.log('joining room')

    const { data, error } = await supabase
      .from('participants')
      .insert([
        {
          room_id: room.id,
          username: `User ${Math.floor(
            Math.random() * 1000
          )}`,
          status: 'focusing',
          is_online: true,
        },
      ])
      .select()

    console.log(data)
    console.log(error)

    if (error || !data || data.length === 0) {
      return
    }

    setParticipantId(data[0].id)

    await fetchRooms()
    await fetchParticipants(room.id)

    setSelectedRoom(room)
    setIsInFocus(false)
  }

  async function handleLeave() {
    if (!participantId) return

    await supabase
      .from('participants')
      .update({
        is_online: false,
      })
      .eq('id', participantId)

    await fetchRooms()

    setSelectedRoom(null)
    setParticipants([])
    setParticipantId(null)
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