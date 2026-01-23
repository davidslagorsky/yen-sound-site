import React, { useEffect, useMemo, useRef, useState } from "react";
import roster from "./rosterData";
import { useNavigate, Link } from "react-router-dom";

/** Shuffle once per page open (Fisher–Yates) */
function shuffleOnce(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Roster() {
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ w: 720, h: 720 });

  // ✅ randomized order once per page open (stable afterward)
  const [shuffledRoster] = useState(() => shuffleOnce(roster));

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      setStageSize({ w: r.width, h: r.height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const minSide = Math.min(stageSize.w, stageSize.h);
  const isMobile = minSide < 560;
  const n = Math.max(1, shuffledRoster.length);

  // ---------- Base sunflower points (normalized) ----------
  const seedPoints = useMemo(() => {
    const goldenAngle = 137.50776405003785;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const theta = (i * goldenAngle * Math.PI) / 180;
      const r = Math.sqrt((i + 0.35) / (n + 0.35));
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;

      // deterministic drift (visible on desktop)
      const dx = (Math.sin((i + 1) * 91) * 18).toFixed(2);
      const dy = (Math.cos((i + 1) * 57) * 18).toFixed(2);

      // a touch faster so you can *feel* it
      const dur = (6.0 + (i % 7) * 0.45).toFixed(2);
      const delay = ((i % 9) * 0.18).toFixed(2);

      pts.push({ x, y, dx, dy, dur, delay, r });
    }
    return pts;
  }, [n]);

  // ---------- Stage-aware geometry (fills desktop better) ----------
  const stageMin = Math.max(1, Math.min(stageSize.w, stageSize.h));

  // Bigger disk on desktop, responsive to actual stage size
  const diskRadiusPx = Math.max(
    isMobile ? 190 : 320,
    stageMin * (isMobile ? 0.50 : 0.78)
  );

  // Desktop: fill space (some closeness ok), Mobile: safe
  const fillFactor = isMobile ? 0.70 : 1.55;

  const stageArea = Math.PI * diskRadiusPx * diskRadiusPx;
  const areaPer = (stageArea / n) * fillFactor;
  const idealDiameter = 2 * Math.sqrt(areaPer / Math.PI);

  const bubbleMin = Math.max(isMobile ? 72 : 120, stageMin * (isMobile ? 0.11 : 0.17));
  const bubbleMax = Math.max(isMobile ? 112 : 280, stageMin * (isMobile ? 0.18 : 0.38));
  const baseBubble = Math.max(bubbleMin, Math.min(bubbleMax, idealDiameter));

  // Minimal, single-line name (small)
  const computeNamePx = (bubbleSize, name) => {
    const len = Math.max(6, name.length);
    const raw = bubbleSize * 0.098 - len * 0.10;
    return Math.max(9, Math.min(bubbleSize * 0.12, raw));
  };

  // ---------- Position + depth + collision relaxation (mobile) ----------
  const nodes = useMemo(() => {
    const pts = seedPoints.map((p, i) => {
      const depth = 1 - Math.min(1, p.r); // center=1, edge=0

      // Depth sizing (desktop only). Mobile stays uniform to avoid collisions.
      const sizeFactor = isMobile ? 1.0 : 0.86 + depth * 0.32;
      const size = baseBubble * sizeFactor;

      return {
        i,
        x: p.x * diskRadiusPx,
        y: p.y * diskRadiusPx,
        rNorm: p.r,
        depth,
        size,
        dx: p.dx,
        dy: p.dy,
        dur: p.dur,
        delay: p.delay,
      };
    });

    if (!isMobile) return pts;

    // Mobile collision-avoidance with TRUE radii + padding
    const iterations = 62;
    const pad = 16;
    const maxR = diskRadiusPx * 0.98;

    for (let it = 0; it < iterations; it++) {
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;

          const ra = a.size / 2;
          const rb = b.size / 2;
          const minDist = ra + rb + pad;

          if (dist < minDist) {
            const push = (minDist - dist) * 0.52;
            const ux = dx / dist;
            const uy = dy / dist;

            a.x -= ux * push;
            a.y -= uy * push;
            b.x += ux * push;
            b.y += uy * push;
          }
        }

        // clamp inside disk
        const p = pts[i];
        const d = Math.sqrt(p.x * p.x + p.y * p.y) || 0.0001;
        if (d > maxR) {
          const s = maxR / d;
          p.x *= s;
          p.y *= s;
        }
      }
    }

    return pts;
  }, [seedPoints, diskRadiusPx, isMobile, baseBubble]);

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <div style={styles.topBar}>
        <button
          onClick={() => navigate(-1)}
          style={styles.arrowBtn}
          aria-label="Back"
          title="Back"
        >
          ←
        </button>

        <div style={styles.topTitle}>YEN SOUND ROSTER</div>
        <div style={{ width: 22 }} />
      </div>

      <div style={styles.centerWrap}>
        <div ref={stageRef} style={styles.stage}>
          <div style={styles.ambientGlow} />
          <div style={styles.vignette} />

          {shuffledRoster.map((artist, idx) => {
            const p = nodes[idx];
            const name = (artist.displayName || artist.name || "").toUpperCase();

            const size = Math.round(p.size);
            const namePx = computeNamePx(size, name);

            // Depth layering (more noticeable, still tasteful)
            const z = Math.round(10 + p.depth * 80);
            const blur = isMobile ? 0 : (1 - p.depth) * 2.2;
            const dim = isMobile ? 1 : 0.82 + p.depth * 0.22;

            const depthOpacity = isMobile ? 1 : 0.78 + p.depth * 0.22;
            const depthScale = isMobile ? 1 : 0.94 + p.depth * 0.08;

            // Movement: desktop strong, mobile safe
            const driftScale = isMobile ? 0.42 : 1.65;

            return (
              <Link
                key={artist.slug || idx}
                to={`/artist/${artist.slug}`}
                className="ys-bubble ys-float"
                style={{
                  width: size,
                  height: size,
                  left: "50%",
                  top: "50%",
                  // Base position + animated offsets --mx/--my
                  transform: `translate(calc(-50% + ${p.x}px + var(--mx, 0px)), calc(-50% + ${p.y}px + var(--my, 0px)))`,
                  zIndex: z,
                  opacity: depthOpacity,
                  filter: `blur(${blur}px) brightness(${dim})`,
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                  "--dur": `${p.dur}s`,
                  "--delay": `${p.delay}s`,
                  "--driftScale": driftScale,
                  "--depthScale": depthScale,
                }}
                aria-label={`Open ${name}`}
              >
                <div className="ys-inner">
                  <img
                    src={artist.image}
                    alt={name}
                    className="ys-bubbleImg"
                    draggable={false}
                    loading="lazy"
                  />
                  <div className="ys-bubbleOverlay" />
                  <div className="ys-bubbleName" style={{ fontSize: namePx }}>
                    {name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "18px 16px 70px",
    background: "#000",
    color: "#fff",
    overflowX: "hidden",
  },

  topBar: {
    maxWidth: 1280,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "22px 1fr 22px",
    alignItems: "center",
    gap: 10,
    padding: "14px 0 10px",
  },

  // Minimal arrow (no circle)
  arrowBtn: {
    width: 22,
    height: 22,
    padding: 0,
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 20,
    lineHeight: "22px",
  },

  topTitle: {
    textAlign: "center",
    fontWeight: 900,
    letterSpacing: 2,
    fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
    textTransform: "uppercase",
    opacity: 0.92,
  },

  centerWrap: {
    maxWidth: 1280,
    margin: "0 auto",
    display: "grid",
    placeItems: "center",
    paddingTop: 0,
  },

  // ✅ desktop fills space better; mobile still works
  stage: {
    position: "relative",

    // slightly higher “Apple” placement (not perfectly centered)
    marginTop: "clamp(10px, 3.2vh, 36px)",

    width: "min(96vw, 1280px)",
    height: "min(70vh, 820px)",

    maxWidth: "96vw",
    maxHeight: "calc(86vh - 56px)",

    isolation: "isolate",
  },

  ambientGlow: {
    position: "absolute",
    inset: "-30%",
    background:
      "radial-gradient(closest-side at 50% 50%, rgba(255,255,255,0.07), rgba(255,255,255,0) 72%)",
    filter: "blur(26px)",
    pointerEvents: "none",
    zIndex: 0,
  },

  vignette: {
    position: "absolute",
    inset: "-10%",
    background:
      "radial-gradient(70% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
    pointerEvents: "none",
    zIndex: 0,
  },
};

const css = `
.ys-bubble{
  position:absolute;
  display:block;
  border-radius:999px;
  text-decoration:none;
  overflow:visible; /* inner handles clipping */

  /* softer, cleaner */
  box-shadow:
    0 18px 50px rgba(0,0,0,0.52),
    0 0 0 1px rgba(255,255,255,0.05) inset;

  will-change: transform, filter, opacity;
  transform-origin: center;
}

/* inner wrapper = lets us “breathe” (scale) without fighting the outer position transform */
.ys-inner{
  position:absolute;
  inset:0;
  border-radius:999px;
  overflow:hidden;
  transform: scale(var(--depthScale, 1));
  will-change: transform;
}

.ys-bubbleImg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:999px;
  filter: contrast(1.01) saturate(1.04);
}

.ys-bubbleOverlay{
  position:absolute;
  inset:0;
  border-radius:999px;
  background:
    radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.14), rgba(255,255,255,0) 58%),
    radial-gradient(120% 120% at 50% 90%, rgba(0,0,0,0.26), rgba(0,0,0,0) 62%),
    linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
  opacity:0.62;
  pointer-events:none;
}

/* minimal single-line name */
.ys-bubbleName{
  position:absolute;
  left:50%;
  top:50%;
  transform: translate(-50%, -50%);
  z-index:3;

  max-width: 72%;
  text-align:center;

  font-weight: 900;
  letter-spacing: 0.75px;
  text-transform: uppercase;

  opacity: 0.44;
  color: rgba(255,255,255,0.92);
  text-shadow: 0 10px 20px rgba(0,0,0,0.55);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select:none;
  pointer-events:none;
}

/* Smooth animatable CSS vars (reliable motion) */
@property --mx {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}
@property --my {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

.ys-float{
  --mx: 0px;
  --my: 0px;
  animation: ysMove var(--dur, 6.8s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

/* subtle “Apple” breathing on the inner content */
.ys-inner{
  animation: ysBreath 10.5s ease-in-out infinite;
}

@keyframes ysBreath{
  0%, 100% { transform: scale(var(--depthScale, 1)); }
  50% { transform: scale(calc(var(--depthScale, 1) * 1.022)); }
}

/* visible movement but still premium */
@keyframes ysMove{
  0%   { --mx: 0px; --my: 0px; }
  20%  { --mx: calc(var(--dx, 16px) * 0.95 * var(--driftScale, 1)); --my: calc(var(--dy, -16px) * 0.70 * var(--driftScale, 1)); }
  50%  { --mx: calc(var(--dx, 16px) * -1.05 * var(--driftScale, 1)); --my: calc(var(--dy, -16px) * 0.35 * var(--driftScale, 1)); }
  75%  { --mx: calc(var(--dx, 16px) * 0.60 * var(--driftScale, 1)); --my: calc(var(--dy, -16px) * -1.05 * var(--driftScale, 1)); }
  100% { --mx: 0px; --my: 0px; }
}

/* hover: freeze + bring forward */
.ys-bubble:hover{
  animation-play-state: paused;
  --mx: 0px;
  --my: 0px;
  filter: none !important;
  opacity: 1 !important;
  z-index: 9999 !important;

  box-shadow:
    0 26px 80px rgba(0,0,0,0.64),
    0 0 0 1px rgba(255,255,255,0.12) inset,
    0 0 46px rgba(255,255,255,0.09);
}
.ys-bubble:hover .ys-inner{
  animation-play-state: paused;
  transform: scale(1.06);
}
.ys-bubble:hover .ys-bubbleName{
  opacity: 0.95;
  letter-spacing: 1.05px;
  text-shadow:
    0 14px 34px rgba(0,0,0,0.65),
    0 0 18px rgba(255,255,255,0.10);
}

/* reduced motion */
@media (prefers-reduced-motion: reduce){
  .ys-float{ animation:none !important; }
  .ys-inner{ animation:none !important; }
}
`;
