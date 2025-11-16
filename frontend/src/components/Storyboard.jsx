import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FrameModal from "./FrameModal";
import jsPDF from "jspdf";

export default function Storyboard({ frames = [], onUpdate, loading }) {
  const [selected, setSelected] = useState(null);
  const [loadingFrame, setLoadingFrame] = useState(null);

  function updateCaption(index, caption) {
    const copy = [...frames];
    copy[index] = { ...copy[index], caption };
    onUpdate(copy);
  }

  async function regenerate(index) {
    setLoadingFrame(index);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: frames[index].caption || "regenerate",
          count: 1,
          regenerateIndex: index,
        }),
      });

      const data = await res.json();
      const copy = [...frames];
      copy[index] = data.frames?.[0] || copy[index];
      onUpdate(copy);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFrame(null);
    }
  }

  // ---------------------------------------------------------
  // Helper: Convert S3 URL → Base64
  // ---------------------------------------------------------
  async function urlToBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  // ---------------------------------------------------------
  // DOWNLOAD PDF
  // ---------------------------------------------------------
  async function handleDownloadPDF() {
    if (!frames.length) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });

    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];

      if (i !== 0) doc.addPage();

      // Convert signed S3 URL → base64
      const dataUrl = await urlToBase64(f.image);

      doc.addImage(dataUrl, "PNG", 40, 40, 520, 300);

      doc.setFontSize(14);
      doc.text(f.caption || `Frame ${i + 1}`, 40, 360);
    }

    doc.save("storyboard.pdf");
  }

  // ---------------------------------------------------------
  // SHARE STORYBOARD (text only)
  // ---------------------------------------------------------
  async function handleShare() {
    const text =
      "Here is my AI storyboard:\n\n" +
      frames.map((f, i) => `${i + 1}. ${f.caption}`).join("\n");

    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  }

  //----------------------------------------------------------
  // UI
  //----------------------------------------------------------
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Storyboard</h2>

        <div className="flex gap-3">

          <button
            onClick={handleShare}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
          >
            Share
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-slate-300">
          Generating — enjoy the animation 🎨
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {frames.map((f, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              key={idx}
              className="bg-white/5 rounded-xl overflow-hidden shadow-lg"
            >
              <div className="relative">
                <img
                  src={f.image}
                  alt={f.caption}
                  className={`w-full h-44 object-cover transition-opacity duration-300 ${
                    loadingFrame === idx ? "opacity-40" : "opacity-100"
                  }`}
                />

                {/* Loading spinner */}
                {loadingFrame === idx && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}

                {/* Buttons */}
                <div className="absolute right-2 top-2 flex gap-2">
                  {loadingFrame !== idx && (
                    <>
                      <button
                        onClick={() => setSelected({ ...f, index: idx })}
                        className="bg-white/20 px-2 py-1 rounded"
                      >
                        View
                      </button>

                      <button
                        onClick={() => regenerate(idx)}
                        className="bg-white/20 px-2 py-1 rounded"
                      >
                        Regenerate
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4">
                <textarea
                  value={f.caption}
                  onChange={(e) => updateCaption(idx, e.target.value)}
                  className="w-full bg-transparent resize-none text-sm outline-none"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {selected && (
        <FrameModal frame={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
