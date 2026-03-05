import React from "react";
import { Link } from "react-router-dom";

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const About = () => (
  <div style={{
    backgroundColor: "#000",
    color: "#f0ede8",
    minHeight: "100vh",
    padding: "80px 40px",
    maxWidth: "680px",
    margin: "0 auto",
    fontFamily: F,
  }}>
    <p style={{ fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.35, marginBottom: "48px" }}>
      About
    </p>

    <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "40px" }}>
      Yen Sound
    </h1>

    <p style={{ fontSize: "16px", fontWeight: 300, lineHeight: 1.85, opacity: 0.72, marginBottom: "24px" }}>
      Yen Sound is a boutique PR &amp; distribution label based in Tel Aviv.
      We craft tailored strategies, design compelling visuals, and oversee
      production and digital presence — all in service of bold,
      boundary-pushing artistry.
    </p>

    <p style={{ fontSize: "16px", fontWeight: 300, lineHeight: 1.85, opacity: 0.72, marginBottom: "64px" }}>
      We work closely with our artists at every stage — from the first demo
      to global release — building the kind of long-term presence that outlasts
      any single record.
    </p>

    <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "40px" }}>
      <p style={{ fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.35, marginBottom: "16px" }}>
        Contact
      </p>
      <a href="mailto:office@yensound.com" style={{ display: "block", fontSize: "15px", color: "#f0ede8", textDecoration: "none", opacity: 0.7, marginBottom: "10px", transition: "opacity 0.2s" }}
        onMouseOver={e => e.currentTarget.style.opacity = 1}
        onMouseOut={e => e.currentTarget.style.opacity = 0.7}>
        office@yensound.com
      </a>
      <a href="https://instagram.com/yen.sound" target="_blank" rel="noopener noreferrer"
        style={{ display: "block", fontSize: "15px", color: "#f0ede8", textDecoration: "none", opacity: 0.7, transition: "opacity 0.2s" }}
        onMouseOver={e => e.currentTarget.style.opacity = 1}
        onMouseOut={e => e.currentTarget.style.opacity = 0.7}>
        Instagram ↗
      </a>
    </div>

    <div style={{ marginTop: "64px" }}>
      <Link to="/" style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f0ede8", opacity: 0.35, textDecoration: "none", transition: "opacity 0.2s" }}
        onMouseOver={e => e.currentTarget.style.opacity = 0.8}
        onMouseOut={e => e.currentTarget.style.opacity = 0.35}>
        ← Home
      </Link>
    </div>
  </div>
);

export default About;
