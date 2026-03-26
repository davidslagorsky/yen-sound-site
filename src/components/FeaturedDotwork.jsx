import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INTERVAL = 5000;

/* ─── draw cover as halftone dots onto canvas ─── */
function drawDotwork(canvas, imgSrc, onDone) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    // draw image into offscreen canvas to sample pixels
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const octx = off.getContext("2d");
    octx.drawImage(img, 0, 0, W, H);

    const SPACING = 7;   // distance between dot centers
    const MAX_R  = 3.2;  // max dot radius

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    for (let y = SPACING / 2; y < H; y += SPACING) {
      for (let x = SPACING / 2; x < W; x += SPACING) {
        const d = octx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
        // luminance 0-1
        const lum = (0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]) / 255;
        const r = lum * MAX_R;
        if (r < 0.25) continue;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,237,232,${0.3 + lum * 0.7})`;
        ctx.fill();
      }
    }
    if (onDone) onDone();
  };
  img.onerror = () => {
    // fallback: just draw a dot pattern with no image
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    const SPACING = 8;
    for (let y = SPACING / 2; y < H; y += SPACING) {
      for (let x = SPACING / 2; x < W; x += SPACING) {
        const r = 1 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(240,237,232,0.15)";
        ctx.fill();
      }
    }
    if (onDone) onDone();
  };
  img.src = imgSrc;
}

/* ─── single dot canvas ─── */
function DotCanvas({ src, active }) {
  const canvasRef = useRef(null);
  const drawn = useRef(false);

  useEffect(() => {
    if (!active || drawn.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawn.current = true;
    drawDotwork(canvas, src, null);
  }, [active, src]);

  return (
    <canvas
      ref={canvasRef}
      width={420}
      height={420}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        opacity: active ? 1 : 0,
        transition: "opacity 0.9s ease",
        display: "block",
      }}
    />
  );
}

/* ─── main component ─── */
export default function FeaturedDotwork({ releases }) {
  const [idx, setIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const items = releases?.slice(0, 6) || [];

  const goTo = useCallback((next) => {
    if (transitioning || next === idx) return;
    setTransitioning(true);
    setIdx(next);
    setTimeout(() => { setTransitioning(false); }, 1000);
  }, [idx, transitioning]);

  // auto-advance
  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx(i => {
        setTransitioning(true);
        setTimeout(() => { setTransitioning(false); }, 1000);
        return (i + 1) % items.length;
      });
    }, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  if (!items.length) return null;

  const current = items[idx];

  return (
    <div style={{
      borderTop: "1px solid #1a1a1a",
      borderBottom: "1px solid #1a1a1a",
      background: "#000",
      overflow: "hidden",
      position: "relative",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "row",
        minHeight: "260px",
        maxWidth: "100%",
        position: "relative",
      }}>

        {/* ── dot art panel ── */}
        <div style={{
          width: "220px",
          minWidth: "220px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          borderRight: "1px solid #1a1a1a",
        }}>
          {/* render all canvases, show only active */}
          {items.map((r, i) => (
            <DotCanvas key={r.slug || i} src={r.cover} active={i === idx} />
          ))}

          {/* subtle scanline overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          }} />
        </div>

        {/* ── text panel ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "28px 24px 24px",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* label */}
          <p style={{
            fontFamily: F, fontSize: "8px", letterSpacing: "0.35em",
            textTransform: "uppercase", color: "rgba(240,237,232,0.3)",
            marginBottom: "20px",
          }}>
            Featured
          </p>

          {/* artist + title — animate on change */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p
              key={`artist-${idx}`}
              style={{
                fontFamily: F, fontSize: "10px", letterSpacing: "0.25em",
                textTransform: "uppercase", color: "rgba(240,237,232,0.45)",
                marginBottom: "10px",
                animation: "yen-fade-up 0.5s ease both",
              }}
            >
              {current.artist}
            </p>
            <p
              key={`title-${idx}`}
              style={{
                fontFamily: F, fontSize: "22px", fontWeight: 900,
                letterSpacing: "-0.02em", lineHeight: 1.1,
                color: "#f0ede8",
                textTransform: "uppercase",
                animation: "yen-fade-up 0.5s 0.06s ease both",
              }}
            >
              {current.title}
            </p>
            {current.type && (
              <p
                key={`type-${idx}`}
                style={{
                  fontFamily: F, fontSize: "8px", letterSpacing: "0.3em",
                  textTransform: "uppercase", color: "rgba(240,237,232,0.25)",
                  marginTop: "10px",
                  animation: "yen-fade-up 0.5s 0.1s ease both",
                }}
              >
                {current.type}
              </p>
            )}
          </div>

          {/* nav + listen link */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
            {/* dot nav */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === idx ? "20px" : "5px",
                    height: "5px",
                    borderRadius: "3px",
                    border: "none",
                    background: i === idx ? "rgba(240,237,232,0.8)" : "rgba(240,237,232,0.2)",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>

            {/* listen link */}
            <Link
              to={`/release/${current.slug}`}
              style={{
                fontFamily: F, fontSize: "9px", letterSpacing: "0.25em",
                textTransform: "uppercase", color: "rgba(240,237,232,0.5)",
                textDecoration: "none",
                border: "1px solid rgba(240,237,232,0.15)",
                padding: "7px 12px",
                transition: "all 0.15s",
                display: "inline-block",
              }}
              onMouseOver={e => { e.currentTarget.style.color = "#f0ede8"; e.currentTarget.style.borderColor = "rgba(240,237,232,0.5)"; }}
              onMouseOut={e => { e.currentTarget.style.color = "rgba(240,237,232,0.5)"; e.currentTarget.style.borderColor = "rgba(240,237,232,0.15)"; }}
            >
              Listen →
            </Link>
          </div>
        </div>
      </div>

      {/* progress bar */}
      <div style={{ height: "1px", background: "#111", position: "relative", overflow: "hidden" }}>
        <div
          key={idx}
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            background: "rgba(240,237,232,0.4)",
            animation: `yen-progress ${INTERVAL}ms linear both`,
          }}
        />
      </div>

      <style>{`
        @keyframes yen-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes yen-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
