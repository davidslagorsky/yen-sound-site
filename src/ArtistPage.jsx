import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import roster from "./rosterData";
import releases from "./releases";
import { supabase } from "./supabase";
import { FaInstagram, FaSpotify, FaApple, FaTiktok } from "react-icons/fa";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const socialLinkStyle = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: "36px", height: "36px",
  border: "1px solid #2a2a2a",
  color: "#f0ede8", textDecoration: "none",
  opacity: 0.5, transition: "opacity 0.2s",
};

export default function ArtistPage() {
  const { slug } = useParams();
  const [showAllReleases, setShowAllReleases] = useState(false);
  const [pressPosts, setPressPosts] = useState([]);

  useEffect(() => { setShowAllReleases(false); }, [slug]);

  const artist = useMemo(() => roster.find((a) => a.slug === slug), [slug]);
  const artistName = artist?.displayName || artist?.name || "";

  const allNames = useMemo(() => {
    if (!artist) return [];
    return [artistName, ...(artist.aliases || [])]
      .filter(Boolean)
      .map((n) => n.trim().toLowerCase());
  }, [artist, artistName]);

  const artistReleases = useMemo(() => {
    if (!artist || allNames.length === 0) return [];
    return releases
      .filter((r) => {
        const names = Array.isArray(r.artist)
          ? r.artist
          : typeof r.artist === "string" ? r.artist.split(",") : [];
        return names.map((a) => a?.trim().toLowerCase()).some((n) => allNames.includes(n));
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [artist, allNames]);

  useEffect(() => {
    if (!artist) return;
    async function fetchPress() {
      const { data } = await supabase
        .from("press_posts")
        .select("id, title, excerpt, cover_url, date, slug, artist")
        .order("date", { ascending: false });
      if (!data) return;
      const names = [
        artistName,
        ...(artist.aliases || []),
      ].filter(Boolean).map(n => n.trim().toLowerCase());

      const matched = data.filter(p => {
        if (!p.artist) return false;
        return p.artist.split(",").map(a => a.trim().toLowerCase()).some(a =>
          names.some(n => a.includes(n) || n.includes(a))
        );
      });
      setPressPosts(matched);
    }
    fetchPress();
  }, [artist, artistName]);

  const LIMIT = 12;
  const visible = showAllReleases ? artistReleases : artistReleases.slice(0, LIMIT);

  if (!artist) return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "120px 40px", fontFamily: F, color: "#f0ede8", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.4 }}>
      Artist not found
    </div>
  );

  const socials = artist.socials || {};

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", paddingTop: "60px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 40px 80px" }}>

        <Link to="/roster" style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.35, textDecoration: "none", display: "inline-block", marginBottom: "48px", transition: "opacity 0.2s" }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.8}
          onMouseOut={e => e.currentTarget.style.opacity = 0.35}>
          ← Roster
        </Link>

        {/* ── Header ── */}
        <div className="artist-header-grid" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "48px", alignItems: "start", marginBottom: "48px" }}>
          <div style={{ width: "200px", aspectRatio: "1", overflow: "hidden", background: "#111" }}>
            <img src={artist.image} alt={artistName}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(0.1)" }} />
          </div>

          <div style={{ paddingTop: "8px" }}>
            <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.35, marginBottom: "12px" }}>Artist</p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, letterSpacing: "0.02em", textTransform: "uppercase", lineHeight: 1, color: "#f0ede8", marginBottom: "24px" }}>
              {artistName.toUpperCase()}
            </h1>
            {artist.bio && (
              <p style={{ fontFamily: F, fontSize: "14px", fontWeight: 300, lineHeight: 1.8, color: "#f0ede8", opacity: 0.6, maxWidth: "520px", marginBottom: "28px" }}>
                {artist.bio}
              </p>
            )}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" style={socialLinkStyle}
                  onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.5}>
                  <FaInstagram size={16} />
                </a>
              )}
              {socials.spotify && (
                <a href={socials.spotify} target="_blank" rel="noreferrer" aria-label="Spotify" style={socialLinkStyle}
                  onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.5}>
                  <FaSpotify size={16} />
                </a>
              )}
              {socials.appleMusic && socials.appleMusic !== "PLACEHOLDER" && (
                <a href={socials.appleMusic} target="_blank" rel="noreferrer" aria-label="Apple Music" style={socialLinkStyle}
                  onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.5}>
                  <FaApple size={16} />
                </a>
              )}
              {socials.tiktok && (
                <a href={socials.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" style={socialLinkStyle}
                  onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.5}>
                  <FaTiktok size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Press — bold feature strip under profile ── */}
        {pressPosts.length > 0 && (
          <div style={{ marginBottom: "64px" }}>
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "32px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.35 }}>
                Press
              </p>
              <Link to="/press" style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.3, color: "#f0ede8", textDecoration: "none" }}
                onMouseOver={e => e.currentTarget.style.opacity = 0.7}
                onMouseOut={e => e.currentTarget.style.opacity = 0.3}>
                כל הכתבות →
              </Link>
            </div>

            {/* Featured first post — big */}
            {pressPosts[0] && (
              <Link to={`/press/${pressPosts[0].slug}`} style={{ textDecoration: "none", color: "#f0ede8", display: "block", marginBottom: "2px" }}
                onMouseOver={e => e.currentTarget.style.opacity = 0.8}
                onMouseOut={e => e.currentTarget.style.opacity = 1}>
                <div style={{ display: "grid", gridTemplateColumns: pressPosts[0].cover_url ? "1fr 1fr" : "1fr", gap: "0", border: "1px solid #111" }}>
                  {pressPosts[0].cover_url && (
                    <div style={{ aspectRatio: "1", overflow: "hidden", background: "#111" }}>
                      <img src={pressPosts[0].cover_url} alt={pressPosts[0].title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s ease" }}
                        onMouseOver={e => e.currentTarget.style.transform = "scale(1.03)"}
                        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"} />
                    </div>
                  )}
                  <div style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "flex-end", direction: "rtl", textAlign: "right" }}>
                    <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.35, marginBottom: "12px" }}>
                      {formatDate(pressPosts[0].date)}
                    </p>
                    <h2 style={{ fontFamily: F, fontSize: "clamp(20px, 2.5vw, 32px)", fontWeight: 700, lineHeight: 1.15, marginBottom: "14px", color: "#f0ede8" }}>
                      {pressPosts[0].title}
                    </h2>
                    {pressPosts[0].excerpt && (
                      <p style={{ fontFamily: F, fontSize: "13px", fontWeight: 300, lineHeight: 1.7, opacity: 0.5, marginBottom: "24px" }}>
                        {pressPosts[0].excerpt}
                      </p>
                    )}
                    <span style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.5, borderBottom: "1px solid #333", paddingBottom: "2px", alignSelf: "flex-start" }}>
                      קרא עוד
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Remaining posts — compact list */}
            {pressPosts.slice(1).map((p) => (
              <Link key={p.id} to={`/press/${p.slug}`} style={{ textDecoration: "none", color: "#f0ede8", display: "flex", gap: "16px", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #111", transition: "opacity 0.2s" }}
                onMouseOver={e => e.currentTarget.style.opacity = 0.65}
                onMouseOut={e => e.currentTarget.style.opacity = 1}>
                {p.cover_url && (
                  <div style={{ width: "60px", height: "60px", flexShrink: 0, overflow: "hidden", background: "#111" }}>
                    <img src={p.cover_url} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, direction: "rtl", textAlign: "right" }}>
                  <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.3, marginBottom: "3px" }}>
                    {formatDate(p.date)}
                  </p>
                  <p style={{ fontFamily: F, fontSize: "13px", fontWeight: 700, lineHeight: 1.25, marginBottom: "3px" }}>
                    {p.title}
                  </p>
                  {p.excerpt && (
                    <p style={{ fontFamily: F, fontSize: "11px", fontWeight: 300, opacity: 0.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Releases ── */}
        {artistReleases.length > 0 && (
          <>
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "40px", marginBottom: "32px" }}>
              <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.35 }}>
                Releases · {artistReleases.length}
              </p>
            </div>
            <div className="artist-releases-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "40px 24px" }}>
              {visible.map((r, i) => (
                <Link key={i} to={`/release/${r.slug}`} style={{ textDecoration: "none", color: "#f0ede8" }}>
                  <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", background: "#111", marginBottom: "12px" }}>
                    <img src={r.cover} alt={r.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                      onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
                      onMouseOut={e => e.currentTarget.style.transform = "scale(1)"} />
                  </div>
                  <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, marginBottom: "3px" }}>
                    {r.type} · {r.date?.slice(0, 4)}
                  </p>
                  <p style={{ fontFamily: F, fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1.2 }}>
                    {r.title}
                  </p>
                </Link>
              ))}
            </div>
            {artistReleases.length > LIMIT && (
              <div style={{ marginTop: "40px", textAlign: "center" }}>
                <button onClick={() => setShowAllReleases(v => !v)}
                  style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", background: "transparent", border: "1px solid #2a2a2a", color: "#f0ede8", padding: "10px 20px", cursor: "pointer", opacity: 0.6, transition: "opacity 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.opacity = 1}
                  onMouseOut={e => e.currentTarget.style.opacity = 0.6}>
                  {showAllReleases ? "Show less" : `Show all (${artistReleases.length})`}
                </button>
              </div>
            )}
          </>
        )}

      </div>

      <style>{`
        @media (max-width: 560px) {
          .artist-header-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .artist-header-grid > div:first-child { width: 100% !important; max-width: 280px; }
          .artist-releases-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("he-IL", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
