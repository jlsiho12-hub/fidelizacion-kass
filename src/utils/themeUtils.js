import QRCode from 'qrcode';

export const CARD_THEMES = [
  {
    id: 'elegance-rose',
    name: 'Rosa Alta Costura',
    primary: '#4c0519',
    secondary: '#f43f5e',
    stickerDefault: '#f43f5e',
    gradient: 'from-rose-950 via-pink-900 to-slate-950',
    border: 'border-pink-500/40',
    accent: 'bg-pink-500',
    badge: 'bg-gradient-to-r from-pink-500 to-rose-400 text-white'
  },
  {
    id: 'gold-luxury',
    name: 'Oro Real & Noir',
    primary: '#1c1917',
    secondary: '#f59e0b',
    stickerDefault: '#f59e0b',
    gradient: 'from-stone-950 via-neutral-900 to-amber-950',
    border: 'border-amber-500/50',
    accent: 'bg-amber-500',
    badge: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-stone-950'
  },
  {
    id: 'champagne-couture',
    name: 'Champagne & Terracota',
    primary: '#2d1810',
    secondary: '#fb923c',
    stickerDefault: '#f97316',
    gradient: 'from-orange-950 via-stone-900 to-neutral-950',
    border: 'border-orange-400/40',
    accent: 'bg-orange-500',
    badge: 'bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 text-stone-900'
  },
  {
    id: 'emerald-boutique',
    name: 'Esmeralda Joya',
    primary: '#022c22',
    secondary: '#10b981',
    stickerDefault: '#10b981',
    gradient: 'from-emerald-950 via-teal-950 to-slate-950',
    border: 'border-emerald-500/40',
    accent: 'bg-emerald-500',
    badge: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-stone-950'
  },
  {
    id: 'purple-imperial',
    name: 'Púrpura Velvet',
    primary: '#3b0764',
    secondary: '#c084fc',
    stickerDefault: '#c084fc',
    gradient: 'from-purple-950 via-violet-900 to-slate-950',
    border: 'border-purple-500/40',
    accent: 'bg-purple-500',
    badge: 'bg-gradient-to-r from-purple-400 to-fuchsia-300 text-white'
  },
  {
    id: 'aurora-hologram',
    name: 'Holográfico Iridiscente',
    primary: '#0f172a',
    secondary: '#38bdf8',
    stickerDefault: '#ec4899',
    gradient: 'from-slate-950 via-indigo-950 to-pink-950',
    border: 'border-cyan-400/40',
    accent: 'bg-cyan-500',
    badge: 'bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 text-slate-950'
  }
];

export const POPULAR_STICKER_EMOJIS = [
  { emoji: '👗', label: 'Vestido' },
  { emoji: '👠', label: 'Tacón' },
  { emoji: '🛍️', label: 'Bolsa' },
  { emoji: '👑', label: 'Corona' },
  { emoji: '💎', label: 'Diamante' },
  { emoji: '✨', label: 'Destello' },
  { emoji: '🌸', label: 'Flor' },
  { emoji: '💄', label: 'Labial' },
  { emoji: '🎀', label: 'Lazo' },
  { emoji: '💖', label: 'Corazón' },
  { emoji: '🦋', label: 'Mariposa' },
  { emoji: '⭐', label: 'Estrella' }
];

export const STICKER_PALETTE_COLORS = [
  '#f43f5e', // Rosa neón
  '#ec4899', // Fucsia couture
  '#f59e0b', // Oro radiante
  '#8b5cf6', // Violeta luxury
  '#10b981', // Verde esmeralda
  '#06b6d4', // Turquesa
  '#e11d48', // Rubí
  '#fbbf24', // Dorado brillante
  '#a855f7', // Púrpura chic
  '#ffffff'  // Blanco perla
];

export async function generateQrDataUrl(text, options = {}) {
  try {
    return await QRCode.toDataURL(text, {
      width: options.width || 320,
      margin: options.margin !== undefined ? options.margin : 2,
      color: {
        dark: options.darkColor || '#090d16',
        light: options.lightColor || '#ffffff',
      },
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
}
