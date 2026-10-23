"use client";

import { useSyncExternalStore, useState } from "react";

const subscribe = () => () => {};
const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * Plays Japanese aloud with the phone's built-in voice (works offline on most
 * phones, no API cost). For drivers, staff, and practising pronunciation.
 */
export function Speak({ text, label = "Play aloud", className = "", slow = false }: { text: string; label?: string; className?: string; slow?: boolean }) {
  const supported = useSyncExternalStore(subscribe, hasSpeech, () => false);
  const [speaking, setSpeaking] = useState(false);
  if (!supported) return null;

  function play() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = slow ? 0.7 : 0.9;
    const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").startsWith("ja"));
    if (voice) u.voice = voice;
    u.onend = u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  }

  return (
    <button
      type="button"
      onClick={play}
      aria-label={`${label}: ${text}`}
      className={`press inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#2b2522] bg-[#2b2522] px-4 py-2 text-sm font-bold text-[#f6efe3] ${className}`}
    >
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${speaking ? "animate-pulse" : ""}`} aria-hidden>
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      {speaking ? "Playing…" : label}
    </button>
  );
}
