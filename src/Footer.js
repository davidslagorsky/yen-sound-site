import React from "react";
import { NavLink } from "react-router-dom";
import { usePageTheme } from "./hooks/PageThemeContext";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function Footer() {
  const { theme } = usePageTheme();
  const isLight = theme === "light";
  const fg      = isLight ? "#0a0a0a" : "#f0ede8";
  const border  = isLight ? "#e0ddd8" : "#1a1a1a";
  const bg      = isLight ? "#f5f3ef" : "transparent";

  return (
    <footer style={{
      borderTop: `1px solid ${border}`,
      background: bg,
      padding: "40px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "20px",
      transition: "background 0.3s, border-color 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <img
          src="https://www.yensound.com/yen-logo.gif"
          alt="Yen Sound"
          style={{ width: "32px", height: "32px", opacity: 0.6, filter: isLight ? "invert(1)" : "none", transition: "filter 0.3s" }}
        />
        <span style={{ fontFamily: F, fontSize: "11px", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: fg, transition: "color 0.3s" }}>
          YEN SOUND
        </span>
      </div>

      <nav style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {[
          { to: "/releases", label: "Releases" },
          { to: "/roster",   label: "Roster" },
          { to: "/press",    label: "Press" },
          { to: "/about",    label: "About" },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} style={{
            fontFamily: F, fontSize: "10px", letterSpacing: "0.18em",
            textTransform: "uppercase", textDecoration: "none",
            color: fg, opacity: 0.35, transition: "opacity 0.2s, color 0.3s",
          }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.8}
          onMouseOut={e => e.currentTarget.style.opacity = 0.35}
          >{label}</NavLink>
        ))}
      </nav>

      <span style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.18em", color: fg, opacity: 0.2, textTransform: "uppercase", transition: "color 0.3s" }}>
        © 2026 YEN SOUND · Tel Aviv
      </span>
    </footer>
  );
}

export default Footer;
