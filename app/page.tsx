'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [status, setStatus] = useState('starting...')

  useEffect(() => {
    test()
  }, [])

  async function test() {
    try {
      setStatus('connecting to supabase...')

      const { data, error } = await supabase
        .from('rooms')
        .select('*')

      if (error) {
        console.error(error)
        setStatus(`ERROR: ${error.message}`)
        return
      }

      setStatus(JSON.stringify(data))
    } catch (e: any) {
      console.error(e)
      setStatus(`CRASH: ${e.message}`)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-10">
      <pre>{status}</pre>
    </main>
  )
}