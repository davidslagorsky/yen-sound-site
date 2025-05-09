import React, { useState, useMemo, useEffect, useState as useReactState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import releases from "./releases";
import About from "./About";

const Home = () => (
  <div style={{
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    padding: "40px",
    backgroundColor: "#000",
    color: "#fff",
    minHeight: "100vh"
  }}>
    <img 
      src="/logo.png" 
      alt="Logo" 
      style={{
        width: "120px",
        marginBottom: "40px",
        borderRadius: "8px",
        display: "block",
        marginLeft: "auto",
        marginRight: "auto"
      }}
    />

    <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: "bold" }}>
      Yen Sound 2025
    </h1>

    <p style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)", marginBottom: "30px" }}>
      Boutique PR & Distribution
      <br />
      Based in Tel Aviv
    </p>

    <Link to="/releases">
      <button style={{
        padding: "10px 20px",
        fontSize: "clamp(1rem, 3.5vw, 1.2rem)",
        backgroundColor: "transparent",
        color: "white",
        border: "2px solid white",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold"
      }}>
        ENTER
      </button>
    </Link>

    <div style={{ marginTop: "30px" }}>
      <Link to="/about" style={{
        color: "white",
        textDecoration: "underline",
        fontSize: "clamp(1rem, 3vw, 1.2rem)"
      }}>
        ABOUT YEN SOUND
      </Link>
    </div>
  </div>
);


const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Releases = () => {
  const [filter, setFilter] = useState("All");
  const [columns, setColumns] = useReactState(3);

  useEffect(() => {
    const updateColumns = () => {
      setColumns(window.innerWidth < 768 ? 2 : 3);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const sortedReleases = useMemo(() => {
    return [...releases].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);

  const filtered = sortedReleases.filter(r => filter === "All" || r.type === filter);

  return (
    <div style={{
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#000",
      color: "#fff",
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

      <div style={{ textAlign: "center", margin: "20px 0" }}>
        {["All", "Album", "Single"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              margin: "5px",
              padding: "8px 16px",
              borderRadius: "5px",
              border: "2px solid white",
              backgroundColor: "transparent",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)"
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "30px",
        maxWidth: "1000px",
        margin: "auto"
      }}>
        {filtered.map((r, i) => (
          <a
            key={i}
            href={r.smartLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
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
              onMouseOver={e => e.currentTarget.style.border = '2px solid white'}
              onMouseOut={e => e.currentTarget.style.border = '2px solid transparent'}
            />
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
          </a>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <a
          href="https://instagram.com/yen.sound"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            margin: "0 10px",
            padding: "10px 20px",
            border: "2px solid white",
            borderRadius: "5px",
            textDecoration: "none",
            color: "white",
            fontWeight: "bold",
            fontSize: "clamp(1rem, 3vw, 1.2rem)"
          }}
        >
          Instagram
        </a>

        <a
          href="mailto:info@sigh.live"
          style={{
            display: "inline-block",
            margin: "0 10px",
            padding: "10px 20px",
            border: "2px solid white",
            borderRadius: "5px",
            textDecoration: "none",
            color: "white",
            fontWeight: "bold",
            fontSize: "clamp(1rem, 3vw, 1.2rem)"
          }}
        >
          Email
        </a>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
  <Link to="/about" style={{
    color: "white",
    textDecoration: "underline",
    fontSize: "clamp(1rem, 3vw, 1.2rem)"
  }}>
    ABOUT YEN SOUND
  </Link>
</div>


      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <Link to="/" style={{ color: "white", textDecoration: "underline", fontSize: "clamp(1rem, 3vw, 1.2rem)" }}>← Back to Home</Link>
      </div>
    </div>
  );
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/releases" element={<Releases />} />
        <Route path="/about" element={<About />} /> {/* ✅ NEW */}
      </Routes>
    </Router>
  );
}

export default App;