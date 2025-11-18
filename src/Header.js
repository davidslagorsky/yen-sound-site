// src/Header.js
import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #111",
      }}
    >
      <div
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* Logo / Home */}
        <NavLink
          to="/"
          style={({ isActive }) => ({
            fontSize: "12px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: "#fff",
            opacity: isActive ? 1 : 0.9,
          })}
        >
          YEN SOUND
        </NavLink>

        {/* Nav links */}
        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <NavLink
            to="/releases"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: "#fff",
              opacity: isActive ? 1 : 0.7,
            })}
          >
            RELEASES
          </NavLink>

          <NavLink
            to="/roster"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: "#fff",
              opacity: isActive ? 1 : 0.7,
            })}
          >
            ROSTER
          </NavLink>

          <NavLink
            to="/merch"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: "#fff",
              opacity: isActive ? 1 : 0.7,
            })}
          >
            MERCH
          </NavLink>

          <NavLink
            to="/contact"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: "#fff",
              opacity: isActive ? 1 : 0.7,
            })}
          >
            CONTACT
          </NavLink>

          <NavLink
  to="/artist-login"
  style={({ isActive }) => ({
    textDecoration: "none",
    color: "#fff",
    opacity: isActive ? 1 : 0.7,
  })}
>
  ARTIST LOGIN
</NavLink>

        </nav>
      </div>
    </header>
  );
};

export default Header;
