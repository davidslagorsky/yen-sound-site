import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkStyle = ({ isActive }) => ({
    fontFamily: F,
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    textDecoration: "none",
    color: "#f0ede8",
    opacity: isActive ? 1 : 0.5,
    transition: "opacity 0.2s",
  });

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 32px",
      background: "linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, transparent 100%)",
    }}>
      <NavLink to="/" style={() => ({
        fontFamily: F,
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        textDecoration: "none",
        color: "#f0ede8",
      })}>
        YEN SOUND
      </NavLink>

      {/* Desktop nav */}
      <nav style={{ display: "flex", gap: "28px", alignItems: "center" }} className="yen-nav-desktop">
        <NavLink to="/releases" style={linkStyle}>Releases</NavLink>
        <NavLink to="/roster" style={linkStyle}>Roster</NavLink>
        <NavLink to="/press" style={linkStyle}>Press</NavLink>
        <NavLink to="/merch" style={linkStyle}>Merch</NavLink>
        <NavLink to="/artist-login" style={linkStyle}>Artist Login</NavLink>
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="yen-nav-mobile-btn"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "none",
          flexDirection: "column",
          gap: "5px",
          padding: "4px",
        }}
        aria-label="Menu"
      >
        <span style={{ display: "block", width: "22px", height: "1px", background: "#f0ede8" }} />
        <span style={{ display: "block", width: "22px", height: "1px", background: "#f0ede8" }} />
        <span style={{ display: "block", width: menuOpen ? "22px" : "14px", height: "1px", background: "#f0ede8", transition: "width 0.2s" }} />
      </button>

      {/* Mobile fullscreen menu */}
      {menuOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "32px",
          zIndex: 99,
        }}>
          <button onClick={() => setMenuOpen(false)} style={{
            position: "absolute", top: "20px", right: "28px",
            background: "none", border: "none", color: "#f0ede8",
            fontSize: "24px", cursor: "pointer", opacity: 0.5,
          }}>✕</button>
          {[
            { to: "/releases", label: "Releases" },
            { to: "/roster", label: "Roster" },
            { to: "/press", label: "Press" },
            { to: "/merch", label: "Merch" },
            { to: "/artist-login", label: "Artist Login" },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} style={() => ({
              fontFamily: F,
              fontSize: "clamp(28px, 7vw, 44px)",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "#f0ede8",
            })}>
              {label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .yen-nav-desktop { display: none !important; }
          .yen-nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
