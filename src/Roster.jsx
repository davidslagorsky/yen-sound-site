import React from "react";
import { Link } from "react-router-dom";
import roster from "./rosterData";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function Roster() {
  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", paddingTop: "60px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 40px 80px" }}>

        <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.35, marginBottom: "48px" }}>
          Roster
        </p>

        <div className="roster-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "48px 32px",
        }}>
          {roster.map((artist) => (
            <Link key={artist.slug} to={`/artist/${artist.slug}`} style={{ textDecoration: "none", color: "#f0ede8" }}>
              <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", background: "#111", marginBottom: "14px" }}>
                <img
                  src={artist.image}
                  alt={artist.displayName || artist.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease, filter 0.3s ease", filter: "grayscale(0.1)" }}
                  onMouseOver={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.filter = "grayscale(0)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.filter = "grayscale(0.1)"; }}
                />
              </div>
              <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, marginBottom: "4px" }}>
                Artist
              </p>
              <p style={{ fontFamily: F, fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.2 }}>
                {(artist.displayName || artist.name).toUpperCase()}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .roster-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 32px 16px !important; padding: 32px 20px 60px !important; }
        }
      `}</style>
    </div>
  );
}
