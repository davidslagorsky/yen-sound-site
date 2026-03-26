import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INTERVAL = 6000;
const SIZE = 340;       // canvas px
const SPACING = 8;      // grid spacing between dot centers
const MAX_R = 3.5;      // max dot radius
const MORPH_MS = 1200;  // total morph duration
const MORPH_STEPS = 48; // animation frames

/* ─── sample image into dot data [{x,y,r}] ─── */
function sampleImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = SIZE; off.height = SIZE;
      const ctx = off.getContext("2d");
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const dots = [];
      for (let y = SPACING / 2; y < SIZE; y += SPACING) {
        for (let x = SPACING / 2; x < SIZE; x += SPACING) {
          const d = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
          const lum = (0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]) / 255;
          dots.push({ x, y, r: lum * MAX_R });
        }
      }
      resolve(dots);
    };
    img.onerror = () => {
      // fallback: random noise dots
      const dots = [];
      for (let y = SPACING / 2; y < SIZE; y += SPACING)
        for (let x = SPACING / 2; x < SIZE; x += SPACING)
          dots.push({ x, y, r: Math.random() * MAX_R * 0.4 });
      resolve(dots);
    };
    img.src = src;
  });
}

/* ─── ease in-out ─── */
function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

/* ─── main component ─── */
export default function FeaturedDotwork({ releases }) {
  const canvasRef = useRef(null);
  const cacheRef  = useRef({});       // src → dots[]
  const stateRef  = useRef({ dots: [], idx: 0 }); // live render state
  const rafRef    = useRef(null);
  const timerRef  = useRef(null);
  const morphRef  = useRef(null);

  const [idx, setIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const items = releases?.slice(0, 6) || [];

  /* ─── preload + cache dot data for an item ─── */
  const getDots = useCallback(async (src) => {
    if (!cacheRef.current[src]) {
      cacheRef.current[src] = await sampleImage(src);
    }
    return cacheRef.current[src];
  }, []);

  /* ─── draw current dots to canvas ─── */
  const drawFrame = useCallback((dots) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "rgba(240,237,232,0.9)";
    for (const dot of dots) {
      if (dot.r < 0.15) continue;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  /* ─── render loop (just keeps canvas fresh) ─── */
  const startLoop = useCallback(() => {
    const loop = () => {
      drawFrame(stateRef.current.dots);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [drawFrame]);

  /* ─── morph from fromDots → toDots over MORPH_MS ─── */
  const morph = useCallback((fromDots, toDots, onDone) => {
    if (morphRef.current) clearInterval(morphRef.current);
    let step = 0;
    morphRef.current = setInterval(() => {
      step++;
      const t = ease(Math.min(step / MORPH_STEPS, 1));
      const interpolated = fromDots.map((a, i) => {
        const b = toDots[i] || { x: a.x, y: a.y, r: 0 };
        return { x: a.x, y: a.y, r: a.r + (b.r - a.r) * t };
      });
      stateRef.current.dots = interpolated;
      if (step >= MORPH_STEPS) {
        clearInterval(morphRef.current);
        stateRef.current.dots = toDots;
        onDone();
      }
    }, MORPH_MS / MORPH_STEPS);
  }, []);

  /* ─── transition to a new index ─── */
  const goTo = useCallback(async (nextIdx) => {
    if (transitioning || !items.length) return;
    setTransitioning(true);

    const currentSrc = items[stateRef.current.idx]?.cover;
    const nextSrc    = items[nextIdx]?.cover;
    if (!currentSrc || !nextSrc) { setIdx(nextIdx); stateRef.current.idx = nextIdx; setTransitioning(false); return; }

    const [fromDots, toDots] = await Promise.all([getDots(currentSrc), getDots(nextSrc)]);

    morph(fromDots, toDots, () => {
      stateRef.current.idx = nextIdx;
      setIdx(nextIdx);
      setTransitioning(false);
    });
  }, [transitioning, items, getDots, morph]);

  /* ─── init: load first image ─── */
  useEffect(() => {
    if (!items.length) return;
    let cancelled = false;
    getDots(items[0].cover).then(dots => {
      if (cancelled) return;
      stateRef.current.dots = dots;
      startLoop();
    });
    // preload rest in background
    items.slice(1).forEach(r => getDots(r.cover));
    return () => { cancelled = true; cancelAnimationFrame(rafRef.current); if (morphRef.current) clearInterval(morphRef.current); };
  }, []); // eslint-disable-line

  /* ─── auto-advance ─── */
  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      const next = (stateRef.current.idx + 1) % items.length;
      goTo(next);
    }, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [goTo, items.length]);

  if (!items.length) return null;

  const current = items[idx];

  return (
    <div style={{
      borderTop: "1px solid #1a1a1a",
      background: "#000",
      padding: "48px 24px 40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>

      {/* label */}
      <p style={{
        fontFamily: F, fontSize: "8px", letterSpacing: "0.4em",
        textTransform: "uppercase", color: "rgba(240,237,232,0.25)",
        marginBottom: "28px",
      }}>
        Featured
      </p>

      {/* canvas */}
      <div style={{
        position: "relative",
        width: SIZE, height: SIZE,
        maxWidth: "100%",
      }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        {/* scanline overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)",
        }} />
      </div>

      {/* artist + title */}
      <div style={{ textAlign: "center", marginTop: "28px", marginBottom: "24px" }}>
        <p
          key={`artist-${idx}`}
          style={{
            fontFamily: F, fontSize: "9px", letterSpacing: "0.3em",
            textTransform: "uppercase", color: "rgba(240,237,232,0.4)",
            marginBottom: "8px",
            animation: "yen-feat-fade 0.5s ease both",
          }}
        >
          {current.artist}
        </p>
        <p
          key={`title-${idx}`}
          style={{
            fontFamily: F, fontSize: "24px", fontWeight: 900,
            letterSpacing: "-0.02em", lineHeight: 1.1,
            color: "#f0ede8", textTransform: "uppercase",
            animation: "yen-feat-fade 0.5s 0.07s ease both",
          }}
        >
          {current.title}
        </p>
        {current.type && (
          <p
            key={`type-${idx}`}
            style={{
              fontFamily: F, fontSize: "8px", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "rgba(240,237,232,0.2)",
              marginTop: "8px",
              animation: "yen-feat-fade 0.5s 0.12s ease both",
            }}
          >
            {current.type}
          </p>
        )}
      </div>

      {/* listen link */}
      <Link
        to={`/release/${current.slug}`}
        style={{
          fontFamily: F, fontSize: "9px", letterSpacing: "0.25em",
          textTransform: "uppercase", color: "rgba(240,237,232,0.45)",
          textDecoration: "none",
          border: "1px solid rgba(240,237,232,0.15)",
          padding: "8px 16px",
          transition: "all 0.15s",
          display: "inline-block",
          marginBottom: "32px",
        }}
        onMouseOver={e => { e.currentTarget.style.color = "#f0ede8"; e.currentTarget.style.borderColor = "rgba(240,237,232,0.5)"; }}
        onMouseOut={e => { e.currentTarget.style.color = "rgba(240,237,232,0.45)"; e.currentTarget.style.borderColor = "rgba(240,237,232,0.15)"; }}
      >
        Listen →
      </Link>

      {/* dot nav */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => !transitioning && goTo(i)}
            style={{
              width: i === idx ? "22px" : "5px",
              height: "5px",
              borderRadius: "3px",
              border: "none",
              background: i === idx ? "rgba(240,237,232,0.7)" : "rgba(240,237,232,0.18)",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.35s ease",
            }}
          />
        ))}
      </div>

      {/* progress bar */}
      <div style={{
        width: "100%", height: "1px", background: "#111",
        position: "relative", overflow: "hidden", marginTop: "32px",
      }}>
        <div
          key={idx}
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            background: "rgba(240,237,232,0.3)",
            animation: `yen-feat-progress ${INTERVAL}ms linear both`,
          }}
        />
      </div>

      <style>{`
        @keyframes yen-feat-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes yen-feat-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
