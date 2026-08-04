export interface TaskColorOption {
  key: string;
  name: string;
  bg: string;
  border: string;
  text: string;
  barBg: string;
  dotColor: string;
  badgeStyle: string;
  cardBg: string;
  cardBorder: string;
  hex: string;
}

export const TASK_COLORS: Record<string, TaskColorOption> = {
  blue: {
    key: "blue",
    name: "Biru (Pengembangan)",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    barBg: "bg-blue-500",
    dotColor: "bg-blue-500",
    badgeStyle: "bg-blue-100/70 text-blue-800 border-blue-200",
    cardBg: "bg-blue-50/60 backdrop-blur-md",
    cardBorder: "border-blue-200/80 hover:border-blue-400/80 shadow-blue-500/5",
    hex: "#3b82f6",
  },
  emerald: {
    key: "emerald",
    name: "Hijau (Rilis / QA)",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    barBg: "bg-emerald-500",
    dotColor: "bg-emerald-500",
    badgeStyle: "bg-emerald-100/70 text-emerald-800 border-emerald-200",
    cardBg: "bg-emerald-50/60 backdrop-blur-md",
    cardBorder: "border-emerald-200/80 hover:border-emerald-400/80 shadow-emerald-500/5",
    hex: "#10b981",
  },
  purple: {
    key: "purple",
    name: "Ungu (Desain / UI)",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    barBg: "bg-purple-500",
    dotColor: "bg-purple-500",
    badgeStyle: "bg-purple-100/70 text-purple-800 border-purple-200",
    cardBg: "bg-purple-50/60 backdrop-blur-md",
    cardBorder: "border-purple-200/80 hover:border-purple-400/80 shadow-purple-500/5",
    hex: "#8b5cf6",
  },
  amber: {
    key: "amber",
    name: "Oranye (Revisi)",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    barBg: "bg-amber-500",
    dotColor: "bg-amber-500",
    badgeStyle: "bg-amber-100/70 text-amber-800 border-amber-200",
    cardBg: "bg-amber-50/60 backdrop-blur-md",
    cardBorder: "border-amber-200/80 hover:border-amber-400/80 shadow-amber-500/5",
    hex: "#f59e0b",
  },
  rose: {
    key: "rose",
    name: "Merah (Bug / Kritis)",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    barBg: "bg-rose-500",
    dotColor: "bg-rose-500",
    badgeStyle: "bg-rose-100/70 text-rose-800 border-rose-200",
    cardBg: "bg-rose-50/60 backdrop-blur-md",
    cardBorder: "border-rose-200/80 hover:border-rose-400/80 shadow-rose-500/5",
    hex: "#ef4444",
  },
  cyan: {
    key: "cyan",
    name: "Sian (Infrastruktur)",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    barBg: "bg-cyan-500",
    dotColor: "bg-cyan-500",
    badgeStyle: "bg-cyan-100/70 text-cyan-800 border-cyan-200",
    cardBg: "bg-cyan-50/60 backdrop-blur-md",
    cardBorder: "border-cyan-200/80 hover:border-cyan-400/80 shadow-cyan-500/5",
    hex: "#06b6d4",
  },
  indigo: {
    key: "indigo",
    name: "Nila (Dokumentasi)",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    barBg: "bg-indigo-500",
    dotColor: "bg-indigo-500",
    badgeStyle: "bg-indigo-100/70 text-indigo-800 border-indigo-200",
    cardBg: "bg-indigo-50/60 backdrop-blur-md",
    cardBorder: "border-indigo-200/80 hover:border-indigo-400/80 shadow-indigo-500/5",
    hex: "#6366f1",
  },
  pink: {
    key: "pink",
    name: "Pink (Inovasi)",
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
    barBg: "bg-pink-500",
    dotColor: "bg-pink-500",
    badgeStyle: "bg-pink-100/70 text-pink-800 border-pink-200",
    cardBg: "bg-pink-50/60 backdrop-blur-md",
    cardBorder: "border-pink-200/80 hover:border-pink-400/80 shadow-pink-500/5",
    hex: "#ec4899",
  },
};

export const DEFAULT_TASK_COLOR = "blue";

export const getTaskColorConfig = (colorKey?: string): TaskColorOption => {
  if (colorKey && TASK_COLORS[colorKey]) {
    return TASK_COLORS[colorKey];
  }
  return TASK_COLORS[DEFAULT_TASK_COLOR];
};
