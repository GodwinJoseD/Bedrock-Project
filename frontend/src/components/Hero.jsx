import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function Hero({ examples, onGenerate, loading }) {
  const [prompt, setPrompt] = useState('')

  return (
    <header className="py-12">
      <div className="container mx-auto px-6">
        <div className="bg-gradient-to-r from-indigo-700 to-fuchsia-700 p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Create AI storyboards — fast.</h1>
              <p className="mt-2 text-slate-200 max-w-xl">Type a concept, get a 3–5 frame visual storyboard. Tweak captions, regenerate frames, and download.</p>

              <div className="mt-4 flex gap-3">
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your idea — e.g. A robot learning to paint"
                  className="flex-1 rounded-md px-4 py-2 text-black"
                />
                <button
                  onClick={() => { if (prompt.trim()) onGenerate(prompt) }}
                  className="bg-white text-black font-semibold px-4 py-2 rounded-md shadow"
                  disabled={loading}
                >{loading ? 'Generating...' : 'Generate'}</button>
              </div>

              <div className="mt-3 text-sm text-slate-100">Examples: {examples.map((e, i) => (
                <button key={i} onClick={() => { setPrompt(e); }} className="underline ml-2">{e}</button>
              ))}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}