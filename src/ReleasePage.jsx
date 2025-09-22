import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import releases from "./releases";
import { FaInstagram, FaSpotify, FaApple, FaYoutube, FaSoundcloud, FaBandcamp, FaGlobe } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import { FiShare2, FiCheck } from "react-icons/fi";

/* ---------- helpers ---------- */
function extractYouTubeId(youtubeUrl = "") {
  if (!youtubeUrl) return null;
  const patterns = [
    /v=([a-zA-Z0-9_-]{11})/,         // watch?v=ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/, // youtu.be/ID
    /\/shorts\/([a-zA-Z0-9_-]{11})/,  // shorts/ID
    /embed\/([a-zA-Z0-9_-]{11})/      // embed/ID
  ];
  for (const rx of patterns) {
    const m = youtubeUrl.match(rx);
    if (m) return m[1];
  }
  return null;
}

function buildYouTubeEmbedSrc(id, origin) {
  if (!id) return null;
  const base = "https://www.youtube-nocookie.com/embed/" + id;
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
    color: "white",
    ...(origin ? { origin } : {})
  });
  return `${base}?${params.toString()}`;
}

// Normalize a slug-ish string: lower, trim, collapse spaces/punct to '-'
function normalizeSlug(s = "") {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[_~!@#$%^&*()+={}\[\]|\\:;"'<>,.?/]+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Treat only non-empty, non-"PLACEHOLDER" strings as real links
function isReal(v) {
  return typeof v === "string" && v.trim().length > 0 && v.trim().toUpperCase() !== "PLACEHOLDER";
}

/* ---------- monochrome white platform icons (for dropdown) ---------- */
const IconSpotify = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden {...props}>
    <path d="M12 1.5A10.5 10.5 0 1 0 22.5 12 10.513 10.513 0 0 0 12 1.5Zm4.6 14.9a.75.75 0 0 1-1.03.26 11.9 11.9 0 0 0-6.14-1.32 15.5 15.5 0 0 0-3.6.47.75.75 0 1 1-.36-1.45c4.12-1.01 8.4-.55 10.34.58a.75.75 0 0 1 .39.52.74.74 0 0 1-.3.8Zm1.35-3.12a.9.9 0 0 1-1.24.31c-2.34-1.45-6.69-1.88-9.74-1.02a.9.9 0 1 1-.48-1.73c3.54-.97 8.37-.5 11.12 1.22a.9.9 0 0 1 .34 1.22Zm.1-3.19a1 1 0 0 1-1.37.34c-2.7-1.62-7.51-1.98-10.8-1.06A1 1 0 0 1 5.4 6.6c3.82-1.05 9.05-.65 12.2 1.22a1 1 0 0 1 .49 1.37Z"/>
  </svg>
);

const IconApple = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden {...props}>
    <path d="M16.9 13.2c.03 3.3 2.9 4.4 2.93 4.42-.02.07-.46 1.58-1.52 3.13-.92 1.34-1.87 2.67-3.37 2.69-1.47.03-1.94-.87-3.61-.87-1.67 0-2.17.84-3.54.9-1.43.06-2.52-1.45-3.45-2.78-1.88-2.73-3.33-7.72-1.39-11.08.96-1.65 2.68-2.69 4.56-2.72 1.43-.03 2.78.96 3.61.96.83 0 2.49-1.18 4.21-1 .71.03 2.69.29 3.96 2.18-.1.06-2.36 1.38-2.38 4.37ZM14 3.4c.73-.89 1.22-2.14 1.08-3.4-1.05.04-2.36.7-3.12 1.59-.69.8-1.28 2.07-1.12 3.29 1.18.09 2.43-.6 3.16-1.48Z"/>
  </svg>
);

const IconYouTube = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden {...props}>
    <path d="M23.5 7.1s-.23-1.66-.94-2.39c-.9-.95-1.9-.96-2.36-1.02-3.3-.24-8.24-.24-8.24-.24h-.01s-4.95 0-8.24.24c-.46.06-1.46.07-2.36 1.02C.73 5.45.5 7.1.5 7.1S.27 9.1.27 11.1v1.78c0 2 .23 4 .23 4s.23 1.66.94 2.39c.9.95 2.08.92 2.61 1.03 1.89.18 8.05.24 8.05.24s4.96-.01 8.26-.25c.46-.06 1.46-.07 2.36-1.02.71-.73.94-2.39.94-2.39s.23-2 .23-4v-1.78c0-2-.23-4-.23-4ZM9.84 13.88V8.1l5.67 2.9-5.67 2.88Z"/>
  </svg>
);

/* ---------- social icon component (per release) ---------- */
const SOCIAL_ICON_MAP = {
  instagram: FaInstagram,
  spotify: FaSpotify,
  appleMusic: FaApple, // for Apple artist pages in "socials"
  youtube: FaYoutube,
  tiktok: SiTiktok,
  soundcloud: FaSoundcloud,
  bandcamp: FaBandcamp,
  website: FaGlobe,
  share: FiShare2 // special key: renders Web Share / clipboard
};

function SocialRow({ socials = {}, color = "#fff", shareDefault }) {
  const [copied, setCopied] = React.useState(false);

  // normalize entries (allow known keys; allow share even if value is true/empty)
  let entries = Object.entries(socials).filter(
    ([k, v]) => SOCIAL_ICON_MAP[k] && (k === "share" || isReal(v))
  );

  // Always show Share icon universally, at the end (no per-release config)
  if (!entries.find(([k]) => k === "share")) {
    entries = [...entries, ["share", true]];
  }

  if (!entries.length) return null;

  async function handleShare(title, url) {
    const shareUrl =
      url ||
      shareDefault?.url ||
      (typeof window !== "undefined" ? window.location.href : "");
    const shareTitle = title || shareDefault?.title || "";

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch { /* ignore cancel/unsupported */ }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "12px",
        flexWrap: "wrap"
      }}
      aria-label="Artist social links"
    >
      {entries.map(([key, val]) => {
        const Icon = SOCIAL_ICON_MAP[key];

        if (key === "share") {
          // val may be true or an object; we prioritize explicit socials.{title,url} if present
          const title = socials.title;
          const url = socials.url;
          return (
            <button
              key="share"
              onClick={() => handleShare(title, url)}
              aria-label="Share"
              title="Share"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                height: "38px",
                borderRadius: "999px",
                border: `1px solid ${color}`,
                background: "transparent",
                color,
                cursor: "pointer",
                opacity: 0.9,
                transition: "opacity 0.2s ease, transform 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = 1;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = 0.9;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {copied ? <FiCheck size={18} /> : <Icon size={18} />}
            </button>
          );
        }

        return (
          <a
            key={key}
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={key}
            title={key}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "38px",
              height: "38px",
              borderRadius: "999px",
              border: `1px solid ${color}`,
              color,
              textDecoration: "none",
              opacity: 0.9,
              transition: "opacity 0.2s ease, transform 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = 1;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = 0.9;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Icon size={18} />
          </a>
        );
      })}
    </div>
  );
}

function SocialSection({ release, color = "#fff", borderColor = "rgba(255,255,255,0.15)" }) {
  const hasPerArtist = Array.isArray(release.socialsByArtist) && release.socialsByArtist.length > 0;
  const hasPerRelease = release.socials && Object.keys(release.socials).length > 0;

  // We’ll show the share icon even if no socials are set, so we still render the section.
  if (!hasPerArtist && !hasPerRelease && !release) return null;

  const shareDefault = {
    title: `${release.title} – ${release.artist || ""}`.trim(),
    // UNIVERSAL SIMPLE WAY: prefer SmartLink for robust previews
    url: isReal(release.smartLink) ? release.smartLink : undefined
  };

  return (
    <section
      style={{
        maxWidth: 1000,
        margin: "32px auto 0",
        padding: "18px 16px 8px",
        borderTop: `1px solid ${borderColor}`
      }}
    >
      {hasPerArtist ? (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontSize: 14, letterSpacing: 0.6, opacity: 0.75, marginBottom: 2 }}>
            
          </div>
          {release.socialsByArtist.map((row, idx) => {
            const valid = row && typeof row === "object";
            if (!valid) return null;
            return (
              <div
                key={(row.name || "") + idx}
                style={{
                  padding: "10px 0",
                  borderBottom: `1px dashed ${borderColor}`
                }}
              >
                {row.name && (
                  <div style={{ fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>
                    {row.name}
                  </div>
                )}
                {/* For per-artist rows, we don't auto-add the Share icon to each row */}
                <SocialRow socials={row.socials || {}} color={color} />
              </div>
            );
          })}
          {/* Add one global socials row under per-artist section that includes the Share icon */}
          <SocialRow socials={release.socials || {}} color={color} shareDefault={shareDefault} />
        </div>
      ) : (
        <>
          <div style={{ fontSize: 14, letterSpacing: 0.6, opacity: 0.75, marginBottom: 1 }}>
          </div>
          <SocialRow
            socials={release.socials || {}}
            color={color}
            shareDefault={shareDefault}
          />
        </>
      )}
    </section>
  );
}

export default function ReleasePage({ theme }) {
  const { slug: rawSlugParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve the slug robustly
  const decodedSegment = useMemo(() => {
    const last = location.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(rawSlugParam ?? last ?? "");
  }, [rawSlugParam, location.pathname]);

  const candidate = useMemo(() => normalizeSlug(decodedSegment), [decodedSegment]);

  const release = useMemo(() => {
    return (
      releases.find((r) => r.slug && (r.slug === decodedSegment || r.slug === candidate)) ||
      releases.find((r) => r.slug && normalizeSlug(r.slug) === candidate) ||
      releases.find((r) => normalizeSlug(r.title || "") === candidate) ||
      null
    );
  }, [decodedSegment, candidate]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const handleEsc = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("click", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("click", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  if (!release) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "#fff", background: "#000", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Release not found</div>
          <div style={{ opacity: 0.7, marginBottom: 16 }}>Tried: “{decodedSegment}”</div>
          <button
            onClick={() => navigate("/releases")}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #444",
              background: "#111",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            ← Back to all releases
          </button>
        </div>
      </div>
    );
  }

  const bg = theme === "dark" ? "#000" : "#fff";
  const fg = theme === "dark" ? "#fff" : "#000";

  /* ---------- NEW: per-release background config ---------- */
  const bgCfg = release.background || {}; // optional object in releases.js
  const bgUrl = isReal(bgCfg.url) ? bgCfg.url : null;
  const opacity = typeof bgCfg.opacity === "number" ? bgCfg.opacity : 0.22;
  const blur = typeof bgCfg.blur === "number" ? bgCfg.blur : 0;
  const darken = typeof bgCfg.darken === "number" ? bgCfg.darken : 0; // 0..1 black overlay
  const attachment = bgCfg.attachment || "fixed"; // "fixed" | "scroll"
  const size = bgCfg.size || "cover";
  const position = bgCfg.position || "center";
  const repeat = bgCfg.repeat || "no-repeat";
  const respectReducedMotion = bgCfg.respectReducedMotion !== false; // default true

  // Respect reduced motion: if true and user prefers reduced motion, hide animated GIFs
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isGif = bgUrl ? /\.gif($|\?)/i.test(bgUrl) : false;
  const showBackground = !!(bgUrl && !(respectReducedMotion && prefersReducedMotion && isGif));

  // Real platform links only (ignore PLACEHOLDER/empty)
  const hasSpotify = isReal(release.spotifyUrl);
  const hasApple = isReal(release.appleUrl);
  const hasYouTubeLink = isReal(release.youtubeUrl);
  const hasAnyPlatforms = hasSpotify || hasApple || hasYouTubeLink;

  // Embeds (respect PLACEHOLDER too)
  const embedSpotify = isReal(release.embedSpotify) ? release.embedSpotify : null;
  const embedYoutubeId = isReal(release.embedYoutubeId) ? release.embedYoutubeId : null;
  const youtubeId = embedYoutubeId || (hasYouTubeLink ? extractYouTubeId(release.youtubeUrl) : null);
  const ytSrc = youtubeId
    ? buildYouTubeEmbedSrc(
        youtubeId,
        typeof window !== "undefined" ? window.location.origin : undefined
      )
    : null;
  const haveYT = !!youtubeId;

  // Buttons
  const btnBase = {
    display: "inline-block",
    padding: "14px 28px",
    fontSize: "1rem",
    fontWeight: "bold",
    backgroundColor: "#000",
    color: "#fff",
    border: "2px solid #fff",
    borderRadius: "10px",
    textDecoration: "none",
    cursor: "pointer",
    transition: "transform 0.15s ease",
    width: "100%",
    boxSizing: "border-box"
  };

  const iconBtn = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    minHeight: 44,
    padding: "12px 14px",
    backgroundColor: "#000",
    color: "#fff",
    border: "2px solid #fff",
    borderRadius: "10px",
    textDecoration: "none",
    boxSizing: "border-box"
  };

  const iconStyle = { width: 18, height: 18, display: "inline-block" };

  return (
    <div
      style={{
        backgroundColor: bg,
        color: fg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
        isolation: "isolate" // keep overlays behind content
      }}
    >
      {/* ---------- NEW: Background layer ---------- */}
      {showBackground && (
        <div
          aria-hidden="true"
          style={{
            position: attachment === "fixed" ? "fixed" : "absolute",
            inset: 0,
            zIndex: -2,
            pointerEvents: "none",
            backgroundImage: `url("${bgUrl}")`,
            backgroundSize: size,
            backgroundPosition: position,
            backgroundRepeat: repeat,
            opacity,
            filter: blur ? `blur(${blur}px)` : undefined,
            transform: "translateZ(0)", // perf hint
            willChange: "transform, opacity, filter"
          }}
        />
      )}
      {showBackground && darken > 0 && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -1,
            pointerEvents: "none",
            background: "#000",
            opacity: Math.min(Math.max(darken, 0), 1)
          }}
        />
      )}

      {/* Bottom Center Back Arrow */}
      <div
        onClick={() => navigate("/releases")}
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
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          backgroundColor: theme === "dark" ? "#111" : "#f9f9f9",
          borderRadius: "16px",
          padding: "28px 22px",
          border: theme === "dark" ? "1px solid #232323" : "1px solid #eaeaea",
          textAlign: "center",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1 // ensure above bg/overlay
        }}
      >
        {/* Title ABOVE art if a video exists */}
        {haveYT && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: "clamp(18px, 4vw, 26px)", lineHeight: 1.2 }}>
              {release.title}
            </div>
            {release.artist && (
              <div style={{ opacity: 0.85, marginTop: 4, fontSize: "clamp(14px, 3vw, 16px)" }}>
                {release.artist}
              </div>
            )}
          </div>
        )}

        {/* Cover Image */}
        <img
          src={release.cover}
          alt={release.title}
          style={{
            width: "100%",
            borderRadius: "12px",
            display: "block",
            marginBottom: "18px",
            border: theme === "dark" ? "1px solid #222" : "1px solid #ddd",
            boxSizing: "border-box"
          }}
          loading="eager"
          decoding="async"
        />

        {/* If no video: Title under art */}
        {!haveYT && (
          <div style={{ marginTop: 4, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: "clamp(18px, 4vw, 26px)", lineHeight: 1.2 }}>
              {release.title}
            </div>
            {release.artist && (
              <div style={{ opacity: 0.85, marginTop: 4, fontSize: "clamp(14px, 3vw, 16px)" }}>
                {release.artist}
              </div>
            )}
          </div>
        )}

        {/* Embeds: YouTube priority, else Spotify */}
        {haveYT ? (
          <div style={{ marginBottom: "18px" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "56.25%", // 16:9
                borderRadius: "12px",
                overflow: "hidden",
                background: "#000",
                border: theme === "dark" ? "1px solid #222" : "1px solid #ddd",
                boxSizing: "border-box"
              }}
            >
              <iframe
                src={ytSrc}
                title={release.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none"
                }}
              />
            </div>
          </div>
        ) : embedSpotify ? (
          <div style={{ marginBottom: "18px" }}>
            <iframe
              src={embedSpotify}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={`${release.title} on Spotify`}
              style={{ borderRadius: "12px", border: theme === "dark" ? "1px solid #222" : "1px solid #ddd" }}
            />
          </div>
        ) : null}

        {/* Primary action:
            - If any real platform links: show dropdown trigger
            - Else (no platform links): direct SmartLink button (if present)
        */}
        <div style={{ marginBottom: 12 }} ref={menuRef}>
          {hasAnyPlatforms ? (
            <>
              <button
                onClick={() => setMenuOpen(v => !v)}
                style={btnBase}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                Listen on All Platforms
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  style={{
                    marginTop: 12,
                    background: theme === "dark" ? "#111" : "#fff",
                    border: "1px solid " + (theme === "dark" ? "#222" : "#e6e6e6"),
                    borderRadius: "12px",
                    boxShadow:
                      theme === "dark"
                        ? "0 10px 24px rgba(0,0,0,0.45)"
                        : "0 10px 24px rgba(0,0,0,0.1)",
                    padding: "10px",
                    maxWidth: 480,
                    marginLeft: "auto",
                    marginRight: "auto",
                    textAlign: "left",
                    boxSizing: "border-box"
                  }}
                >
                  {hasSpotify && (
                    <a
                      href={release.spotifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...iconBtn, marginBottom: 8 }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <IconSpotify style={iconStyle} />
                      <span>Spotify</span>
                    </a>
                  )}

                  {hasApple && (
                    <a
                      href={release.appleUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...iconBtn, marginBottom: 8 }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <IconApple style={iconStyle} />
                      <span>Apple Music</span>
                    </a>
                  )}

                  {hasYouTubeLink && (
                    <a
                      href={release.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={iconBtn}
                      onClick={() => setMenuOpen(false)}
                    >
                      <IconYouTube style={iconStyle} />
                      <span>YouTube</span>
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            isReal(release.smartLink) && (
              <a href={release.smartLink} target="_blank" rel="noreferrer" style={btnBase}>
                Listen on All Platforms
              </a>
            )
          )}
        </div>

        {/* Social icons (Share included automatically, using SmartLink if present) */}
        <SocialSection
          release={release}
          color={fg}
          borderColor={theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}
        />

        {/* Distributed by + spinning Yen logo */}
        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            opacity: 0.65,
            fontStyle: "italic",
            fontSize: "0.95rem"
          }}
        >
          <div>הופץ ע״י YEN SOUND</div>
          <img src="/yen-logo.gif" alt="Yen Sound Animated Logo" style={{ width: "40px", marginTop: "10px" }} />
        </div>
      </div>
    </div>
  );
}
