import React from "react";

export default function CoverFlowCarousel({ releases, selectedIndex }) {
  const visibleCount = 6;
  const half = Math.floor(visibleCount / 2);

  const getStyle = (i, center) => {
    const offset = i - center;
    const absOffset = Math.abs(offset);

    return {
      transform: `translateX(${offset * 90}px) scale(${1 - absOffset * 0.1}) rotateY(${offset * -15}deg)`,
      zIndex: 100 - absOffset,
      position: "absolute",
      top: "50%",
      left: "50%",
      transformOrigin: "center center",
      transition: "transform 0.3s ease",
      width: "120px",
      height: "120px",
      borderRadius: "4px",
      overflow: "hidden",
      boxShadow: absOffset === 0 ? "0 4px 12px rgba(0,0,0,0.3)" : "0 2px 6px rgba(0,0,0,0.1)",
      margin: "0 -60px",
    };
  };

  const getVisibleReleases = () => {
    const total = releases.length;
    const visible = [];
    for (let i = -half; i <= half; i++) {
      const index = (selectedIndex + i + total) % total;
      visible.push({ ...releases[index], virtualIndex: i });
    }
    return visible;
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "180px",
        perspective: "1000px",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {getVisibleReleases().map((release, i) => (
        <img
          key={i}
          src={release.cover}
          alt={release.title}
          style={getStyle(release.virtualIndex, 0)}
        />
      ))}
    </div>
  );
}
