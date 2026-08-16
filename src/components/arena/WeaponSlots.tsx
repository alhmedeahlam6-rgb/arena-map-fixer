import { getWeapon } from "./weapons";
import fistIcon from "@/assets/hud/fist.png";

type Props = {
  /** [heavy 1, heavy 2, sidearm, fists] — nulls render as empty slots */
  slots: (string | null)[];
  activeSlot: number;
  onSelect: (index: number) => void;
  ammo?: Record<string, { mag: number; reserve: number }>;
};

/**
 * Top-right weapon rack, arranged like a mobile battle-royale HUD:
 * two primary cards with ammo counters, then the sidearm and the melee slot.
 */
export default function WeaponSlots({ slots, activeSlot, onSelect, ammo }: Props) {
  const count = (id: string | null) => {
    if (!id) return null;
    const a = ammo?.[id];
    if (!a) return null;
    return a.mag + a.reserve;
  };

  const card = (i: number) => {
    const id = slots[i] ?? null;
    const w = getWeapon(id);
    const active = i === activeSlot;
    const total = count(id);
    return (
      <button
        key={i}
        type="button"
        onClick={() => onSelect(i)}
        disabled={!w}
        aria-label={w ? `Select ${w.name}` : "Empty weapon slot"}
        className={`pointer-events-auto relative h-[58px] w-[104px] overflow-hidden border-2 transition ${
          active
            ? "border-[#ff4d3d] bg-gradient-to-b from-[#5a1512]/85 to-black/80"
            : w
              ? "border-white/20 bg-black/55 hover:border-[#ff4d3d]/60"
              : "border-dashed border-white/15 bg-black/35 opacity-45"
        }`}
        style={{ clipPath: "polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)" }}
      >
        {w ? (
          <>
            <img
              src={w.image}
              alt={w.name}
              width={512}
              height={512}
              loading="lazy"
              className="absolute inset-x-1 top-1 h-8 w-[calc(100%-8px)] object-contain"
            />
            <span className="absolute bottom-1 left-2 text-[13px] font-bold tabular-nums text-white drop-shadow">
              {total ?? "—"}
            </span>
            <span className="absolute bottom-1.5 right-2 text-[7px] font-semibold uppercase tracking-widest text-white/60">
              {w.name}
            </span>
          </>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[8px] uppercase tracking-widest text-white/45">
            Empty
          </span>
        )}
        <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#ff4d3d]/70" />
      </button>
    );
  };

  const sidearm = getWeapon(slots[2] ?? null);
  const melee = getWeapon(slots[3] ?? null);

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-end gap-2 sm:right-5 sm:top-5">
      {/* melee + unlimited-ammo row */}
      <div className="flex items-center gap-4">
        <span className="text-lg leading-none text-white/70">∞</span>
        <button
          type="button"
          onClick={() => onSelect(3)}
          aria-label="Select melee"
          className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border transition ${
            activeSlot === 3 ? "border-[#ff4d3d] bg-white/15" : "border-white/25 bg-black/40"
          }`}
        >
          <img
            src={fistIcon}
            alt=""
            width={512}
            height={512}
            loading="lazy"
            className="h-6 w-6 object-contain [filter:invert(1)] opacity-90"
          />
        </button>
      </div>

      {/* primaries + sidearm */}
      <div className="flex items-end gap-2">
        {card(0)}
        {card(1)}
        <button
          type="button"
          onClick={() => onSelect(2)}
          disabled={!sidearm}
          aria-label={sidearm ? `Select ${sidearm.name}` : "Empty sidearm slot"}
          className={`pointer-events-auto flex h-[58px] w-[58px] flex-col items-center justify-center rounded-md border transition ${
            activeSlot === 2 ? "border-[#ff4d3d] bg-white/10" : "border-white/20 bg-black/45"
          } ${sidearm ? "" : "opacity-40"}`}
        >
          {sidearm && (
            <>
              <img
                src={sidearm.image}
                alt={sidearm.name}
                width={512}
                height={512}
                loading="lazy"
                className="h-6 w-full object-contain px-1"
              />
              <span className="text-[11px] font-bold tabular-nums text-white">{count(sidearm.id) ?? "—"}</span>
            </>
          )}
        </button>
      </div>
      {melee ? <span className="sr-only">{melee.name}</span> : null}
    </div>
  );
}
