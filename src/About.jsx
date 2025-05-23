// src/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const About = ({ theme, toggleTheme }) => (
  <div
    style={{
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      padding: "40px",
      backgroundColor: theme === "dark" ? "#000" : "#fff",
      color: theme === "dark" ? "#fff" : "#000",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: "bold" }}>
        About Yen Sound
      </h1>

      <p
        style={{
          fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
          maxWidth: "600px",
          margin: "20px auto",
        }}
      >
        Yen Sound is a boutique PR & distribution label based in Tel Aviv.
        We craft tailored strategies, design compelling visuals, and oversee
        production and digital presence — all in service of bold,
        boundary-pushing artistry.
      </p>

      <div
        style={{
          marginTop: "40px",
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
        }}
      >
        <p>
          For contact:
          <br />
          info@sigh.live
          <br />
          <a
            href="https://instagram.com/yen.sound"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme === "dark" ? "#fff" : "#000",
              textDecoration: "underline",
            }}
          >
            Instagram
          </a>
        </p>
      </div>

      <Link
        to="/"
        style={{
          color: theme === "dark" ? "#fff" : "#000",
          textDecoration: "underline",
          fontSize: "clamp(1rem, 3vw, 1.2rem)",
        }}
      >
        ← Back to Home
      </Link>

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
            cursor: "pointer",
          }}
          aria-label="Toggle Theme"
        />
      </div>
    </div>

    <Footer />
  </div>
);

export default About;
