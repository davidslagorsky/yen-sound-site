import React from "react";
import roster from "./rosterData";
import { FaInstagram, FaSpotify, FaApple } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function Roster() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Back Button */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <button
          onClick={() => navigate("/releases")}
          style={{
            padding: "10px 20px",
            border: "2px solid #fff",
            borderRadius: "8px",
            color: "#fff",
            background: "transparent",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          ← Go Back
        </button>
      </div>

      <h1 style={{
        textAlign: "center",
        fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
        fontWeight: "bold",
        marginBottom: "40px",
        color: "#fff",
        textTransform: "uppercase"
      }}>
        Yen Sound Roster
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "30px"
      }}>
        {roster.map((artist, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              color: "#000",
              transition: "transform 0.2s ease-in-out"
            }}
            onMouseOver={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <img
              src={artist.image}
              alt={artist.name}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "10px",
                marginBottom: "15px",
                border: "2px solid #000"
              }}
            />
            <h2 style={{
              fontSize: "1.2rem",
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.5px" // ✅ NEW
            }}>
              {artist.displayName || artist.name}
            </h2>
            <p style={{ fontSize: "0.95rem", marginBottom: "15px" }}>{artist.bio}</p>

            <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
              <Link
                to={`/artist/${artist.slug}`}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  backgroundColor: "#000",
                  color: "#fff",
                  borderRadius: "999px",
                  textDecoration: "none"
                }}
              >
                Artist Page
              </Link>

              {/* Social Icons with scale + hover transition */}
              {artist.socials.instagram && (
                <a
                  href={artist.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#000",
                    transition: "color 0.3s, transform 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = "#555";
                    e.currentTarget.style.transform = "scale(1.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "#000";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <FaInstagram size={18} />
                </a>
              )}

              {artist.socials.spotify && (
                <a
                  href={artist.socials.spotify}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#000",
                    transition: "color 0.3s, transform 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = "#555";
                    e.currentTarget.style.transform = "scale(1.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "#000";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <FaSpotify size={18} />
                </a>
              )}

              {artist.socials.appleMusic && (
                <a
                  href={artist.socials.appleMusic}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#000",
                    transition: "color 0.3s, transform 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = "#555";
                    e.currentTarget.style.transform = "scale(1.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "#000";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <FaApple size={18} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
