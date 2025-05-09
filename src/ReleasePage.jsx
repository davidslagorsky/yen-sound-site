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
      <div
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          fontSize: "28px",
          cursor: "pointer",
          color: fg
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

        {/* Stream Button */}
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
          STREAM
        </a>

        {/* Artist + Song Title */}
        <div style={{
          marginTop: "24px",
          fontSize: "1.1rem",
          fontWeight: "bold"
        }}>
          {release.artist} — {release.title}
        </div>

        {/* Distributed by line */}
        <div style={{ textAlign: "center", marginTop: "20px", opacity: 0.6, fontStyle: "italic", fontSize: "0.9rem" }}>
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
