"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import AUDIO from "@/data/audioManifest.json";

const CLIPS = AUDIO as Record<string, string>;

// Japanese system voice availability (voices load asynchronously in Chrome).
const hasJaVoice = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  window.speechSynthesis.getVoices().some((v) => v.lang.replace("_", "-").startsWith("ja"));
const subscribeVoices = (cb: () => void) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", cb);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", cb);
};

/**
 * Plays Japanese aloud. Fixed lines (phrases, taxi and chef cards) use
 * pre-generated natural-voice MP3s bundled with the app: they work on every
 * phone and offline. Anything else falls back to the device's Japanese voice;
 * if neither exists, the button doesn't render.
 */
export function Speak({ text, label = "Play aloud", className = "" }: { text: string; label?: string; className?: string }) {
  const clip = CLIPS[text];
  const jaVoice = useSyncExternalStore(subscribeVoices, hasJaVoice, () => false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!clip && !jaVoice) return null;

  function speakWithVoice() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.9;
    const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").startsWith("ja"));
    if (voice) u.voice = voice;
    u.onend = u.onerror = () => setPlaying(false);
    setPlaying(true);
    synth.speak(u);
  }

  function play() {
    if (playing) {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      setPlaying(false);
      return;
    }
    if (!clip) return speakWithVoice();
    const a = (audioRef.current ??= new Audio(clip));
    a.currentTime = 0;
    a.onended = () => setPlaying(false);
    a.onerror = () => (jaVoice ? speakWithVoice() : setPlaying(false));
    setPlaying(true);
    a.play().catch(() => (jaVoice ? speakWithVoice() : setPlaying(false)));
  }

  return (
    <button
      type="button"
      onClick={play}
      aria-pressed={playing}
      aria-label={`${playing ? "Stop" : label}: ${text}`}
      className={`press inline-flex shrink-0 items-center gap-2 rounded-full border-[1.5px] border-[#2b2522] bg-[#2b2522] px-4 py-2 text-sm font-bold text-[#f6efe3] ${className}`}
    >
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${playing ? "animate-pulse" : ""}`} aria-hidden>
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      {playing ? "Stop" : label}
    </button>
  );
}
