import React, { useState, useMemo, useEffect, useRef } from "react";
import { Routes, Route, Link, Navigate, useLocation, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import About from "./About";
import Footer from "./Footer";
import "./index.css";
import ReleasePage from "./ReleasePage";
import CoverFlowFrame from "./components/ipod/CoverFlowFrame";
import Roster from "./Roster";
import ArtistPage from "./ArtistPage";
import ArtistLogin from "./components/ArtistLogin";
import ArtistDashboard from "./components/ArtistDashboard";
import SubmitForm from "./components/SubmitForm";
import { SpeedInsights } from "@vercel/speed-insights/react";
import AdminDashboard from "./AdminDashboard";
import HiddenSplash from "./HiddenSplash";
import { useAnalytics } from "./hooks/useAnalytics";
import RigshiFamRelease from "./RigshiFamRelease";
import RSVP from "./RSVP";
import Capsule001 from "./pages/Capsule001";
import Header from "./Header";
import { PageThemeProvider, usePageTheme } from "./hooks/PageThemeContext";
import VoiceLessons from "./pages/VoiceLessons";
import Press from "./pages/Press";
import PostPage from "./pages/PostPage";
import { useReleases } from "./hooks/useReleases";
import FeaturedDotwork from "./components/FeaturedDotwork";
import SEOMeta from "./components/SEOMeta";
import { supabase } from "./supabase";
import roster from "./rosterData";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* ---------------- + Cursor (desktop only) ---------------- */
function CursorPlus() {
  const cursorRef = React.useRef(null);
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const el = cursorRef.current;
    if (!el) return;
    let visible = false;
    const move = (e) => {
      el.style.left = e.clientX + "px";
      el.style.top  = e.clientY + "px";
      if (!visible) { el.style.opacity = "1"; visible = true; }
    };
    const over = (e) => { if (e.target.closest("a, button, [role=button]")) el.classList.add("hovering"); };
    const out  = () => el.classList.remove("hovering");
    const leave = () => { el.style.opacity = "0"; visible = false; };
    const enter = () => { if (visible) el.style.opacity = "1"; };
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, []);
  return <div ref={cursorRef} className="yen-cursor" aria-hidden />;
}

/* ---------------- Grain Overlay ---------------- */
function GrainOverlay() {
  return <div className="yen-grain" aria-hidden />;
}

/* ---------------- Page Transition ---------------- */
function PageTransition({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="yen-page">
      {children}
    </div>
  );
}

/* ---------------- Bottom Marquee ---------------- */
/* ---------------- Home ---------------- */
const Home = ({ releases }) => {
  const videoRef = React.useRef(null);

  const latest5 = useMemo(() => {
    if (!releases || releases.length === 0) return [];
    return [...releases].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [releases]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const p = video.play();
      if (p !== undefined) p.catch(() => {});
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", display: "flex", flexDirection: "column" }}>
      <SEOMeta
        title={null}
        description="Boutique PR & distribution for bold, boundary-pushing music. Based in Tel Aviv."
        url="/"
      />

      {/* Hero: full-bleed on mobile, centered on desktop */}
      <div className="yen-hero">
        <div className="yen-hero-media">
          <video
            ref={videoRef}
            id="title-video"
            src="/YEN SOUND PR LOGO VID.mp4"
            autoPlay muted playsInline preload="auto"
            onEnded={() => {
              const vid = document.getElementById("title-video");
              const img = document.getElementById("title-image");
              if (vid && img) { vid.style.display = "none"; img.style.display = "block"; }
            }}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          <img
            id="title-image"
            src="/yen sound white on black raw.png"
            alt="Yen Sound"
            style={{ display: "none", width: "100%", height: "auto" }}
          />
        </div>
        <p className="yen-hero-tagline">
          Boutique PR &amp; Distribution · Tel Aviv
        </p>
      </div>

      {/* Featured dotwork release */}
      <FeaturedDotwork releases={latest5} />

    </div>
  );
};

/* ---------------- Releases ---------------- */
const Releases = ({ releases }) => {
  const currentLocation = useLocation();
  const [filter, setFilter] = useState("All");
  const [artistFilter, setArtistFilter] = useState("All");
  const [artistDropdownOpen, setArtistDropdownOpen] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [filteredFromURL, setFilteredFromURL] = useState(null);
  const [dotLeft, setDotLeft] = useState(0);
  const filterRefs = useRef({});

  const TYPE_FILTERS = ["All", "Album", "Single"];

  useEffect(() => {
    const activeKey = showRoster ? "__roster__" : filter;
    const el = filterRefs.current[activeKey];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.offsetParent?.getBoundingClientRect() || { left: 0 };
      setDotLeft(rect.left - parentRect.left + rect.width / 2 - 2.5);
    }
  }, [filter, showRoster]);

  const allArtists = useMemo(() => {
    const names = new Set();
    releases.forEach((r) => r.artist.split(",").forEach((n) => names.add(n.trim())));
    return Array.from(names).sort();
  }, [releases]);

  const artistNameMap = useMemo(() => ({
    sgulot: "סגולות", ethel: "Ethel", sighdafekt: "Sighdafekt",
    shower: "SHOWER", kizels: "Kizels", roynismo: "Roy Nismo",
  }), []);

  useEffect(() => {
    const params = new URLSearchParams(currentLocation.search);
    const a = params.get("artist");
    if (!a) return;
    const norm = a.toLowerCase().replace(/\s+/g, "");
    const mapped = artistNameMap[norm];
    const match = mapped && allArtists.includes(mapped)
      ? mapped
      : allArtists.find((x) => x.toLowerCase().replace(/\s+/g, "") === norm);
    if (match) { setArtistFilter(match); setFilteredFromURL(match); setShowRoster(false); }
    else { setArtistFilter("All"); setFilteredFromURL(null); }
  }, [currentLocation.search, allArtists, artistNameMap]);

  const filtered = useMemo(() => {
    return [...releases]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((r) => {
        const okType = filter === "All" || r.type === filter;
        const okArtist = artistFilter === "All" || r.artist.includes(artistFilter);
        return okType && okArtist;
      });
  }, [releases, filter, artistFilter]);

  const btnStyle = (active) => ({
    fontFamily: F,
    fontSize: "10px",
    fontWeight: active ? 700 : 400,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    padding: "6px 4px",
    border: "none",
    background: "transparent",
    color: "#f0ede8",
    opacity: active ? 1 : 0.35,
    cursor: "pointer",
    transition: "opacity 0.2s",
  });

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", paddingTop: "60px" }}>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 40px 0", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", position: "relative", paddingBottom: "18px" }}>

          <div style={{
            position: "absolute", bottom: "6px", left: dotLeft,
            width: "5px", height: "5px", borderRadius: "50%",
            background: "#f0ede8",
            transition: "left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: "none",
          }} />

          {TYPE_FILTERS.map((t) => (
            <button key={t} ref={el => filterRefs.current[t] = el}
              onClick={() => { setFilter(t); setArtistFilter("All"); setArtistDropdownOpen(false); setShowRoster(false); setFilteredFromURL(null); }}
              style={btnStyle(filter === t && !showRoster)}
              onMouseOver={e => { if (!(filter === t && !showRoster)) e.currentTarget.style.opacity = 0.7; }}
              onMouseOut={e => { if (!(filter === t && !showRoster)) e.currentTarget.style.opacity = 0.35; }}
            >{t}</button>
          ))}

          <div style={{ position: "relative" }}>
            <button onClick={() => setArtistDropdownOpen(!artistDropdownOpen)}
              style={btnStyle(artistFilter !== "All")}
              onMouseOver={e => { if (artistFilter === "All") e.currentTarget.style.opacity = 0.7; }}
              onMouseOut={e => { if (artistFilter === "All") e.currentTarget.style.opacity = 0.35; }}>
              {artistFilter === "All" ? "Artists ▾" : artistFilter + " ▾"}
            </button>
            {artistDropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0,
                background: "#000", border: "1px solid #1a1a1a",
                padding: "8px 0", zIndex: 20, minWidth: "180px",
                maxHeight: "260px", overflowY: "auto",
              }}>
                <button onClick={() => { setArtistFilter("All"); setFilteredFromURL(null); setArtistDropdownOpen(false); }}
                  style={{ ...btnStyle(false), display: "block", width: "100%", textAlign: "left", padding: "10px 20px" }}>
                  All Artists
                </button>
                {allArtists.map((a) => (
                  <button key={a}
                    onClick={() => { setArtistFilter(a); setFilteredFromURL(a); setArtistDropdownOpen(false); setShowRoster(false); }}
                    style={{ ...btnStyle(artistFilter === a), display: "block", width: "100%", textAlign: "left", padding: "10px 20px" }}>
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button ref={el => filterRefs.current["__roster__"] = el}
            onClick={() => { setShowRoster(true); setArtistDropdownOpen(false); setFilteredFromURL(null); }}
            style={btnStyle(showRoster)}
            onMouseOver={e => { if (!showRoster) e.currentTarget.style.opacity = 0.7; }}
            onMouseOut={e => { if (!showRoster) e.currentTarget.style.opacity = 0.35; }}>
            Roster
          </button>

          <Link to="/artist-login" style={{ textDecoration: "none" }}>
            <button style={btnStyle(false)}
              onMouseOver={e => e.currentTarget.style.opacity = 0.7}
              onMouseOut={e => e.currentTarget.style.opacity = 0.35}>
              Artist Login
            </button>
          </Link>
        </div>
      </div>

      {showRoster ? (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px" }}>
          <Roster />
        </div>
      ) : (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 40px 80px" }}>
          {filteredFromURL && (
            <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.35, marginBottom: "32px" }}>
              Showing: {filteredFromURL}
            </p>
          )}
          <div className="releases-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "48px 32px",
          }}>
            {filtered.map((r, i) => (
              <Link key={i} to={`/release/${r.slug}`} style={{ textDecoration: "none", color: "#f0ede8" }}>
                <div className="yen-shimmer" style={{ width: "100%", aspectRatio: "1", overflow: "hidden", marginBottom: "14px", position: "relative" }}>
                  <img src={r.cover} alt={r.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s ease", position: "relative", zIndex: 1 }}
                    onLoad={e => { e.currentTarget.closest(".yen-shimmer")?.classList.remove("yen-shimmer"); }}
                    onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                </div>
                <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.45, marginBottom: "4px" }}>
                  {r.date ? new Date(r.date).getFullYear() : r.artist}
                </p>
                <p style={{ fontFamily: F, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.3, opacity: 0.9, marginBottom: "2px" }}>
                  {r.title}
                </p>
                <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.45 }}>
                  {r.artist}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .releases-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 32px 12px !important; }
        }
      `}</style>
    </div>
  );
};

/* ---------------- Slug redirect ---------------- */
function SlugRedirect({ releases }) {
  const { maybeSlug } = useParams();
  const [resolved, setResolved] = useState(null); // null=loading, false=not found, string=url

  const reserved = [
    "press","about","releases","roster","merch","admin","ipod",
    "rsvp","voice","artist-login","artist-dashboard",
    "enter-shower","rigshi-fam","001","release"
  ];

  useEffect(() => {
    if (reserved.includes(maybeSlug)) { setResolved(false); return; }

    async function resolve() {
      // 1. Check rosterData artist slugs → /artist/:slug
      const artistMatch = roster.find(a => a.slug === maybeSlug);
      if (artistMatch) { setResolved(`/artist/${maybeSlug}`); return; }

      // 2. Check static releases.js
      const staticRelease = releases.find(r => r.slug === maybeSlug);
      if (staticRelease) { setResolved(`/release/${staticRelease.slug}`); return; }

      // 3. Check Supabase slugs table (custom redirects)
      const { data: slugRow } = await supabase
        .from("slugs").select("destination").eq("slug", maybeSlug).single();
      if (slugRow?.destination) {
        // external URL — ensure protocol then hard redirect
        const dest = /^https?:\/\//i.test(slugRow.destination) ? slugRow.destination : `https://${slugRow.destination}`;
        window.location.replace(dest);
        return;
      }

      // 4. Check Supabase releases table
      const { data: dbRelease } = await supabase
        .from("releases").select("slug").eq("slug", maybeSlug).single();
      if (dbRelease?.slug) { setResolved(`/release/${dbRelease.slug}`); return; }

      // Nothing found
      setResolved(false);
    }
    resolve();
  }, [maybeSlug]); // eslint-disable-line

  if (resolved === null) return null; // still resolving — blank is fine, avoids flash
  if (resolved === false) return <Navigate to="/" replace />;
  return <Navigate to={resolved} replace />;
}

/* ---------------- Body theme sync ---------------- */
// Must be inside PageThemeProvider. Flips document.body bg/color when an
// artist page switches to light mode, and restores dark on all other pages.
function BodyThemeSync() {
  const { theme } = usePageTheme();
  useEffect(() => {
    if (theme === "light") {
      document.body.style.backgroundColor = "#f5f3ef";
      document.body.style.backgroundImage = "none";
      document.body.style.color = "#0a0a0a";
    } else {
      document.body.style.color = "#f0ede8";
      // Restore original bg — re-run the site_settings fetch would be heavy,
      // so we just clear inline styles and let the <body> class/CSS take over.
      // If there was a custom site background it was set on mount and will
      // still be in the cascade once we remove the inline override.
      document.body.style.backgroundColor = "#000";
      document.body.style.backgroundImage = "";
    }
  }, [theme]);
  return null;
}

/* ---------------- App ---------------- */
function App() {
  const currentLocation = useLocation();
  const { releases, loading } = useReleases();

  useEffect(() => {
    document.body.style.backgroundColor = "#000";
    document.body.style.color = "#f0ede8";
    // Load site background from Supabase site_settings
    (async () => {
      try {
        const { data } = await supabase.from("site_settings").select("value").eq("key", "background").single();
        if (data?.value) {
          const bg = data.value;
          if (bg.type === "image") {
            document.body.style.backgroundImage = `url(${bg.value})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center center";
            document.body.style.backgroundAttachment = "fixed"; // parallax on desktop
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundColor = "#000";
          } else if (bg.type === "gradient") {
            document.body.style.backgroundImage = bg.value;
            document.body.style.backgroundAttachment = "fixed";
          } else if (bg.type === "color" && bg.value) {
            document.body.style.backgroundColor = bg.value;
          }
        }
      } catch (_) { /* no settings table yet — keep default black */ }
    })();
  }, []);

  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  useAnalytics();

  if (loading) return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.3 }}>Loading</p>
    </div>
  );

  const isReleasePage = currentLocation.pathname.startsWith("/release/");
  const isHomePage = currentLocation.pathname === "/";

  return (
    <HelmetProvider>
      <PageThemeProvider>
      <BodyThemeSync />
      <CursorPlus />
      <GrainOverlay />
      <Header />

      <PageTransition>
        <main style={{ paddingTop: isHomePage ? "0" : "60px" }}>
          <Routes>
            <Route path="/" element={<Home releases={releases} />} />
            <Route path="/releases" element={<Releases releases={releases} />} />
            <Route path="/about" element={<About />} />
            <Route path="/ipod" element={<CoverFlowFrame />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/artist/:slug" element={<ArtistPage />} />
            <Route path="/artist-login" element={<ArtistLogin />} />
            <Route path="/artist-dashboard/:artistId" element={<ArtistDashboard />} />
            <Route path="/artist-dashboard/submit" element={<SubmitForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/enter-shower" element={<HiddenSplash />} />
            <Route path="/rigshi-fam" element={<RigshiFamRelease />} />
            <Route path="/merch" element={<Capsule001 />} />
            <Route path="/001" element={<Capsule001 />} />
            <Route path="/release/:slug" element={<ReleasePage />} />
            <Route path="/rsvp" element={<RSVP />} />
            <Route path="/voice" element={<VoiceLessons />} />
            <Route path="/press" element={<Press />} />
            <Route path="/press/:slug" element={<PostPage />} />
            <Route path="/:maybeSlug" element={<SlugRedirect releases={releases} />} />
          </Routes>
        </main>
      </PageTransition>

      {!isReleasePage && <Footer />}
      <SpeedInsights />
      </PageThemeProvider>
    </HelmetProvider>
  );
}

export default App;
