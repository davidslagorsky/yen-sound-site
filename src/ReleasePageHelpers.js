export function getCountdownParts(target) {
  const now = new Date();
  if (!target || now >= target) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const s = Math.floor((target - now) / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60
  };
}

export function formatCountdown({ days, hours, minutes, seconds }) {
  const pad = (n) => String(n).padStart(2, "0");
  return days > 0
    ? `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function isValidLink(url) {
  return typeof url === "string" && url.trim() && !/PLACEHOLDER/i.test(url);
}
