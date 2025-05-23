import React, { useState } from "react";
import releases from "./releases";
import ClickWheel from "./ClickWheel";
import CoverFlowCarousel from "./CoverFlowCarousel";

export default function CoverFlowFrame() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scroll = (dir) => {
    setSelectedIndex((prev) => {
      const max = releases.length;
      return dir === "up" || dir === "left"
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
        borderRadius: "36px",
        background: "#d8d8d8",
        boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        fontFamily: "'Helvetica Neue', sans-serif",
        overflow: "hidden",
        position: "relative",
        border: "none"
      }}
    >
      {/* Full iPod Body */}
      <div
        style={{
          width: "288px",
          height: "214px",
          background: "#fff",
          border: "4px solid black",
          borderRadius: "12px",
          marginTop: "30px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "4px"
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            width: "100%",
            height: "24px",
            backgroundColor: "#f4f4f4",
            borderBottom: "1px solid #aaa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 8px",
            fontWeight: "bold",
            fontSize: "12px",
            color: "#000"
          }}
        >
          <span>Cover Flow</span>
          <div
            style={{
              width: "20px",
              height: "10px",
              background: "linear-gradient(to right, #4cd137, #44bd32)",
              borderRadius: "2px",
              border: "1px solid #888"
            }}
          ></div>
        </div>

        {/* Cover Flow View */}
        <div style={{ flex: 1, width: "100%", position: "relative" }}>
          <CoverFlowCarousel
            releases={releases}
            selectedIndex={selectedIndex}
            onSpin={(dir) => scroll(dir)}
          />
        </div>
      </div>

      {/* Click Wheel */}
      <div style={{ marginTop: "28px" }}>
        <ClickWheel onScroll={scroll} onSelect={select} onMenu={() => {}} />
      </div>
    </div>
  );
}
