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

window.JapaTime.parseDateKey = function parseDateKey(dateKey) {
  const parts = String(dateKey || "").split("-");
  if (parts.length !== 3) {
    return null;
  }
  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
  date.setHours(0, 0, 0, 0);
  return date;
};

/** Example: 03-Sep-2026 */
window.JapaTime.formatDayMonthYear = function formatDayMonthYear(dateKey) {
  const date = window.JapaTime.parseDateKey(dateKey);
  if (!date) {
    return dateKey;
  }
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(date.getDate()).padStart(2, "0");
  return day + "-" + months[date.getMonth()] + "-" + date.getFullYear();
};

/** Example: Thu 03 Sept 2026 */
window.JapaTime.formatExpenseDateHeading = function formatExpenseDateHeading(
  dateKey
) {
  const date = window.JapaTime.parseDateKey(dateKey);
  if (!date) {
    return dateKey;
  }
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(date.getDate()).padStart(2, "0");
  return (
    weekdays[date.getDay()] +
    " " +
    day +
    " " +
    months[date.getMonth()] +
    " " +
    date.getFullYear()
  );
};
