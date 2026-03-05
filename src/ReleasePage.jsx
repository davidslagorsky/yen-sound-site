import React, { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useReleases } from "./hooks/useReleases";
import { FaInstagram, FaSpotify, FaApple, FaYoutube, FaSoundcloud, FaBandcamp, FaGlobe } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import { FiShare2, FiCheck } from "react-icons/fi";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* ── helpers ── */
function toLocalMidnight(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T00:00:00`);
}
function getCountdownParts(target) {
  const now = new Date();
  if (!target || now >= target) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const s = Math.floor((target - now) / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
function formatCountdown({ days, hours, minutes, seconds }) {
  const pad = (n) => String(n).padStart(2, "0");
  return days > 0
    ? `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
function useSecondTicker(enabled = true) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [enabled]);
}
function extractYouTubeId(url = "") {
  if (!url) return null;
  for (const rx of [
    /v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ]) {
    const m = url.match(rx);
    if (m) return m[1];
  }
  return null;
}
function buildYouTubeEmbedSrc(id, origin) {
  if (!id) return null;
  const p = new URLSearchParams({
    rel: "0", modestbranding: "1", playsinline: "1",
    iv_load_policy: "3", color: "white",
    ...(origin ? { origin } : {}),
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${p.toString()}`;
}
function normalizeSlug(s = "") {
  return s.toString().trim().toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
function isReal(v) {
  return typeof v === "string" && v.trim().length > 0 && v.trim().toUpperCase() !== "PLACEHOLDER";
}

/* ── platform SVG icons ── */
const IconSpotify = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
    <path d="M12 1.5A10.5 10.5 0 1 0 22.5 12 10.513 10.513 0 0 0 12 1.5Zm4.6 14.9a.75.75 0 0 1-1.03.26 11.9 11.9 0 0 0-6.14-1.32 15.5 15.5 0 0 0-3.6.47.75.75 0 1 1-.36-1.45c4.12-1.01 8.4-.55 10.34.58a.75.75 0 0 1 .39.52.74.74 0 0 1-.3.8Zm1.35-3.12a.9.9 0 0 1-1.24.31c-2.34-1.45-6.69-1.88-9.74-1.02a.9.9 0 1 1-.48-1.73c3.54-.97 8.37-.5 11.12 1.22a.9.9 0 0 1 .34 1.22Zm.1-3.19a1 1 0 0 1-1.37.34c-2.7-1.62-7.51-1.98-10.8-1.06A1 1 0 0 1 5.4 6.6c3.82-1.05 9.05-.65 12.2 1.22a1 1 0 0 1 .49 1.37Z" />
  </svg>
);
const IconApple = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
    <path d="M16.9 13.2c.03 3.3 2.9 4.4 2.93 4.42-.02.07-.46 1.58-1.52 3.13-.92 1.34-1.87 2.67-3.37 2.69-1.47.03-1.94-.87-3.61-.87-1.67 0-2.17.84-3.54.9-1.43.06-2.52-1.45-3.45-2.78-1.88-2.73-3.33-7.72-1.39-11.08.96-1.65 2.68-2.69 4.56-2.72 1.43-.03 2.78.96 3.61.96.83 0 2.49-1.18 4.21-1 .71.03 2.69.29 3.96 2.18-.1.06-2.36 1.38-2.38 4.37ZM14 3.4c.73-.89 1.22-2.14 1.08-3.4-1.05.04-2.36.7-3.12 1.59-.69.8-1.28 2.07-1.12 3.29 1.18.09 2.43-.6 3.16-1.48Z" />
  </svg>
);
const IconYouTube = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
    <path d="M23.5 7.1s-.23-1.66-.94-2.39c-.9-.95-1.9-.96-2.36-1.02-3.3-.24-8.24-.24-8.24-.24h-.01s-4.95 0-8.24.24c-.46.06-1.46.07-2.36 1.02C.73 5.45.5 7.1.5 7.1S.27 9.1.27 11.1v1.78c0 2 .23 4 .23 4s.23 1.66.94 2.39c.9.95 2.08.92 2.61 1.03 1.89.18 8.05.24 8.05.24s4.96-.01 8.26-.25c.46-.06 1.46-.07 2.36-1.02.71-.73.94-2.39.94-2.39s.23-2 .23-4v-1.78c0-2-.23-4-.23-4ZM9.84 13.88V8.1l5.67 2.9-5.67 2.88Z" />
  </svg>
);

/* ── share button ── */
function ShareButton({ release }) {
  const [copied, setCopied] = useState(false);
  async function handle() {
    const url = isReal(release.smartLink) ? release.smartLink : window.location.href;
    const title = `${release.title} — ${release.artist}`;
    try {
      if (navigator.share) { await navigator.share({ title, url }); }
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    } catch { /* ignore */ }
  }
  return (
    <button onClick={handle} style={borderedBtn}
      onMouseOver={e => e.currentTarget.style.background = "#111"}
      onMouseOut={e => e.currentTarget.style.background = "transparent"}>
      {copied ? <FiCheck size={17} /> : <FiShare2 size={17} />}
      <span>{copied ? "COPIED" : "SHARE"}</span>
    </button>
  );
}

/* ── artist social icon row ── */
const SOCIAL_MAP = {
  instagram: FaInstagram, spotify: FaSpotify, appleMusic: FaApple,
  youtube: FaYoutube, tiktok: SiTiktok, soundcloud: FaSoundcloud,
  bandcamp: FaBandcamp, website: FaGlobe,
};
function SocialRow({ socials = {} }) {
  const entries = Object.entries(socials).filter(([k, v]) => SOCIAL_MAP[k] && isReal(v));
  if (!entries.length) return null;
  return (
    <div style={{ display: "flex", gap: "0", justifyContent: "center" }}>
      {entries.map(([key, val]) => {
        const Icon = SOCIAL_MAP[key];
        return (
          <a key={key} href={val} target="_blank" rel="noreferrer" aria-label={key}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: 1, padding: "14px", borderRight: "1px solid #1a1a1a", color: "#f0ede8", textDecoration: "none", opacity: 0.4, transition: "opacity 0.2s", fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", gap: "8px" }}
            onMouseOver={e => e.currentTarget.style.opacity = 1}
            onMouseOut={e => e.currentTarget.style.opacity = 0.4}>
            <Icon size={14} />
          </a>
        );
      })}
    </div>
  );
}

/* ── per-artist social rows ── */
function ArtistSocialSection({ release }) {
  const hasByArtist = Array.isArray(release.socialsByArtist) && release.socialsByArtist.length > 0;
  const hasGeneral = release.socials && Object.keys(release.socials).length > 0;
  if (!hasByArtist && !hasGeneral) return null;

  if (hasByArtist) {
    return (
      <>
        {release.socialsByArtist.map((row, i) => (
          row && typeof row === "object" ? (
            <div key={i} style={{ borderTop: "1px solid #1a1a1a" }}>
              {row.name && (
                <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.35, padding: "10px 24px 0", textAlign: "center" }}>{row.name}</p>
              )}
              <SocialRow socials={row.socials || {}} />
            </div>
          ) : null
        ))}
        {hasGeneral && <div style={{ borderTop: "1px solid #1a1a1a" }}><SocialRow socials={release.socials} /></div>}
      </>
    );
  }
  return <div style={{ borderTop: "1px solid #1a1a1a" }}><SocialRow socials={release.socials} /></div>;
}

/* ── shared button style — matches ArtistPage ── */
const borderedBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  width: "calc(100% - 48px)",
  margin: "0 24px 10px",
  padding: "18px 24px",
  border: "2px solid rgba(240,237,232,0.8)",
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

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function ReleasePage() {
  const { slug: rawSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { releases, loading } = useReleases();

  const decodedSegment = useMemo(() => {
    const last = location.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(rawSlug ?? last ?? "");
  }, [rawSlug, location.pathname]);

  const candidate = useMemo(() => normalizeSlug(decodedSegment), [decodedSegment]);

  const release = useMemo(() => (
    releases.find((r) => r.slug && (r.slug === decodedSegment || r.slug === candidate)) ||
    releases.find((r) => r.slug && normalizeSlug(r.slug) === candidate) ||
    releases.find((r) => normalizeSlug(r.title || "") === candidate) ||
    null
  ), [releases, decodedSegment, candidate]);

  const unlockAt = release?.releaseAt ? toLocalMidnight(release.releaseAt) : null;
  const isLocked = !!(unlockAt && new Date() < unlockAt);
  useSecondTicker(isLocked);

  if (loading) return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.3 }}>Loading</p>
    </div>
  );

  if (!release) return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px" }}>
      <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.4 }}>Release not found</p>
      <button onClick={() => navigate("/releases")}
        style={{ ...borderedBtn, width: "auto", margin: 0 }}>
        ← All Releases
      </button>
    </div>
  );

  const pageUrl = `https://yensound.com/release/${release.slug}`;
  const pageTitle = `${release.title} — ${release.artist}`;
  const pageDescription = `Listen to ${release.title} by ${release.artist} on Yen Sound.`;
  const pageImage = release.cover || "https://yensound.com/logo.png";

  const bgCfg = release.background || {};
  const bgUrl = isReal(bgCfg.url) ? bgCfg.url : null;
  const bgOpacity = typeof bgCfg.opacity === "number" ? bgCfg.opacity : 0.22;
  const bgBlur = typeof bgCfg.blur === "number" ? bgCfg.blur : 0;
  const bgDarken = typeof bgCfg.darken === "number" ? bgCfg.darken : 0;
  const isGif = bgUrl ? /\.gif($|\?)/i.test(bgUrl) : false;
  const prefersReduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const showBg = !!(bgUrl && !(isGif && prefersReduced));

  const embedSpotify = isReal(release.embedSpotify) ? release.embedSpotify : null;
  const embedYoutubeId = isReal(release.embedYoutubeId) ? release.embedYoutubeId : null;
  const youtubeId = embedYoutubeId || (isReal(release.youtubeUrl) ? extractYouTubeId(release.youtubeUrl) : null);
  const ytSrc = youtubeId ? buildYouTubeEmbedSrc(youtubeId, typeof window !== "undefined" ? window.location.origin : undefined) : null;

  const hasSpotify = isReal(release.spotifyUrl);
  const hasApple = isReal(release.appleUrl);
  const hasYouTube = isReal(release.youtubeUrl);
  const hasSmartLink = isReal(release.smartLink);
  const hasAnyPlatform = hasSpotify || hasApple || hasYouTube;

  if (isLocked) {
    const parts = getCountdownParts(unlockAt);
    return (
      <div style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px", position: "relative", overflow: "hidden" }}>
        <Helmet>
          <title>{pageTitle} — Yen Sound</title>
          <meta property="og:title" content={pageTitle} />
          <meta property="og:image" content={pageImage} />
          <meta property="og:url" content={pageUrl} />
        </Helmet>
        {showBg && <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: `url("${bgUrl}")`, backgroundSize: "cover", backgroundPosition: "center", opacity: bgOpacity, filter: bgBlur ? `blur(${bgBlur}px)` : undefined }} />}
        {bgDarken > 0 && <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 1, background: "#000", opacity: bgDarken }} />}
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "480px" }}>
          <img src={release.cover} alt={release.title} style={{ width: "100%", display: "block", marginBottom: "28px" }} />
          <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.35, textAlign: "center", marginBottom: "6px" }}>Pre-Release</p>
          <h1 style={{ fontFamily: F, fontSize: "15px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center", color: "#f0ede8", marginBottom: "4px" }}>
            {release.artist} — {release.title}
          </h1>
          <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.35, textAlign: "center", marginBottom: "28px" }}>Unlocks at midnight</p>
          <p style={{ fontFamily: "monospace", fontSize: "32px", color: "#f0ede8", textAlign: "center", marginBottom: "32px", letterSpacing: "0.05em" }}>{formatCountdown(parts)}</p>
          {hasSmartLink && (
            <a href={release.smartLink} target="_blank" rel="noreferrer" style={borderedBtn}
              onMouseOver={e => e.currentTarget.style.background = "#111"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}>
              Pre-Save
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#000", color: "#f0ede8", minHeight: "100vh", fontFamily: F, position: "relative" }}>
      <Helmet>
        <title>{pageTitle} — Yen Sound</title>
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="music.song" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
      </Helmet>

      {showBg && (
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: `url("${bgUrl}")`, backgroundSize: "cover", backgroundPosition: "center", opacity: bgOpacity, filter: bgBlur ? `blur(${bgBlur}px)` : undefined }} />
      )}
      {bgDarken > 0 && (
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 1, background: "#000", opacity: bgDarken }} />
      )}

      <div style={{ position: "relative", zIndex: 2, maxWidth: "600px", margin: "0 auto" }}>

        {/* ── Spinning logo + marquee ── */}
        <div style={{ paddingTop: "36px", paddingBottom: "0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <img
              src="/spinning yen logo white.gif"
              alt="YEN SOUND"
              className="yen-spin"
              style={{ width: "52px", height: "52px", opacity: 0.55 }}
            />
          </div>
          {/* Marquee */}
          <div style={{ overflow: "hidden", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", padding: "7px 0" }}>
            <div style={{
              display: "inline-flex", gap: "0",
              animation: "marquee 18s linear infinite",
              whiteSpace: "nowrap",
            }}>
              {Array(6).fill("YEN SOUND ®   ").map((t, i) => (
                <span key={i} style={{ fontFamily: F, fontSize: "9px", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", opacity: 0.25, paddingRight: "40px" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Cover — full-bleed square ── */}
        <div style={{ width: "100%", marginTop: "24px" }}>
          <img src={release.cover} alt={release.title}
            style={{ width: "100%", display: "block", aspectRatio: "1", objectFit: "cover" }} />
        </div>

        {/* ── Title block ── */}
        <div style={{ padding: "28px 24px 24px", textAlign: "center" }}>
          <h1 style={{ fontFamily: F, fontSize: "17px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f0ede8", marginBottom: "10px", lineHeight: 1.3 }}>
            {release.artist} — {release.title}
          </h1>
          <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.35 }}>
            Choose music service
          </p>
        </div>

        {/* ── Platform buttons ── */}
        <div style={{ padding: "24px 0 16px" }}>
          {hasSpotify && (
            <a href={release.spotifyUrl} target="_blank" rel="noreferrer" style={borderedBtn}
              onMouseOver={e => e.currentTarget.style.background = "#111"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}>
              <IconSpotify /><span>SPOTIFY</span>
            </a>
          )}
          {hasApple && (
            <a href={release.appleUrl} target="_blank" rel="noreferrer" style={borderedBtn}
              onMouseOver={e => e.currentTarget.style.background = "#111"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}>
              <IconApple /><span>APPLE MUSIC</span>
            </a>
          )}
          {hasYouTube && (
            <a href={release.youtubeUrl} target="_blank" rel="noreferrer" style={borderedBtn}
              onMouseOver={e => e.currentTarget.style.background = "#111"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}>
              <IconYouTube /><span>YOUTUBE</span>
            </a>
          )}
          {!hasAnyPlatform && hasSmartLink && (
            <a href={release.smartLink} target="_blank" rel="noreferrer" style={borderedBtn}
              onMouseOver={e => e.currentTarget.style.background = "#111"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}>
              <span>LISTEN</span>
            </a>
          )}
          <ShareButton release={release} />
        </div>

        {/* ── YouTube embed ── */}
        {ytSrc && (
          <div style={{ borderTop: "1px solid #1a1a1a", marginTop: "8px" }}>
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
              <iframe src={ytSrc} title={release.title} frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} />
            </div>
          </div>
        )}

        {/* ── Spotify embed (only if no YouTube) ── */}
        {embedSpotify && !ytSrc && (
          <div style={{ borderTop: "1px solid #1a1a1a", marginTop: "8px" }}>
            <iframe src={embedSpotify} width="100%" height="152" frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy" title={`${release.title} on Spotify`}
              style={{ display: "block" }} />
          </div>
        )}

        {/* ── Artist socials ── */}
        <ArtistSocialSection release={release} />

        {/* ── Footer stamp ── */}
        <div style={{ borderTop: "1px solid #1a1a1a", padding: "28px 24px", textAlign: "center" }}>
          <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.2, marginBottom: "12px" }}>
            Distributed by Yen Sound
          </p>
          <img src="/yen-logo.gif" alt="Yen Sound" style={{ width: "24px", opacity: 0.25 }} />
        </div>

        {/* ── Back ── */}
        <div style={{ padding: "0 24px 60px", textAlign: "center" }}>
          <button onClick={() => navigate("/releases")}
            style={{ background: "none", border: "none", color: "#f0ede8", cursor: "pointer", fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.25, padding: 0 }}
            onMouseOver={e => e.currentTarget.style.opacity = 0.7}
            onMouseOut={e => e.currentTarget.style.opacity = 0.25}>
            ← Releases
          </button>
        </div>

      </div>
    </div>
  );
}
