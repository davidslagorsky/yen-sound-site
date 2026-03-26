export const config = { matcher: ["/release/:slug*", "/artist/:slug*"] };

const SUPABASE_URL  = "https://ctsrszcgupgondawghnj.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3JzemNndXBnb25kYXdnaG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Njk0MDIsImV4cCI6MjA4ODA0NTQwMn0.MD8cG-a1of2C1QtLLpoHx7Ajgyygd-waxnc7qIW5kY4";
const SITE_URL      = "https://yensound.com";
const DEFAULT_IMG   = "https://yensound.com/yen%20sound%20white%20on%20black%20raw.png";
const DEFAULT_DESC  = "Boutique PR & distribution for bold, boundary-pushing music. Based in Tel Aviv.";

/* ─── is this a social/bot crawler? ─── */
function isBot(req) {
  const ua = req.headers.get("user-agent") || "";
  return /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|googlebot|bingbot|applebot|pinterest|instagram|vkshare|w3c_validator|preview/i.test(ua);
}

/* ─── fetch from Supabase ─── */
async function fetchRelease(slug) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/releases?slug=eq.${encodeURIComponent(slug)}&select=title,artist,cover,smart_link&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await res.json();
  return data?.[0] || null;
}

async function fetchArtist(slug) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/artists?slug=eq.${encodeURIComponent(slug)}&select=display_name,profile_image,bio&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await res.json();
  return data?.[0] || null;
}

/* ─── build HTML shell with meta tags ─── */
function buildHTML({ title, description, image, url }) {
  const fullTitle = `${title} — YEN SOUND`;
  const img = image || DEFAULT_IMG;
  const desc = description || DEFAULT_DESC;
  const canonical = `${SITE_URL}${url}`;

  return `<!DOCTYPE html>
<html lang="he-IL">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${fullTitle}</title>
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

  <!-- redirect bots that render JS -->
  <script>window.location.href="${canonical}";</script>
</head>
<body>
  <p>${esc(fullTitle)}</p>
  <p>${esc(desc)}</p>
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

/* ─── middleware entry point ─── */
export default async function middleware(req) {
  // Only intercept bot requests — real users get the normal React app
  if (!isBot(req)) return;

  const { pathname } = new URL(req.url);
  const parts = pathname.split("/").filter(Boolean); // ["release","halfdry"] or ["artist","shower"]
  const section = parts[0];
  const slug    = parts[1];

  if (!slug) return;

  let meta = null;

  if (section === "release") {
    const release = await fetchRelease(slug);
    if (release) {
      meta = {
        title: `${release.title} — ${release.artist}`,
        description: `Listen to ${release.title} by ${release.artist} on YEN SOUND.`,
        image: release.cover || DEFAULT_IMG,
        url: pathname,
      };
    }
  } else if (section === "artist") {
    const artist = await fetchArtist(slug);
    if (artist) {
      const bio = (artist.bio || "").replace(/<[^>]+>/g, "").slice(0, 155);
      meta = {
        title: artist.display_name,
        description: bio || `${artist.display_name} — YEN SOUND artist page.`,
        image: artist.profile_image || DEFAULT_IMG,
        url: pathname,
      };
    }
  }

  if (!meta) return; // let Vercel serve the normal app

  return new Response(buildHTML(meta), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
