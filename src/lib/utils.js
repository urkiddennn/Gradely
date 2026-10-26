export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

export function clamp(value, min = 0, max = 100) {
  const number = Number(value);
  if (Number.isNaN(number)) return min;
  return Math.min(max, Math.max(min, number));
}

export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function formatPercent(value, digits = 1) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toFixed(digits)}%`;
}

export function formatGradePoint(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toFixed(2);
}

export function formatWeight(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

export function initials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "G";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function displayName(user) {
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
  if (fullName) return String(fullName).trim();
  return user?.email ? String(user.email).split("@")[0] : "Student";
}

export function firstName(name) {
  return String(name || "there").trim().split(/\s+/)[0];
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDate(value, options = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function formatShortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function timeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(value);
}

export function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function randomId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

export function sum(values = []) {
  return values.reduce((total, value) => total + toNumber(value), 0);
}

export function getInitialsColor(seed = "") {
  const palettes = [
    "bg-[#e2efe9] text-[#146c58] dark:bg-[#162b24] dark:text-[#7ad4b9]",
    "bg-[#fbf1d9] text-[#96620a] dark:bg-[#2a2113] dark:text-[#eabf72]",
    "bg-[#e8e9f5] text-[#4b4f8a] dark:bg-[#1c1d2e] dark:text-[#b3b8ee]",
    "bg-[#fbe9e4] text-[#a3462d] dark:bg-[#2c1c17] dark:text-[#f0ab98]",
  ];
  const total = String(seed)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palettes[total % palettes.length];
}

export const SEMESTERS = ["1st Semester", "2nd Semester", "Summer"];
