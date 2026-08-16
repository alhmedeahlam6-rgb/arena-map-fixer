import { getWeapon } from "./weapons";

type Props = {
  /** [heavy 1, heavy 2, sidearm, fists] — nulls render as empty slots */
  slots: (string | null)[];
  activeSlot: number;
  onSelect: (index: number) => void;
};

const EMPTY_LABEL = ["Empty", "Empty", "Sidearm", "Fists"];

export default function WeaponSlots({ slots, activeSlot, onSelect }: Props) {
  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-10 grid w-[184px] grid-cols-2 grid-rows-2 gap-1.5 sm:right-6 sm:top-6 sm:w-[204px]">
      {slots.slice(0, 4).map((id, i) => {
        const w = getWeapon(id);
        const active = i === activeSlot;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            disabled={!w}
            className={`group relative flex h-[62px] w-full items-center justify-center rounded-md border backdrop-blur transition ${
              active
                ? "border-[var(--hud-accent)] bg-[var(--hud-panel)] shadow-[var(--shadow-hud)]"
                : w
                  ? "border-border/60 bg-[var(--hud-panel-dim)] hover:border-[var(--hud-accent)]/60"
                  : "border-dashed border-border/40 bg-[var(--hud-panel-dim)] opacity-50"
            }`}
          >
            <span
              className={`absolute left-1.5 top-1 text-[10px] font-bold tabular-nums ${
                active ? "text-[var(--hud-accent)]" : "text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            {w ? (
              <>
                <img
                  src={w.image}
                  alt={`${w.name} ${w.cls}`}
                  width={512}
                  height={512}
                  className="h-9 w-full object-contain px-3"
                  loading="lazy"
                />
                <span className="absolute bottom-0.5 text-[8px] font-semibold uppercase tracking-widest text-foreground/90">
                  {w.name}
                </span>
              </>
            ) : (
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                {EMPTY_LABEL[i]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
