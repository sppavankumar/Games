import React, { useState, useRef, useCallback } from "react";
import { ShoppingBag, Star, ImagePlus } from "lucide-react";

// ---- Data -------------------------------------------------------------
// `photoUrl` points at /images/<slug>.jpg — matching the folder convention
// used across this repo's tap games (each game's own images/ folder).
// Drop a same-named file in that folder and the placeholder tile is
// automatically replaced by the real photo. Until the file exists, the
// <img> fails to load and the colored placeholder tile shows instead.
const ITEMS = [
  { name: "Adidas", slug: "adidas", color: "#111111", accent: "#F5F5F5", say: "Ah dee dahs" },
  { name: "Amazon", slug: "amazon", color: "#232F3E", accent: "#FF9900" },
  { name: "Apple", slug: "apple", color: "#1D1D1F", accent: "#D2D2D7" },
  { name: "Banana Republic", slug: "bananarepublic", color: "#2B2B2B", accent: "#E8E1D4" },
  { name: "Bank of America", slug: "bankofamerica", color: "#012169", accent: "#E31837" },
  { name: "Best Buy", slug: "bestbuy", color: "#0046BE", accent: "#FFE000" },
  { name: "Burger King", slug: "burgerking", color: "#502314", accent: "#F5EBDC" },
  { name: "Champion", slug: "champion", color: "#1C2A6B", accent: "#FF4D4D" },
  { name: "Chanel", slug: "chanel", color: "#000000", accent: "#F2F2F2", say: "Shuh nell" },
  { name: "Chase", slug: "chase", color: "#117ACA", accent: "#D6ECFF" },
  { name: "Chick-fil-A", slug: "chikfila", color: "#DD0031", accent: "#FFFFFF", say: "Chick fill A" },
  { name: "Coca-Cola", slug: "cocacola", color: "#F40009", accent: "#FFE5E5", say: "Coca Cola" },
  { name: "Costco", slug: "costco", color: "#005DAA", accent: "#FF8A8A" },
  { name: "Disney", slug: "disney", color: "#113CCF", accent: "#BFD1FF" },
  { name: "Domino's", slug: "dominos", color: "#006491", accent: "#9FD8F0" },
  { name: "Dunkin' Donuts", slug: "dunkindonuts", color: "#FF671F", accent: "#FFD1E8", say: "Dunkin Donuts" },
  { name: "Gap", slug: "gap", color: "#002868", accent: "#FFFFFF" },
  { name: "GE", slug: "ge", color: "#005EB8", accent: "#CFE6FF", say: "G. E." },
  { name: "Gucci", slug: "gucci", color: "#1B1B1B", accent: "#D4AF37", say: "Goo chee" },
  { name: "Hermès", slug: "hermes", color: "#F37021", accent: "#FFE6D2", say: "Air mez" },
  { name: "Hershey's", slug: "hersheys", color: "#3F2A1E", accent: "#E8D3B9", say: "Her sheez" },
  { name: "Home Depot", slug: "homedepot", color: "#F96302", accent: "#FFE0C2", say: "Home Dee poh" },
  { name: "Instacart", slug: "instacart", color: "#0AAD0A", accent: "#FF7009" },
  { name: "LEGO", slug: "lego", color: "#D01012", accent: "#FFCF00", say: "Leggo" },
  { name: "Louis Vuitton", slug: "louisvuitton", color: "#4B2E1E", accent: "#E8C99B", say: "Loo ee Vwee tawn" },
  { name: "Lowe's", slug: "lowes", color: "#004990", accent: "#A5CCEB", say: "Lows" },
  { name: "McDonald's", slug: "mcdonalds", color: "#DA291C", accent: "#FFC72C", say: "Mick Donalds" },
  { name: "Meijer", slug: "meijer", color: "#D62C2C", accent: "#BFD9FF", say: "My er" },
  { name: "Nespresso", slug: "nespresso", color: "#1A1A1A", accent: "#C8A97E", say: "Ness presso" },
  { name: "Nike", slug: "nike", color: "#111111", accent: "#F5F5F5", say: "Ny key" },
  { name: "Noodles & Company", slug: "noodleandco", color: "#C8102E", accent: "#FFD25A", say: "Noodles and Company" },
  { name: "Panera Bread", slug: "panerabread", color: "#4E5B31", accent: "#E0C27A", say: "Puh nair uh Bread" },
  { name: "Pepsi", slug: "pepsi", color: "#004B93", accent: "#7FC4FF" },
  { name: "Pizza Hut", slug: "pizzahut", color: "#EE3124", accent: "#FFE1DC" },
  { name: "Prada", slug: "prada", color: "#1A1A1A", accent: "#E6E6E6", say: "Prah duh" },
  { name: "Saint Laurent", slug: "saintlaurent", color: "#000000", accent: "#EDEDED", say: "San Lor ahn" },
  { name: "Sam's Club", slug: "samsclub", color: "#0067A0", accent: "#9FD356" },
  { name: "Stanley", slug: "stanley", color: "#2E2E2E", accent: "#7FB069" },
  { name: "Starbucks", slug: "starbucks", color: "#00704A", accent: "#D4E9E2" },
  { name: "Subway", slug: "subway", color: "#008938", accent: "#FFC600" },
  { name: "Taco Bell", slug: "tacobell", color: "#702082", accent: "#E4C5F0" },
  { name: "Target", slug: "target", color: "#CC0000", accent: "#FFD6D6" },
  { name: "Tommy Hilfiger", slug: "tommyhilfiger", color: "#00174F", accent: "#E4002B", say: "Tommy Hill figger" },
  { name: "Walmart", slug: "walmart", color: "#0071CE", accent: "#FFC220" },
  { name: "Wendy's", slug: "wendys", color: "#E2203D", accent: "#FFE4E9" },
].map((b, i) => ({ ...b, id: i, photoUrl: `/images/${b.slug}.jpg` }));

const PRAISE = ["Yay!", "Nice!", "You got it!", "Woohoo!", "Great job!", "Awesome!"];

// ---- Speech -------------------------------------------------------------
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
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
        className="h-full w-full bg-white object-contain p-3 sm:p-4"
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
      <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16" color={item.accent} strokeWidth={1.75} />
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
        const colors = ["#FFC72C", "#FF4D6D", "#FFFFFF", "#22D3EE"];
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
        borderColor: isActive ? "#FFC72C" : "#2B1055",
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
        style={{ background: "#2B1055" }}
      >
        <span className="text-center text-lg font-black leading-tight tracking-tight text-white sm:text-2xl">
          {item.name}
        </span>
      </div>
      {isActive && (
        <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold shadow" style={{ color: "#2B1055" }}>
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
    speak(item.say || item.name);
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
      style={{ background: "radial-gradient(circle at 15% 10%, #4C1D95 0%, #1E1036 45%, #0B0618 100%)" }}
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
            <Star key={i} className="h-4 w-4 fill-current" style={{ color: "#FFC72C" }} />
          ))}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
          Brands
        </h1>
        <p className="mt-2 text-sm font-medium sm:text-base" style={{ color: "#E9D5FF" }}>
          Tap one to hear its name!
        </p>
        <div className="mx-auto mt-4 h-2 w-48 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(progress / total) * 100}%`, background: "#FFC72C" }}
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
        style={{ color: "#E9D5FF" }}
      >
        Placeholder tiles show where each photo will go — set{" "}
        <code className="rounded bg-white/10 px-1 py-0.5" style={{ color: "#FFC72C" }}>
          photoUrl
        </code>{" "}
        on an item in the data list to swap it in.
      </footer>
    </div>
  );
}
