import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import roster from "./rosterData";
import releases from "./releases";
import { supabase } from "./supabase";
import { FaInstagram, FaSpotify, FaApple, FaTiktok, FaYoutube } from "react-icons/fa";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function ArtistPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
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
      const names = [artistName, ...(artist.aliases || [])]
        .filter(Boolean).map(n => n.trim().toLowerCase());
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

  const platforms = [
    socials.spotify && socials.spotify !== "PLACEHOLDER" && { label: "SPOTIFY", icon: <FaSpotify size={17} />, url: socials.spotify },
    socials.appleMusic && socials.appleMusic !== "PLACEHOLDER" && { label: "APPLE MUSIC", icon: <FaApple size={17} />, url: socials.appleMusic },
    socials.youtube && socials.youtube !== "PLACEHOLDER" && { label: "YOUTUBE", icon: <FaYoutube size={17} />, url: socials.youtube },
    socials.tiktok && socials.tiktok !== "PLACEHOLDER" && { label: "TIKTOK", icon: <FaTiktok size={17} />, url: socials.tiktok },
    socials.instagram && socials.instagram !== "PLACEHOLDER" && { label: "INSTAGRAM", icon: <FaInstagram size={17} />, url: socials.instagram },
    pressPosts.length > 0 && { label: "PRESS", url: `/press`, internal: true },
  ].filter(Boolean);

  const btnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    padding: "20px 24px",
    marginBottom: "0",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "2px solid rgba(240,237,232,0.85)",
    background: "transparent",
    fontFamily: F,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: "#f0ede8",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.15s",
    boxSizing: "border-box",
  };

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "#f0ede8", maxWidth: "600px", margin: "0 auto" }}>

      {/* ── Spinning logo — centered ── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "32px 24px 0" }}>
        <img
          src="/spinning yen logo white.gif"
          alt="YEN SOUND"
          className="yen-spin"
          style={{ width: "34px", height: "34px", opacity: 0.55 }}
        />
      </div>

      {/* ── Full-bleed square cover ── */}
      <div style={{ width: "100%", marginTop: "24px" }}>
        <img
          src={artist.image}
          alt={artistName}
          style={{ width: "100%", display: "block", aspectRatio: "1", objectFit: "cover", objectPosition: "top" }}
        />
      </div>

      {/* ── Name + bio ── */}
      <div style={{ padding: "28px 24px 24px", textAlign: "center", borderBottom: "2px solid rgba(240,237,232,0.85)" }}>
        <h1 style={{ fontFamily: F, fontSize: "17px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f0ede8", marginBottom: "10px", lineHeight: 1.3 }}>
          {artistName.toUpperCase()}
        </h1>
        <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.35 }}>
          Choose music service
        </p>
      </div>

      {/* ── Platform buttons ── */}
      <div>
        {platforms.map((p, i) =>
          p.internal ? (
            <Link key={i} to={p.url} style={btnStyle}
              onMouseOver={e => e.currentTarget.style.background = "#111"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}>
              {p.icon && p.icon}
              {p.label}
            </Link>
          ) : (
            <a key={i} href={p.url} target="_blank" rel="noreferrer" style={btnStyle}
              onMouseOver={e => e.currentTarget.style.background = "#111"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}>
              {p.icon && p.icon}
              {p.label}
            </a>
          )
        )}
      </div>

      {/* ── Releases ── */}
      {artistReleases.length > 0 && (
        <div style={{ padding: "48px 24px 24px" }}>
          <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", opacity: 0.3, marginBottom: "24px", textAlign: "center" }}>
            Releases · {artistReleases.length}
          </p>
          <div className="artist-releases-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "28px 16px" }}>
            {visible.map((r, i) => (
              <Link key={i} to={`/release/${r.slug}`} style={{ textDecoration: "none", color: "#f0ede8" }}>
                <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", background: "#111", marginBottom: "10px" }}>
                  <img src={r.cover} alt={r.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                    onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"} />
                </div>
                <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.35, marginBottom: "2px" }}>
                  {r.type} · {r.date?.slice(0, 4)}
                </p>
                <p style={{ fontFamily: F, fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1.2 }}>
                  {r.title}
                </p>
              </Link>
            ))}
          </div>
          {artistReleases.length > LIMIT && (
            <div style={{ marginTop: "32px", textAlign: "center" }}>
              <button onClick={() => setShowAllReleases(v => !v)}
                style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", background: "transparent", border: "2px solid rgba(240,237,232,0.5)", color: "#f0ede8", padding: "12px 24px", cursor: "pointer", opacity: 0.6 }}
                onMouseOver={e => e.currentTarget.style.opacity = 1}
                onMouseOut={e => e.currentTarget.style.opacity = 0.6}>
                {showAllReleases ? "Show less" : `Show all (${artistReleases.length})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Press posts ── */}
      {pressPosts.length > 0 && (
        <div style={{ padding: "40px 24px 80px" }}>
          <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", opacity: 0.3, marginBottom: "24px", textAlign: "center" }}>
            Press · {pressPosts.length}
          </p>
          {pressPosts.map((p) => (
            <Link key={p.id} to={`/press/${p.slug}`}
              style={{ textDecoration: "none", color: "#f0ede8", display: "flex", gap: "16px", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #1a1a1a", transition: "opacity 0.2s" }}
              onMouseOver={e => e.currentTarget.style.opacity = 0.65}
              onMouseOut={e => e.currentTarget.style.opacity = 1}>
              {p.cover_url && (
                <div style={{ width: "56px", height: "56px", flexShrink: 0, overflow: "hidden", background: "#111" }}>
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

      {/* ── Back ── */}
      <div style={{ padding: "0 24px 60px", textAlign: "center" }}>
        <button onClick={() => navigate("/roster")}
          style={{ background: "none", border: "none", color: "#f0ede8", cursor: "pointer", fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.25, padding: 0 }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.7}
          onMouseOut={e => e.currentTarget.style.opacity = 0.25}>
          ← Roster
        </button>
      </div>

    </div>
  );
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("he-IL", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
