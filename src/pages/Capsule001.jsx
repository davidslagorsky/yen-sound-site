import React, { useState, useEffect, useRef } from "react";
import "./Capsule001.css";

// currency helper
function fmt(n) {
  return new Intl.NumberFormat("en-IL", {
    style: "currency",
    currency: "ILS",
  }).format(n);
}

// launch time: Jan 1, 2026 at 10:00 (Israel, UTC+2)
const LAUNCH_TIME = new Date("2026-01-01T10:00:00+02:00");

// countdown helper
function getRemaining(target, now) {
  const diff = target.getTime() - now.getTime();
  const clamped = Math.max(diff, 0);
  const totalSeconds = Math.floor(clamped / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalMs: diff,
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

// product data
const KEYCARD = {
  id: "keycard",
  name: "KEYCARD 001",
  price: 150, // not shown
  images: ["https://i.postimg.cc/mgQYt3VJ/3dgifmaker63182.gif"],
  shopify: "https://example.com/keycard-001", // placeholder – replace later
  passwordProtected: true,
  password: "SHOWERBITCH",
};

const CATALOG = [
  {
    id: "tee",
    name: "ASHDOD SHIRT 001",
    price: 119,
    shopify: "https://sighbarbie.myshopify.com/products/ashdod-shirt-001",
    images: [
      "https://i.postimg.cc/XvLVfL8y/SHIRT1-optimize.gif",
    ],
  },
  {
    id: "bandanna",
    name: "ASHDOD BANDANA 001",
    price: 59,
    shopify: "https://sighbarbie.myshopify.com/products/ashdod-bandana-001",
    images: [
      "https://i.postimg.cc/85dLBqY1/BANDANA1-optimize.gif",
    ],
  },
  {
    id: "shower-bandana",
    name: "SHOWER BANDANA 001",
    price: 59,
    shopify: "https://sighbarbie.myshopify.com/products/shower-bandana-001",
    images: [
      "https://i.postimg.cc/PfYwgpdC/pasley3.png",
    ],
  },
];

// intersection observer hook for fade-in
function useInView() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function Capsule001() {
  const [now, setNow] = useState(new Date());
  const [pageUnlocked, setPageUnlocked] = useState(false);
  const [pagePassword, setPagePassword] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = getRemaining(LAUNCH_TIME, now);
  const timeReached = remaining.totalMs <= 0;

  // auto-unlock when time passes
  useEffect(() => {
    if (timeReached) {
      setPageUnlocked(true);
    }
  }, [timeReached]);

  const handlePagePasswordSubmit = () => {
    if (pagePassword.trim().toLowerCase() === "madeinashdod") {
      setPageUnlocked(true);
    }
  };

  // GATE VIEW: before unlock
  if (!pageUnlocked) {
    return (
      <div className="capsule-root">
        <div
          className="capsule-bg"
          style={{
            backgroundImage: "url('https://i.postimg.cc/G28MH8N8/image.gif')",
          }}
        />
        <div className="capsule-inner">
          <div className="capsule-gate">
            <div className="capsule-countdown capsule-countdown--large">
              <span>{remaining.days}</span>d ·{" "}
              <span>{remaining.hours}</span>h ·{" "}
              <span>{remaining.minutes}</span>m ·{" "}
              <span>{remaining.seconds}</span>s
            </div>

            {!timeReached && (
              <div className="capsule-password-wrapper">
                <input
                  type="password"
                  value={pagePassword}
                  onChange={(e) => setPagePassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePagePasswordSubmit();
                  }}
                  placeholder="Password"
                  className="capsule-password-input"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED VIEW: after time OR correct password
  return (
    <div className="capsule-root">
      <div
        className="capsule-bg"
        style={{
          backgroundImage: "url('https://i.postimg.cc/G28MH8N8/image.gif')",
        }}
      />

      <div className="capsule-inner">
        <div className="capsule-title">
          <h1>ASHDOD CAPSULE 001</h1>
          <p className="capsule-subtext">
            Limited edition, curated by Yen Sound.
          </p>
        </div>

        {/* Triangle layout */}
        <main className="capsule-main">
          {/* Top: Keycard */}
          <div className="keycard-wrapper">
            <Card product={KEYCARD} variant="single" />
          </div>

          {/* Bottom row: Shirt + Ashdod Bandana */}
          <div className="grid-row">
            {CATALOG.slice(0, 2).map((p) => (
              <Card key={p.id} product={p} variant="grid" />
            ))}
          </div>

          {/* Second row: Shower Bandana centered */}
          <div className="grid-row" style={{ marginTop: "4rem" }}>
            <Card product={CATALOG[2]} variant="grid" />
          </div>
        </main>

        <footer className="capsule-footer">
          <a href="/" aria-label="Yen Sound Home">
            <img
              src="https://i.postimg.cc/FHrhnywm/web-footer.png"
              alt="Yen Sound"
            />
          </a>
        </footer>
      </div>
    </div>
  );
}

function Card({ product, variant }) {
  const [hover, setHover] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const mainImage = product.images?.[0];
  const hoverImage = product.images?.[1] ?? product.images?.[0];
  const { ref, visible } = useInView();

  const handlePasswordSubmit = () => {
    if (!product.password) return;
    if (passwordInput.trim().toUpperCase() === product.password.toUpperCase()) {
      setUnlocked(true);
    }
  };

  const isPassworded = product.passwordProtected;
  const showShopLink =
    product.shopify && (!isPassworded || (isPassworded && unlocked));

  // smaller image for SHOWER BANDANA 001
  const imgClass =
    product.id === "shower-bandana"
      ? "card-img card-img--shower"
      : variant === "single"
      ? "card-img card-img--single"
      : "card-img";

  return (
    <div
      ref={ref}
      className={"card " + (visible ? "card--visible" : "card--hidden")}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="card-img-wrapper">
        <img
          src={hover ? hoverImage : mainImage}
          alt={product.name}
          className={imgClass}
        />
      </div>

      <div className="card-meta">
        <h3>{product.name}</h3>

        {product.id !== "keycard" && (
          <span className="card-price">{fmt(product.price)}</span>
        )}

        <span className="card-caption">Limited Drop</span>

        {isPassworded && !unlocked && (
          <div className="password-wrapper">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasswordSubmit();
              }}
              placeholder="Password"
            />
          </div>
        )}

        {showShopLink && (
          <a
            href={product.shopify}
            target="_blank"
            rel="noopener noreferrer"
            className="shop-link"
          >
            Shop ↗
          </a>
        )}
      </div>
    </div>
  );
}
