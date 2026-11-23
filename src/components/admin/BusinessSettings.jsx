import React, { useState } from 'react';
import { 
  Building2, Palette, Gift, Upload, Check, Save, 
  Sparkles, Shield, Trash2, Plus, Eye, Smile, Image as ImageIcon,
  CheckCircle2, Sliders, Smartphone, Type, Layers, Info
} from 'lucide-react';
import LoyaltyCard from '../LoyaltyCard';
import { 
  CARD_THEMES, 
  POPULAR_STICKER_EMOJIS, 
  STICKER_PALETTE_COLORS 
} from '../../utils/themeUtils';

export default function BusinessSettings({ settings, onSaveSettings }) {
  const [formData, setFormData] = useState({
    name: settings?.name || 'Kass moda y estilo',
    slogan: settings?.slogan || 'Moda, elegancia y tendencia para ti',
    logo_url: settings?.logo_url || '',
    phone: settings?.phone || '+57 300 000 0000',
    whatsapp: settings?.whatsapp || '+57 300 000 0000',
    instagram: settings?.instagram || '@kassmodayestilo',
    address: settings?.address || 'Centro Comercial / Calle Principal',
    primary_color: settings?.primary_color || '#4c0519',
    secondary_color: settings?.secondary_color || '#f43f5e',
    card_theme: settings?.card_theme || 'elegance-rose',
    card_icon: settings?.card_icon || 'gem',
    sticker_type: settings?.sticker_type || 'emoji',
    sticker_emoji: settings?.sticker_emoji || '👗',
    sticker_image_url: settings?.sticker_image_url || '',
    sticker_color: settings?.sticker_color || '#f43f5e',
    card_pattern: settings?.card_pattern || 'silk',
    card_bg_image: settings?.card_bg_image || '',
    card_gradient_angle: settings?.card_gradient_angle || 145,
    stamp_shape: settings?.stamp_shape || 'rounded',
    unmarked_stamp_bg: settings?.unmarked_stamp_bg || 'rgba(0,0,0,0.45)',
    unmarked_stamp_border: settings?.unmarked_stamp_border || 'rgba(255,255,255,0.15)',
    card_font: settings?.card_font || 'serif',
    card_border_glow: settings?.card_border_glow || 'gold',
    custom_completion_message: settings?.custom_completion_message || '',
    stamps_target: settings?.stamps_target || 10,
    referral_bonus: settings?.referral_bonus || 2,
    rewards_list: settings?.rewards_list || [
      "20% de Descuento en tu próxima prenda",
      "Bono de $30.000 para tu compra",
      "Accesorio o Prenda de Regalo seleccionada",
      "Regalo Especial de Temporada Kass Moda"
    ],
    terms: settings?.terms || '',
    pin: '1234'
  });

  const [previewStamps, setPreviewStamps] = useState(6);
  const [newRewardText, setNewRewardText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('stickers'); // 'stickers', 'card-style', 'profile', 'rewards', 'wallet-info'

  // Subir logo de la tienda
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Subir imagen de fondo personalizada completa para la tarjeta
  const handleCardBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        alert('La imagen de fondo no debe superar los 6MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, card_bg_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Subir minifotico para los stickers
  const handleStickerImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('La foto para el sticker no debe superar los 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          sticker_image_url: reader.result,
          sticker_type: 'image'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await onSaveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Error al guardar configuración: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stickers')}
          className={`min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'stickers' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Stickers & Sellos</span>
        </button>
        <button
          onClick={() => setActiveTab('card-style')}
          className={`min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'card-style' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Estilo & Fondo Tarjeta</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'profile' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Perfil & Logo</span>
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'rewards' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Premios (10 Sellos)</span>
        </button>
        <button
          onClick={() => setActiveTab('wallet-info')}
          className={`min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'wallet-info' ? 'bg-purple-600 text-white shadow-lg' : 'text-purple-300 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Apple & Google Wallet</span>
        </button>
      </div>

      {/* Live Preview Column + Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Live Preview (Sticky) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              Vista Previa en Vivo 100%
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold">Probar con:</span>
              <select 
                value={previewStamps} 
                onChange={(e) => setPreviewStamps(Number(e.target.value))}
                className="bg-slate-800 text-white rounded-lg px-2 py-1 text-xs font-bold border border-slate-700"
              >
                {[0, 1, 3, 5, 8, 10].map(n => (
                  <option key={n} value={n}>{n} sellos</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loyalty Card Live Preview */}
          <LoyaltyCard 
            settings={formData} 
            previewStamps={previewStamps}
            customer={{ name: 'Carolina Ramírez', customer_code: 'KASS-7842' }} 
          />

          <div className="p-3 rounded-2xl bg-black/40 border border-slate-800 text-center text-xs text-slate-400">
            Cualquier cambio de color, forma o sticker se actualiza instantáneamente en la tarjeta del cliente.
          </div>
        </div>

        {/* Right Settings Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TAB 1: STICKERS & SELLOS */}
            {activeTab === 'stickers' && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  Personalización Total de los Stickers
                </h3>

                {/* 1. Tipo de contenido del sticker */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                    1. Contenido del Sticker (¿Qué se estampa?)
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sticker_type: 'emoji' }))}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        formData.sticker_type === 'emoji'
                          ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg ring-1 ring-pink-500 font-bold'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smile className="w-5 h-5 mx-auto mb-1 text-amber-300" />
                      <span className="text-xs block">Emoji Libre</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sticker_type: 'image' }))}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        formData.sticker_type === 'image'
                          ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg ring-1 ring-pink-500 font-bold'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-5 h-5 mx-auto mb-1 text-pink-400" />
                      <span className="text-xs block">Minifotico</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sticker_type: 'icon' }))}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        formData.sticker_type === 'icon'
                          ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg ring-1 ring-pink-500 font-bold'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Palette className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                      <span className="text-xs block">Icono Moda</span>
                    </button>
                  </div>
                </div>

                {/* Sub-selector según el tipo */}
                {formData.sticker_type === 'emoji' && (
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Catálogo de Emojis de Moda:</span>
                      <span className="text-2xl p-1 bg-pink-500/20 rounded-xl border border-pink-500/40">
                        {formData.sticker_emoji}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {POPULAR_STICKER_EMOJIS.map(item => (
                        <button
                          type="button"
                          key={item.emoji}
                          onClick={() => setFormData(prev => ({ ...prev, sticker_emoji: item.emoji }))}
                          className={`p-2 rounded-xl text-2xl text-center border transition-all ${
                            formData.sticker_emoji === item.emoji
                              ? 'bg-pink-500/30 border-pink-500 scale-110 shadow-md ring-2 ring-pink-400'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {item.emoji}
                        </button>
                      ))}
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold block mb-1">O escribe cualquier emoji de tu teclado:</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={formData.sticker_emoji}
                        onChange={(e) => setFormData(prev => ({ ...prev, sticker_emoji: e.target.value }))}
                        className="w-20 text-center text-xl bg-slate-950 border border-slate-700 rounded-xl py-1 text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                )}

                {formData.sticker_type === 'image' && (
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Subir Minifotico para el Sello:</span>
                    <div className="flex items-center gap-4">
                      {formData.sticker_image_url ? (
                        <img 
                          src={formData.sticker_image_url} 
                          alt="Sticker" 
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-500 shadow-lg"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <label className="cursor-pointer px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md">
                        <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                        <span>Subir Imagen</span>
                        <input type="file" accept="image/*" onChange={handleStickerImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}

                {/* 2. Forma de la casilla del sello */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                    2. Forma de las Casillas de Sellos
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'rounded', label: 'Cuadrado Redondeado', preview: 'rounded-xl' },
                      { id: 'circle', label: 'Círculo Perfecto', preview: 'rounded-full' },
                      { id: 'diamond', label: 'Diamante / Rombo', preview: 'rounded-lg rotate-45 scale-75' }
                    ].map(shape => (
                      <button
                        type="button"
                        key={shape.id}
                        onClick={() => setFormData(prev => ({ ...prev, stamp_shape: shape.id }))}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          formData.stamp_shape === shape.id
                            ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg ring-1 ring-pink-500 font-bold'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-pink-500 ${shape.preview}`} />
                        <span className="text-xs">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Color del sticker al marcarse */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                    3. Color del Sticker Marcado
                  </label>
                  <div className="flex flex-wrap gap-2.5 mb-3">
                    {STICKER_PALETTE_COLORS.map(color => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, sticker_color: color }))}
                        className={`w-8 h-8 rounded-xl border-2 transition-transform hover:scale-110 ${
                          formData.sticker_color.toLowerCase() === color.toLowerCase()
                            ? 'border-white scale-110 shadow-lg ring-2 ring-white/50'
                            : 'border-white/20'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl p-2 max-w-xs">
                    <input
                      type="color"
                      value={formData.sticker_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, sticker_color: e.target.value }))}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.sticker_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, sticker_color: e.target.value }))}
                      className="bg-transparent font-mono text-xs text-white focus:outline-none flex-1 uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ESTILO & FONDO DE LA TARJETA */}
            {activeTab === 'card-style' && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-400" />
                  Fondo, Marco & Tipografía de la Tarjeta
                </h3>

                {/* Subir imagen de fondo propia */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white block">
                    Subir Imagen de Fondo Propia para la Tarjeta (Opcional):
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Si tienes un diseño de fondo creado en Canva o una textura exclusiva de tu tienda, súbela aquí.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md">
                      <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                      <span>Subir Fondo Propio</span>
                      <input type="file" accept="image/*" onChange={handleCardBgUpload} className="hidden" />
                    </label>
                    {formData.card_bg_image && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, card_bg_image: '' }))}
                        className="px-3 py-2 rounded-xl bg-red-950/60 text-red-300 text-xs font-bold"
                      >
                        Quitar Fondo
                      </button>
                    )}
                  </div>
                </div>

                {/* Marco y Resplandor */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                    Marco & Resplandor Exterior
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'gold', label: 'Foil de Oro ✨' },
                      { id: 'rose', label: 'Rosa Couture 💖' },
                      { id: 'neon', label: 'Neón Cian 💎' },
                      { id: 'glass', label: 'Cristal Glass 🪞' },
                      { id: 'none', label: 'Sutil Mate 🖤' },
                    ].map(border => (
                      <button
                        type="button"
                        key={border.id}
                        onClick={() => setFormData(prev => ({ ...prev, card_border_glow: border.id }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                          formData.card_border_glow === border.id
                            ? 'border-pink-500 bg-pink-500/20 text-white shadow-md'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        {border.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipografía */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                    Tipografía de la Tarjeta
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'serif', label: 'Playfair (Elegante)', fontClass: 'font-serif' },
                      { id: 'sans', label: 'Jakarta (Moderna)', fontClass: 'font-sans' },
                      { id: 'cursive', label: 'Cursiva Chic', fontClass: 'font-serif italic' },
                    ].map(f => (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => setFormData(prev => ({ ...prev, card_font: f.id }))}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          formData.card_font === f.id
                            ? 'border-pink-500 bg-pink-500/20 text-white font-bold'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        <span className={`text-base block mb-0.5 ${f.fontClass}`}>Kass Moda</span>
                        <span className="text-[10px] text-slate-400">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colores Primario y Secundario si no usa imagen */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Color de Fondo 1</label>
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-full h-10 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Color de Fondo 2</label>
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-full h-10 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PERFIL & LOGO */}
            {activeTab === 'profile' && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 animate-in fade-in">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-pink-400" />
                  Logo & Datos de Kass moda y estilo
                </h3>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-500 shadow-lg" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-pink-600 text-white font-serif font-bold text-xl flex items-center justify-center">
                      KM
                    </div>
                  )}
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md">
                    <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                    <span>Cambiar Logo / Foto</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Nombre</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Slogan</label>
                    <input
                      type="text"
                      value={formData.slogan}
                      onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Instagram</label>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: RECOMPENSAS */}
            {activeTab === 'rewards' && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 animate-in fade-in">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  Premios que el Negocio Otorga (10 Sellos)
                </h3>
                <div className="space-y-2">
                  {formData.rewards_list.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span>{i + 1}. {r}</span>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, rewards_list: prev.rewards_list.filter((_, idx) => idx !== i) }))} className="text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRewardText}
                    onChange={(e) => setNewRewardText(e.target.value)}
                    placeholder="Nuevo premio..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  />
                  <button type="button" onClick={() => { if (newRewardText) { setFormData(prev => ({ ...prev, rewards_list: [...prev.rewards_list, newRewardText] })); setNewRewardText(''); } }} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: GUÍA TÉCNICA APPLE & GOOGLE WALLET */}
            {activeTab === 'wallet-info' && (
              <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-5 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      ¿Qué tan posible y gratis es integrar Apple & Google Wallet?
                    </h3>
                    <p className="text-xs text-purple-300">
                      Comparativa técnica y de costos reales
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                  {/* Google Wallet */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <span className="font-bold text-emerald-400 text-sm block">
                      🤖 Google Wallet (Android)
                    </span>
                    <span className="font-bold text-white block">Costo: 100% GRATIS</span>
                    <p className="text-slate-300">
                      Google <strong>no cobra nada</strong> por emitir tarjetas de fidelización (Loyalty Passes). Solo requiere crear una cuenta gratuita en Google Cloud y Google Pay Business Console.
                    </p>
                    <p className="text-slate-400">
                      Permite que la clienta pulse "Guardar en Google Wallet" y se agregue a la app oficial con notificaciones de ubicación cuando esté cerca de tu local.
                    </p>
                  </div>

                  {/* Apple Wallet */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <span className="font-bold text-amber-400 text-sm block">
                      🍎 Apple Wallet (iPhone)
                    </span>
                    <span className="font-bold text-white block">Costo: $99 USD / año (Exigido por Apple)</span>
                    <p className="text-slate-300">
                      Apple exige que los pases oficiales <code>.pkpass</code> estén firmados por un certificado criptográfico emitido por su programa de desarrolladores (<strong>Apple Developer Program: $99 USD/año</strong>).
                    </p>
                    <p className="text-slate-400">
                      <strong>Alternativa 100% Gratis en iPhone:</strong> Nuestra solución PWA ("Agregar a pantalla de inicio") crea un icono oficial en el celular sin pagarle los $99 a Apple.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/30 text-xs text-pink-200">
                  <strong className="text-white block mb-1">💡 La Solución Lista en tu App:</strong>
                  Tu aplicación ya incluye el botón <strong>"📱 Guardar en Celular"</strong> con PWA nativa y <strong>descarga de pase VIP en imagen HD</strong> para el carrete de fotos/billetera del móvil. ¡Es 100% gratis y funciona en todos los iPhones y Android de inmediato!
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  ¡Configuración al 100% guardada!
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-3 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-xl shadow-pink-900/40 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Guardando...' : 'Guardar y Aplicar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
