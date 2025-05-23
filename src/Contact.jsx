import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      alert("Message sent!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } else {
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "inherit",
        color: "inherit",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        flexDirection: "column"
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "500px",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}
      >
        <h2 style={{ fontSize: "1.8rem", textAlign: "center", fontWeight: "bold" }}>
          Contact Us
        </h2>

        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          style={inputStyle}
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          required
          style={inputStyle}
        />
        <input
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone (optional)"
          style={inputStyle}
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
          rows="5"
          required
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <button
          type="submit"
          style={{
            padding: "14px 24px",
            fontSize: "1rem",
            borderRadius: "5px",
            fontWeight: "bold",
            backgroundColor: "transparent",
            color: "inherit",
            border: "2px solid currentColor",
            cursor: "pointer",
            transition: "0.3s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "inherit";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Send
        </button>
      </form>

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <Link
          to="/"
          style={{
            display: "inline-block",
            fontSize: "2rem",
            color: "inherit",
            textDecoration: "none",
            lineHeight: "1"
          }}
        >
          ←
        </Link>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px 16px",
  fontSize: "1rem",
  border: "2px solid currentColor",
  borderRadius: "5px",
  backgroundColor: "transparent",
  color: "inherit",
  outline: "none"
};
