import { useRef, useState } from "react";
import { X } from "lucide-react";
import { getWeapon } from "./weapons";
import fistIcon from "@/assets/hud/fist.png";
import crouchIcon from "@/assets/hud/crouch.png";
import proneIcon from "@/assets/hud/prone.png";
import standIcon from "@/assets/hud/stand.png";
import scopeIcon from "@/assets/hud/scope.png";
import medkitIcon from "@/assets/hud/medkit.png";
import wallIcon from "@/assets/hud/wall.png";
import backpackIcon from "@/assets/hud/backpack.png";
import sprintIcon from "@/assets/hud/sprint.png";

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

/** shared round glass button, matching the reference HUD's dark translucent discs */
const disc =
  "pointer-events-auto flex items-center justify-center rounded-full border border-white/25 bg-black/45 backdrop-blur-sm transition active:scale-95 active:bg-white/25 select-none";

const glyph = "object-contain [filter:invert(1)] opacity-90";

const MOVE_KEYS = ["KeyW", "KeyS", "KeyA", "KeyD"] as const;

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
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [sprinting, setSprinting] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);
  const padId = useRef<number | null>(null);

  const clearMove = () => {
    MOVE_KEYS.forEach((k) => release(k));
    release("ShiftLeft");
    setSprinting(false);
  };

  const applyStick = (dx: number, dy: number, radius: number) => {
    const dist = Math.hypot(dx, dy);
    const max = radius;
    const clamped = dist > max ? max / dist : 1;
    const nx = dx * clamped;
    const ny = dy * clamped;
    setKnob({ x: nx, y: ny });

    const dead = radius * 0.22;
    MOVE_KEYS.forEach((k) => release(k));
    if (dist < dead) {
      release("ShiftLeft");
      setSprinting(false);
      return;
    }
    if (ny < -dead * 0.6) press("KeyW");
    if (ny > dead * 0.6) press("KeyS");
    if (nx < -dead * 0.6) press("KeyA");
    if (nx > dead * 0.6) press("KeyD");
    const run = dist > radius * 0.82;
    setSprinting(run);
    if (run) press("ShiftLeft");
    else release("ShiftLeft");
  };

  const padHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = padRef.current;
      if (!el) return;
      padId.current = e.pointerId;
      el.setPointerCapture(e.pointerId);
      const r = el.getBoundingClientRect();
      applyStick(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2), r.width / 2 - 22);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (padId.current !== e.pointerId) return;
      const el = padRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      applyStick(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2), r.width / 2 - 22);
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (padId.current !== e.pointerId) return;
      padId.current = null;
      setKnob({ x: 0, y: 0 });
      clearMove();
    },
    onPointerCancel: () => {
      padId.current = null;
      setKnob({ x: 0, y: 0 });
      clearMove();
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };

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
      {/* ---- sprint / posture indicator, left of the stick ---- */}
      <div className="absolute bottom-[228px] left-8">
        <img
          src={sprintIcon}
          alt="Sprinting"
          width={512}
          height={512}
          loading="lazy"
          className={`h-12 w-12 object-contain transition-opacity ${sprinting ? "opacity-100" : "opacity-30"}`}
        />
      </div>

      {/* ---- left: analog movement stick ---- */}
      <div
        ref={padRef}
        {...padHandlers}
        className="pointer-events-auto absolute bottom-6 left-6 h-[164px] w-[164px] rounded-full border border-white/15 bg-black/25 backdrop-blur-[2px]"
      >
        <div className="absolute inset-3 rounded-full border border-white/10" />
        {/* directional chevrons */}
        <span className="absolute left-1/2 top-1.5 -translate-x-1/2 text-[13px] leading-none text-white/45">▲</span>
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[13px] leading-none text-white/45">▼</span>
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[13px] leading-none text-white/45">◀</span>
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[13px] leading-none text-white/45">▶</span>
        <div
          className="absolute left-1/2 top-1/2 h-[70px] w-[70px] rounded-full border border-white/30 bg-white/15 shadow-[0_0_18px_-4px_rgba(0,0,0,0.9)] backdrop-blur"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>

      {/* ---- bottom-left utility row: backpack + gloo wall ---- */}
      <div className="absolute bottom-8 left-[190px] flex items-end gap-3">
        <button aria-label="Open backpack" className={`${disc} h-12 w-12`} {...tap(() => setBagOpen((v) => !v))}>
          <img src={backpackIcon} alt="" width={512} height={512} loading="lazy" className={`h-6 w-6 ${glyph}`} />
        </button>
        <button
          aria-label="Throw shield wall"
          disabled={walls <= 0}
          className={`${disc} relative h-14 w-14 ${walls > 0 ? "border-sky-300/60" : "opacity-35"}`}
          {...tap(() => walls > 0 && onThrowWall())}
        >
          <img src={wallIcon} alt="" width={512} height={512} loading="lazy" className={`h-7 w-7 ${glyph}`} />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-black/85 px-1.5 text-[10px] font-bold tabular-nums text-white">
            {walls}
          </span>
        </button>
      </div>

      {/* ---- consumables strip, centered above the HP bar ---- */}
      <div className="absolute bottom-[54px] left-1/2 flex -translate-x-1/2 items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => {
          const filled = i < kits;
          return (
            <button
              key={i}
              aria-label="Use medkit"
              disabled={!filled}
              className={`${disc} h-9 w-9 ${filled ? "border-emerald-300/60" : "opacity-30"}`}
              {...tap(() => filled && onHeal())}
            >
              <img src={medkitIcon} alt="" width={512} height={512} loading="lazy" className={`h-4 w-4 ${glyph}`} />
            </button>
          );
        })}
      </div>

      {/* ---- right: fire button + posture cluster ---- */}
      <div className="absolute bottom-6 right-6 flex items-end gap-3">
        <div className="flex flex-col items-center gap-3">
          <button
            aria-label="Toggle scope"
            className={`${disc} h-12 w-12 ${scoped ? "border-[var(--hud-accent)] bg-[var(--hud-accent)]/35" : ""}`}
            {...tap(onScopeToggle)}
          >
            <img src={scopeIcon} alt="" width={512} height={512} loading="lazy" className={`h-6 w-6 ${glyph}`} />
          </button>
          <button
            aria-label="Fire"
            className={`${disc} h-[88px] w-[88px] border-white/35 bg-white/10`}
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
            <img src={fistIcon} alt="" width={512} height={512} loading="lazy" className={`h-11 w-11 ${glyph}`} />
          </button>
        </div>

        {/* right edge posture stack: stand / crouch / prone / jump */}
        <div className="flex flex-col gap-2.5">
          <button aria-label="Jump" className={`${disc} h-12 w-12`} {...tap(onJump)}>
            <img src={standIcon} alt="" width={512} height={512} loading="lazy" className={`h-7 w-7 ${glyph}`} />
          </button>
          <button
            aria-label="Crouch"
            className={`${disc} h-12 w-12`}
            {...tap(() => {
              press("KeyC");
              setTimeout(() => release("KeyC"), 80);
            })}
          >
            <img src={crouchIcon} alt="" width={512} height={512} loading="lazy" className={`h-7 w-7 ${glyph}`} />
          </button>
          <button
            aria-label="Toggle prone"
            className={`${disc} h-12 w-12 ${prone ? "border-[var(--hud-accent)] bg-[var(--hud-accent)]/35" : ""}`}
            {...tap(onProneToggle)}
          >
            <img src={proneIcon} alt="" width={512} height={512} loading="lazy" className={`h-7 w-7 ${glyph}`} />
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
              <img src={medkitIcon} alt="" width={512} height={512} loading="lazy" className={`h-4 w-4 ${glyph}`} />
              <span className="flex-1 uppercase tracking-wide">Medkits</span>
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
              <img src={wallIcon} alt="" width={512} height={512} loading="lazy" className={`h-4 w-4 ${glyph}`} />
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
