import React, { useState, useRef, useCallback } from "react";
import { Apple, Star, ImagePlus } from "lucide-react";

// ---- Data -------------------------------------------------------------
// `photoUrl` points at /images/<slug>.jpg — matching the folder convention
// used across this repo's tap games (each game's own images/ folder).
// Drop a same-named file in that folder and the placeholder tile is
// automatically replaced by the real photo. Until the file exists, the
// <img> fails to load and the colored placeholder tile shows instead.
const ITEMS = [
  { name: "Apple", slug: "apple", color: "#8B1E1E", accent: "#7CB518" },
  { name: "Banana", slug: "banana", color: "#6B4F0A", accent: "#FFD93D" },
  { name: "Orange", slug: "orange", color: "#B54708", accent: "#FFB627" },
  { name: "Grapes", slug: "grapes", color: "#3D1A5B", accent: "#C9A0FF" },
  { name: "Strawberry", slug: "strawberry", color: "#7A0C1E", accent: "#4CAF50" },
  { name: "Watermelon", slug: "watermelon", color: "#0B3D2E", accent: "#FF5C7A" },
  { name: "Pineapple", slug: "pineapple", color: "#5C4A1E", accent: "#8BC34A" },
  { name: "Mango", slug: "mango", color: "#C2410C", accent: "#FFC145" },
  { name: "Peach", slug: "peach", color: "#8B3A3A", accent: "#FFB6A3" },
  { name: "Pear", slug: "pear", color: "#3D5C1E", accent: "#D4E157" },
  { name: "Cherry", slug: "cherry", color: "#5C0A1E", accent: "#FF3B5C" },
  { name: "Kiwi", slug: "kiwi", color: "#3D2B1F", accent: "#B2D732" },
  { name: "Blueberry", slug: "blueberry", color: "#1B2A4A", accent: "#8FB8FF" },
  { name: "Lemon", slug: "lemon", color: "#7A6B00", accent: "#FFF34D" },
  { name: "Coconut", slug: "coconut", color: "#3D2817", accent: "#F5F0E6" },
  { name: "Papaya", slug: "papaya", color: "#A03A1D", accent: "#FF9F5A" },
].map((b, i) => ({ ...b, id: i, photoUrl: `/images/${b.slug}.jpg` }));

const PRAISE = ["Yay!", "Nice!", "You got it!", "Woohoo!", "Yum!", "Delicious!"];

// ---- Speech -------------------------------------------------------------
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.85;
  u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

// ---- Placeholder photo tile ---------------------------------------------
function PhotoTile({ item }) {
  const [failed, setFailed] = useState(false);

  if (item.photoUrl && !failed) {
    return (
      <img
        src={item.photoUrl}
        alt={item.name}
        className="h-full w-full object-cover"
        draggable={false}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1"
      style={{
        background: `linear-gradient(160deg, ${item.color} 0%, ${item.color}CC 100%)`,
      }}
    >
      <Apple className="h-12 w-12 sm:h-16 sm:w-16" color={item.accent} strokeWidth={1.75} />
      <span
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs"
        style={{ background: "rgba(255,255,255,0.18)", color: item.accent }}
      >
        <ImagePlus className="h-3 w-3" /> photo goes here
      </span>
    </div>
  );
}

// ---- Confetti burst -------------------------------------------------------
function Burst({ show }) {
  if (!show) return null;
  const pieces = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const angle = (360 / pieces.length) * i;
        const dist = 60 + (i % 3) * 18;
        const colors = ["#FFD23F", "#FF6B6B", "#FFFFFF", "#8BC34A"];
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-sm"
            style={{
              background: colors[i % colors.length],
              transform: `rotate(${angle}deg) translate(${dist}px)`,
              animation: `pop-fade 700ms ease-out forwards`,
            }}
          />
        );
      })}
    </div>
  );
}

// ---- Card -------------------------------------------------------------
function ItemCard({ item, onTap, isActive }) {
  return (
    <button
      onClick={() => onTap(item)}
      className="group relative flex aspect-square flex-col overflow-hidden rounded-3xl border-4 shadow-[0_6px_0_rgba(0,0,0,0.18)] transition-transform duration-150 ease-out active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.18)]"
      style={{
        borderColor: isActive ? "#FFB627" : "#0F3D2E",
        transform: isActive ? "scale(1.04)" : "scale(1)",
      }}
      aria-label={`Play ${item.name}`}
    >
      <div className="relative h-[70%] w-full">
        <PhotoTile item={item} />
        <Burst show={isActive} />
      </div>
      <div
        className="flex h-[30%] w-full items-center justify-center px-1"
        style={{ background: "#0F3D2E" }}
      >
        <span className="text-center text-lg font-black leading-tight tracking-tight text-white sm:text-2xl">
          {item.name}
        </span>
      </div>
      {isActive && (
        <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold shadow" style={{ color: "#0F3D2E" }}>
          <Star className="mr-1 inline h-3 w-3 fill-current" />
          {item.praise}
        </div>
      )}
    </button>
  );
}

// ---- Main app -------------------------------------------------------------
export default function App() {
  const [activeId, setActiveId] = useState(null);
  const timeoutRef = useRef(null);
  const [tapped, setTapped] = useState(() => new Set());

  const handleTap = useCallback((item) => {
    speak(item.name);
    item.praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    setActiveId(item.id);
    setTapped((prev) => new Set(prev).add(item.id));
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveId(null), 750);
  }, []);

  const progress = tapped.size;
  const total = ITEMS.length;

  return (
    <div
      className="min-h-screen w-full px-4 py-6 sm:px-8"
      style={{ background: "radial-gradient(circle at 20% 10%, #1B5E44 0%, #0F3D2E 55%, #08251C 100%)" }}
    >
      <style>{`
        @keyframes pop-fade {
          0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--r,0deg)) translate(0px); }
          100% { opacity: 0; }
        }
      `}</style>

      <header className="mx-auto mb-6 max-w-4xl text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" style={{ color: "#FFB627" }} />
          ))}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
          Fruits
        </h1>
        <p className="mt-2 text-sm font-medium sm:text-base" style={{ color: "#8FD9B4" }}>
          Tap a fruit to hear its name!
        </p>
        <div className="mx-auto mt-4 h-2 w-48 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(progress / total) * 100}%`, background: "#FFB627" }}
          />
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4">
        {ITEMS.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onTap={handleTap}
            isActive={activeId === item.id}
          />
        ))}
      </main>

      <footer
        className="mx-auto mt-8 max-w-4xl rounded-2xl border-2 border-dashed border-white/15 px-4 py-3 text-center text-xs sm:text-sm"
        style={{ color: "#8FD9B4" }}
      >
        Placeholder tiles show where each fruit's photo will go — set{" "}
        <code className="rounded bg-white/10 px-1 py-0.5" style={{ color: "#FFB627" }}>
          photoUrl
        </code>{" "}
        on an item in the data list to swap it in.
      </footer>
    </div>
  );
}
