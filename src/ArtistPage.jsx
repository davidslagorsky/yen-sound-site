import React from "react";
import { useParams, Link } from "react-router-dom";
import roster from "./rosterData";
import releases from "./releases";
import { FaInstagram, FaSpotify, FaApple } from "react-icons/fa";

export default function ArtistPage() {
  const { slug } = useParams();
  const artist = roster.find((a) => a.slug === slug);

  if (!artist) {
    return <div style={{ padding: "40px", color: "#fff", textAlign: "center" }}>Artist not found.</div>;
  }

  const artistName = artist.displayName || artist.name || "";
  const allNames = [
    artistName,
    ...(artist.aliases || [])
  ]
    .filter(Boolean)
    .map((name) => name.trim().toLowerCase());

  const getSpotifyEmbedSrc = (url) => {
    const match = url?.match(/artist\/([a-zA-Z0-9]+)/);
    return match ? `https://open.spotify.com/embed/artist/${match[1]}?utm_source=generator` : null;
  };

  const embedSrc = getSpotifyEmbedSrc(artist.socials?.spotify);

  const artistReleases = releases.filter((release) => {
    if (!release.artist) return false;

    const releaseArtists = Array.isArray(release.artist)
      ? release.artist
      : typeof release.artist === "string"
        ? release.artist.split(",")
        : [];

    return releaseArtists
      .map((a) => a?.trim().toLowerCase())
      .some((name) => allNames.includes(name));
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    });
  };

  return (
    <div style={{
      padding: "40px 20px",
      maxWidth: "1000px",
      margin: "0 auto",
      color: "#fff",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        {/* Section Title */}
        <h2 style={{
          fontSize: "1rem",
          letterSpacing: "2px",
          textTransform: "uppercase",
          opacity: 0.7,
          marginBottom: "10px"
        }}>
          {artistName.toUpperCase()}
        </h2>

        {/* Artist Image */}
        <img
          src={artist.image}
          alt={artistName}
          style={{
            width: "200px",
            height: "200px",
            objectFit: "cover",
            borderRadius: "16px",
            border: "3px solid #fff",
            marginBottom: "20px"
          }}
        />

        {/* Artist Bio */}
        <p style={{
          fontSize: "1rem",
          lineHeight: 1.6,
          maxWidth: "700px",
          margin: "0 auto 30px"
        }}>
          {artist.bio}
        </p>

        {/* Social icons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px" }}>
          {artist.socials?.instagram && (
            <a href={artist.socials.instagram} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>
              <FaInstagram size={24} />
            </a>
          )}
          {artist.socials?.spotify && (
            <a href={artist.socials.spotify} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>
              <FaSpotify size={24} />
            </a>
          )}
          {artist.socials?.appleMusic && (
            <a href={artist.socials.appleMusic} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>
              <FaApple size={24} />
            </a>
          )}
        </div>
      </div>

      {/* Spotify Embed */}
      {embedSrc && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
          <iframe
            title={`Spotify embed - ${artistName}`}
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

      {/* Releases grid */}
      {artistReleases.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", textAlign: "center" }}>
            Releases
          </h2>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "24px"
          }}>
            {artistReleases.map((release) => (
              <a
                key={release.title}
                href={release.smartLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: "180px",
                  textDecoration: "none",
                  color: "#fff",
                  textAlign: "center",
                  transition: "transform 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <img
                  src={release.cover}
                  alt={release.title}
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "8px"
                  }}
                />
                {/* Badge */}
                <div style={{
                  display: "inline-block",
                  backgroundColor: "#fff",
                  color: "#000",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  padding: "4px 8px",
                  borderRadius: "999px",
                  marginBottom: "6px",
                  textTransform: "uppercase"
                }}>
                  {release.type}
                </div>
                {/* Title */}
                <div style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  marginBottom: "4px"
                }}>
                  {release.title}
                </div>
                {/* Date */}
                <div style={{
                  fontSize: "0.8rem",
                  opacity: 0.6
                }}>
                  {formatDate(release.date)}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Back to roster */}
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <Link to="/roster" style={{
          display: "inline-block",
          padding: "10px 20px",
          border: "2px solid #fff",
          borderRadius: "8px",
          color: "#fff",
          textDecoration: "none",
          fontWeight: "bold"
        }}>
          ← Back to Roster
        </Link>
      </div>
    </div>
  );
}
