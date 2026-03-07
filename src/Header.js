import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { usePageTheme } from "./hooks/PageThemeContext";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const LINKS = [
  { to: "/releases",     label: "Releases" },
  { to: "/roster",       label: "Roster" },
  { to: "/press",        label: "Press" },
  { to: "/merch",        label: "Merch" },
  { to: "/artist-login", label: "Artist Login" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = usePageTheme();

  const isLight     = theme === "light";
  const fg          = isLight ? "#0a0a0a" : "#f0ede8";
  const headerBg    = isLight
    ? "linear-gradient(to bottom, rgba(245,243,239,0.95) 0%, rgba(245,243,239,0) 100%)"
    : "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)";
  const mobileBg    = isLight ? "rgba(245,243,239,0.98)" : "rgba(0,0,0,0.97)";
  const mobileLine  = isLight ? "#ddd"      : "#1a1a1a";
  const mobileRow   = isLight ? "#e8e5e0"   : "#111";

  const linkStyle = ({ isActive }) => ({
    fontFamily: F,
    fontSize: "10px",
    fontWeight: 400,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    textDecoration: "none",
    color: fg,
    opacity: isActive ? 1 : 0.45,
    transition: "opacity 0.2s, color 0.3s",
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
      background: headerBg,
      transition: "background 0.3s",
    }}>

      {/* Logo */}
      <NavLink to="/" style={() => ({
        fontFamily: F,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        textDecoration: "none",
        color: fg,
        transition: "color 0.3s",
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
        <span style={{ display: "block", width: "22px", height: "1px", background: fg, transition: "transform 0.2s, opacity 0.2s, background 0.3s", transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }} />
        <span style={{ display: "block", width: "22px", height: "1px", background: fg, transition: "opacity 0.2s, background 0.3s", opacity: menuOpen ? 0 : 1 }} />
        <span style={{ display: "block", width: "22px", height: "1px", background: fg, transition: "transform 0.2s, opacity 0.2s, background 0.3s", transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }} />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: "fixed",
          top: "54px", left: 0, right: 0,
          background: mobileBg,
          borderBottom: `1px solid ${mobileLine}`,
          display: "flex",
          flexDirection: "column",
          zIndex: 101,
          backdropFilter: "blur(12px)",
          transition: "background 0.3s",
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
                color: fg,
                opacity: isActive ? 1 : 0.55,
                padding: "18px 28px",
                borderBottom: `1px solid ${mobileRow}`,
                display: "block",
                transition: "color 0.3s",
              })}>
              {label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Close menu on outside tap */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 100 }} aria-hidden />
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
