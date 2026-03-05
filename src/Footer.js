import React from "react";
import { NavLink } from "react-router-dom";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #1a1a1a",
      padding: "40px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <img
          src="https://www.yensound.com/yen-logo.gif"
          alt="Yen Sound"
          style={{ width: "32px", height: "32px", opacity: 0.6 }}
        />
        <span style={{
          fontFamily: F,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#f0ede8",
        }}>
          YEN SOUND
        </span>
      </div>

      <nav style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {[
          { to: "/releases", label: "Releases" },
          { to: "/roster", label: "Roster" },
          { to: "/press", label: "Press" },
          { to: "/about", label: "About" },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} style={{
            fontFamily: F,
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: "#f0ede8",
            opacity: 0.35,
            transition: "opacity 0.2s",
          }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.8}
          onMouseOut={e => e.currentTarget.style.opacity = 0.35}
          >{label}</NavLink>
        ))}
      </nav>

      <span style={{
        fontFamily: F,
        fontSize: "10px",
        letterSpacing: "0.18em",
        color: "#f0ede8",
        opacity: 0.2,
        textTransform: "uppercase",
      }}>
        © 2026 YEN SOUND · Tel Aviv
      </span>
    </footer>
  );
}

export default Footer;
