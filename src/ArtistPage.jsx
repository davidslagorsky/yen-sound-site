import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import roster from "./rosterData";
import releases from "./releases";
import { FaInstagram, FaSpotify, FaApple, FaTiktok } from "react-icons/fa";

export default function ArtistPage() {
  const { slug } = useParams();

  // hooks must be unconditional
  const [showSpotify, setShowSpotify] = useState(false);
  const [showAllReleases, setShowAllReleases] = useState(false);

  // close sections when switching artists
  useEffect(() => {
    setShowSpotify(false);
    setShowAllReleases(false);
  }, [slug]);

  const artist = useMemo(() => roster.find((a) => a.slug === slug), [slug]);
  const artistName = artist?.displayName || artist?.name || "";

  const allNames = useMemo(() => {
    if (!artist) return [];
    return [artistName, ...(artist.aliases || [])]
      .filter(Boolean)
      .map((name) => name.trim().toLowerCase());
  }, [artist, artistName]);

  const getSpotifyEmbedSrc = (url) => {
    const match = url?.match(/artist\/([a-zA-Z0-9]+)/);
    return match
      ? `https://open.spotify.com/embed/artist/${match[1]}?utm_source=generator`
      : null;
  };

  const embedSrc = useMemo(() => {
    if (!artist?.socials?.spotify) return null;
    return getSpotifyEmbedSrc(artist.socials.spotify);
  }, [artist]);

  const artistReleases = useMemo(() => {
    if (!artist || allNames.length === 0) return [];
    return releases
      .filter((release) => {
        if (!release.artist) return false;

        const releaseArtists = Array.isArray(release.artist)
          ? release.artist
          : typeof release.artist === "string"
            ? release.artist.split(",")
            : [];

        return releaseArtists
          .map((a) => a?.trim().toLowerCase())
          .some((name) => allNames.includes(name));
      })
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da; // newest first
      });
  }, [artist, allNames]);

  const latestRelease = artistReleases[0];

  const RELEASES_PAGE_SIZE = 12;
  const visibleReleases = showAllReleases
    ? artistReleases
    : artistReleases.slice(0, RELEASES_PAGE_SIZE);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const styles = {
    page: {
      position: "relative",
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Inter, Arial, sans-serif',
      overflow: "hidden",
    },

    container: {
      position: "relative",
      zIndex: 3,
      padding: "34px 16px 70px",
      maxWidth: "1040px",
      margin: "0 auto",
    },

    header: {
      textAlign: "center",
      marginBottom: "20px",
      position: "relative",
    },

    artistName: {
      fontSize: "0.85rem",
      letterSpacing: "2.2px",
      textTransform: "uppercase",
      opacity: 0.75,
      marginBottom: "12px",
    },

    // Gradient ring + subtle halo
    avatarRing: {
      width: 214,
      height: 214,
      borderRadius: 24,
      padding: 7,
      margin: "0 auto 18px",
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.08), rgba(255,255,255,0.28))",
      boxShadow: "0 22px 70px rgba(0,0,0,0.60)",
      position: "relative",
    },

    avatarHalo: {
      position: "absolute",
      inset: -18,
      borderRadius: 28,
      background:
        "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.10), transparent 62%)",
      filter: "blur(10px)",
      opacity: 0.9,
      pointerEvents: "none",
    },

    avatar: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: 18,
      display: "block",
      border: "1px solid rgba(255,255,255,0.10)",
    },

    bio: {
      fontSize: "1rem",
      lineHeight: 1.75,
      maxWidth: "760px",
      margin: "0 auto 18px",
      opacity: 0.92,
      fontWeight: 430,
    },

    socials: {
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      marginBottom: "8px",
    },

    socialBtn: {
      width: "44px",
      height: "44px",
      borderRadius: "999px",
      display: "grid",
      placeItems: "center",
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
      color: "#fff",
      transition: "transform 160ms ease, background 160ms ease, border-color 160ms ease",
      textDecoration: "none",
    },

    divider: {
      height: 1,
      width: "min(820px, 92%)",
      margin: "26px auto",
      background: "rgba(255,255,255,0.12)",
    },

    // Smarter label (not a stats row)
    releasesTitle: {
      fontSize: "1.05rem",
      fontWeight: 650,
      letterSpacing: "0.2px",
      margin: "0 0 14px",
      textAlign: "center",
      opacity: 0.95,
    },

    // Spotify compact toggle
    spotifyToggleWrap: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "18px",
    },

    spotifyToggle: {
      width: "min(860px, 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "14px",
      padding: "14px 16px",
      borderRadius: "18px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.40)",
      cursor: "pointer",
      userSelect: "none",
    },

    spotifyToggleLeft: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      textAlign: "left",
    },

    spotifyToggleTitle: {
      fontSize: "0.98rem",
      fontWeight: 650,
      letterSpacing: "0.1px",
      margin: 0,
      lineHeight: 1.2,
    },

    spotifyToggleSub: {
      fontSize: "0.82rem",
      opacity: 0.65,
      marginTop: "4px",
    },

    chevron: {
      width: 34,
      height: 34,
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.05)",
      display: "grid",
      placeItems: "center",
      transition: "transform 180ms ease",
      flex: "0 0 auto",
    },

    embedWrap: {
      width: "min(860px, 100%)",
      margin: "0 auto 22px",
      borderRadius: "18px",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 14px 50px rgba(0,0,0,0.45)",
    },

    // Latest spotlight
    spotlightOuter: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "22px",
    },

    spotlight: {
      width: "min(920px, 100%)",
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      gap: "14px",
      alignItems: "center",
      borderRadius: "18px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.035)",
      boxShadow: "0 12px 46px rgba(0,0,0,0.42)",
      padding: "12px",
      textDecoration: "none",
      color: "#fff",
      transition: "transform 180ms ease, border-color 180ms ease",
    },

    spotlightCover: {
      width: "120px",
      height: "120px",
      borderRadius: "14px",
      objectFit: "cover",
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "0 14px 38px rgba(0,0,0,0.55)",
    },

    spotlightMeta: { textAlign: "left" },

    spotlightKicker: {
      fontSize: "0.72rem",
      letterSpacing: "1.6px",
      textTransform: "uppercase",
      opacity: 0.65,
      marginBottom: "6px",
      fontWeight: 650,
    },

    spotlightTitle: {
      fontSize: "1.05rem",
      fontWeight: 750,
      marginBottom: "6px",
      lineHeight: 1.2,
    },

    spotlightSub: {
      fontSize: "0.86rem",
      opacity: 0.65,
    },

    // Releases grid (tighter + centered)
    releasesOuter: {
      display: "flex",
      justifyContent: "center",
    },

    releasesGrid: {
      width: "min(920px, 100%)",
      display: "grid",
      gap: "10px",
      justifyContent: "center",
      gridTemplateColumns: "repeat(auto-fit, minmax(155px, 155px))",
      padding: "6px 0 0",
    },

    releaseItem: {
      width: "155px",
      textDecoration: "none",
      color: "#fff",
      textAlign: "center",
      transition:
        "transform 180ms ease, opacity 180ms ease, filter 180ms ease",
      opacity: 0.98,
    },

    coverWrap: {
      position: "relative",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 16px 44px rgba(0,0,0,0.55)",
      border: "1px solid rgba(255,255,255,0.10)",
      marginBottom: "10px",
      transform: "translateZ(0)",
    },

    cover: {
      width: "100%",
      aspectRatio: "1 / 1",
      objectFit: "cover",
      display: "block",
      transition: "transform 180ms ease, filter 180ms ease",
    },

    // Badge: cleaner gallery look (desktop: show on hover; mobile: always show)
    badge: {
      display: "inline-block",
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(255,255,255,0.06)",
      fontSize: "0.7rem",
      fontWeight: 700,
      padding: "4px 10px",
      borderRadius: "999px",
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.8px",
      opacity: 0.95,
      transition: "opacity 180ms ease",
    },

    relTitle: {
      fontSize: "0.94rem",
      fontWeight: 650,
      marginBottom: "5px",
      lineHeight: 1.25,
    },

    relDate: {
      fontSize: "0.82rem",
      opacity: 0.62,
    },

    showMoreWrap: {
      display: "flex",
      justifyContent: "center",
      marginTop: "18px",
    },

    showMoreBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 16px",
      borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.05)",
      color: "#fff",
      fontWeight: 700,
      letterSpacing: "0.2px",
      cursor: "pointer",
      transition: "transform 160ms ease, background 160ms ease, border-color 160ms ease",
    },

    backWrap: {
      textAlign: "center",
      marginTop: "44px",
    },

    backBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 18px",
      borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      color: "#fff",
      textDecoration: "none",
      fontWeight: 750,
      letterSpacing: "0.2px",
      boxShadow: "0 14px 44px rgba(0,0,0,0.35)",
      transition: "transform 160ms ease, background 160ms ease",
    },
  };

  if (!artist) {
    return (
      <div style={styles.page}>
        <div style={{ padding: "40px", textAlign: "center" }}>
          Artist not found.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        /* Global grain + vignette */
        .ys-grain {
          position: fixed;
          inset: -60%;
          z-index: 0;
          pointer-events: none;
          opacity: 0.14;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
          background-repeat: repeat;
          mix-blend-mode: overlay;
          animation: ysGrainMove 7.5s steps(10) infinite;
          transform: translateZ(0);
        }
        .ys-vignette {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(circle at 50% 10%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 65%, rgba(0,0,0,0.75) 100%);
        }
        .ys-softglow {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(900px 520px at 50% 0%, rgba(255,255,255,0.08), transparent 60%),
            radial-gradient(700px 520px at 20% 10%, rgba(255,255,255,0.04), transparent 60%),
            radial-gradient(700px 520px at 80% 10%, rgba(255,255,255,0.04), transparent 60%);
        }

        /* Artist-specific blurred wash (uses the image as bg) */
        .ys-artist-wash {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.22;
          background-position: center top;
          background-repeat: no-repeat;
          background-size: 1200px 1200px;
          filter: blur(40px) saturate(1.1) contrast(1.05);
          transform: translateZ(0);
          mask-image: radial-gradient(circle at 50% 16%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 72%);
          -webkit-mask-image: radial-gradient(circle at 50% 16%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 72%);
        }

        @keyframes ysGrainMove {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(-4%, 2%); }
          30% { transform: translate(3%, -4%); }
          40% { transform: translate(-3%, 5%); }
          50% { transform: translate(-5%, -2%); }
          60% { transform: translate(4%, 3%); }
          70% { transform: translate(2%, -5%); }
          80% { transform: translate(-4%, -1%); }
          90% { transform: translate(5%, 2%); }
          100% { transform: translate(0, 0); }
        }

        /* Subtle section enter animations (8) */
        .ys-fade-in {
          animation: ysFadeIn 220ms ease-out both;
        }
        .ys-slide-in {
          animation: ysSlideIn 240ms ease-out both;
        }
        @keyframes ysFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ysSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Releases: badge hidden until hover on desktop (3) */
        @media (hover: hover) and (pointer: fine) {
          .ys-badge { opacity: 0; }
          .ys-release:hover .ys-badge { opacity: 0.95; }
        }

        /* Mobile grid: 2 columns, centered */
        @media (max-width: 520px) {
          .ys-releases-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            width: min(420px, 100%) !important;
            gap: 10px !important;
            justify-content: center !important;
          }
          .ys-release { width: 100% !important; }
          .ys-spotlight { grid-template-columns: 92px 1fr !important; }
          .ys-spotlight-cover { width: 92px !important; height: 92px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ys-grain { animation: none; }
          .ys-fade-in, .ys-slide-in { animation: none; }
        }
      `}</style>

      <div className="ys-softglow" />
      {artist.image && (
        <div
          className="ys-artist-wash"
          style={{ backgroundImage: `url(${artist.image})` }}
        />
      )}
      <div className="ys-grain" />
      <div className="ys-vignette" />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header} className="ys-fade-in">
          <div style={styles.artistName}>{artistName.toUpperCase()}</div>

          <div style={styles.avatarRing}>
            <div style={styles.avatarHalo} />
            <img src={artist.image} alt={artistName} style={styles.avatar} />
          </div>

          {artist.bio && <p style={styles.bio}>{artist.bio}</p>}

          <div style={styles.socials}>
            {artist.socials?.instagram && (
              <a
                href={artist.socials.instagram}
                target="_blank"
                rel="noreferrer"
                style={styles.socialBtn}
                aria-label="Instagram"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                }}
              >
                <FaInstagram size={20} />
              </a>
            )}
            {artist.socials?.tiktok && (
  <a
    href={artist.socials.tiktok}
    target="_blank"
    rel="noreferrer"
    style={styles.socialBtn}
    aria-label="TikTok"
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.05)";
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
    }}
  >
    <FaTiktok size={20} />
  </a>
)}

            {artist.socials?.spotify && (
              <a
                href={artist.socials.spotify}
                target="_blank"
                rel="noreferrer"
                style={styles.socialBtn}
                aria-label="Spotify"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                }}
              >
                <FaSpotify size={20} />
              </a>
            )}
            {artist.socials?.appleMusic && (
              <a
                href={artist.socials.appleMusic}
                target="_blank"
                rel="noreferrer"
                style={styles.socialBtn}
                aria-label="Apple Music"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                }}
              >
                <FaApple size={20} />
              </a>
            )}
          </div>
        </div>

        <div style={styles.divider} />

        {/* Spotify (compact + expandable) */}
        {embedSrc && (
          <>
            <div style={styles.spotifyToggleWrap} className="ys-slide-in">
              <div
                role="button"
                tabIndex={0}
                style={styles.spotifyToggle}
                onClick={() => setShowSpotify((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setShowSpotify((v) => !v);
                }}
              >
                <div style={styles.spotifyToggleLeft}>
                  <div style={{ display: "grid", placeItems: "center" }}>
                    <FaSpotify size={20} />
                  </div>

                  <div>
                    <div style={styles.spotifyToggleTitle}>Top tracks</div>
                    <div style={styles.spotifyToggleSub}>
                      {showSpotify ? "Hide player" : "Show player"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.chevron,
                    transform: showSpotify ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 8l5 5 5-5"
                      stroke="rgba(255,255,255,0.85)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {showSpotify && (
              <div style={styles.embedWrap} className="ys-slide-in">
                <iframe
                  title={`Spotify embed - ${artistName}`}
                  src={embedSrc}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ display: "block" }}
                />
              </div>
            )}

            <div style={styles.divider} />
          </>
        )}

        {/* Latest spotlight */}
        {latestRelease?.smartLink && (
          <div style={styles.spotlightOuter} className="ys-slide-in">
            <a
              className="ys-spotlight"
              href={latestRelease.smartLink}
              target="_blank"
              rel="noreferrer"
              style={styles.spotlight}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              <img
                className="ys-spotlight-cover"
                src={latestRelease.cover}
                alt={latestRelease.title}
                style={styles.spotlightCover}
              />
              <div style={styles.spotlightMeta}>
                <div style={styles.spotlightKicker}>Latest release</div>
                <div style={styles.spotlightTitle}>{latestRelease.title}</div>
                <div style={styles.spotlightSub}>
                  {latestRelease.type?.toUpperCase()}
                  {latestRelease.date ? ` • ${formatDate(latestRelease.date)}` : ""}
                </div>
              </div>
            </a>
          </div>
        )}

        {/* Releases */}
        {artistReleases.length > 0 && (
          <div style={{ marginTop: "10px" }} className="ys-fade-in">
            <div style={styles.releasesTitle}>
              Releases · {artistReleases.length}
            </div>

            <div style={styles.releasesOuter}>
              <div className="ys-releases-grid" style={styles.releasesGrid}>
                {visibleReleases.map((release) => (
                  <a
                    key={`${release.title}-${release.smartLink}`}
                    href={release.smartLink}
                    target="_blank"
                    rel="noreferrer"
                    className="ys-release"
                    style={styles.releaseItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.opacity = "1";
                      const img = e.currentTarget.querySelector("img");
                      if (img) {
                        img.style.transform = "scale(1.02)";
                        img.style.filter = "brightness(1.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.opacity = "0.98";
                      const img = e.currentTarget.querySelector("img");
                      if (img) {
                        img.style.transform = "scale(1)";
                        img.style.filter = "brightness(1)";
                      }
                    }}
                  >
                    <div style={styles.coverWrap}>
                      <img src={release.cover} alt={release.title} style={styles.cover} />
                    </div>

                    <div className="ys-badge" style={styles.badge}>
                      {release.type}
                    </div>
                    <div style={styles.relTitle}>{release.title}</div>
                    <div style={styles.relDate}>{formatDate(release.date)}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Show more (4) */}
            {artistReleases.length > RELEASES_PAGE_SIZE && (
              <div style={styles.showMoreWrap}>
                <button
                  type="button"
                  style={styles.showMoreBtn}
                  onClick={() => setShowAllReleases((v) => !v)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                  }}
                >
                  {showAllReleases
                    ? "Show less"
                    : `Show more (${artistReleases.length - RELEASES_PAGE_SIZE})`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back */}
        <div style={styles.backWrap}>
          <Link
            to="/roster"
            style={styles.backBtn}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            ← Back to Roster
          </Link>
        </div>
      </div>
    </div>
  );
}
