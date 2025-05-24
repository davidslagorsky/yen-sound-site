import React from "react";
import { useParams, Link } from "react-router-dom";
import roster from "./rosterData";
import { FaInstagram, FaSpotify, FaApple } from "react-icons/fa";

export default function ArtistPage() {
  const { slug } = useParams();
  const artist = roster.find(a => a.slug === slug);

  if (!artist) {
    return <div style={{ padding: "40px", color: "#fff", textAlign: "center" }}>Artist not found.</div>;
  }

  const getSpotifyEmbedSrc = (url) => {
    const match = url.match(/artist\/([a-zA-Z0-9]+)/);
    return match ? `https://open.spotify.com/embed/artist/${match[1]}?utm_source=generator` : null;
  };

  const embedSrc = getSpotifyEmbedSrc(artist.socials.spotify);

  return (
    <div style={{
      padding: "40px 20px",
      maxWidth: "900px",
      margin: "0 auto",
      color: "#fff",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <img
          src={artist.image}
          alt={artist.displayName}
          style={{
            width: "200px",
            height: "200px",
            objectFit: "cover",
            borderRadius: "16px",
            border: "3px solid #fff",
            marginBottom: "20px"
          }}
        />
        <h1 style={{
          fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
          marginBottom: "10px",
          textTransform: "uppercase"
        }}>
          {artist.displayName}
        </h1>
        <p style={{
          fontSize: "1rem",
          lineHeight: 1.6,
          maxWidth: "700px",
          margin: "0 auto 20px"
        }}>
          {artist.bio}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px" }}>
          {artist.socials.instagram && (
            <a href={artist.socials.instagram} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>
              <FaInstagram size={24} />
            </a>
          )}
          {artist.socials.spotify && (
            <a href={artist.socials.spotify} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>
              <FaSpotify size={24} />
            </a>
          )}
          {artist.socials.appleMusic && (
            <a href={artist.socials.appleMusic} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>
              <FaApple size={24} />
            </a>
          )}
        </div>
      </div>

      {embedSrc && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <iframe
            style={{ borderRadius: "12px" }}
            src={embedSrc}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Link to="/roster" style={{
          display: "inline-block",
          padding: "10px 20px",
          border: "2px solid #fff",
          borderRadius: "8px",
          color: "#fff",
          textDecoration: "none",
          fontWeight: "bold",
          transition: "all 0.2s ease-in-out"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#fff";
          e.currentTarget.style.color = "#000";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#fff";
        }}>
          ← Back to Roster
        </Link>
      </div>
    </div>
  );
}
