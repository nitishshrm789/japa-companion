/**
 * Local calendar helpers for daily Result saves.
 */
window.JapaTime.getLocalDateKey = function getLocalDateKey(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
};

window.JapaTime.formatDateLabel = function formatDateLabel(dateKey) {
  const parts = dateKey.split("-");
  if (parts.length !== 3) {
    return dateKey;
  }
  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

window.JapaTime.sumElapsed = function sumElapsed(rounds) {
  return rounds.reduce(function (total, round) {
    return total + (round.elapsedMs || 0);
  }, 0);
};

/**
 * Whole calendar days from today (or fromDate) until dateKey.
 * Negative when dateKey is in the past.
 */
window.JapaTime.daysUntil = function daysUntil(dateKey, fromDate) {
  const parts = String(dateKey || "").split("-");
  if (parts.length !== 3) {
    return 0;
  }
  const target = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
  target.setHours(0, 0, 0, 0);
  const from = fromDate ? new Date(fromDate) : new Date();
  from.setHours(0, 0, 0, 0);
  const ms = target.getTime() - from.getTime();
  return Math.round(ms / 86400000);
};
