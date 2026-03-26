export const config = { matcher: ["/release/:slug*", "/artist/:slug*"] };

const SUPABASE_URL = "https://ctsrszcgupgondawghnj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3JzemNndXBnb25kYXdnaG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Njk0MDIsImV4cCI6MjA4ODA0NTQwMn0.MD8cG-a1of2C1QtLLpoHx7Ajgyygd-waxnc7qIW5kY4";
const SITE_URL     = "https://yensound.com";
const DEFAULT_IMG  = "https://yensound.com/yen%20sound%20white%20on%20black%20raw.png";
const DEFAULT_DESC = "Boutique PR & distribution for bold, boundary-pushing music. Based in Tel Aviv.";

/* ─── roster fallback (mirrors rosterData.js) ─── */
const ROSTER = {
  shower:    { name: "SHOWER",    image: "https://is1-ssl.mzstatic.com/image/thumb/AMCArtistImages221/v4/07/c6/e5/07c6e576-9209-6826-9e50-26344cde6f14/file_cropped.png/1000x1000bb.jpg" },
  yali:      { name: "YALi",      image: "https://i.postimg.cc/BZ1q4xQM/temp-Imagen-QRo-Pk.avif" },
  sighdafekt:{ name: "Sighdafekt",image: "https://is1-ssl.mzstatic.com/image/thumb/AMCArtistImages221/v4/e8/f7/3c/e8f73c64-5e0b-ce16-bdf0-ec0308931ff8/7f8a5081-38ab-4b07-a23f-87c3dea38270_file_cropped.png/1000x1000bb.jpg" },
  ethel:     { name: "Ethel",     image: "https://iili.io/F4WKPzg.png" },
  romiroth:  { name: "ROMI ROTH", image: "https://i.postimg.cc/CxZ8kfrM/520820584-18509610442017331-6655838734014150963-n.jpg" },
  alonmylo:  { name: "Alon Mylo", image: "https://i.imgur.com/CqaN85O.jpeg" },
  kizels:    { name: "Kizels",    image: "https://iili.io/F4VyakJ.md.jpg" },
  roynismo:  { name: "Roy Nismo", image: "https://i.scdn.co/image/ab6761610000e5eb857ad2aa383c67f4c04488da" },
  aloni:     { name: "ALONI",     image: "https://i.postimg.cc/WbkMDH96/3f4f9b29e6ad69f0714de9c1bb8a0c6f-1000x1000x1.jpg" },
  esh:       { name: "E$H",       image: "https://i.postimg.cc/NfSFN3t8/6D79D7DC-F40B-496F-9FE2-6379C854F4B4.jpg" },
  coco:      { name: "COCO",      image: "https://i.postimg.cc/LX9jHcnT/channels4-profile.jpg" },
  sgulot:    { name: "SGULOT",    image: "https://i.scdn.co/image/ab6761610000e5eb912bae37f837455d83f1d2e1" },
};

/* ─── bot detection ─── */
function isBot(req) {
  const ua = req.headers.get("user-agent") || "";
  return /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|googlebot|bingbot|applebot|pinterest|instagram|vkshare|w3c_validator|preview/i.test(ua);
}

/* ─── Supabase fetchers ─── */
async function fetchRelease(slug) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/releases?slug=eq.${encodeURIComponent(slug)}&select=title,artist,cover,smart_link&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await res.json();
  return data?.[0] || null;
}

async function fetchArtistFromDB(slug) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/artists?slug=eq.${encodeURIComponent(slug)}&select=display_name,profile_image,bio&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await res.json();
  return data?.[0] || null;
}

/* ─── HTML builder ─── */
function buildHTML({ title, description, image, url }) {
  const fullTitle = `${title} — YEN SOUND`;
  const img  = image || DEFAULT_IMG;
  const desc = description || DEFAULT_DESC;
  const canonical = `${SITE_URL}${url}`;

  return `<!DOCTYPE html>
<html lang="he-IL">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(desc)}" />

  <meta property="og:site_name"    content="YEN SOUND" />
  <meta property="og:type"         content="website" />
  <meta property="og:url"          content="${canonical}" />
  <meta property="og:title"        content="${esc(fullTitle)}" />
  <meta property="og:description"  content="${esc(desc)}" />
  <meta property="og:image"        content="${img}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${esc(fullTitle)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image"       content="${img}" />

  <link rel="canonical" href="${canonical}" />
  <script>window.location.href="${canonical}";</script>
</head>
<body>
  <h1>${esc(fullTitle)}</h1>
  <p>${esc(desc)}</p>
  <img src="${img}" alt="${esc(title)}" />
</body>
</html>`;
}

function esc(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ─── entry point ─── */
export default async function middleware(req) {
  if (!isBot(req)) return;

  const { pathname } = new URL(req.url);
  const parts   = pathname.split("/").filter(Boolean);
  const section = parts[0];
  const slug    = parts[1];

  if (!slug) return;

  let meta = null;

  /* ── release page ── */
  if (section === "release") {
    const release = await fetchRelease(slug);
    if (release) {
      meta = {
        title: `${release.title} — ${release.artist}`,
        description: `Listen to "${release.title}" by ${release.artist} on YEN SOUND.`,
        image: release.cover || DEFAULT_IMG,
        url: pathname,
      };
    }
  }

  /* ── artist page ── */
  if (section === "artist") {
    // 1. Try Supabase first (may have a custom uploaded profile_image)
    const dbArtist = await fetchArtistFromDB(slug);

    // 2. Fall back to rosterData if Supabase has no profile_image
    const rosterEntry = ROSTER[slug];

    const name  = dbArtist?.display_name || rosterEntry?.name || slug;
    const image = dbArtist?.profile_image || rosterEntry?.image || DEFAULT_IMG;
    const bio   = (dbArtist?.bio || "").replace(/<[^>]+>/g, "").slice(0, 155);
    const desc  = bio || `${name} — YEN SOUND artist. Music, releases and links.`;

    meta = { title: name, description: desc, image, url: pathname };
  }

  if (!meta) return;

  return new Response(buildHTML(meta), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
