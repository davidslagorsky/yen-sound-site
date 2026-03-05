import React, { useState, useMemo, useEffect } from "react";
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
import Sigh from "./pages/Sigh";
import VoiceLessons from "./pages/VoiceLessons";
import Press from "./pages/Press";
import PostPage from "./pages/PostPage";
import { useReleases } from "./hooks/useReleases";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/* ---------------- Cursor Dot ---------------- */
function CursorDot() {
  const dotRef = React.useRef(null);
  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    const move = (e) => {
      dot.style.left = e.clientX + "px";
      dot.style.top  = e.clientY + "px";
    };
    const over = (e) => { if (e.target.closest("a, button, [role=button]")) dot.classList.add("hovering"); };
    const out  = () => dot.classList.remove("hovering");
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, []);
  return <div ref={dotRef} className="yen-cursor" aria-hidden />;
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

/* ---------------- Marquee ---------------- */
const MARQUEE_TEXT = "YEN SOUND · TEL AVIV · PR & DISTRIBUTION · BOUTIQUE LABEL · ";
function Marquee() {
  const items = Array(8).fill(MARQUEE_TEXT);
  return (
    <div className="yen-marquee-wrap">
      <div className="yen-marquee-track">
        {items.map((t, i) => <span key={i} className="yen-marquee-item">{t}</span>)}
      </div>
    </div>
  );
}

/* ---------------- Home ---------------- */
const Home = ({ releases }) => {
  const videoRef = React.useRef(null);
  const latest = releases && releases.length > 0
    ? [...releases].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;

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
      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px 40px", textAlign: "center" }}>
        <div style={{ marginBottom: "28px" }}>
          <video
            ref={videoRef}
            id="title-video"
            src="/YEN SOUND PR LOGO VID.mp4"
            autoPlay muted playsInline preload="auto"
            onEnded={() => {
              const vid = document.getElementById("title-video");
              const img = document.getElementById("title-image");
              if (vid && img) { vid.style.display = "none"; img.style.display = "inline"; }
            }}
            style={{ width: "clamp(200px, 38vw, 460px)", height: "auto" }}
          />
          <img id="title-image" src="/yen sound white on black raw.png" alt="Yen Sound"
            style={{ display: "none", width: "clamp(200px, 38vw, 460px)", height: "auto" }} />
        </div>
        <p style={{ fontFamily: F, fontSize: "10px", fontWeight: 300, letterSpacing: "0.32em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.3 }}>
          Boutique PR &amp; Distribution · Tel Aviv
        </p>
      </div>

      {/* Latest release */}
      {latest && (
        <div style={{ borderTop: "1px solid #1a1a1a", padding: "32px 40px" }}>
          <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.3, marginBottom: "20px" }}>
            Latest Release
          </p>
          <Link to={`/release/${latest.slug}`} style={{ textDecoration: "none", color: "#f0ede8", display: "inline-flex", alignItems: "center", gap: "16px" }}>
            <div className="yen-cover" style={{ width: "clamp(48px, 8vw, 72px)", aspectRatio: "1", overflow: "hidden", flexShrink: 0 }}>
              <img src={latest.cover} alt={latest.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div>
              <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, marginBottom: "3px" }}>
                {latest.artist}
              </p>
              <p style={{ fontFamily: F, fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.2 }}>
                {latest.title}
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Marquee */}
      <Marquee />
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

  const btnBase = {
    fontFamily: F,
    fontSize: "10px",
    fontWeight: 400,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    padding: "8px 16px",
    border: "1px solid #2a2a2a",
    background: "transparent",
    color: "#f0ede8",
    cursor: "pointer",
    transition: "all 0.2s",
  };
  const btnActive = { ...btnBase, background: "#f0ede8", color: "#000", borderColor: "#f0ede8" };

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", paddingTop: "60px" }}>

      <div style={{
        maxWidth: "1100px", margin: "0 auto", padding: "28px 40px",
        display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center",
        borderBottom: "1px solid #1a1a1a", position: "relative",
      }}>
        {["All", "Album", "Single"].map((t) => (
          <button key={t}
            onClick={() => { setFilter(t); setArtistFilter("All"); setArtistDropdownOpen(false); setShowRoster(false); setFilteredFromURL(null); }}
            style={filter === t && !showRoster ? btnActive : btnBase}
          >{t}</button>
        ))}

        <button onClick={() => setArtistDropdownOpen(!artistDropdownOpen)}
          style={artistFilter !== "All" ? btnActive : btnBase}>
          {artistFilter === "All" ? "Artists ▾" : artistFilter + " ▾"}
        </button>

        <button onClick={() => { setShowRoster(true); setArtistDropdownOpen(false); setFilteredFromURL(null); }}
          style={showRoster ? btnActive : btnBase}>
          Roster
        </button>

        <Link to="/artist-login" style={{ textDecoration: "none" }}>
          <button style={btnBase}
            onMouseOver={e => { e.currentTarget.style.background = "#f0ede8"; e.currentTarget.style.color = "#000"; }}
            onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f0ede8"; }}>
            Artist Login
          </button>
        </Link>

        {artistDropdownOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 1px)", left: "40px",
            background: "#000", border: "1px solid #222",
            padding: "8px 0", zIndex: 20, minWidth: "200px",
            maxHeight: "260px", overflowY: "auto",
          }}>
            <button onClick={() => { setArtistFilter("All"); setFilteredFromURL(null); setArtistDropdownOpen(false); }}
              style={{ ...btnBase, display: "block", width: "100%", textAlign: "left", border: "none", borderRadius: 0, padding: "10px 20px" }}>
              All Artists
            </button>
            {allArtists.map((a) => (
              <button key={a}
                onClick={() => { setArtistFilter(a); setFilteredFromURL(a); setArtistDropdownOpen(false); setShowRoster(false); }}
                style={{ ...btnBase, display: "block", width: "100%", textAlign: "left", border: "none", borderRadius: 0, padding: "10px 20px" }}>
                {a}
              </button>
            ))}
          </div>
        )}
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
                <div className="yen-cover" style={{ width: "100%", aspectRatio: "1", overflow: "hidden", background: "#111", marginBottom: "14px" }}>
                  <img src={r.cover} alt={r.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <p style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.45, marginBottom: "4px" }}>
                  {r.artist}
                </p>
                <p style={{ fontFamily: F, fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.3, opacity: 0.9 }}>
                  {r.title}
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
  const reserved = [
    "press","about","releases","roster","merch","admin","ipod",
    "rsvp","sigh","voice","artist-login","artist-dashboard",
    "enter-shower","rigshi-fam","001","release"
  ];
  if (reserved.includes(maybeSlug)) return <Navigate to="/" replace />;
  const match = releases.find((r) => r.slug === maybeSlug);
  if (match) return <Navigate to={`/release/${match.slug}`} replace />;
  return <Navigate to="/" replace />;
}

/* ---------------- App ---------------- */
function App() {
  const currentLocation = useLocation();
  const { releases, loading } = useReleases();

  useEffect(() => {
    document.body.style.backgroundColor = "#000";
    document.body.style.color = "#f0ede8";
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
      <CursorDot />
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
            <Route path="/sigh" element={<Sigh />} />
            <Route path="/voice" element={<VoiceLessons />} />
            <Route path="/press" element={<Press />} />
            <Route path="/press/:slug" element={<PostPage />} />
            <Route path="/:maybeSlug" element={<SlugRedirect releases={releases} />} />
          </Routes>
        </main>
      </PageTransition>

      {!isReleasePage && <Footer />}
      <SpeedInsights />
    </HelmetProvider>
  );
}

export default App;
