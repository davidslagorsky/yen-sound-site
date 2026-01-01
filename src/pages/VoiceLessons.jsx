import React, { useMemo, useState, useEffect, useRef } from "react";
import "./VoiceLessons.css";
import { voiceContent } from "../content/voiceLessonsContent";

const HERO_IMG =
  "https://mcusercontent.com/f6bfdd76bde1d8b90b791aaa6/_compresseds/b2f081cd-ad76-4f1e-9048-873dba6ab494.jpg";

const TITLE_IMG = "https://i.postimg.cc/43ndG2YD/pytwh-qwl-bbt-ym.png";

const ETHEL_IG = "https://www.instagram.com/ethel_superstarbaby";

const ETHEL_PHOTOS = [
  "https://i.postimg.cc/bwYYHYjG/IMG-9780.avif",
  "https://i.postimg.cc/2j0fRsbM/DSCF8376.jpg",
  "https://i.postimg.cc/52vG0T0K/IMG-6936.avif",
];

function useRevealOnScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      el.classList.add("isVisible");
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("isVisible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}

/**
 * Snap hint: when a section enters the viewport, we pulse a divider.
 * Lightweight: just toggles a class for ~700ms.
 */
function useSnapHint(sectionId, hintId) {
  useEffect(() => {
    const section = document.getElementById(sectionId);
    const hint = document.getElementById(hintId);
    if (!section || !hint) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    let t = null;

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e?.isIntersecting) return;

        // restart pulse
        hint.classList.remove("pulse");
        // force reflow so the animation restarts reliably
        // eslint-disable-next-line no-unused-expressions
        hint.offsetHeight;
        hint.classList.add("pulse");

        if (t) clearTimeout(t);
        t = setTimeout(() => hint.classList.remove("pulse"), 800);
      },
      { threshold: 0.2, rootMargin: "-10% 0px -55% 0px" }
    );

    obs.observe(section);
    return () => {
      if (t) clearTimeout(t);
      obs.disconnect();
    };
  }, [sectionId, hintId]);
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const [h, setH] = useState(0);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    setH(open ? bodyRef.current.scrollHeight : 0);
  }, [open, a]);

  useEffect(() => {
    const onResize = () => {
      if (!bodyRef.current) return;
      if (open) setH(bodyRef.current.scrollHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  return (
    <div className={`vfFaqCard ${open ? "open" : ""}`}>
      <button
        className="vfFaqHead"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="vfFaqQ">{q}</span>
        <span className={`vfChevron ${open ? "rot" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      <div className="vfFaqBody" style={{ height: h }}>
        <div ref={bodyRef} className="vfFaqInner">
          <div className="vfFaqA">{a}</div>
        </div>
      </div>
    </div>
  );
}

function EthelCarousel({ alt = "Ethel" }) {
  const [idx, setIdx] = useState(0);

  // Preload all carousel images (background, no blocking)
  useEffect(() => {
    ETHEL_PHOTOS.forEach((src) => {
      const im = new Image();
      im.src = src;
    });
  }, []);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    const t = setInterval(() => {
      setIdx((v) => (v + 1) % ETHEL_PHOTOS.length);
    }, 3600);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="vfPhotoWrap" aria-label="Ethel photo carousel">
      {ETHEL_PHOTOS.map((src, i) => (
        <img
          key={src}
          className={`vfPhoto ${i === idx ? "active" : ""}`}
          src={src}
          alt={alt}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      ))}

      <div className="vfPhotoTint" aria-hidden="true" />
      <div className="vfPhotoVignette" aria-hidden="true" />

      <div className="vfPhotoDots" aria-hidden="true">
        {ETHEL_PHOTOS.map((_, i) => (
          <span key={i} className={`vfDot ${i === idx ? "on" : ""}`} />
        ))}
      </div>
    </div>
  );
}

export default function VoiceLessons() {
  const [lang, setLang] = useState("he");
  const t = useMemo(() => voiceContent[lang], [lang]);
  const isHebrew = lang === "he";

  const scrollToForm = () => {
    const el = document.getElementById("typeform-area");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToHow = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Preload hero in background
  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMG;
  }, []);

  // Reveal refs
  const r1 = useRevealOnScroll();
  const r2 = useRevealOnScroll();
  const r3 = useRevealOnScroll();
  const r4 = useRevealOnScroll();
  const r5 = useRevealOnScroll();
  const r6 = useRevealOnScroll();

  // Snap hints (pulse dividers when next section enters)
  useSnapHint("sec-2", "hint-1");
  useSnapHint("how-it-works", "hint-2");
  useSnapHint("sec-4", "hint-3");
  useSnapHint("sec-5", "hint-4");
  useSnapHint("typeform-area", "hint-5");

  // Localized “limited weekly slots”
  const limitedSlots =
    lang === "he" ? "מספר מקומות שבועיים מוגבל" : "Количество мест в неделю ограничено";

  return (
    <div className={`voiceFunnel ${isHebrew ? "rtl" : "ltr"}`}>
      {/* Top bar */}
      <div className="vfTop">
        <div className="vfLang">
          <button
            className={`vfLangBtn ${lang === "he" ? "active" : ""}`}
            onClick={() => setLang("he")}
            type="button"
          >
            עברית
          </button>
          <span className="vfSep">|</span>
          <button
            className={`vfLangBtn ${lang === "ru" ? "active" : ""}`}
            onClick={() => setLang("ru")}
            type="button"
          >
            Русский
          </button>
        </div>

        <button className="vfTopCta" onClick={scrollToForm} type="button">
          {t.ctaPrimary}
        </button>
      </div>

      {/* Hero */}
      <section className="vfHero">
        <div className="vfHeroImg" style={{ backgroundImage: `url(${HERO_IMG})` }} />
        <div className="vfHeroOverlay" />

        <div className="vfHeroShelf heroEnter">
          {lang === "he" ? (
            <img
              className="vfTitleImg"
              src={TITLE_IMG}
              alt={t.title}
              loading="eager"
              draggable="false"
            />
          ) : (
            <h1 className="vfTitleText">{t.title}</h1>
          )}

          <p className="vfSubtitle">{t.subtitle}</p>

          <div className="vfPills">
            {t.bulletsTop.map((b, i) => (
              <span key={i} className="vfPill">
                {b}
              </span>
            ))}
          </div>

          <div className="vfHeroBtns">
            <button className="vfBtnPrimary" onClick={scrollToForm} type="button">
              {t.ctaPrimary}
            </button>
            <button className="vfBtnGhost" onClick={scrollToHow} type="button">
              {t.ctaSecondary}
            </button>
          </div>

          <div className="vfLimited">{limitedSlots}</div>
        </div>

        <div className="vfScrollHint" aria-hidden="true">
          <span className="vfScrollDot" />
        </div>
      </section>

      {/* Content */}
      <main className="vfWrap">
        <section ref={r1} className="vfSection accentPink" id="sec-1">
          <div className="vfKicker">{t.kicker1}</div>
          <h2 className="vfH2 gradientTitle">{t.section1Title}</h2>
          <p className="vfText preline">{t.section1Text}</p>
        </section>

        {/* snap hint divider */}
        <div className="vfSnapHint" id="hint-1" aria-hidden="true" />

        <section ref={r2} className="vfSection accentPurple" id="sec-2">
          <div className="vfKicker">{t.kicker2}</div>
          <h2 className="vfH2 gradientTitle">{t.section2Title}</h2>
          <ul className="vfList">
            {t.section2List.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </section>

        <div className="vfSnapHint" id="hint-2" aria-hidden="true" />

        <section ref={r3} className="vfSection accentBlue" id="how-it-works">
          <div className="vfKicker">{t.kicker3}</div>
          <h2 className="vfH2 gradientTitle">{t.section3Title}</h2>
          <div className="vfSteps">
            {t.section3Steps.map((s, i) => (
              <div key={i} className="vfStep">
                <div className="vfStepNum">{i + 1}</div>
                <div className="vfStepTitle">{s.title}</div>
                <div className="vfStepText">{s.text}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="vfSnapHint" id="hint-3" aria-hidden="true" />

        <section ref={r4} className="vfSection accentPink" id="sec-4">
          <div className="vfKicker">{t.kicker4}</div>
          <h2 className="vfH2 gradientTitle">{t.section4Title}</h2>
          <div className="vfAboutName">{t.section4Name}</div>
          <p className="vfText preline">{t.section4Text}</p>

          <EthelCarousel alt={t.section4Name} />

          <a
            className="vfIgBanner"
            href={ETHEL_IG}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram: ethel_superstarbaby"
            title="Instagram"
          >
            <span className="vfIgIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.8A4.2 4.2 0 1 0 16.2 12 4.2 4.2 0 0 0 12 7.8zm6.4-.9a1 1 0 1 0 1 1 1 1 0 0 0-1-1z" />
              </svg>
            </span>
            <span className="vfIgText">@ethel_superstarbaby</span>
            <span className="vfIgHint" aria-hidden="true">
              ↗
            </span>
          </a>
        </section>

        <div className="vfSnapHint" id="hint-4" aria-hidden="true" />

        <section ref={r5} className="vfSection accentPurple" id="sec-5">
          <div className="vfKicker">{t.kicker5}</div>
          <h2 className="vfH2 gradientTitle">{t.faqTitle}</h2>

          <div className="vfFaq">
            {t.faq.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </section>

        <div className="vfSnapHint" id="hint-5" aria-hidden="true" />

        <section ref={r6} className="vfSection accentBlue" id="typeform-area">
          <div className="vfKicker">{t.kicker6}</div>
          <h2 className="vfH2 gradientTitle">{t.formTitle}</h2>
          <div className="vfTypeformBox">
            <p className="vfTypeformNote">{t.formNote}</p>
          </div>
        </section>

        <footer className="vfFooter">{t.footer}</footer>
      </main>

      {/* Bottom sticky CTA */}
      <div className="vfSticky">
        <button className="vfStickyBtn" onClick={scrollToForm} type="button">
          {t.ctaPrimary}
        </button>
        <div className="vfStickySub">{limitedSlots}</div>
      </div>
    </div>
  );
}
