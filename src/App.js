import React, { useState, useMemo, useEffect, useRef, useState as useReactState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import releases from "./releases";
import About from "./About";
import Footer from "./Footer";
import './index.css'; 
import ReleasePage from "./ReleasePage";
import IpodFrame from './components/ipod/IpodFrame';
import CoverFlowFrame from './components/ipod/CoverFlowFrame';
import Contact from "./Contact";
import Roster from "./Roster";
import { useLocation } from "react-router-dom";
import ArtistPage from "./ArtistPage";
import InstallPrompt from "./components/InstallPrompt";
import ArtistLogin from "./components/ArtistLogin";
import ArtistDashboard from "./components/ArtistDashboard";
import SubmitForm from "./components/SubmitForm";
import { SpeedInsights } from "@vercel/speed-insights/react"
import Redirector from "./Redirector";
import AdminDashboard from "./AdminDashboard";






const Home = ({ theme, toggleTheme }) => {
  const videoRef = useRef(null);

  useEffect(() => {
  const video = videoRef.current;
  if (video) {
    video.muted = true; // <- explicitly enforce this again
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => console.warn("Autoplay failed:", err));
    }
  }
}, []);

  return (
    <div style={{
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      padding: "40px",
      backgroundColor: theme === "dark" ? "#000" : "#fff",
      color: theme === "dark" ? "#fff" : "#000",
      minHeight: "100vh"
    }}>
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
            filter: theme === "light" ? "invert(1)" : "none"
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
            filter: theme === "light" ? "invert(1)" : "none"
          }}
        />
      </div>

      <p style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "30px" }}>
        Boutique PR & Distribution
        <br />
        Based in Tel Aviv
      </p>

     <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
  <Link to="/releases">
    <button style={{
      padding: "14px 24px",
      minHeight: "44px",
      fontSize: "clamp(1rem, 3.5vw, 1.2rem)",
      backgroundColor: "transparent",
      color: theme === "dark" ? "#fff" : "#000",
      border: `2px solid ${theme === "dark" ? "#fff" : "#000"}`,
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "all 0.3s ease-in-out",
      boxShadow: "0 0 0 transparent"
    }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = theme === "dark" ? "#fff" : "#000";
        e.currentTarget.style.color = theme === "dark" ? "#000" : "#fff";
        e.currentTarget.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.2)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = theme === "dark" ? "#fff" : "#000";
        e.currentTarget.style.boxShadow = "0 0 0 transparent";
      }}
    >
      ENTER
    </button>
  </Link>


  <Link to="/artist-login">
  <button style={{
    padding: "14px 24px",
    minHeight: "44px",
    fontSize: "clamp(1rem, 3.5vw, 1.2rem)",
    backgroundColor: "transparent",
    color: theme === "dark" ? "#fff" : "#000",
    border: `2px solid ${theme === "dark" ? "#fff" : "#000"}`,
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease-in-out",
    boxShadow: "0 0 0 transparent"
  }}
    onMouseOver={(e) => {
      e.currentTarget.style.backgroundColor = theme === "dark" ? "#fff" : "#000";
      e.currentTarget.style.color = theme === "dark" ? "#000" : "#fff";
      e.currentTarget.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.2)";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = theme === "dark" ? "#fff" : "#000";
      e.currentTarget.style.boxShadow = "0 0 0 transparent";
    }}
  >
    ARTIST LOGIN
  </button>
</Link>

</div>



      <div style={{ marginTop: "30px" }}>
        <Link to="/about" style={{
          color: theme === "dark" ? "#fff" : "#000",
          textDecoration: "underline",
          fontSize: "clamp(1rem, 3vw, 1.2rem)"
        }}>
          ABOUT YEN SOUND
        </Link>
      </div>

      {/* Theme Toggle Button Removed
<div style={{ marginTop: "30px" }}>
  <button
    onClick={toggleTheme}
    style={{
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      border: "2px solid",
      borderColor: theme === "dark" ? "#fff" : "#000",
      backgroundColor: theme === "dark" ? "#fff" : "#000",
      cursor: "pointer"
    }}
    aria-label="Toggle Theme"
  />
</div>
*/}

    </div>
  );
};



const Releases = ({ theme, toggleTheme }) => {
  const currentLocation = useLocation();
  const [filter, setFilter] = useState("All");
  const [artistFilter, setArtistFilter] = useState("All");
  const [artistDropdownOpen, setArtistDropdownOpen] = useState(false);
  const [columns, setColumns] = useReactState(3);
  const [showRoster, setShowRoster] = useState(false);
  const [filteredFromURL, setFilteredFromURL] = useState(null);
 

  useEffect(() => {
    const updateColumns = () => {
      setColumns(window.innerWidth < 768 ? 2 : 3);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const allArtists = useMemo(() => {
    const names = new Set();
    releases.forEach(r => {
      r.artist.split(",").forEach(name => names.add(name.trim()));
    });
    return Array.from(names);
  }, []);

  // Normalize URL param and match to known artist names
  const artistNameMap = {
  sgulot: "סגולות",
  ethel: "Ethel",
  sighdafekt: "Sighdafekt",
  shower: "Shower",
  kizels: "Kizels",
  roynismo: "רוי ניסמו"
};

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
      const fallback = allArtists.find(a =>
        a.toLowerCase().replace(/\s+/g, "") === normalized
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
}, [currentLocation.search, allArtists]);

  const sortedReleases = useMemo(() => {
    return [...releases].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);

  const filtered = sortedReleases.filter(r => {
    const matchesType = filter === "All" || r.type === filter;
    const matchesArtist = artistFilter === "All" || r.artist.includes(artistFilter);
    return matchesType && matchesArtist;
  });

  return (
    <div style={{
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: theme === "dark" ? "#000" : "#fff",
      color: theme === "dark" ? "#fff" : "#000",
      minHeight: "100vh",
      boxSizing: "border-box"
    }}>
      <h2 style={{
        textAlign: "center",
        fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
        fontWeight: "bold",
        marginTop: "40px",
        marginBottom: "30px"
      }}>
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
              transition: "background-color 0.2s"
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
            transition: "background-color 0.2s"
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
            color: showRoster ? (theme === "dark" ? "#000" : "#fff") : (theme === "dark" ? "#fff" : "#000"),
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
            transition: "background-color 0.2s"
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
      transition: "background-color 0.2s"
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
          <div style={{
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
            overflowY: "auto"
          }}>
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
        <div style={{
          textAlign: "center",
          fontSize: "0.95rem",
          marginTop: "-20px",
          marginBottom: "10px",
          color: theme === "dark" ? "#aaa" : "#444"
        }}>
          🔍 Showing results for: <strong>{filteredFromURL}</strong>
        </div>
      )}

      {/* Conditional Roster or Release Grid */}
      {showRoster ? (
        <Roster />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: "30px",
          maxWidth: "1000px",
          margin: "auto"
        }}>
          
          {filtered.map((r, i) => (
            <Link
              key={i}
              to={`/release/${r.title.toLowerCase().replace(/\s+/g, "-")}`}
              style={{
                textDecoration: "none",
                color: theme === "dark" ? "#fff" : "#000",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
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
      border: "2px solid transparent"
    }}
    onMouseOver={e => e.currentTarget.style.border = `2px solid ${theme === "dark" ? "#fff" : "#000"}`}
    onMouseOut={e => e.currentTarget.style.border = "2px solid transparent"}
  />
</div>


              <div style={{
                fontWeight: "bold",
                fontSize: "1em",
                textAlign: "center",
                maxWidth: "240px"
              }}>
                {r.title}<br />
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




// Shared styles as functions:
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
  fontSize: "clamp(0.9rem, 2.5vw, 1rem)"
});

const linkBtnStyle = (theme) => ({
  display: "inline-block",
  margin: "0 10px",
  padding: "10px 20px",
  border: `2px solid ${theme === "dark" ? "#fff" : "#000"}`,
  borderRadius: "5px",
  textDecoration: "none",
  color: theme === "dark" ? "#fff" : "#000",
  fontWeight: "bold",
  fontSize: "clamp(1rem, 3vw, 1.2rem)"
});


function App() {
  const currentLocation = useLocation();
  const theme = "dark"; // force dark theme
  
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

  

  return (
    <>
      <Routes>
        <Route path="/" element={<div style={{ paddingBottom: "100px" }}><Home theme={theme} /></div>} />
        <Route path="/releases" element={<div style={{ paddingBottom: "100px" }}><Releases theme={theme} /></div>} />
        <Route path="/about" element={<div style={{ paddingBottom: "100px" }}><About theme={theme} /></div>} />
        <Route path="/release/:slug" element={<ReleasePage theme={theme} />} />
        <Route path="/ipod" element={<div style={{ paddingBottom: "100px" }}><CoverFlowFrame /></div>} />
        <Route path="/contact" element={<div style={{ paddingBottom: "100px" }}><Contact /></div>} />
        <Route path="/roster" element={<div style={{ paddingBottom: "100px" }}><Roster /></div>} />
        <Route path="/artist/:slug" element={<div style={{ paddingBottom: "100px" }}><ArtistPage theme={theme} /></div>} />
        <Route path="/artist-login" element={<div style={{ paddingBottom: "100px" }}><ArtistLogin /></div>} />
        <Route path="/artist-dashboard/:artistId" element={<div style={{ paddingBottom: "100px" }}><ArtistDashboard /></div>} />
        <Route path="/artist-dashboard/submit" element={<div style={{ paddingBottom: "100px" }}><SubmitForm /></div>} />
        <Route path="/admin" element={<div style={{ paddingBottom: "100px" }}><AdminDashboard /></div>} />
        <Route path="/:shortlink" element={<Redirector />} />
      </Routes>

      {/* ✅ Only show footer when NOT on release page */}
    {!currentLocation.pathname.startsWith("/release/") && <Footer />}
    </>
  );
}

export default App;
