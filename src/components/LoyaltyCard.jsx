import React from 'react';
import { Gift, Check, Star, Heart, Sparkles } from 'lucide-react';
import { CARD_THEMES } from '../utils/themeUtils';

export default function LoyaltyCard({ 
  settings = {}, 
  customer = null,
  previewStamps = null 
}) {
  const currentStamps = previewStamps !== null 
    ? previewStamps 
    : (customer?.current_stamps || 0);

  const target = settings?.stamps_target || 10;
  const isComplete = currentStamps >= target;
  const remaining = Math.max(0, target - currentStamps);

  // Opciones de personalización completas
  const stickerType = settings?.sticker_type || 'check'; // 'check', 'emoji', 'image', 'star', 'heart'
  const stickerEmoji = settings?.sticker_emoji || '👗';
  const stickerColor = settings?.sticker_color || '#f59e0b'; // Dorado brillante por defecto
  const effectiveImage = settings?.sticker_image_url || settings?.logo_url || '';
  const stampShape = settings?.stamp_shape || 'circle'; // 'circle', 'squircle', 'diamond'
  const unmarkedStyle = settings?.unmarked_stamp_style || 'dashed_star'; // 'dashed_star', 'dashed_circle', 'number'
  const cardBgColor = settings?.card_bg_color || '#121214';
  const cardGlow = settings?.card_border_glow || 'gold';

  // Helper para esquinas de la casilla según la forma
  const getShapeClass = () => {
    if (stampShape === 'squircle') return 'rounded-2xl';
    if (stampShape === 'diamond') return 'rotate-45 rounded-lg';
    return 'rounded-full';
  };

  // Border & Glow styling
  let glowClasses = 'border-white/10 shadow-2xl';
  let ambientGlowColor = stickerColor;
  if (cardGlow === 'gold') {
    glowClasses = 'border-amber-400/40 shadow-xl shadow-amber-500/10';
    ambientGlowColor = '#f59e0b';
  } else if (cardGlow === 'pink') {
    glowClasses = 'border-pink-500/40 shadow-xl shadow-pink-500/10';
    ambientGlowColor = '#ec4899';
  } else if (cardGlow === 'purple') {
    glowClasses = 'border-purple-500/40 shadow-xl shadow-purple-500/10';
    ambientGlowColor = '#8b5cf6';
  } else if (cardGlow === 'emerald') {
    glowClasses = 'border-emerald-500/40 shadow-xl shadow-emerald-500/10';
    ambientGlowColor = '#10b981';
  }

  // Renderizar contenido de cada casilla de sello
  const renderStamp = (index) => {
    const stampNum = index + 1;
    const isEarned = stampNum <= currentStamps;
    const isTarget = stampNum === target;
    const shapeClass = getShapeClass();

    if (isEarned) {
      // Última casilla: Premio especial
      if (isTarget) {
        return (
          <div className={`w-full h-full ${shapeClass} flex flex-col items-center justify-center bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 shadow-md animate-bounce-short`}>
            <Gift className={`w-5 h-5 drop-shadow ${stampShape === 'diamond' ? '-rotate-45' : ''}`} />
          </div>
        );
      }

      // 1. Imagen PNG / Logo de la marca
      if (stickerType === 'image' && effectiveImage) {
        return (
          <div 
            className={`w-full h-full ${shapeClass} overflow-hidden p-1.5 border-2 border-white/80 shadow-md flex items-center justify-center`}
            style={{ backgroundColor: stickerColor }}
          >
            <img 
              src={effectiveImage} 
              alt="Logo Marca" 
              className={`w-full h-full object-contain filter drop-shadow-sm ${stampShape === 'diamond' ? '-rotate-45 scale-125' : ''}`} 
            />
          </div>
        );
      }

      // 2. Emoji personalizado (Vestido, Tacón, Corona, etc.)
      if (stickerType === 'emoji') {
        return (
          <div 
            className={`w-full h-full ${shapeClass} flex items-center justify-center text-lg shadow-md border-2 border-white/70`}
            style={{ backgroundColor: stickerColor }}
          >
            <span className={`drop-shadow filter leading-none ${stampShape === 'diamond' ? '-rotate-45' : ''}`}>
              {stickerEmoji}
            </span>
          </div>
        );
      }

      // 3. Estrella Joya
      if (stickerType === 'star') {
        return (
          <div 
            className={`w-full h-full ${shapeClass} flex items-center justify-center shadow-md border-2 border-white/80`}
            style={{ backgroundColor: stickerColor }}
          >
            <Star className={`w-5 h-5 text-stone-950 fill-stone-950 ${stampShape === 'diamond' ? '-rotate-45' : ''}`} />
          </div>
        );
      }

      // 4. Corazón Couture
      if (stickerType === 'heart') {
        return (
          <div 
            className={`w-full h-full ${shapeClass} flex items-center justify-center shadow-md border-2 border-white/80`}
            style={{ backgroundColor: stickerColor }}
          >
            <Heart className={`w-5 h-5 text-stone-950 fill-stone-950 ${stampShape === 'diamond' ? '-rotate-45' : ''}`} />
          </div>
        );
      }

      // 5. Checkmark clásico de alta precisión (Default como Imagen 2 y 4)
      return (
        <div 
          className={`w-full h-full ${shapeClass} flex items-center justify-center shadow-md border-2 border-white/80`}
          style={{ backgroundColor: stickerColor }}
        >
          <Check className={`w-5 h-5 text-stone-950 font-black stroke-[3.5] ${stampShape === 'diamond' ? '-rotate-45' : ''}`} />
        </div>
      );
    }

    // Casilla no marcada / pendiente
    if (unmarkedStyle === 'number') {
      return (
        <div className={`w-full h-full ${shapeClass} border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 font-mono text-xs font-bold text-white/40`}>
          <span className={stampShape === 'diamond' ? '-rotate-45' : ''}>{stampNum}</span>
        </div>
      );
    }

    if (unmarkedStyle === 'dashed_circle') {
      return (
        <div className={`w-full h-full ${shapeClass} border-2 border-dashed border-white/25 flex items-center justify-center bg-white/5`}>
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      );
    }

    // Default: dashed_star (Estrella tenue como en Imagen 1)
    return (
      <div className={`w-full h-full ${shapeClass} border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5`}>
        <Star className={`w-4 h-4 text-white/30 fill-white/10 ${stampShape === 'diamond' ? '-rotate-45' : ''}`} />
      </div>
    );
  };

  return (
    <div 
      className={`rounded-[28px] border p-5 text-white relative overflow-hidden transition-all duration-300 ${glowClasses}`}
      style={{ backgroundColor: cardBgColor }}
    >
      {/* Glow ambiental de fondo */}
      <div 
        className="absolute -right-16 -top-16 w-44 h-44 rounded-full opacity-25 blur-3xl pointer-events-none transition-all duration-500"
        style={{ backgroundColor: ambientGlowColor }}
      />

      {/* Header de la tarjeta: Logo, Nombre y Contador (Imagen 1 y 3) */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center space-x-2.5">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-stone-900 border border-white/20 flex items-center justify-center font-serif text-xs font-bold text-amber-300">
              {(settings?.name || 'KM').substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-sans font-bold text-sm tracking-tight text-white leading-tight">
              {settings?.name || 'Kass moda y estilo'}
            </h3>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold block">
              TARJETA DE SELLOS
            </span>
          </div>
        </div>

        {/* Badge o Contador estilo 00 / 05 */}
        <div>
          {isComplete ? (
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow">
              Premio Listo
            </span>
          ) : (
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/10">
              {String(currentStamps).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Micro-copy de Progreso y Gamificación Destacado */}
      <div className="relative z-10">
        {isComplete ? (
          <div className="mb-3 py-2 px-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 font-black text-xs text-center flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 animate-pulse">
            <Sparkles className="w-4 h-4 fill-stone-950" />
            <span>¡TARJETA COMPLETA! PREMIO LISTO PARA CANJEAR 🎉</span>
          </div>
        ) : remaining <= 2 ? (
          <div className="mb-3 py-2 px-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-center flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-amber-500/10 animate-pulse">
            <span className="text-[10px] tracking-widest uppercase text-amber-300 font-black">
              TE FALTAN: {remaining} {remaining === 1 ? 'SELLO' : 'SELLOS'}
            </span>
            <span className="text-white text-xs font-bold flex items-center gap-1">
              ✨ ¡Estás a solo {remaining === 1 ? '1 compra' : '2 compras'} de tu regalo! 🎉
            </span>
          </div>
        ) : (
          <div className="mb-3 py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-black tracking-wider text-amber-300 uppercase">
              TE FALTAN: {remaining} {remaining === 1 ? 'SELLO' : 'SELLOS'}
            </span>
          </div>
        )}
      </div>

      {/* Grid de Sellos: 5 columnas (o 2 filas de 5 para 10 sellos) */}
      <div className="grid grid-cols-5 gap-2.5 sm:gap-3 py-2 mb-3 relative z-10">
        {Array.from({ length: target }).map((_, index) => (
          <div key={index} className="aspect-square flex items-center justify-center">
            {renderStamp(index)}
          </div>
        ))}
      </div>

      {/* Footer de la tarjeta: "Restantes: 04" | "Sellos: 06/10" (Idéntico a Imagen 1) */}
      <div className="flex items-center justify-between text-[11px] text-white/60 font-medium pt-2 border-t border-white/10 relative z-10">
        <span>Restantes : {String(remaining).padStart(2, '0')}</span>
        <span className="font-semibold text-white/90">
          Sellos : {String(currentStamps).padStart(2, '0')}/{String(target).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
