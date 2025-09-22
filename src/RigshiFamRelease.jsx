import React, { useEffect, useMemo, useState } from "react";

/** Target: Sep 28, 2025 00:00 Asia/Jerusalem (UTC+3) = Sep 27, 2025 21:00:00Z */
const TARGET_UTC_ISRAEL_MIDNIGHT = "2025-09-27T21:00:00Z";
const TARGET_TS = Date.parse(TARGET_UTC_ISRAEL_MIDNIGHT);

const SMARTLINK_URL = "https://ffm.to/rigshi"; 
const LOGO_URL = "https://i.imgur.com/Y4WccjV.gif";

function useCountdown(targetMs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(targetMs - now, 0);
  const isOver = diff <= 0;
  const parts = useMemo(() => {
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = (n) => String(n).padStart(2, "0");
    return { d, h: pad(h), m: pad(m), s: pad(s) };
  }, [diff]);
  return { isOver, parts };
}

export default function RigshiFamRelease() {
  const { isOver, parts } = useCountdown(TARGET_TS);

  useEffect(() => {
    const prev = document.title;
    document.title = "RIGSHI FAM RELEASE — Countdown";
    return () => (document.title = prev);
  }, []);

  return (
    <div style={styles.page}>
      {/* Logo */}
      <div style={styles.logoWrap}>
        <img
          src={LOGO_URL}
          alt="RIGSHI FAM — spinning logo"
          style={styles.logo}
          loading="eager"
        />
      </div>

      {/* Countdown / Button */}
      <div style={styles.bottomArea}>
        {!isOver ? (
          <div style={styles.countdown} aria-live="polite">
            <div style={styles.timerRow}>
              <TimeBlock label="DAYS" value={parts.d} />
              <Separator />
              <TimeBlock label="HRS" value={parts.h} />
              <Separator />
              <TimeBlock label="MIN" value={parts.m} />
              <Separator />
              <TimeBlock label="SEC" value={parts.s} />
            </div>
            <div style={styles.caption}>UNTIL 28·09·2025 · 00:00 (ISRAEL)</div>

            <a
              href={SMARTLINK_URL}
              target="_blank"
              rel="noreferrer"
              style={styles.secondaryBtn}
            >
              PRE-SAVE
            </a>
          </div>
        ) : (
          <a
            href={SMARTLINK_URL}
            target="_blank"
            rel="noreferrer"
            style={styles.primaryBtn}
          >
            ENTER RELEASE
          </a>
        )}
      </div>
    </div>
  );
}

function TimeBlock({ label, value }) {
  return (
    <div style={styles.block}>
      <div style={styles.value}>{value}</div>
      <div style={styles.label}>{label}</div>
    </div>
  );
}
function Separator() {
  return <div style={styles.sep}>:</div>;
}

const styles = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#000",
    color: "#fff",
    padding: "12px clamp(12px, 3vw, 24px)",
    letterSpacing: "0.06em",
  },
  logoWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: "6px",
    marginBottom: "2px", // very tight spacing
  },
  logo: {
    width: "min(360px, 72vw)",
    height: "auto",
  },
  bottomArea: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginBottom: "12px",
  },
  countdown: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  timerRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  block: {
    minWidth: "60px",
    textAlign: "center",
  },
  value: {
    fontSize: "clamp(26px, 7vw, 40px)",
    fontWeight: 700,
    lineHeight: 1,
  },
  label: {
    fontSize: "clamp(9px, 2vw, 11px)",
    opacity: 0.7,
    marginTop: "4px",
  },
  sep: {
    fontSize: "clamp(22px, 6vw, 32px)",
    lineHeight: 1,
    opacity: 0.7,
  },
  caption: {
    fontSize: "clamp(10px, 2.2vw, 12px)",
    opacity: 0.65,
  },
  primaryBtn: {
    display: "inline-block",
    padding: "14px 22px",
    borderRadius: "999px",
    textDecoration: "none",
    color: "#000",
    background: "#fff",
    fontSize: "14px",
    letterSpacing: "0.08em",
    border: "1px solid #fff",
  },
  secondaryBtn: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: "999px",
    textDecoration: "none",
    color: "#fff",
    background: "transparent",
    fontSize: "13px",
    letterSpacing: "0.08em",
    border: "1px solid rgba(255,255,255,0.8)",
  },
};
