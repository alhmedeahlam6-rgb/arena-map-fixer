import { useState } from "react";
import { Backpack, Crosshair, Shield, HeartPulse, ArrowBigUp, Target, MoveDown, X } from "lucide-react";
import { getWeapon } from "./weapons";

type Props = {
  press: (code: string) => void;
  release: (code: string) => void;
  onShootStart: () => void;
  onShootEnd: () => void;
  onScopeToggle: () => void;
  scoped: boolean;
  onJump: () => void;
  onProneToggle: () => void;
  prone: boolean;
  kits: number;
  onHeal: () => void;
  walls: number;
  onThrowWall: () => void;
  slots: (string | null)[];
  onDropWeapon: (index: number) => void;
};

const btn =
  "pointer-events-auto flex items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm active:scale-95 active:bg-white/25 transition select-none";

export default function TouchControls({
  press,
  release,
  onShootStart,
  onShootEnd,
  onScopeToggle,
  scoped,
  onJump,
  onProneToggle,
  prone,
  kits,
  onHeal,
  walls,
  onThrowWall,
  slots,
  onDropWeapon,
}: Props) {
  const [bagOpen, setBagOpen] = useState(false);

  const hold = (code: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      press(code);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      release(code);
    },
    onPointerLeave: () => release(code),
    onPointerCancel: () => release(code),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const tap = (fn: () => void) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      fn();
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-30 touch-none select-none">
      {/* ---- left: movement pad ---- */}
      <div className="pointer-events-none absolute bottom-6 left-4 flex flex-col items-center gap-1">
        <button aria-label="Forward" className={`${btn} h-14 w-14`} {...hold("KeyW")}>
          W
        </button>
        <div className="flex gap-1">
          <button aria-label="Left" className={`${btn} h-14 w-14`} {...hold("KeyA")}>
            A
          </button>
          <button aria-label="Back" className={`${btn} h-14 w-14`} {...hold("KeyS")}>
            S
          </button>
          <button aria-label="Right" className={`${btn} h-14 w-14`} {...hold("KeyD")}>
            D
          </button>
        </div>
        <button
          aria-label="Sprint"
          className={`${btn} mt-1 h-10 w-[178px] text-[10px] font-bold uppercase tracking-widest`}
          {...hold("ShiftLeft")}
        >
          Sprint
        </button>
      </div>

      {/* ---- health kits, above the pad ---- */}
      <div className="pointer-events-none absolute bottom-[212px] left-4 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => {
          const filled = i < kits;
          return (
            <button
              key={i}
              aria-label="Use health kit"
              disabled={!filled}
              className={`${btn} h-11 w-11 ${filled ? "border-rose-400/70 bg-rose-600/40" : "opacity-30"}`}
              {...tap(() => filled && onHeal())}
            >
              <HeartPulse className="h-5 w-5" />
            </button>
          );
        })}
      </div>

      {/* ---- left edge: shield wall ---- */}
      <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-3">
        <button
          aria-label="Throw shield wall"
          disabled={walls <= 0}
          className={`${btn} relative h-16 w-16 ${walls > 0 ? "border-sky-300/60 bg-sky-600/35" : "opacity-30"}`}
          {...tap(() => walls > 0 && onThrowWall())}
        >
          <Shield className="h-7 w-7" />
          <span className="absolute -right-1 -top-1 rounded-full bg-black/80 px-1.5 text-[10px] font-bold tabular-nums">
            {walls}
          </span>
        </button>
        <button
          aria-label="Open backpack"
          className={`${btn} h-14 w-14`}
          {...tap(() => setBagOpen((v) => !v))}
        >
          <Backpack className="h-6 w-6" />
        </button>
      </div>

      {/* ---- right: action stack ---- */}
      <div className="pointer-events-none absolute bottom-6 right-4 flex items-end gap-3">
        <div className="flex flex-col gap-3">
          <button
            aria-label="Toggle prone"
            className={`${btn} h-14 w-14 ${prone ? "border-[var(--hud-accent)] bg-[var(--hud-accent)]/40" : ""}`}
            {...tap(onProneToggle)}
          >
            <MoveDown className="h-6 w-6" />
          </button>
          <button aria-label="Jump" className={`${btn} h-14 w-14`} {...tap(onJump)}>
            <ArrowBigUp className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <button
            aria-label="Toggle scope"
            className={`${btn} h-14 w-14 ${scoped ? "border-[var(--hud-accent)] bg-[var(--hud-accent)]/40" : ""}`}
            {...tap(onScopeToggle)}
          >
            <Target className="h-6 w-6" />
          </button>
          <button
            aria-label="Shoot"
            className={`${btn} h-20 w-20 border-white/35 bg-white/15`}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShootStart();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onShootEnd();
            }}
            onPointerLeave={onShootEnd}
            onPointerCancel={onShootEnd}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Crosshair className="h-9 w-9" />
          </button>
        </div>
      </div>

      {/* ---- backpack panel ---- */}
      {bagOpen && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/60 bg-card/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Backpack</p>
            <button aria-label="Close backpack" onClick={() => setBagOpen(false)} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 space-y-1.5">
            {slots.map((id, i) => {
              const w = getWeapon(id);
              if (!w) return null;
              return (
                <div key={i} className="flex items-center gap-2 rounded-md border border-border/50 px-2 py-1.5">
                  <img src={w.image} alt={w.name} width={512} height={512} className="h-7 w-11 object-contain" loading="lazy" />
                  <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-foreground">
                    {w.name}
                  </span>
                  {w.id !== "fists" && (
                    <button
                      onClick={() => onDropWeapon(i)}
                      className="rounded bg-destructive/80 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-destructive-foreground"
                    >
                      Drop
                    </button>
                  )}
                </div>
              );
            })}
            <div className="flex items-center gap-2 rounded-md border border-border/50 px-2 py-1.5 text-[11px] text-foreground">
              <HeartPulse className="h-4 w-4 text-rose-400" />
              <span className="flex-1 uppercase tracking-wide">Health kits</span>
              <span className="tabular-nums">{kits}</span>
              <button
                onClick={onHeal}
                disabled={kits <= 0}
                className="rounded bg-[var(--hud-accent)] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--hud-accent-foreground)] disabled:opacity-40"
              >
                Use
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border/50 px-2 py-1.5 text-[11px] text-foreground">
              <Shield className="h-4 w-4 text-sky-400" />
              <span className="flex-1 uppercase tracking-wide">Shield walls</span>
              <span className="tabular-nums">{walls}</span>
              <button
                onClick={onThrowWall}
                disabled={walls <= 0}
                className="rounded bg-[var(--hud-accent)] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--hud-accent-foreground)] disabled:opacity-40"
              >
                Throw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
