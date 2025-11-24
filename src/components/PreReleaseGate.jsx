import React from "react";

// --- local helpers (no external imports needed) ---
function getCountdownParts(target) {
  const now = new Date();
  if (!target || now >= target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const s = Math.floor((target - now) / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60
  };
}

function formatCountdown({ days, hours, minutes, seconds }) {
  const pad = (n) => String(n).padStart(2, "0");
  return days > 0
    ? `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function isValidLink(url) {
  return (
    typeof url === "string" &&
    url.trim().length > 0 &&
    url.trim().toUpperCase() !== "PLACEHOLDER"
  );
}

export default function PreReleaseGate({ release, unlockAt, theme }) {
  const parts = getCountdownParts(unlockAt);

  // background image (ignore PLACEHOLDER)
  const bgUrl =
    release?.background && isValidLink(release.background.url)
      ? release.background.url
      : null;

  const bgStyle = bgUrl
    ? {
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative"
      }
    : {};

  const darken =
    typeof release?.background?.darken === "number"
      ? Math.min(Math.max(release.background.darken, 0), 1)
      : 0;

  return (
    <div
      style={{
        backgroundColor: theme === "dark" ? "#000" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        ...bgStyle
      }}
    >
      {/* optional dark overlay */}
      {bgUrl && darken > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${darken})`
          }}
        />
      )}

      {/* content card */}
      <div
        style={{
          position: "relative",
          maxWidth: 520,
          width: "100%",
          background:
            theme === "dark" ? "#111" : "rgba(249,249,249,0.96)",
          border:
            theme === "dark" ? "1px solid #232323" : "1px solid #eaeaea",
          borderRadius: 16,
          padding: "28px 22px",
          boxSizing: "border-box"
        }}
      >
        {/* cover */}
        <img
          src={release.cover}
          alt={release.title}
          style={{
            width: "100%",
            borderRadius: 12,
            display: "block",
            marginBottom: 18,
            border: theme === "dark" ? "1px solid #222" : "1px solid #ddd"
          }}
        />

        {/* title / artist */}
        <div
          style={{
            fontWeight: 800,
            fontSize: "clamp(18px, 4vw, 26px)",
            lineHeight: 1.2
          }}
        >
          {release.title}
        </div>
        {release.artist && (
          <div
            style={{
              opacity: 0.85,
              marginTop: 4,
              fontSize: "clamp(14px, 3vw, 16px)"
            }}
          >
            {release.artist}
          </div>
        )}

        {/* countdown label */}
        <div
          style={{
            marginTop: 10,
            opacity: 0.75,
            letterSpacing: 0.6,
            fontSize: 14
          }}
        >
          Unlocks at 00:00 (local time)
        </div>

        {/* countdown value */}
        <div
          style={{
            marginTop: 6,
            fontFamily: "monospace",
            fontSize: 24
          }}
        >
          {formatCountdown(parts)}
        </div>

        {/* PRE-SAVE button */}
        {isValidLink(release.smartLink) && (
          <a
            href={release.smartLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "14px 28px",
              fontSize: "0.95rem",
              fontWeight: 800,
              letterSpacing: 1.2,
              backgroundColor: "#000",
              color: "#fff",
              border: "2px solid #fff",
              borderRadius: 10,
              textDecoration: "none",
              width: "100%",
              boxSizing: "border-box",
              marginTop: 16
            }}
          >
            PRE-SAVE
          </a>
        )}
      </div>
    </div>
  );
}
