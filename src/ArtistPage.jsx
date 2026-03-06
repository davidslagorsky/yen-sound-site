import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import roster from "./rosterData";
import releases from "./releases";
import { supabase } from "./supabase";
import { FaInstagram, FaSpotify, FaApple, FaTiktok, FaYoutube } from "react-icons/fa";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const DEFAULT_ORDER = ["spotify","appleMusic","youtube","tiktok","instagram","press"];

const PLATFORM_ICON = {
  spotify:    <FaSpotify size={17} />,
  appleMusic: <FaApple size={17} />,
  youtube:    <FaYoutube size={17} />,
  tiktok:     <FaTiktok size={17} />,
  instagram:  <FaInstagram size={17} />,
};
const PLATFORM_LABEL = {
  spotify: "SPOTIFY", appleMusic: "APPLE MUSIC", youtube: "YOUTUBE",
  tiktok: "TIKTOK", instagram: "INSTAGRAM", press: "PRESS",
};
const CUSTOM_ICON_MAP = {
  link: "→", spotify: "◎", apple: "◈", youtube: "▶",
  instagram: "◻", tiktok: "◇", soundcloud: "◉", bandcamp: "◆",
};

/* ── embed parser — same as dashboard ── */
function buildEmbedData(url = "") {
  if (!url?.trim()) return null;
  const u = url.trim();
  const spotify = u.match(/open\.spotify\.com\/(track|album|playlist|episode|artist)\/([A-Za-z0-9]+)/);
  const youtube = u.match(/(?:[?&]v=|youtu\.be\/|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  const sc = u.includes("soundcloud.com/");
  if (spotify) return { type: "spotify", src: `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}?utm_source=generator&theme=0` };
  if (youtube) return { type: "youtube", src: `https://www.youtube-nocookie.com/embed/${youtube[1]}?rel=0&modestbranding=1&playsinline=1` };
  if (sc) return { type: "soundcloud", src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&color=%23f0ede8&auto_play=false&hide_related=true&show_comments=false&show_user=true` };
  return null;
}

/* ── migrate old embed_url into custom_buttons shape ── */
function migrateEmbedUrl(buttons, embedUrl) {
  if (!embedUrl?.trim()) return buttons;
  const alreadyMigrated = buttons.some(b => b.type === "embed" && b.url === embedUrl.trim());
  if (alreadyMigrated) return buttons;
  return [...buttons, { id: "__legacy_embed__", type: "embed", url: embedUrl.trim(), label: "" }];
}

/* ── inline embed card ── */
function EmbedCard({ item }) {
  const data = buildEmbedData(item.url);
  if (!data) return null;
  return (
    <div style={{ margin: "0 24px 10px", border: "1px solid rgba(240,237,232,0.15)", overflow: "hidden" }}>
      {item.label && (
        <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.4, padding: "10px 14px 6px", textAlign: "center" }}>
          {item.label}
        </p>
      )}
      {data.type === "youtube" ? (
        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
          <iframe src={data.src} title="Video embed" frameBorder="0" allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} />
        </div>
      ) : data.type === "spotify" ? (
        <iframe src={data.src} width="100%" height="152" frameBorder="0" title="Music embed"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy" style={{ display: "block" }} />
      ) : (
        <iframe width="100%" height="166" frameBorder="0" src={data.src} title="SoundCloud embed" style={{ display: "block" }} />
      )}
    </div>
  );
}

export default function ArtistPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [showAllReleases, setShowAllReleases] = useState(false);
  const [pressPosts, setPressPosts] = useState([]);
  const [pageData, setPageData] = useState(null);

  useEffect(() => { setShowAllReleases(false); }, [slug]);

  const artist = useMemo(() => roster.find((a) => a.slug === slug), [slug]);
  const artistName = artist?.displayName || artist?.name || "";

  const allNames = useMemo(() => {
    if (!artist) return [];
    return [artistName, ...(artist.aliases || [])].filter(Boolean).map((n) => n.trim().toLowerCase());
  }, [artist, artistName]);

  const artistReleases = useMemo(() => {
    if (!artist || allNames.length === 0) return [];
    return releases
      .filter((r) => {
        const names = Array.isArray(r.artist) ? r.artist : typeof r.artist === "string" ? r.artist.split(",") : [];
        return names.map((a) => a?.trim().toLowerCase()).some((n) => allNames.includes(n));
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [artist, allNames]);

  useEffect(() => {
    if (!artist) return;
    async function fetchPress() {
      const { data } = await supabase.from("press_posts").select("id,title,excerpt,cover_url,date,slug,artist").order("date", { ascending: false });
      if (!data) return;
      const names = [artistName, ...(artist.aliases || [])].filter(Boolean).map(n => n.trim().toLowerCase());
      setPressPosts(data.filter(p => {
        if (!p.artist) return false;
        return p.artist.split(",").map(a => a.trim().toLowerCase()).some(a => names.some(n => a.includes(n) || n.includes(a)));
      }));
    }
    async function fetchPageData() {
      const { data } = await supabase.from("artists").select("bio,custom_buttons,embed_url,button_order,profile_image,theme").eq("slug", slug).single();
      if (data) setPageData(data);
    }
    fetchPress();
    fetchPageData();
  }, [artist, artistName, slug]);

  const LIMIT = 12;
  const visible = showAllReleases ? artistReleases : artistReleases.slice(0, LIMIT);

  if (!artist) return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "120px 40px", fontFamily: F, color: "#f0ede8", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.4 }}>
      Artist not found
    </div>
  );

  const socials = artist.socials || {};
  const profileImage = pageData?.profile_image || artist.image;
  const bio = pageData?.bio || "";

  /* ── theme ── */
  const isLight = pageData?.theme === "light";
  const bg       = isLight ? "#f5f3ef" : "#000";
  const fg       = isLight ? "#0a0a0a" : "#f0ede8";
  const fgMuted  = isLight ? "rgba(10,10,10,0.45)" : "rgba(240,237,232,0.35)";
  const border   = isLight ? "rgba(10,10,10,0.12)"  : "rgba(240,237,232,0.15)";
  const btnBorder= isLight ? "rgba(10,10,10,0.7)"   : "rgba(240,237,232,0.8)";
  const hoverBg  = isLight ? "#e8e5e0" : "#111";
  const logoFilter = isLight ? "invert(1)" : "none";

  /* merge legacy embed into custom buttons */
  const rawButtons = pageData?.custom_buttons || [];
  const customButtons = migrateEmbedUrl(rawButtons, pageData?.embed_url || "");

  /* build order: saved order, fall back to default + append any unordered custom items */
  const savedOrder = pageData?.button_order?.length ? pageData.button_order : DEFAULT_ORDER;
  const allCustomIds = customButtons.map(b => b.id);
  const buttonOrder = [...savedOrder, ...allCustomIds.filter(id => !savedOrder.includes(id))];

  /* build final ordered item list */
  const orderedItems = buttonOrder.map(key => {
    /* streaming platform */
    if (PLATFORM_LABEL[key]) {
      if (key === "press") return pressPosts.length > 0 ? { kind: "platform", key: "press", label: "PRESS", icon: null, url: "/press", internal: true } : null;
      const url = socials[key];
      if (!url || url === "PLACEHOLDER") return null;
      return { kind: "platform", key, label: PLATFORM_LABEL[key], icon: PLATFORM_ICON[key], url, internal: false };
    }
    /* custom item */
    const item = customButtons.find(b => b.id === key);
    if (!item) return null;
    if (item.type === "embed") {
      if (!item.url?.trim()) return null;
      return { kind: "embed", key, item };
    }
    if (item.type === "link" && item.label && item.url) {
      return { kind: "link", key, label: item.label.toUpperCase(), icon: item.icon, url: item.url };
    }
    return null;
  }).filter(Boolean);

  const btnStyle = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
    width: "calc(100% - 48px)", margin: "0 24px 10px", padding: "18px 24px",
    border: `2px solid ${btnBorder}`, background: "transparent",
    fontFamily: F, fontSize: "11px", fontWeight: 700, letterSpacing: "0.3em",
    textTransform: "uppercase", color: fg, textDecoration: "none",
    cursor: "pointer", transition: "background 0.15s", boxSizing: "border-box",
  };

  return (
    <div style={{ backgroundColor: bg, minHeight: "100vh", color: fg, maxWidth: "600px", margin: "0 auto", transition: "background-color 0.3s, color 0.3s" }}>

      {/* logo */}
      <div style={{ paddingTop: "36px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <img src="/spinning yen logo white.gif" alt="YEN SOUND" className="yen-spin" style={{ width: "52px", height: "52px", opacity: 0.55, filter: logoFilter }} />
        </div>
      </div>

      {/* cover */}
      <div style={{ width: "100%" }}>
        <img src={profileImage} alt={artistName} style={{ width: "100%", display: "block", aspectRatio: "1", objectFit: "cover", objectPosition: "top" }} />
      </div>

      {/* name + bio */}
      <div style={{ padding: "28px 24px 0", textAlign: "center" }}>
        <h1 style={{ fontFamily: F, fontSize: "17px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: fg, marginBottom: "14px", lineHeight: 1.3 }}>
          {artistName.toUpperCase()}
        </h1>
        {bio && (
          <p style={{ fontFamily: F, fontSize: "11px", letterSpacing: "0.08em", lineHeight: 1.7, color: fgMuted, maxWidth: "440px", margin: "0 auto" }}>
            {bio}
          </p>
        )}
      </div>

      {/* marquee */}
      <div style={{ overflow: "hidden", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: "7px 0", margin: "28px 0 0" }}>
        <div style={{ display: "inline-flex", animation: "marquee 18s linear infinite", whiteSpace: "nowrap" }}>
          {Array(6).fill("YEN SOUND ®   ").map((t, i) => (
            <span key={i} style={{ fontFamily: F, fontSize: "9px", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: fgMuted, paddingRight: "40px" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* choose music service */}
      <div style={{ padding: "24px 24px 16px", textAlign: "center" }}>
        <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: fgMuted }}>
          Choose music service
        </p>
      </div>

      {/* ── ordered items: platforms, links, embeds ── */}
      <div style={{ paddingBottom: "24px" }}>
        {orderedItems.map((item, i) => {
          if (item.kind === "embed") {
            return <EmbedCard key={item.key} item={item.item} />;
          }
          if (item.kind === "platform") {
            return item.internal ? (
              <Link key={item.key} to={item.url} style={btnStyle}
                onMouseOver={e => e.currentTarget.style.background = hoverBg}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                {item.icon}{item.label}
              </Link>
            ) : (
              <a key={item.key} href={item.url} target="_blank" rel="noreferrer" style={btnStyle}
                onMouseOver={e => e.currentTarget.style.background = hoverBg}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                {item.icon}{item.label}
              </a>
            );
          }
          if (item.kind === "link") {
            return (
              <a key={item.key} href={item.url} target="_blank" rel="noreferrer" style={btnStyle}
                onMouseOver={e => e.currentTarget.style.background = hoverBg}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ opacity: 0.8 }}>{CUSTOM_ICON_MAP[item.icon] || "→"}</span>
                {item.label}
              </a>
            );
          }
          return null;
        })}
      </div>

      {/* releases */}
      {artistReleases.length > 0 && (
        <div style={{ padding: "48px 24px 24px", borderTop: `1px solid ${border}` }}>
          <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: fgMuted, marginBottom: "24px", textAlign: "center" }}>
            Releases · {artistReleases.length}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "28px 16px" }}>
            {visible.map((r, i) => (
              <Link key={i} to={`/release/${r.slug}`} style={{ textDecoration: "none", color: fg }}>
                <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", background: isLight ? "#ddd" : "#111", marginBottom: "10px" }}>
                  <img src={r.cover} alt={r.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                    onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"} />
                </div>
                <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: fgMuted, marginBottom: "2px" }}>{r.type} · {r.date?.slice(0, 4)}</p>
                <p style={{ fontFamily: F, fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1.2 }}>{r.title}</p>
              </Link>
            ))}
          </div>
          {artistReleases.length > LIMIT && (
            <div style={{ marginTop: "32px", textAlign: "center" }}>
              <button onClick={() => setShowAllReleases(v => !v)}
                style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", background: "transparent", border: `2px solid ${btnBorder}`, color: fg, padding: "12px 24px", cursor: "pointer", opacity: 0.6 }}
                onMouseOver={e => e.currentTarget.style.opacity = 1}
                onMouseOut={e => e.currentTarget.style.opacity = 0.6}>
                {showAllReleases ? "Show less" : `Show all (${artistReleases.length})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* press */}
      {pressPosts.length > 0 && (
        <div style={{ padding: "40px 24px 80px", borderTop: `1px solid ${border}` }}>
          <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: fgMuted, marginBottom: "24px", textAlign: "center" }}>
            Press · {pressPosts.length}
          </p>
          {pressPosts.map((p) => (
            <Link key={p.id} to={`/press/${p.slug}`}
              style={{ textDecoration: "none", color: fg, display: "flex", gap: "16px", alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${border}`, transition: "opacity 0.2s" }}
              onMouseOver={e => e.currentTarget.style.opacity = 0.65}
              onMouseOut={e => e.currentTarget.style.opacity = 1}>
              {p.cover_url && (
                <div style={{ width: "56px", height: "56px", flexShrink: 0, overflow: "hidden", background: isLight ? "#ddd" : "#111" }}>
                  <img src={p.cover_url} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0, direction: "rtl", textAlign: "right" }}>
                <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: fgMuted, marginBottom: "3px" }}>{formatDate(p.date)}</p>
                <p style={{ fontFamily: F, fontSize: "13px", fontWeight: 700, lineHeight: 1.25, marginBottom: "3px" }}>{p.title}</p>
                {p.excerpt && <p style={{ fontFamily: F, fontSize: "11px", fontWeight: 300, color: fgMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* back */}
      <div style={{ padding: "0 24px 60px", textAlign: "center" }}>
        <button onClick={() => navigate("/roster")}
          style={{ background: "none", border: "none", color: fg, cursor: "pointer", fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.25, padding: 0 }}
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
  return new Date(d + "T00:00:00").toLocaleDateString("he-IL", { day: "2-digit", month: "short", year: "numeric" });
}
