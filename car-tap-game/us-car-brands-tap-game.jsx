import React, { useState, useRef, useCallback } from "react";
import { Car, Star, ImagePlus } from "lucide-react";

// ---- Data -------------------------------------------------------------
// `photoUrl` points at /images/<slug>.jpg — matching the folder convention
// used in the toddler-tap-games GitHub Pages repo (public/images/...).
// Drop a same-named file in that folder and the placeholder tile is
// automatically replaced by the real photo. Until the file exists, the
// <img> fails to load and the colored placeholder tile shows instead.
const BRANDS = [
  { name: "Rolls-Royce", slug: "rolls-royce", color: "#0D0D0D", accent: "#D8D8D8" },
  { name: "Bentley", slug: "bentley", color: "#0E2A1E", accent: "#C9A24B" },
  { name: "Maybach", slug: "maybach", color: "#12100E", accent: "#B8B8B8" },
  { name: "Ferrari", slug: "ferrari", color: "#C41E1E", accent: "#FFD400" },
  { name: "Lamborghini", slug: "lamborghini", color: "#151515", accent: "#F4C400" },
  { name: "Tesla", slug: "tesla", color: "#B0B3B8", accent: "#E31937" },
  { name: "BMW", slug: "bmw", color: "#0D2F6B", accent: "#E6E6E6" },
  { name: "Audi", slug: "audi", color: "#1A1A1A", accent: "#C8102E" },
  { name: "Chrysler", slug: "chrysler", color: "#3A3F55", accent: "#B7CBE0" },
  { name: "Toyota", slug: "toyota", color: "#B0161C", accent: "#FFFFFF" },
  { name: "Honda", slug: "honda", color: "#A6120D", accent: "#E6E6E6" },
  { name: "Hyundai", slug: "hyundai", color: "#0B3C8A", accent: "#C0C9D6" },
].map((b, i) => ({ ...b, id: i, photoUrl: `/images/${b.slug}.jpg` }));

const PRAISE = ["Yay!", "Nice!", "You got it!", "Woohoo!", "Beep beep!", "Vroom!"];

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
function PhotoTile({ brand }) {
  const [failed, setFailed] = useState(false);

  if (brand.photoUrl && !failed) {
    return (
      <img
        src={brand.photoUrl}
        alt={brand.name}
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
        background: `linear-gradient(160deg, ${brand.color} 0%, ${brand.color}CC 100%)`,
      }}
    >
      <Car className="h-12 w-12 sm:h-16 sm:w-16" color={brand.accent} strokeWidth={1.75} />
      <span
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs"
        style={{ background: "rgba(255,255,255,0.18)", color: brand.accent }}
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
        const colors = ["#FFD400", "#E31937", "#FFFFFF", "#4A90D9"];
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
function BrandCard({ brand, onTap, isActive }) {
  return (
    <button
      onClick={() => onTap(brand)}
      className="group relative flex aspect-square flex-col overflow-hidden rounded-3xl border-4 shadow-[0_6px_0_rgba(0,0,0,0.18)] transition-transform duration-150 ease-out active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.18)]"
      style={{
        borderColor: isActive ? "#FFD400" : "#0B2545",
        transform: isActive ? "scale(1.04)" : "scale(1)",
      }}
      aria-label={`Play ${brand.name}`}
    >
      <div className="relative h-[70%] w-full">
        <PhotoTile brand={brand} />
        <Burst show={isActive} />
      </div>
      <div
        className="flex h-[30%] w-full items-center justify-center px-1"
        style={{ background: "#0B2545" }}
      >
        <span className="text-center text-lg font-black leading-tight tracking-tight text-white sm:text-2xl">
          {brand.name}
        </span>
      </div>
      {isActive && (
        <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-[#0B2545] shadow">
          <Star className="mr-1 inline h-3 w-3 fill-current" />
          {brand.praise}
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

  const handleTap = useCallback((brand) => {
    speak(brand.name);
    brand.praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    setActiveId(brand.id);
    setTapped((prev) => new Set(prev).add(brand.id));
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveId(null), 750);
  }, []);

  const progress = tapped.size;
  const total = BRANDS.length;

  return (
    <div
      className="min-h-screen w-full px-4 py-6 sm:px-8"
      style={{
        background:
          "radial-gradient(circle at 20% 10%, #14335E 0%, #0B2545 55%, #071A33 100%)",
      }}
    >
      <style>{`
        @keyframes pop-fade {
          0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--r,0deg)) translate(0px); }
          100% { opacity: 0; }
        }
        @keyframes road-move {
          0% { background-position-x: 0; }
          100% { background-position-x: 120px; }
        }
      `}</style>

      <header className="mx-auto mb-6 max-w-4xl text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current text-[#FFD400]" />
          ))}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
          Car Brands
        </h1>
        <p className="mt-2 text-sm font-medium text-[#9FB4D6] sm:text-base">
          Tap a car to hear its name!
        </p>
        <div className="mx-auto mt-4 h-2 w-48 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#FFD400] transition-all duration-500"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4">
        {BRANDS.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
            onTap={handleTap}
            isActive={activeId === brand.id}
          />
        ))}
      </main>

      <footer
        className="mx-auto mt-8 max-w-4xl rounded-2xl border-2 border-dashed border-white/15 px-4 py-3 text-center text-xs text-[#7C90B5] sm:text-sm"
      >
        Placeholder tiles show where each car's photo will go — set{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 text-[#FFD400]">
          photoUrl
        </code>{" "}
        on a brand in the data list to swap it in.
      </footer>
    </div>
  );
}
