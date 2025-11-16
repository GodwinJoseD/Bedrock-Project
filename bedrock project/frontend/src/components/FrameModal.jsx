import React from 'react'
import { motion } from 'framer-motion'

export default function FrameModal({ frame, onClose }) {
  if (!frame) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 rounded-xl p-6 z-50 max-w-3xl w-full">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-lg font-semibold">Frame</h3>
          <button onClick={onClose} className="text-slate-400">Close</button>
        </div>
        <div className="mt-4">
          <img src={frame.image} alt={frame.caption} className="w-full rounded" />
          <p className="mt-3 text-slate-200">{frame.caption}</p>
        </div>
      </motion.div>
    </div>
  )
}