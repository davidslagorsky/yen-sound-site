import React, { useState } from "react";
import releases from "./releases";
import ClickWheel from "./ClickWheel";

const mainMenu = ["All Releases", "Albums", "Singles", "By Artist"];

export default function IpodFrame() {
  const [menuStack, setMenuStack] = useState([mainMenu]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentMenu = menuStack[menuStack.length - 1];

  const scroll = (dir) => {
    setSelectedIndex((prev) => {
      const max = currentMenu.length - 1;
      if (dir === "up") return prev === 0 ? max : prev - 1;
      else return prev === max ? 0 : prev + 1;
    });
  };

  const select = () => {
    const selectedItem = currentMenu[selectedIndex];

    if (menuStack.length === 1) {
      if (selectedItem === "All Releases") {
        const sorted = [...releases].sort((a, b) => new Date(b.date) - new Date(a.date));
        setMenuStack([...menuStack, sorted]);
        setSelectedIndex(0);
      } else if (selectedItem === "Albums" || selectedItem === "Singles") {
        const type = selectedItem.slice(0, -1);
        const filtered = releases.filter(r => r.type === type);
        const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
        setMenuStack([...menuStack, sorted]);
        setSelectedIndex(0);
      } else if (selectedItem === "By Artist") {
        const uniqueArtists = [...new Set(releases.map(r => r.artist))];
        setMenuStack([...menuStack, uniqueArtists]);
        setSelectedIndex(0);
      }
    }
    else if (menuStack.length === 2 && typeof selectedItem === "string") {
      const artist = selectedItem;
      const filtered = releases.filter(r => r.artist === artist);
      const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
      setMenuStack([...menuStack, sorted]);
      setSelectedIndex(0);
    }
    else {
      const selectedRelease = currentMenu[selectedIndex];
      if (selectedRelease.smartLink) {
        window.location.href = selectedRelease.smartLink;
      }
    }
  };

  const goBack = () => {
    if (menuStack.length > 1) {
      const newStack = [...menuStack];
      newStack.pop();
      setMenuStack(newStack);
      setSelectedIndex(0);
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
      {/* iPod Classic Screen */}
      <div
        style={{
          width: "100%",
          height: "240px",
          border: "4px solid black",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#fff",
          boxShadow: "inset 0 0 8px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* Left Menu Panel */}
        <div
          style={{
            width: "55%",
            background: "#f2f2f2",
            borderRight: "1px solid #bbb",
            padding: "6px 0",
            display: "flex",
            flexDirection: "column",
            borderTopLeftRadius: "12px",
            borderBottomLeftRadius: "12px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              padding: "2px 8px",
              fontWeight: "bold",
              fontSize: "12px",
              color: "#000",
              borderBottom: "1px solid #ccc"
            }}
          >
            iPod.js
          </div>
          {currentMenu.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: index === selectedIndex ? "#007aff" : "transparent",
                color: index === selectedIndex ? "#fff" : "#000",
                padding: "6px 8px",
                fontSize: "13px",
                fontWeight: index === selectedIndex ? "bold" : "normal",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {typeof item === "string" ? item : item.title}
              {index === selectedIndex && <span style={{ fontSize: "16px" }}>›</span>}
            </div>
          ))}
        </div>

        {/* Right Content Panel */}
        <div
          style={{
            width: "45%",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <img
            src={
              currentMenu[selectedIndex] && currentMenu[selectedIndex].cover
                ? currentMenu[selectedIndex].cover
                : "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_Music_icon.svg/512px-Apple_Music_icon.svg.png"
            }
            alt="cover"
            style={{
              width: "60%",
              marginBottom: "8px"
            }}
          />
          <div style={{ fontWeight: "bold", fontSize: "12px", color: "#000" }}>
            Apple Music
          </div>
          <div style={{ fontSize: "11px", color: "#555" }}>
            Sign in to view<br />your library
          </div>
        </div>
      </div>

      {/* Click Wheel */}
      <ClickWheel onScroll={scroll} onSelect={select} onMenu={goBack} />
    </div>
  );
}
