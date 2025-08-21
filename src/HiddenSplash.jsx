import React from "react";
import { Link } from "react-router-dom";

export default function HiddenSplash() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        letterSpacing: "0.08em",
        textTransform: "uppercase"
      }}
    >
      {/* Spacer top */}
      <div style={{ height: "8vh" }} />

      {/* Centerpiece: rotating logo */}
      <div
        style={{
          display: "grid",
          placeItems: "center",
          width: "100%",
          padding: "0 20px"
        }}
      >
        <img
          src="https://i.imgur.com/v44wVQV.gif"
          alt="Yen Sound Rotating Logo"
          style={{
            width: "min(80vw, 520px)",
            height: "auto",
            imageRendering: "crisp-edges",
            display: "block",
            filter: "contrast(1.05)",
          }}
          loading="eager"
        />
      </div>

      {/* Bottom actions */}
      <div
        style={{
          width: "100%",
          padding: "24px 20px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px"
        }}
      >
        {/* ENTER button (narrow, minimalist) */}
        <a
          href="https://www.yensound.com/artist/shower"
          style={{
            display: "inline-block",
            padding: "10px 22px",
            border: "2px solid #fff",
            borderRadius: "10px",
            background: "transparent",
            color: "#fff",
            textDecoration: "none",
            fontSize: "clamp(12px, 2.6vw, 14px)",
            fontWeight: 600,
            letterSpacing: "0.2em",
            lineHeight: 1,
            transition: "opacity 160ms ease, transform 160ms ease",
            width: "fit-content"
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          aria-label="Enter"
        >
          Enter
        </a>

        {/* Underlined YEN SOUND text link */}
        <a
          href="https://yensound.com"
          style={{
            color: "#fff",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            textDecorationThickness: "1px",
            fontSize: "clamp(12px, 2.4vw, 13px)",
            fontWeight: 500,
            opacity: 0.9
          }}
        >
          Yen Sound
        </a>
      </div>
    </div>
  );
}
