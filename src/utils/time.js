// src/utils/time.js
// Interprets "YYYY-MM-DD" as 00:00 local time of that date
export function releaseDateTimeLocal(releaseAt) {
  if (!releaseAt) return null;
  // Force midnight local by constructing a local Date
  // Works reliably across modern browsers with the "T00:00:00" suffix.
  return new Date(`${releaseAt}T00:00:00`);
}

export function diffPartsTo(target) {
  const now = new Date();
  if (!target || now >= target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }
  const diffMs = target - now;
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isOver: false };
}

export function formatCountdown({ days, hours, minutes, seconds }) {
  const pad = (n) => String(n).padStart(2, "0");
  return days > 0
    ? `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
