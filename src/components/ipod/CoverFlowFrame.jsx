import React, { useState } from "react";
import releases from "./releases";
import ClickWheel from "./ClickWheel";
import CoverFlowCarousel from "./CoverFlowCarousel";

export default function CoverFlowFrame() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scroll = (dir) => {
    setSelectedIndex((prev) => {
      const max = releases.length;
      return dir === "up"
        ? (prev - 1 + max) % max
        : (prev + 1) % max;
    });
  };

  const select = () => {
    const selectedRelease = releases[selectedIndex];
    if (selectedRelease.smartLink) {
      window.location.href = selectedRelease.smartLink;
    }
  };

  return (
    <div
      style={{
        width: "320px",
        height: "550px",
        margin: "40px auto",
        border: "6px solid #999",
        borderRadius: "36px",
        background: "#d8d8d8",
        boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px",
        boxSizing: "border-box",
        fontFamily: "'Helvetica Neue', sans-serif"
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          width: "100%",
          height: "28px",
          background: "linear-gradient(to bottom, #fff, #e0e0e0)",
          border: "2px solid #000",
          borderRadius: "12px 12px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          fontWeight: "bold",
          fontSize: "12px",
        }}
      >
        <span>Cover Flow</span>
        <div
          style={{
            width: "22px",
            height: "10px",
            background: "linear-gradient(to right, #4cd137, #44bd32)",
            borderRadius: "2px",
            border: "1px solid #888"
          }}
        ></div>
      </div>

      {/* Cover Flow View */}
      <div style={{ flex: 1, width: "100%", paddingTop: "20px" }}>
        <CoverFlowCarousel releases={releases} selectedIndex={selectedIndex} />
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <div style={{ fontWeight: "bold", fontSize: "14px", color: "#000" }}>
            {releases[selectedIndex].title}
          </div>
          <div style={{ fontSize: "13px", color: "#333" }}>
            {releases[selectedIndex].artist}
          </div>
        </div>
      </div>

      {/* Click Wheel */}
      <ClickWheel onScroll={scroll} onSelect={select} onMenu={() => {}} />
    </div>
  );
}
