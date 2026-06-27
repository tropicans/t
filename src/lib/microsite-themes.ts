export const DEFAULT_MICROSITE_THEME_ID = "dark" as const;

export const MICROSITE_THEMES = [
  {
    id: "dark",
    label: "Dark",
    tagline: "Gelap elegan dan profesional",
    preview: {
      bg: "bg-gradient-to-b from-zinc-900 to-zinc-950",
      dot: "bg-zinc-400",
      card: "bg-zinc-800",
    },
    public: {
      page: "bg-zinc-950",
      hero: "from-zinc-900/0 via-zinc-950/60 to-zinc-950",
      title: "text-white",
      description: "text-zinc-400",
      avatar: "border-zinc-800 ring-2 ring-zinc-700",
      card: "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/30",
      cardTitle: "text-white",
      icon: "text-zinc-600 group-hover:text-zinc-300",
      empty: "text-zinc-600",
      footer: "text-zinc-800",
      footerBrand: "text-zinc-600",
      divider: "bg-zinc-800",
      share: "text-zinc-500 hover:text-white",
      shareLabel: "text-zinc-600",
    },
    thumbnail: {
      container: "bg-zinc-800/50 flex items-center justify-center overflow-hidden group-hover:bg-zinc-800/80 transition-all",
      avatar: "bg-zinc-800 rounded-2xl w-14 h-14 flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform",
    },
  },
  {
    id: "light",
    label: "Light",
    tagline: "Terang bersih dan minimalis",
    preview: {
      bg: "bg-gradient-to-b from-white to-gray-100",
      dot: "bg-gray-400",
      card: "bg-white border border-gray-200",
    },
    public: {
      page: "bg-gray-50",
      hero: "from-gray-50/0 via-gray-50/60 to-gray-50",
      title: "text-zinc-900",
      description: "text-zinc-500",
      avatar: "border-white ring-2 ring-zinc-200",
      card: "bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/60",
      cardTitle: "text-zinc-900",
      icon: "text-zinc-400 group-hover:text-zinc-600",
      empty: "text-zinc-400",
      footer: "text-zinc-300",
      footerBrand: "text-zinc-400",
      divider: "bg-zinc-200",
      share: "text-zinc-400 hover:text-zinc-800",
      shareLabel: "text-zinc-400",
    },
    thumbnail: {
      container: "bg-slate-100 dark:bg-zinc-800/40 flex items-center justify-center overflow-hidden group-hover:bg-zinc-800/60 transition-all",
      avatar: "bg-white dark:bg-zinc-700 rounded-2xl w-14 h-14 flex items-center justify-center text-zinc-800 dark:text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform",
    },
  },
  {
    id: "gradient",
    label: "Gradient",
    tagline: "Biru lembut bergradasi",
    preview: {
      bg: "bg-gradient-to-b from-white to-[#8EC5E8]",
      dot: "bg-sky-300",
      card: "bg-white/70 border border-white/80",
    },
    public: {
      page: "bg-gradient-to-b from-white to-[#8EC5E8]",
      hero: "from-white/0 via-white/35 to-[#8EC5E8]",
      title: "text-sky-950",
      description: "text-sky-900/75",
      avatar: "border-white/80 ring-2 ring-sky-200/80",
      card: "bg-white/55 border border-white/70 text-sky-950 hover:bg-white/75 hover:border-white/90 backdrop-blur-md hover:shadow-lg hover:shadow-sky-300/30",
      cardTitle: "text-sky-950",
      icon: "text-sky-900/40 group-hover:text-sky-900/70",
      empty: "text-sky-900/45",
      footer: "text-sky-950/20",
      footerBrand: "text-sky-950/45",
      divider: "bg-sky-900/12",
      share: "text-sky-900/45 hover:text-sky-950",
      shareLabel: "text-sky-900/40",
    },
    thumbnail: {
      container: "bg-gradient-to-b from-white to-[#8EC5E8] flex items-center justify-center overflow-hidden transition-all group-hover:brightness-95",
      avatar: "bg-white/80 rounded-2xl w-14 h-14 flex items-center justify-center text-sky-950 text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform backdrop-blur-sm",
    },
  },
  {
    id: "midnight",
    label: "Midnight",
    tagline: "Misteri malam berselimut biru",
    preview: {
      bg: "bg-gradient-to-b from-slate-900 to-slate-950",
      dot: "bg-slate-400",
      card: "bg-slate-800",
    },
    public: {
      page: "bg-slate-950",
      hero: "from-slate-900/0 via-slate-950/60 to-slate-950",
      title: "text-slate-100",
      description: "text-slate-400",
      avatar: "border-slate-800 ring-2 ring-slate-700",
      card: "bg-slate-900 border border-slate-800 text-slate-100 hover:bg-slate-800/80 hover:border-slate-600 hover:shadow-lg hover:shadow-black/40",
      cardTitle: "text-slate-100",
      icon: "text-slate-500 group-hover:text-slate-300",
      empty: "text-slate-600",
      footer: "text-slate-800",
      footerBrand: "text-slate-600",
      divider: "bg-slate-800",
      share: "text-slate-500 hover:text-white",
      shareLabel: "text-slate-600",
    },
    thumbnail: {
      container: "bg-slate-900 flex items-center justify-center overflow-hidden group-hover:bg-slate-800 transition-all",
      avatar: "bg-slate-950 rounded-2xl w-14 h-14 flex items-center justify-center text-slate-100 text-2xl font-bold shadow-md group-hover:scale-110 transition-transform border border-slate-800",
    },
  },
  {
    id: "sunset",
    label: "Sunset",
    tagline: "Kombinasi jingga dan ungu hangat",
    preview: {
      bg: "bg-gradient-to-b from-[#2A0E2A] to-[#1C0826]",
      dot: "bg-rose-400",
      card: "bg-rose-950/55 border border-rose-900/50",
    },
    public: {
      page: "bg-[#1E0B19]",
      hero: "from-[#2A0E2A]/0 via-[#1E0B19]/60 to-[#1E0B19]",
      title: "text-rose-100",
      description: "text-rose-300/80",
      avatar: "border-rose-900/60 ring-2 ring-rose-800/50",
      card: "bg-rose-950/40 border border-rose-900/50 text-rose-100 hover:bg-rose-900/30 hover:border-rose-700/50 hover:shadow-lg hover:shadow-rose-950/50",
      cardTitle: "text-rose-100",
      icon: "text-rose-400 group-hover:text-rose-200",
      empty: "text-rose-600",
      footer: "text-rose-950",
      footerBrand: "text-rose-800",
      divider: "bg-rose-900/30",
      share: "text-rose-400 hover:text-rose-200",
      shareLabel: "text-rose-500",
    },
    thumbnail: {
      container: "bg-gradient-to-br from-[#2A0E2A] to-[#1C0826] flex items-center justify-center overflow-hidden transition-all group-hover:brightness-95",
      avatar: "bg-rose-900/80 rounded-2xl w-14 h-14 flex items-center justify-center text-rose-100 text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform border border-rose-800",
    },
  },
  {
    id: "forest",
    label: "Forest",
    tagline: "Nuansa hijau alam yang tenang",
    preview: {
      bg: "bg-gradient-to-b from-[#0D2D1D] to-[#091F14]",
      dot: "bg-emerald-400",
      card: "bg-emerald-950/55 border border-emerald-900/50",
    },
    public: {
      page: "bg-[#091F14]",
      hero: "from-[#0D2D1D]/0 via-[#091F14]/60 to-[#091F14]",
      title: "text-emerald-100",
      description: "text-emerald-400/80",
      avatar: "border-emerald-900/60 ring-2 ring-emerald-800/50",
      card: "bg-emerald-950/40 border border-emerald-900/50 text-emerald-100 hover:bg-emerald-900/30 hover:border-emerald-700/50 hover:shadow-lg hover:shadow-emerald-950/50",
      cardTitle: "text-emerald-100",
      icon: "text-emerald-400 group-hover:text-emerald-200",
      empty: "text-emerald-600",
      footer: "text-emerald-950",
      footerBrand: "text-emerald-800",
      divider: "bg-emerald-900/30",
      share: "text-emerald-400 hover:text-emerald-200",
      shareLabel: "text-emerald-500",
    },
    thumbnail: {
      container: "bg-[#0D2D1D] flex items-center justify-center overflow-hidden group-hover:bg-[#091F14] transition-all",
      avatar: "bg-emerald-950 rounded-2xl w-14 h-14 flex items-center justify-center text-emerald-100 text-2xl font-bold shadow-md group-hover:scale-110 transition-transform border border-emerald-900",
    },
  },
  {
    id: "mono",
    label: "Mono",
    tagline: "Monokrom minimalis kontras tinggi",
    preview: {
      bg: "bg-black",
      dot: "bg-white",
      card: "bg-zinc-900 border border-white",
    },
    public: {
      page: "bg-black",
      hero: "from-zinc-900/0 via-black/60 to-black",
      title: "text-white font-mono",
      description: "text-zinc-300 font-mono",
      avatar: "border-white ring-2 ring-zinc-500",
      card: "bg-zinc-900 border-2 border-white text-white font-mono hover:bg-white hover:text-black hover:shadow-lg hover:shadow-white/20",
      cardTitle: "group-hover:text-black",
      icon: "text-white group-hover:text-black",
      empty: "text-zinc-500 font-mono",
      footer: "text-zinc-800 font-mono",
      footerBrand: "text-zinc-600 font-mono",
      divider: "bg-white",
      share: "text-zinc-400 hover:text-white font-mono",
      shareLabel: "text-zinc-600 font-mono",
    },
    thumbnail: {
      container: "bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-800 group-hover:bg-black transition-all",
      avatar: "bg-white rounded-2xl w-14 h-14 flex items-center justify-center text-black text-2xl font-bold shadow-md group-hover:scale-110 transition-transform",
    },
  },
] as const;

export type MicrositeThemeId = typeof MICROSITE_THEMES[number]["id"];

export function isMicrositeThemeId(value: string): value is MicrositeThemeId {
  return MICROSITE_THEMES.some((t) => t.id === value);
}

export function normalizeMicrositeTheme(value: unknown): MicrositeThemeId {
  const str = typeof value === "string" ? value : String(value || "");
  return isMicrositeThemeId(str) ? str : DEFAULT_MICROSITE_THEME_ID;
}

export function getMicrositeTheme(value: string | null | undefined) {
  const normalized = normalizeMicrositeTheme(value);
  return MICROSITE_THEMES.find((t) => t.id === normalized)!;
}
