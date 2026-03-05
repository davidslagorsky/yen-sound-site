import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const LINKS = [
  { to: "/releases", label: "Releases" },
  { to: "/roster",   label: "Roster" },
  { to: "/press",    label: "Press" },
  { to: "/merch",    label: "Merch" },
  { to: "/artist-login", label: "Artist Login" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkStyle = ({ isActive }) => ({
    fontFamily: F,
    fontSize: "10px",
    fontWeight: 400,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    textDecoration: "none",
    color: "#f0ede8",
    opacity: isActive ? 1 : 0.45,
    transition: "opacity 0.2s",
  });

  return (
    <header style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 28px",
      background: "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)",
    }}>
      {/* Logo */}
      <NavLink to="/" style={() => ({
        fontFamily: F,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        textDecoration: "none",
        color: "#f0ede8",
      })}>
        YEN SOUND
      </NavLink>

      {/* Desktop nav */}
      <nav style={{ display: "flex", gap: "28px", alignItems: "center" }} className="yen-nav-desktop">
        {LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} style={linkStyle}>{label}</NavLink>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="yen-nav-mobile-btn"
        style={{ background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: "5px", padding: "4px", zIndex: 102 }}
        aria-label="Menu"
      >
        <span style={{ display: "block", width: "22px", height: "1px", background: "#f0ede8", transition: "transform 0.2s, opacity 0.2s", transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }} />
        <span style={{ display: "block", width: "22px", height: "1px", background: "#f0ede8", transition: "opacity 0.2s", opacity: menuOpen ? 0 : 1 }} />
        <span style={{ display: "block", width: "22px", height: "1px", background: "#f0ede8", transition: "transform 0.2s, opacity 0.2s", transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }} />
      </button>

      {/* Mobile dropdown — compact, from top */}
      {menuOpen && (
        <div style={{
          position: "fixed",
          top: "54px", left: 0, right: 0,
          background: "rgba(0,0,0,0.97)",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          flexDirection: "column",
          zIndex: 101,
          backdropFilter: "blur(12px)",
        }} className="yen-nav-mobile-menu">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                fontFamily: F,
                fontSize: "11px",
                fontWeight: isActive ? 700 : 400,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: "#f0ede8",
                opacity: isActive ? 1 : 0.55,
                padding: "18px 28px",
                borderBottom: "1px solid #111",
                display: "block",
              })}>
              {label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Close menu on outside tap */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 100 }}
          aria-hidden
        />
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
