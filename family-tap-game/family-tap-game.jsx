import React, { useState, useCallback, useRef } from "react";
import { Settings, Camera, ImageOff, Check, Plus, Trash2 } from "lucide-react";

const TAPE_COLORS = [
  { bg: "#F2A5A5", shadow: "#D97F7F" }, // dusty rose
  { bg: "#A8D8C9", shadow: "#7FB9A7" }, // mint
  { bg: "#F4CB6B", shadow: "#DCAE45" }, // mustard
  { bg: "#9BB7D4", shadow: "#7796B8" }, // dusty blue
  { bg: "#D9B3E0", shadow: "#B888C4" }, // lilac
];

// `photo` is a path relative to where this game is published (e.g. on GitHub
// Pages). Put your image files in a `photos/` folder next to this game in
// your repo, named to match, and they'll load automatically.
const DEFAULT_FAMILY = [
  { id: 1, name: "Amma", photo: "./photos/amma.jpg", tape: 0, rot: -4 },
  { id: 2, name: "Daddy", photo: "./photos/daddy.jpg", tape: 1, rot: 3 },
  { id: 3, name: "Ayaansh", photo: "./photos/ayaansh.jpg", tape: 2, rot: -3 },
  { id: 4, name: "Aneesh", photo: "./photos/aneesh.jpg", tape: 3, rot: 5 },
  { id: 5, name: "Mohan", photo: "./photos/mohan.jpg", tape: 4, rot: -5 },
  { id: 6, name: "Rukmini", photo: "./photos/rukmini.jpg", tape: 0, rot: 4 },
  { id: 7, name: "Soma Prabhu", photo: "./photos/somaprabhu.jpg", tape: 1, rot: -2 },
  { id: 8, name: "Meenakshi", photo: "./photos/meenakshi.jpg", tape: 2, rot: 3 },
];

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.85;
  utter.pitch = 1.15;
  window.speechSynthesis.speak(utter);
}

function Confetti({ id }) {
  const pieces = Array.from({ length: 10 });
  const colors = ["#F2A5A5", "#A8D8C9", "#F4CB6B", "#9BB7D4", "#D9B3E0"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {pieces.map((_, i) => {
        const angle = (360 / pieces.length) * i;
        const dist = 46 + (i % 3) * 14;
        const x = Math.cos((angle * Math.PI) / 180) * dist;
        const y = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <span
            key={`${id}-${i}`}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
            style={{
              backgroundColor: colors[i % colors.length],
              animation: `burst-${id} 700ms ease-out forwards`,
              // custom property trick isn't available inline, so use CSS var
              "--dx": `${x}px`,
              "--dy": `${y}px`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes burst-${id} {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function PhotoCard({ member, editing, onTap, onNameChange, onPhotoPathChange, onRemove, popped }) {
  const [broken, setBroken] = useState(false);
  const tape = TAPE_COLORS[member.tape % TAPE_COLORS.length];
  const showImage = member.photo && !broken;

  return (
    <div
      className="relative flex flex-col items-center transition-transform duration-200"
      style={{
        transform: `rotate(${member.rot}deg) ${popped ? "scale(1.08) translateY(-6px)" : "scale(1)"}`,
      }}
    >
      {/* washi tape */}
      <div
        className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-6deg] rounded-[2px] opacity-90 shadow-sm z-10"
        style={{ backgroundColor: tape.bg }}
      />

      <button
        type="button"
        onClick={() => !editing && onTap(member)}
        className="group relative w-full rounded-sm bg-[#FBF6EC] p-3 pb-4 shadow-[0_6px_14px_rgba(58,43,34,0.25)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F4CB6B] active:scale-95 transition-transform"
        style={{ touchAction: "manipulation" }}
        aria-label={`Say ${member.name}`}
      >
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[2px] bg-[#E7DCC8]">
          {showImage ? (
            <img
              src={member.photo}
              alt={member.name}
              className="h-full w-full object-cover"
              onError={() => setBroken(true)}
              onLoad={() => setBroken(false)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center text-[#9C8567]">
              {member.photo ? (
                <ImageOff size={32} strokeWidth={1.5} />
              ) : (
                <Camera size={32} strokeWidth={1.5} />
              )}
              {editing && (
                <span className="text-[11px] font-medium leading-tight">
                  {member.photo ? "Not found yet — check the path" : "Add a photo path below"}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 min-h-[2rem]">
          {editing ? (
            <input
              value={member.name}
              onChange={(e) => onNameChange(member.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Name"
              className="w-full rounded border border-[#D8C9AE] bg-white px-2 py-1 text-center text-lg font-semibold text-[#3A2B22] focus:outline-none focus:ring-2 focus:ring-[#F4CB6B]"
              style={{ fontFamily: "'Comic Sans MS', ui-rounded, system-ui, sans-serif" }}
            />
          ) : (
            <p
              className="text-center text-xl font-bold text-[#3A2B22]"
              style={{ fontFamily: "'Comic Sans MS', ui-rounded, system-ui, sans-serif" }}
            >
              {member.name || "?"}
            </p>
          )}
        </div>

        {editing && (
          <input
            value={member.photo || ""}
            onChange={(e) => {
              setBroken(false);
              onPhotoPathChange(member.id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="./photos/name.jpg"
            className="mt-2 w-full rounded border border-[#D8C9AE] bg-white px-2 py-1 text-center text-xs text-[#6B5A45] focus:outline-none focus:ring-2 focus:ring-[#F4CB6B]"
          />
        )}
      </button>

      {editing && (
        <button
          type="button"
          onClick={() => onRemove(member.id)}
          className="absolute -right-2 -top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[#C0483A] text-white shadow-md active:scale-90"
          aria-label={`Remove ${member.name}`}
        >
          <Trash2 size={14} />
        </button>
      )}

      {popped && <Confetti id={member.id} />}
    </div>
  );
}

export default function FamilyTapGame() {
  const [family, setFamily] = useState(DEFAULT_FAMILY);
  const [editing, setEditing] = useState(false);
  const [poppedId, setPoppedId] = useState(null);
  const popTimeout = useRef(null);

  const handleTap = useCallback((member) => {
    speak(member.name || "Family");
    setPoppedId(member.id);
    if (popTimeout.current) clearTimeout(popTimeout.current);
    popTimeout.current = setTimeout(() => setPoppedId(null), 700);
  }, []);

  const updateName = (id, name) => {
    setFamily((f) => f.map((m) => (m.id === id ? { ...m, name } : m)));
  };

  const updatePhotoPath = (id, photo) => {
    setFamily((f) => f.map((m) => (m.id === id ? { ...m, photo } : m)));
  };

  const removeMember = (id) => {
    setFamily((f) => f.filter((m) => m.id !== id));
  };

  const addMember = () => {
    const nextId = Math.max(0, ...family.map((m) => m.id)) + 1;
    setFamily((f) => [
      ...f,
      {
        id: nextId,
        name: "",
        photo: "./photos/",
        tape: nextId % TAPE_COLORS.length,
        rot: (nextId % 2 === 0 ? 1 : -1) * (2 + (nextId % 4)),
      },
    ]);
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-y-auto p-5 pb-16"
      style={{
        backgroundColor: "#C89B6E",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(58,43,34,0.12) 1px, transparent 0)",
        backgroundSize: "14px 14px",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-extrabold text-[#FBF6EC] drop-shadow-[0_2px_0_rgba(58,43,34,0.4)]"
              style={{ fontFamily: "'Comic Sans MS', ui-rounded, system-ui, sans-serif" }}
            >
              Our Family
            </h1>
            <p className="mt-1 text-sm text-[#F0E4CC]">Tap a photo to hear the name!</p>
          </div>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FBF6EC] text-[#3A2B22] shadow-md active:scale-90"
            aria-label={editing ? "Done editing" : "Edit family board"}
          >
            {editing ? <Check size={20} /> : <Settings size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {family.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              editing={editing}
              onTap={handleTap}
              onNameChange={updateName}
              onPhotoPathChange={updatePhotoPath}
              onRemove={removeMember}
              popped={poppedId === member.id}
            />
          ))}

          {editing && (
            <button
              type="button"
              onClick={addMember}
              className="flex aspect-square w-full flex-col items-center justify-center gap-2 self-start rounded-sm border-2 border-dashed border-[#FBF6EC]/60 text-[#FBF6EC] transition-colors hover:bg-[#FBF6EC]/10"
            >
              <Plus size={28} />
              <span className="text-sm font-semibold">Add family member</span>
            </button>
          )}
        </div>

        {editing && (
          <p className="mt-8 text-center text-sm text-[#F0E4CC]">
            Edit a name, or set a photo's path to where you'll keep the image in your repo (e.g.{" "}
            <code className="rounded bg-black/20 px-1">./photos/mom.jpg</code>). Add your image
            files there and they'll show up automatically once published. Tap the checkmark when
            you're done.
          </p>
        )}
      </div>
    </div>
  );
}
