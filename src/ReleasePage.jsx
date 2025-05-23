import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import releases from "./releases";

export default function ReleasePage({ theme }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const release = releases.find(r =>
    r.title.toLowerCase().replace(/\s+/g, "-") === slug
  );

  if (!release) return <p style={{ textAlign: "center" }}>Release not found</p>;

  const bg = theme === "dark" ? "#000" : "#fff";
  const fg = theme === "dark" ? "#fff" : "#000";

  return (
    <div style={{
      backgroundColor: bg,
      color: fg,
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px",
      fontFamily: "Arial, sans-serif",
      position: "relative"
    }}>
      {/* Back Arrow */}
      {/* Bottom Center Back Arrow */}
<div
  onClick={() => navigate(-1)}
  style={{
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "32px",
    color: fg,
    cursor: "pointer",
    zIndex: 1000
  }}
  aria-label="Back"
>
  ←
</div>


      {/* Modal box */}
      <div style={{
        maxWidth: "480px",
        width: "100%",
        backgroundColor: theme === "dark" ? "#111" : "#f9f9f9",
        borderRadius: "16px",
        padding: "32px 24px",
        boxShadow: theme === "dark"
          ? "0 0 30px rgba(255, 255, 255, 0.05)"
          : "0 0 30px rgba(0, 0, 0, 0.05)",
        textAlign: "center"
      }}>
        {/* Cover Image */}
        <img
          src={release.cover}
          alt={release.title}
          style={{
            width: "100%",
            borderRadius: "12px",
            marginBottom: "24px"
          }}
        />

        {/* Smart Link Button */}
        <a
          href={release.smartLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            fontSize: "1rem",
            fontWeight: "bold",
            backgroundColor: "transparent",
            color: fg,
            border: `2px solid ${fg}`,
            borderRadius: "8px",
            textDecoration: "none",
            transition: "all 0.25s ease-in-out"
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = fg;
            e.currentTarget.style.color = bg;
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = fg;
          }}
        >
          Listen on All Platforms
        </a>

        {/* Platform Icons (Spotify, Apple, YouTube) */}
        <div style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "center",
          gap: "16px"
        }}>
          {["spotify", "apple", "youtube"].map(service => (
            <a
              key={service}
              href={release.smartLink}
              target="_blank"
              rel="noopener noreferrer"
              title={`Listen on ${service.charAt(0).toUpperCase() + service.slice(1)}`}
            >
              <img
                src={`/${service}.png`}
                alt={service}
                style={{
  width: "32px",
  height: "32px",
  opacity: 0.85,
  transition: "opacity 0.2s",
  filter: theme === "dark" ? "brightness(1000%)" : "none"
}}

                onMouseOver={e => e.currentTarget.style.opacity = "1"}
                onMouseOut={e => e.currentTarget.style.opacity = "0.85"}
              />
            </a>
          ))}
        </div>

        {/* Artist + Song Title */}
        <div style={{
          marginTop: "24px",
          fontSize: "1.1rem",
          fontWeight: "bold"
        }}>
          {release.artist} — {release.title}
        </div>

        {/* Distributed by line */}
        <div style={{
          textAlign: "center",
          marginTop: "20px",
          opacity: 0.6,
          fontStyle: "italic",
          fontSize: "0.9rem"
        }}>
          <div>הופץ ע״י YEN SOUND</div>
          <img
            src="/yen-logo.gif"
            alt="Yen Sound Animated Logo"
            style={{ width: "40px", marginTop: "10px" }}
          />
        </div>
      </div>
    </div>
  );
}
