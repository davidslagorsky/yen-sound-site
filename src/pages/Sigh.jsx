// src/pages/Sigh.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import "./Sigh.css";

const HERO_IMG = "https://i.postimg.cc/NGZpqQyb/SHORT-ezgif-com-optimize.gif";

// Links
const IG_URL = "https://www.instagram.com/imsigh";
const WHATSAPP_NOA = "https://wa.me/972544753334";

const SPOTIFY_URL = "https://open.spotify.com/artist/58luIRW1Niu35QbYozFjPj";
const SPOTIFY_EMBED =
  "https://open.spotify.com/embed/artist/58luIRW1Niu35QbYozFjPj?utm_source=generator";

const APPLE_URL = "https://music.apple.com/il/artist/sighdafekt/692853131?l=he";

const RELEASES_FILTERED = "https://www.yensound.com/releases?artist=SIGHDAFEKT";
const MERCH_URL =
  "https://shop.spotify.com/en-US/artist/58luIRW1Niu35QbYozFjPj/store?utm_medium=app-release&utm_source=spotify&utm_content=&utm_term=00a466be762c93e6e883fae84b4ba46066827f0a8ae5c3fe3451e8&utm_promo=&container_platform=&utm_campaign=";

// YouTube embeds (video IDs)
const YT_1 = "8oXeWatmhdo";
const YT_2 = "dxHyjFmKwUg";
const YT_3 = "WtUfA8TR0MM";
const ytEmbed = (id) =>
  `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&controls=1&fs=1&iv_load_policy=3`;

function setMetaDescription(content) {
  try {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  } catch {
    // no-op
  }
}

function IconSpotify(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.5c-.19.31-.6.41-.91.22-2.5-1.53-5.65-1.87-9.36-1.03-.36.08-.71-.14-.79-.5-.08-.35.14-.7.49-.78 4.05-.92 7.54-.52 10.35 1.21.31.19.41.6.22.88zm1.3-2.9c-.24.39-.75.51-1.14.27-2.86-1.76-7.22-2.27-10.59-1.25-.44.13-.9-.12-1.03-.56-.13-.44.12-.9.56-1.03 3.86-1.17 8.67-.6 11.98 1.43.39.24.51.75.22 1.14zm.11-3.02c-3.43-2.03-9.09-2.22-12.36-1.23-.53.16-1.09-.14-1.25-.67-.16-.53.14-1.09.67-1.25 3.75-1.14 10.01-.92 13.96 1.42.47.28.62.9.34 1.37-.28.47-.9.62-1.37.36z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconApple(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M16.7 13.7c0 2.6 2.3 3.5 2.3 3.5s-1.8 5.1-4.2 5.1c-1.1 0-2-.7-3.2-.7s-2.2.7-3.2.7C6 22.3 3.7 17.7 3.7 14c0-3.2 2.1-4.9 4.1-4.9 1.1 0 2.1.8 3.2.8 1.1 0 1.9-.8 3.2-.8.9 0 3.2.4 4.1 2.8 0 0-2.6 1-2.6 3.8zM14 6.4c.8-1 1.3-2.4 1.2-3.8-1.2.1-2.6.8-3.4 1.8-.7.8-1.3 2.3-1.1 3.6 1.3.1 2.5-.6 3.3-1.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Sigh() {
  const [listenOpen, setListenOpen] = useState(false);
  const [sticky, setSticky] = useState(false);

  // HERO preload (CSS bg images can load “late” on mobile Safari)
  const [heroLoaded, setHeroLoaded] = useState(false);

  // iframe skeletons
  const [loaded, setLoaded] = useState({
    spotify: false,
    yt1: false,
    yt2: false,
    yt3: false,
  });

  const heroRef = useRef(null);

  const listenItems = useMemo(
    () => [
      { label: "Spotify", href: SPOTIFY_URL, Icon: IconSpotify },
      { label: "Apple Music", href: APPLE_URL, Icon: IconApple },
    ],
    []
  );

  // Page title + meta
  useEffect(() => {
    document.title = "SIGHDAFEKT — Artist & Producer | YEN SOUND";
    setMetaDescription(
      "SIGHDAFEKT — Artist & Producer at YEN SOUND. Listen, watch videos, booking & inquiries."
    );
  }, []);

  // Preload hero GIF early + only apply bg after it’s loaded
  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMG;
    img.decoding = "async";
    img.onload = () => setHeroLoaded(true);
    img.onerror = () => setHeroLoaded(true);
  }, []);

  // Scroll fade
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Sticky mini-header on scroll
  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      setSticky(rect.bottom <= 70);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setListenOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="sigh">
      <div className="sigh-grain" aria-hidden="true" />
      <div className="sigh-vignette" aria-hidden="true" />

      {/* Preload asset with high priority */}
      <img
        className="sigh-preloadHero"
        src={HERO_IMG}
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />

      {/* Sticky mini-header */}
      <div className={`sigh-sticky ${sticky ? "is-on" : ""}`} role="banner">
        <div className="sigh-stickyInner">
          <div className="sigh-stickyTitle">SIGHDAFEKT</div>
          <button
            className="sigh-stickyListen ios-press"
            onClick={() => setListenOpen(true)}
            aria-label="Open listen menu"
          >
            LISTEN
          </button>
        </div>
      </div>

      {/* HERO */}
      <section
        ref={heroRef}
        className={`sigh-hero ${heroLoaded ? "is-loaded" : ""}`}
        style={heroLoaded ? { backgroundImage: `url(${HERO_IMG})` } : undefined}
      >
        <div className="sigh-heroOverlay" />
        {!heroLoaded && <div className="sigh-heroSkeleton" aria-hidden="true" />}

        <div className="sigh-heroContent">
          <div className="sigh-heroContentInner">
            <h1 className="sigh-title">SIGHDAFEKT</h1>
            <p className="sigh-subtitle">Artist &amp; Producer | @ YEN SOUND</p>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="sigh-body">
        <div className="sigh-actions" data-reveal>
          <button
            className="sigh-btn sigh-btnPrimary ios-press"
            onClick={() => setListenOpen(true)}
            aria-label="Open listen menu"
          >
            LISTEN
          </button>

          <a
            className="sigh-btn sigh-btnGlass ios-press"
            href={IG_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Follow on Instagram"
          >
            FOLLOW
          </a>

          <a
            className="sigh-btn sigh-btnGlass ios-press"
            href={WHATSAPP_NOA}
            target="_blank"
            rel="noreferrer"
            aria-label="Contact Noa on WhatsApp for booking and inquiries"
          >
            BOOKING / INQUIRIES – NOA
          </a>

          <a
            className="sigh-btn sigh-btnGlass ios-press"
            href={MERCH_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Open Merch store"
          >
            MERCH
          </a>
        </div>

        {/* SPOTIFY */}
        <section className="sigh-section" aria-label="Spotify and videos" data-reveal>
          <div className="sigh-sectionHeader sigh-sectionHeaderBlur">
            <h2 className="sigh-h2">SPOTIFY</h2>
            <a
              className="sigh-microLink ios-press-link"
              href={SPOTIFY_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open in Spotify"
            >
              Open in Spotify ↗
            </a>
          </div>

          <div className="sigh-card sigh-cardNoSheen">
            <div className="sigh-frameWrap">
              {!loaded.spotify && <div className="sigh-skeleton" aria-hidden="true" />}
              <iframe
                title="Sighdafekt on Spotify"
                src={SPOTIFY_EMBED}
                width="100%"
                height="420"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                onLoad={() => setLoaded((p) => ({ ...p, spotify: true }))}
                className={loaded.spotify ? "is-loaded" : ""}
              />
            </div>
          </div>

          {/* VIDEOS (square + skeletons) */}
          <div className="sigh-videos" data-reveal>
            {[YT_1, YT_2, YT_3].map((id, idx) => {
              const key = idx === 0 ? "yt1" : idx === 1 ? "yt2" : "yt3";
              return (
                <div key={id} className="sigh-card sigh-videoCard sigh-cardNoSheen">
                  <div className="sigh-frameWrap">
                    {!loaded[key] && <div className="sigh-skeleton" aria-hidden="true" />}
                    <iframe
                      title={`Video ${idx + 1}`}
                      src={ytEmbed(id)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      onLoad={() => setLoaded((p) => ({ ...p, [key]: true }))}
                      className={loaded[key] ? "is-loaded" : ""}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sigh-afterEmbedsSpace" />

          <div className="sigh-links" data-reveal>
            <a
              className="sigh-btn sigh-btnGlass ios-press"
              href={RELEASES_FILTERED}
              target="_blank"
              rel="noreferrer"
              aria-label="More releases by Sighdafekt"
            >
              MORE RELEASES
            </a>
          </div>
        </section>
      </section>

      {/* LISTEN MENU MODAL */}
      {listenOpen && (
        <div className="sigh-modal" role="dialog" aria-modal="true" aria-label="Listen menu">
          <button
            className="sigh-modalBackdrop"
            onClick={() => setListenOpen(false)}
            aria-label="Close"
          />
          <div className="sigh-modalCard">
            <div className="sigh-modalTop">
              <div className="sigh-modalTitle">LISTEN</div>
              <button
                className="sigh-modalClose ios-press"
                onClick={() => setListenOpen(false)}
                aria-label="Close listen menu"
              >
                ×
              </button>
            </div>

            <div className="sigh-modalGrid">
              {listenItems.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  className="sigh-modalIconItem ios-press"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  onClick={() => setListenOpen(false)}
                >
                  <Icon className="sigh-modalIcon" />
                  <div className="sigh-modalLabel">{label}</div>
                </a>
              ))}
            </div>

            <div className="sigh-modalHint">Tap to open.</div>
          </div>
        </div>
      )}
    </main>
  );
}
