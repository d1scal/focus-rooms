'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import LobbyScreen from '@/components/LobbyScreen'
import RoomScreen from '@/components/RoomScreen'

type Participant = {
  id: string
  username: string
  status: string
  room_id: string
}

type Room = {
  id: string
  name: string
  online_count: number
}

type FocusSession = {
  id: string
  room_id: string
  mode: 'focus' | 'break'
  started_at: string
  duration: number
}

export default function HomePage() {
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [joined, setJoined] = useState(false)
  const [session, setSession] = useState<FocusSession | null>(null)

  const username = useMemo(() => {
    if (typeof window === 'undefined') return ''

    const existing = localStorage.getItem('focus_username')

    if (existing) return existing

    const generated = `user-${Math.floor(Math.random() * 9999)}`

    localStorage.setItem('focus_username', generated)

    return generated
  }, [])

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const loadedRoom = await loadRoom()

    if (!loadedRoom) return

    await loadParticipants(loadedRoom)
    await loadSession(loadedRoom)

    subscribeRealtime(loadedRoom)
  }

  function subscribeRealtime(currentRoom: Room) {
    const participantsChannel = supabase
      .channel('participants-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
        },
        async () => {
          await loadParticipants(currentRoom)
        }
      )
      .subscribe()

    const sessionChannel = supabase
      .channel('session-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'focus_sessions',
        },
        async () => {
          await loadSession(currentRoom)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(participantsChannel)
      supabase.removeChannel(sessionChannel)
    }
  }

  async function loadRoom(): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error(error)
      return null
    }

    if (data) {
      setRoom(data)
      return data
    }

    return null
  }

  async function loadSession(currentRoom: Room) {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('room_id', currentRoom.id)
      .limit(1)
      .single()

    if (error) {
      console.error('SESSION LOAD ERROR', error)

      const { data: created, error: createError } = await supabase
        .from('focus_sessions')
        .insert({
          room_id: currentRoom.id,
          mode: 'focus',
          duration: 1500,
        })
        .select()
        .single()

      if (createError) {
        console.error('SESSION CREATE ERROR', createError)
        return
      }

      if (created) {
        setSession(created)
      }

      return
    }

    if (data) {
      setSession(data)
    }
  }

  async function loadParticipants(currentRoom: Room) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', currentRoom.id)

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setParticipants(data)

      await supabase
        .from('rooms')
        .update({
          online_count: data.length,
        })
        .eq('id', currentRoom.id)

      setRoom((prev) =>
        prev
          ? {
              ...prev,
              online_count: data.length,
            }
          : prev
      )
    }
  }

  async function joinFocus() {
    if (!room) return

    await supabase.from('participants').insert({
      username,
      status: 'Focusing',
      room_id: room.id,
    })

    setJoined(true)
  }

  async function leaveFocus() {
    await supabase
      .from('participants')
      .delete()
      .eq('username', username)

    setJoined(false)
  }

  async function switchMode() {
    if (!room || !session) return

    const nextMode =
      session.mode === 'focus'
        ? 'break'
        : 'focus'

    const nextDuration =
      nextMode === 'focus'
        ? 1500
        : 300

    await supabase
      .from('focus_sessions')
      .insert({
        room_id: room.id,
        mode: nextMode,
        duration: nextDuration,
      })

    await supabase
      .from('participants')
      .update({
        status:
          nextMode === 'focus'
            ? 'Focusing'
            : 'Break',
      })
      .eq('room_id', room.id)
  }

  useEffect(() => {
    const cleanup = async () => {
      await supabase
        .from('participants')
        .delete()
        .eq('username', username)
    }

    window.addEventListener('beforeunload', cleanup)

    return () => {
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [username])

  if (!room || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </main>
    )
  }

  if (joined) {
    return (
      <RoomScreen
        roomName={room.name}
        session={session}
        onLeave={leaveFocus}
        onSwitchMode={switchMode}
      />
    )
  }

  return (
    <LobbyScreen
      room={room}
      participants={participants}
      onJoinFocus={joinFocus}
    />
  )
}