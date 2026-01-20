import React, { useState, useMemo, useEffect, useRef } from "react";
import { Routes, Route, Link, Navigate, useLocation, useParams } from "react-router-dom";

import releases from "./releases";
import About from "./About";
import Footer from "./Footer";
import "./index.css";
import ReleasePage from "./ReleasePage";
import CoverFlowFrame from "./components/ipod/CoverFlowFrame";
import Roster from "./Roster";
import ArtistPage from "./ArtistPage";
import InstallPrompt from "./components/InstallPrompt";
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

/* ===== Countdown helpers (local midnight) ===== */
function toLocalMidnight(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T00:00:00`);
}
function getCountdownParts(target) {
  const now = new Date();
  if (!target || now >= target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }
  const diff = Math.floor((target - now) / 1000);
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  return { days, hours, minutes, seconds, isOver: false };
}
function formatCountdown({ days, hours, minutes, seconds }) {
  const pad = (n) => String(n).padStart(2, "0");
  return days > 0
    ? `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
function useSecondTicker(enabled = true) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [enabled]);
}

/* ===== Page gate shown BEFORE release time (no links) ===== */
function ReleaseCountdownGate({ cover, title, artist, releaseAt }) {
  const target = toLocalMidnight(releaseAt);
  const locked = !!(target && new Date() < target);
  useSecondTicker(locked);

  if (!locked) return null;

  const parts = getCountdownParts(target);
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      {cover && (
        <img
          src={cover}
          alt={title || "Cover"}
          className="w-40 h-40 md:w-56 md:h-56 rounded-2xl object-cover mb-6"
        />
      )}
      {title && <div className="text-xl font-semibold mb-1">{title}</div>}
      {artist && <div className="opacity-70 mb-4">{artist}</div>}
      <div className="uppercase tracking-widest text-sm opacity-70 mb-1">
        Unlocks at 00:00 (local time)
      </div>
      <div className="text-3xl font-mono">{formatCountdown(parts)}</div>
    </div>
  );
}

/* ===== Route wrapper: if unreleased → show countdown; else → real page ===== */
function ReleaseRouteGate({ theme }) {
  const { slug } = useParams();
  const rel = releases.find((r) => r.slug === slug);
  if (!rel) return <div className="p-6">Release not found.</div>;

  const target = toLocalMidnight(rel.releaseAt);
  const locked = !!(target && new Date() < target);

  if (locked) {
    return (
      <ReleaseCountdownGate
        cover={rel.cover}
        title={rel.title}
        artist={rel.artist}
        releaseAt={rel.releaseAt}
      />
    );
  }
  return <ReleasePage theme={theme} />;
}

/* ---------------- Home ---------------- */
const Home = ({ theme }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => console.warn("Autoplay failed:", err));
      }
    }
  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        padding: "40px",
        backgroundColor: theme === "dark" ? "#000" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "30px" }}>
        <video
          ref={videoRef}
          id="title-video"
          src="/YEN SOUND PR LOGO VID.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => {
            const vid = document.getElementById("title-video");
            const img = document.getElementById("title-image");
            if (vid && img) {
              vid.style.display = "none";
              img.style.display = "inline";
            }
          }}
          style={{
            width: "clamp(300px, 50vw, 600px)",
            height: "auto",
            filter: theme === "light" ? "invert(1)" : "none",
          }}
        />
        <img
          id="title-image"
          src="/yen sound white on black raw.png"
          alt="Yen Sound Logo"
          style={{
            display: "none",
            width: "clamp(300px, 50vw, 600px)",
            height: "auto",
            filter: theme === "light" ? "invert(1)" : "none",
          }}
        />
      </div>

      <p style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "30px" }}>
        Boutique PR & Distribution
        <br />
        Based in Tel Aviv
      </p>

      <div style={{ marginTop: "30px" }}>
        <Link
          to="/about"
          style={{
            color: theme === "dark" ? "#fff" : "#000",
            textDecoration: "underline",
            fontSize: "clamp(1rem, 3vw, 1.2rem)",
          }}
        >
          ABOUT YEN SOUND
        </Link>
      </div>
    </div>
  );
};

/* ---------------- Releases ---------------- */
const Releases = ({ theme }) => {
  const currentLocation = useLocation();
  const [filter, setFilter] = useState("All");
  const [artistFilter, setArtistFilter] = useState("All");
  const [artistDropdownOpen, setArtistDropdownOpen] = useState(false);
  const [columns, setColumns] = useState(3);
  const [showRoster, setShowRoster] = useState(false);
  const [filteredFromURL, setFilteredFromURL] = useState(null);

  useEffect(() => {
    const updateColumns = () => {
      setColumns(window.innerWidth < 768 ? 2 : 3);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [setColumns]); // ✅ fixes lint

  const allArtists = useMemo(() => {
    const names = new Set();
    releases.forEach((r) => {
      r.artist.split(",").forEach((name) => names.add(name.trim()));
    });
    return Array.from(names);
  }, []);

  // ✅ make stable so eslint is happy in useEffect deps
  const artistNameMap = useMemo(
    () => ({
      sgulot: "סגולות",
      ethel: "Ethel",
      sighdafekt: "Sighdafekt",
      shower: "Shower",
      kizels: "Kizels",
      roynismo: "רוי ניסמו",
    }),
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(currentLocation.search);
    const artistFromURL = params.get("artist");

    if (artistFromURL) {
      const normalized = artistFromURL.toLowerCase().replace(/\s+/g, "");
      const mappedName = artistNameMap[normalized];

      if (mappedName && allArtists.includes(mappedName)) {
        setArtistFilter(mappedName);
        setFilteredFromURL(mappedName);
        setShowRoster(false);
      } else {
        const fallback = allArtists.find(
          (a) => a.toLowerCase().replace(/\s+/g, "") === normalized
        );

        if (fallback) {
          setArtistFilter(fallback);
          setFilteredFromURL(fallback);
          setShowRoster(false);
        } else {
          setArtistFilter("All");
          setFilteredFromURL(null);
        }
      }
    }
  }, [currentLocation.search, allArtists, artistNameMap]); // ✅ fixes lint

  const sortedReleases = useMemo(() => {
    return [...releases].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);

  const filtered = sortedReleases.filter((r) => {
    const matchesType = filter === "All" || r.type === filter;
    const matchesArtist = artistFilter === "All" || r.artist.includes(artistFilter);
    return matchesType && matchesArtist;
  });

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: theme === "dark" ? "#000" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          fontWeight: "bold",
          marginTop: "40px",
          marginBottom: "30px",
        }}
      >
        Releases
      </h2>

      <div style={{ textAlign: "center", margin: "40px 0", position: "relative" }}>
        {["All", "Album", "Single"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setShowRoster(false);
              setFilter(t);
              setArtistFilter("All");
              setArtistDropdownOpen(false);
              setFilteredFromURL(null);
            }}
            style={{
              margin: "6px",
              padding: "14px 20px",
              minHeight: "44px",
              borderRadius: "5px",
              border: `2px solid ${theme === "dark" ? "#fff" : "#000"}`,
              backgroundColor: "transparent",
              color: theme === "dark" ? "#fff" : "#000",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              transition: "background-color 0.2s",
            }}
          >
            {t}
          </button>
        ))}

        <button
          onClick={() => setArtistDropdownOpen(!artistDropdownOpen)}
          style={{
            margin: "6px",
            padding: "14px 20px",
            minHeight: "44px",
            borderRadius: "5px",
            border: `2px solid ${theme === "dark" ? "#fff" : "#000"}`,
            backgroundColor: "transparent",
            color: theme === "dark" ? "#fff" : "#000",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
            transition: "background-color 0.2s",
          }}
        >
          Artists ▾
        </button>

        <button
          onClick={() => {
            setShowRoster(true);
            setArtistDropdownOpen(false);
            setFilteredFromURL(null);
          }}
          style={{
            margin: "6px",
            padding: "14px 20px",
            minHeight: "44px",
            borderRadius: "5px",
            border: `2px solid ${theme === "dark" ? "#fff" : "#000"}`,
            backgroundColor: showRoster ? (theme === "dark" ? "#fff" : "#000") : "transparent",
            color: showRoster ? (theme === "dark" ? "#000" : "#fff") : theme === "dark" ? "#fff" : "#000",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
            transition: "background-color 0.2s",
          }}
        >
          Roster
        </button>

        <Link to="/artist-login">
          <button
            style={{
              margin: "6px",
              padding: "14px 20px",
              minHeight: "44px",
              borderRadius: "5px",
              border: `2px solid ${theme === "dark" ? "#fff" : "#000"}`,
              backgroundColor: "transparent",
              color: theme === "dark" ? "#fff" : "#000",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme === "dark" ? "#fff" : "#000";
              e.currentTarget.style.color = theme === "dark" ? "#000" : "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme === "dark" ? "#fff" : "#000";
            }}
          >
            Artist Login
          </button>
        </Link>

        {artistDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: theme === "dark" ? "#111" : "#eee",
              border: `1px solid ${theme === "dark" ? "#444" : "#ccc"}`,
              borderRadius: "6px",
              marginTop: "10px",
              padding: "10px",
              zIndex: 10,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => {
                setArtistFilter("All");
                setFilteredFromURL(null);
                setArtistDropdownOpen(false);
              }}
              style={dropdownBtnStyle(theme)}
            >
              All Artists
            </button>
            {allArtists.map((artist) => (
              <button
                key={artist}
                onClick={() => {
                  setArtistFilter(artist);
                  setFilteredFromURL(artist);
                  setArtistDropdownOpen(false);
                }}
                style={dropdownBtnStyle(theme)}
              >
                {artist}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredFromURL && !showRoster && (
        <div
          style={{
            textAlign: "center",
            fontSize: "0.95rem",
            marginTop: "-20px",
            marginBottom: "10px",
            color: theme === "dark" ? "#aaa" : "#444",
          }}
        >
          🔍 Showing results for: <strong>{filteredFromURL}</strong>
        </div>
      )}

      {showRoster ? (
        <Roster />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: "30px",
            maxWidth: "1000px",
            margin: "auto",
          }}
        >
          {filtered.map((r, i) => (
            <Link
              key={i}
              to={`/release/${r.slug}`}
              style={{
                textDecoration: "none",
                color: theme === "dark" ? "#fff" : "#000",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div className="release-cover-wrapper">
                <img
                  src={r.cover}
                  alt={r.title}
                  style={{
                    width: "100%",
                    maxWidth: "240px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    display: "block",
                    transition: "all 0.3s ease",
                    border: "2px solid transparent",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.border = `2px solid ${theme === "dark" ? "#fff" : "#000"}`)
                  }
                  onMouseOut={(e) => (e.currentTarget.style.border = "2px solid transparent")}
                />
              </div>

              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1em",
                  textAlign: "center",
                  maxWidth: "240px",
                }}
              >
                {r.title}
                <br />
                <span style={{ fontWeight: "normal", fontSize: "0.9em" }}>
                  {r.artist} ({r.type})
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- Shared styles ---------------- */
const dropdownBtnStyle = (theme) => ({
  display: "block",
  width: "100%",
  padding: "12px 16px",
  minHeight: "44px",
  backgroundColor: "transparent",
  border: "none",
  color: theme === "dark" ? "#fff" : "#000",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
});

/* ---------------- Slug redirect (/:maybeSlug) ---------------- */
function SlugRedirect() {
  const { maybeSlug } = useParams();
  const match = releases.find((r) => r.slug === maybeSlug);
  if (match) {
    return <Navigate to={`/release/${match.slug}`} replace />;
  }
  return <Navigate to="/" replace />;
}

/* ---------------- App ---------------- */
function App() {
  const currentLocation = useLocation();
  const theme = "dark";

  useEffect(() => {
    document.body.style.backgroundColor = "#000";
    document.body.style.color = "#fff";
  }, []);

  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  useAnalytics();

  return (
    <>
      <Header />
      <InstallPrompt />

      <Routes>
        <Route
          path="/"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <Home theme={theme} />
            </div>
          }
        />

        <Route
          path="/releases"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <Releases theme={theme} />
            </div>
          }
        />

        <Route
          path="/about"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <About theme={theme} />
            </div>
          }
        />

        <Route
          path="/ipod"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <CoverFlowFrame />
            </div>
          }
        />

        <Route
          path="/roster"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <Roster />
            </div>
          }
        />

        <Route
          path="/artist/:slug"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <ArtistPage theme={theme} />
            </div>
          }
        />

        <Route
          path="/artist-login"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <ArtistLogin />
            </div>
          }
        />

        <Route
          path="/artist-dashboard/:artistId"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <ArtistDashboard />
            </div>
          }
        />

        <Route
          path="/artist-dashboard/submit"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <SubmitForm />
            </div>
          }
        />

        <Route
          path="/admin"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <AdminDashboard />
            </div>
          }
        />

        <Route path="/enter-shower" element={<HiddenSplash />} />
        <Route path="/rigshi-fam" element={<RigshiFamRelease />} />

        <Route
          path="/merch"
          element={
            <div style={{ paddingBottom: "100px" }}>
              <Capsule001 />
            </div>
          }
        />
        <Route path="/001" element={<Capsule001 />} />

        {/* ✅ Countdown gate route */}
        <Route path="/release/:slug" element={<ReleaseRouteGate theme={theme} />} />

        <Route path="/rsvp" element={<RSVP />} />
        <Route path="/sigh" element={<Sigh />} />
        <Route path="/voice" element={<VoiceLessons />} />

        {/* ✅ Universal shortcut */}
        <Route path="/:maybeSlug" element={<SlugRedirect />} />
      </Routes>

      {!currentLocation.pathname.startsWith("/release/") && <Footer />}

      <SpeedInsights />
    </>
  );
}

export default App;
