import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "../supabase";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function formatDate(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("he-IL", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/* ── hero post (first/featured) ── */
function HeroPost({ post }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={`/press/${post.slug}`}
      style={{ textDecoration: "none", color: "#f0ede8", display: "block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{ position: "relative", overflow: "hidden", background: "#050505" }}>
        {/* full-bleed image */}
        {post.cover_url && (
          <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", position: "relative" }}>
            <img
              src={post.cover_url}
              alt={post.title}
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transform: hovered ? "scale(1.03)" : "scale(1)",
                transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
                filter: "brightness(0.6)",
              }}
            />
            {/* gradient overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)",
            }} />
            {/* text overlay on image */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{
                  fontFamily: F, fontSize: "8px", fontWeight: 700, letterSpacing: "0.35em",
                  textTransform: "uppercase", color: "#f0ede8", opacity: 0.5,
                }}>
                  {post.artist && `${post.artist} · `}{formatDate(post.date)}
                </span>
              </div>
              <h2 style={{
                fontFamily: F, fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 900,
                letterSpacing: "-0.01em", lineHeight: 1.15, color: "#f0ede8",
                maxWidth: "600px",
              }}>
                {post.title}
              </h2>
              {post.excerpt && (
                <p style={{
                  fontFamily: F, fontSize: "13px", fontWeight: 300, lineHeight: 1.7,
                  opacity: 0.6, marginTop: "10px", maxWidth: "500px",
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {post.excerpt}
                </p>
              )}
              <div style={{
                marginTop: "18px", display: "inline-flex", alignItems: "center", gap: "8px",
                fontFamily: F, fontSize: "9px", fontWeight: 700, letterSpacing: "0.25em",
                textTransform: "uppercase", opacity: hovered ? 0.9 : 0.45,
                transition: "opacity 0.2s",
              }}>
                Read
                <span style={{
                  display: "inline-block",
                  transform: hovered ? "translateX(4px)" : "translateX(0)",
                  transition: "transform 0.2s",
                }}>→</span>
              </div>
            </div>
          </div>
        )}
        {/* fallback if no cover */}
        {!post.cover_url && (
          <div style={{ padding: "48px 28px", borderBottom: "1px solid #111" }}>
            <p style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.35, marginBottom: "14px" }}>
              {post.artist && `${post.artist} · `}{formatDate(post.date)}
            </p>
            <h2 style={{ fontFamily: F, fontSize: "26px", fontWeight: 900, letterSpacing: "-0.01em", lineHeight: 1.15, color: "#f0ede8" }}>
              {post.title}
            </h2>
          </div>
        )}
      </article>
    </Link>
  );
}

/* ── standard grid card ── */
function PostCard({ post, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={`/press/${post.slug}`}
      style={{ textDecoration: "none", color: "#f0ede8", display: "block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        borderBottom: "1px solid #111",
        animation: `yen-press-in 0.4s ${index * 0.05}s ease both`,
      }}>
        {/* cover */}
        {post.cover_url && (
          <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", background: "#0a0a0a" }}>
            <img
              src={post.cover_url}
              alt={post.title}
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transform: hovered ? "scale(1.04)" : "scale(1)",
                filter: hovered ? "brightness(0.9)" : "brightness(0.75) grayscale(0.2)",
                transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
              }}
            />
          </div>
        )}

        {/* text */}
        <div style={{ padding: "16px 14px 20px" }}>
          <p style={{
            fontFamily: F, fontSize: "8px", letterSpacing: "0.2em",
            textTransform: "uppercase", opacity: 0.35, marginBottom: "8px",
          }}>
            {post.artist && <span>{post.artist} · </span>}{formatDate(post.date)}
          </p>
          <h3 style={{
            fontFamily: F, fontSize: "14px", fontWeight: 700,
            letterSpacing: "-0.01em", lineHeight: 1.25, marginBottom: "8px",
            color: "#f0ede8",
          }}>
            {post.title}
          </h3>
          {post.excerpt && (
            <p style={{
              fontFamily: F, fontSize: "11px", fontWeight: 300, lineHeight: 1.7,
              opacity: 0.45,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {post.excerpt}
            </p>
          )}
          <div style={{
            marginTop: "12px",
            fontFamily: F, fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: hovered ? 0.8 : 0,
            transform: hovered ? "translateX(0)" : "translateX(-6px)",
            transition: "opacity 0.2s, transform 0.2s",
          }}>
            Read →
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ── artist filter pill ── */
function ArtistPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: F, fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em",
        textTransform: "uppercase", padding: "7px 14px",
        border: active ? "1px solid rgba(240,237,232,0.7)" : "1px solid rgba(240,237,232,0.15)",
        background: active ? "rgba(240,237,232,0.08)" : "transparent",
        color: active ? "#f0ede8" : "rgba(240,237,232,0.4)",
        cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.borderColor = "rgba(240,237,232,0.4)"; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.borderColor = "rgba(240,237,232,0.15)"; }}
    >
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Press() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artistFilter, setArtistFilter] = useState("All");

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("press_posts")
        .select("id, title, artist, cover_url, date, excerpt, slug")
        .order("date", { ascending: false });
      if (error) { setError(error.message); }
      else { setPosts(data || []); }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  /* artists for filter pills */
  const artists = useMemo(() => {
    const names = new Set();
    posts.forEach(p => {
      if (p.artist) p.artist.split(",").forEach(a => names.add(a.trim()));
    });
    return ["All", ...Array.from(names).sort()];
  }, [posts]);

  const filtered = useMemo(() => {
    if (artistFilter === "All") return posts;
    return posts.filter(p =>
      p.artist && p.artist.split(",").map(a => a.trim()).includes(artistFilter)
    );
  }, [posts, artistFilter]);

  const hero = filtered[0] || null;
  const rest = filtered.slice(1);

  return (
    <>
      <Helmet>
        <title>Press — YEN SOUND</title>
        <meta name="description" content="כתבות, פיצ'רים ועדכונים מאמני YEN SOUND." />
        <meta property="og:title" content="Press — YEN SOUND" />
        <meta property="og:description" content="כתבות, פיצ'רים ועדכונים מאמני YEN SOUND." />
      </Helmet>

      <style>{`
        @keyframes yen-press-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ backgroundColor: "#000", minHeight: "100vh", paddingTop: "60px" }}>

        {/* ── header ── */}
        <div style={{ padding: "32px 24px 24px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h1 style={{
            fontFamily: F, fontSize: "10px", fontWeight: 700, letterSpacing: "0.4em",
            textTransform: "uppercase", color: "#f0ede8", opacity: 0.35,
          }}>
            Press
          </h1>
          {!loading && posts.length > 0 && (
            <span style={{ fontFamily: F, fontSize: "9px", opacity: 0.2, letterSpacing: "0.1em" }}>
              {filtered.length} {filtered.length === 1 ? "post" : "posts"}
            </span>
          )}
        </div>

        {/* ── artist filter ── */}
        {!loading && artists.length > 2 && (
          <div style={{
            display: "flex", gap: "6px", flexWrap: "nowrap", overflowX: "auto",
            padding: "0 24px 24px",
            scrollbarWidth: "none", msOverflowStyle: "none",
          }}>
            {artists.map(a => (
              <ArtistPill
                key={a}
                label={a}
                active={artistFilter === a}
                onClick={() => setArtistFilter(a)}
              />
            ))}
          </div>
        )}

        {/* ── loading ── */}
        {loading && (
          <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.25, padding: "48px 24px" }}>
            Loading...
          </p>
        )}

        {/* ── error ── */}
        {!loading && error && (
          <p style={{ fontFamily: F, fontSize: "10px", color: "rgba(255,100,100,0.7)", padding: "48px 24px" }}>
            {error}
          </p>
        )}

        {/* ── empty ── */}
        {!loading && !error && filtered.length === 0 && (
          <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.25, padding: "48px 24px" }}>
            {artistFilter !== "All" ? `No posts for ${artistFilter}` : "No posts yet."}
          </p>
        )}

        {/* ── content ── */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {/* hero */}
            {hero && <HeroPost post={hero} />}

            {/* grid */}
            {rest.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                borderTop: "1px solid #111",
              }}>
                {rest.map((post, i) => (
                  <div key={post.id} style={{ borderRight: "1px solid #111" }}>
                    <PostCard post={post} index={i} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── footer pad ── */}
        <div style={{ height: "80px" }} />
      </div>
    </>
  );
}
