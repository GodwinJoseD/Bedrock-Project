import React, { useState } from 'react'
import Hero from './components/Hero'
import Storyboard from './components/Storyboard'

export default function App() {
  const [examples] = useState([
    'A shy robot learning to paint in a neon-lit studio',
    'A time-lapse of a city growing from a seed',
    'A medieval bard discovering a glowing cassette tape'
  ])

  const [frames, setFrames] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleGenerate(prompt) {
    setLoading(true)
    setFrames([])
    try {
      // call our server proxy
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, count: 5 })
      })
      const data = await res.json()
      // data.frames -> [{image, caption}]
      setFrames(data.frames)
    } catch (e) {
      console.error(e)
      // fallback: mocked frames
      const mock = Array.from({ length: 5 }).map((_, i) => ({
        image: `https://picsum.photos/800/560?random=${Math.floor(Math.random()*1000)+i}`,
        caption: `Mock caption ${i+1} for: ${prompt}`
      }))
      setFrames(mock)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Hero examples={examples} onGenerate={handleGenerate} loading={loading} />
      <main className="flex-1 container mx-auto px-6 py-8">
        <Storyboard frames={frames} onUpdate={(newFrames) => setFrames(newFrames)} loading={loading} />
      </main>
      <footer className="text-center py-4 text-sm text-slate-400">AI Storyboard</footer>
    </div>
  )
}