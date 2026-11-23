import React, { useState, useEffect } from 'react';
import { 
  Home, Users, FileText, QrCode, Settings as SettingsIcon, Plus,
  Sparkles, Gift, Check, LogOut, ArrowLeft, Smartphone, ExternalLink,
  ChevronRight, ToggleLeft, ToggleRight, Star, Upload, Save, Eye,
  TrendingUp, UserPlus, Award, ArrowUpRight, Clock, Activity, BarChart3
} from 'lucide-react';
import CashierScanner from './CashierScanner';
import CustomerManagement from './CustomerManagement';
import StorePoster from './StorePoster';
import CustomerCardView from '../CustomerCardView';
import CustomerRegisterModal from '../CustomerRegisterModal';
import LoyaltyCard from '../LoyaltyCard';
import { POPULAR_STICKER_EMOJIS } from '../../utils/themeUtils';

export default function AdminDashboard({ settings, onSaveSettings, onExitAdmin }) {
  const [activeMenu, setActiveMenu] = useState('mypage'); // 'mypage', 'customers', 'home', 'poster', 'scanner'
  const [pageSubTab, setPageSubTab] = useState('card'); // 'welcome', 'register', 'card'
  const [customerFilter, setCustomerFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const navigateToCustomers = (filterKey = 'all') => {
    setCustomerFilter(filterKey);
    setActiveMenu('customers');
  };

  // Form State
  const [formData, setFormData] = useState({
    name: settings?.name || 'Kass moda y estilo',
    slogan: settings?.slogan || 'Moda, elegancia y tendencia para ti',
    logo_url: settings?.logo_url || '',
    banner_url: settings?.banner_url || '',
    phone: settings?.phone || '+57 300 000 0000',
    whatsapp: settings?.whatsapp || '+57 300 000 0000',
    instagram: settings?.instagram || '@kassmodayestilo',
    address: settings?.address || 'Centro Comercial / Calle Principal',
    primary_color: settings?.primary_color || '#121214',
    secondary_color: settings?.secondary_color || '#f59e0b',
    sticker_color: settings?.sticker_color || '#f59e0b',
    sticker_type: settings?.sticker_type || 'check',
    sticker_emoji: settings?.sticker_emoji || '👗',
    sticker_image_url: settings?.sticker_image_url || '',
    stamp_shape: settings?.stamp_shape || 'circle',
    unmarked_stamp_style: settings?.unmarked_stamp_style || 'dashed_star',
    card_bg_color: settings?.card_bg_color || '#121214',
    card_border_glow: settings?.card_border_glow || 'gold',
    stamps_target: settings?.stamps_target || 10,
    referral_bonus: settings?.referral_bonus || 2,
    program_name: settings?.program_name || 'Lleva un Premio Gratis',
    reward_description: settings?.reward_description || '20% de Descuento en tu próxima prenda',
    how_it_works: settings?.how_it_works || 'Junta 10 sellos y reclama tu premio en tienda',
    reward_invitations: settings?.reward_invitations !== undefined ? settings?.reward_invitations : 1,
    conditions: settings?.conditions || 'Por compras mayores a 10.000 pesos en tienda física',
    welcome_title: settings?.welcome_title || 'Bienvenida a Kass moda y estilo',
    welcome_subtitle: settings?.welcome_subtitle || 'Moda de especialidad y tendencia. Descubre prendas exclusivas y acumula beneficios con cada visita.',
    welcome_btn_text: settings?.welcome_btn_text || 'Entrar / Obtener mi tarjeta',
    register_title: settings?.register_title || 'Registra tu Tarjeta en 10 segundos',
    register_subtitle: settings?.register_subtitle || 'Solo ingresa tu nombre y teléfono. Tu tarjeta quedará guardada en tu celular.',
    register_btn_text: settings?.register_btn_text || '¡Listo! Ver mi tarjeta',
    terms: settings?.terms || '',
    pin: '1234'
  });

  // Cargar estadísticas
  const loadStats = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  };

  useEffect(() => {
    loadStats();
  }, [activeMenu]);

  // Guardar cambios ("Publicar cambios")
  const handlePublish = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await onSaveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadStats();
    } catch (err) {
      alert('Error al publicar cambios: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 flex font-sans antialiased">
      {/* 1. SIDEBAR OSCURO (Idéntico a Imagen 3) */}
      <aside className="w-64 bg-[#111215] text-white flex flex-col justify-between shrink-0 p-4 border-r border-slate-800">
        <div>
          {/* Logo y Nombre */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-slate-800">
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="w-10 h-10 rounded-2xl object-cover bg-black border border-white/20" />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-stone-900 border border-white/20 flex items-center justify-center font-bold text-amber-300">
                {(formData.name || 'KM').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <h2 className="font-bold text-sm text-white truncate">{formData.name}</h2>
              <span className="text-[11px] text-slate-400 block">Moda & Estilo</span>
            </div>
          </div>

          {/* Menú */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveMenu('mypage')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeMenu === 'mypage' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Mi página</span>
            </button>

            <button
              onClick={() => setActiveMenu('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeMenu === 'customers' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-pink-400" />
              <span>Clientes ({stats?.totalCustomers || 0})</span>
            </button>

            <button
              onClick={() => setActiveMenu('poster')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeMenu === 'poster' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>QR de unión</span>
            </button>

            <button
              onClick={() => setActiveMenu('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeMenu === 'home' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Métricas & Gráficas</span>
            </button>
          </nav>
        </div>

        {/* Botón inferior morado fijo: "+ Marcar sello" */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveMenu('scanner')}
            className="w-full py-3.5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-lg shadow-purple-950 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Marcar sello</span>
          </button>

          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
            <button onClick={onExitAdmin} className="hover:text-white">Ver como cliente</button>
            <button onClick={() => { localStorage.removeItem('kass_admin_auth'); window.location.reload(); }} className="hover:text-red-400">Salir</button>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex overflow-y-auto">
        {/* ================= SECCIÓN MI PÁGINA (BIENVENIDA / REGISTRO / TARJETA) ================= */}
        {activeMenu === 'mypage' && (
          <div className="flex-1 flex flex-col xl:flex-row p-6 xl:p-8 gap-8 max-w-7xl mx-auto w-full">
            {/* Panel Central con Formulario */}
            <div className="flex-1 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              {/* Encabezado: "Mi página • Publicada" y Pestañas: 1 Bienvenida | 2 Registro | 3 Tarjeta */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <h1 className="font-bold text-xl text-slate-900">Mi página</h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    • Publicada
                  </span>
                </div>

                {/* Sub-Pestañas: 1 Bienvenida | 2 Registro | 3 Tarjeta */}
                <div className="flex gap-2">
                  {[
                    { id: 'welcome', num: '1', label: 'Bienvenida' },
                    { id: 'register', num: '2', label: 'Registro' },
                    { id: 'card', num: '3', label: 'Tarjeta' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setPageSubTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        pageSubTab === tab.id
                          ? 'bg-[#121214] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="opacity-60">{tab.num}.</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CONTENIDO VARIABLE SEGÚN LA PESTAÑA SELECCIONADA */}
              <form onSubmit={handlePublish} className="space-y-5">
                {/* PESTAÑA 1: BIENVENIDA (Landing de entrada que ve la clienta) */}
                {pageSubTab === 'welcome' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-900 border border-purple-200 text-xs">
                      <strong>👋 Pantalla de Bienvenida:</strong> Es lo primero que ve tu clienta al escanear el QR en tu tienda antes de entrar a su tarjeta.
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Título de Bienvenida</label>
                      <input
                        type="text"
                        value={formData.welcome_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, welcome_title: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                        placeholder="Bienvenida a Kass moda y estilo"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Mensaje / Slogan de Entrada</label>
                      <textarea
                        rows={3}
                        value={formData.welcome_subtitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, welcome_subtitle: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600 resize-none"
                        placeholder="Moda de especialidad y tendencia. Descubre prendas exclusivas y acumula beneficios."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Texto del Botón de Entrada</label>
                      <input
                        type="text"
                        value={formData.welcome_btn_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, welcome_btn_text: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                        placeholder="Entrar / Obtener mi tarjeta"
                      />
                    </div>

                    {/* Portada y Logo 100% editables */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Foto de Portada</label>
                        {formData.banner_url && (
                          <img src={formData.banner_url} alt="Portada" className="w-full h-16 object-cover rounded-xl mb-2" />
                        )}
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-purple-600 text-slate-700 text-xs font-bold transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Cambiar Portada</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner_url')} className="hidden" />
                        </label>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Logo del Negocio</label>
                        {formData.logo_url && (
                          <img src={formData.logo_url} alt="Logo" className="w-12 h-12 object-cover rounded-2xl mx-auto mb-2 border border-slate-200" />
                        )}
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-purple-600 text-slate-700 text-xs font-bold transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Cambiar Logo</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo_url')} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* PESTAÑA 2: REGISTRO (Formulario rápido de cliente) */}
                {pageSubTab === 'register' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-900 border border-purple-200 text-xs">
                      <strong>📝 Pantalla de Registro:</strong> Se abre cuando la clienta toca el botón "Entrar". Solo le pide su Nombre y WhatsApp una sola vez.
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Título del Registro</label>
                      <input
                        type="text"
                        value={formData.register_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, register_title: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                        placeholder="Registra tu Tarjeta en 10 segundos"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Subtítulo Explicativo</label>
                      <textarea
                        rows={2}
                        value={formData.register_subtitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, register_subtitle: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600 resize-none"
                        placeholder="Solo ingresa tu nombre y teléfono. Tu tarjeta quedará guardada en tu celular."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Texto del Botón de Confirmación</label>
                      <input
                        type="text"
                        value={formData.register_btn_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, register_btn_text: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                        placeholder="¡Listo! Ver mi tarjeta"
                      />
                    </div>
                  </div>
                )}

                {/* PESTAÑA 3: TARJETA & GRAN SUITE DE PERSONALIZACIÓN */}
                {pageSubTab === 'card' && (
                  <div className="space-y-6 animate-in fade-in">
                    {/* SECCIÓN A: REGLAS DEL PROGRAMA Y PREMIOS */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Gift className="w-4 h-4 text-purple-600" />
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                          1. Reglas del Programa & Recompensas
                        </h4>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Nombre del programa</label>
                        <input
                          type="text"
                          value={formData.program_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, program_name: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                          placeholder="Lleva un Premio Gratis"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Premio que se gana el cliente</label>
                        <input
                          type="text"
                          value={formData.reward_description}
                          onChange={(e) => setFormData(prev => ({ ...prev, reward_description: e.target.value }))}
                          className="w-full bg-white border border-purple-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-100"
                          placeholder="20% de Descuento en tu próxima prenda"
                        />
                      </div>

                      {/* Sellos para ganar (- 10 + con estrellitas) */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Sellos necesarios para ganar</label>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, stamps_target: Math.max(3, prev.stamps_target - 1) }))}
                              className="px-3.5 py-2 hover:bg-slate-100 text-slate-700 font-bold"
                            >
                              -
                            </button>
                            <span className="px-4 py-2 text-xs font-bold text-slate-900 min-w-[35px] text-center">
                              {formData.stamps_target}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, stamps_target: Math.min(20, prev.stamps_target + 1) }))}
                              className="px-3.5 py-2 hover:bg-slate-100 text-slate-700 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: Math.min(10, formData.stamps_target) }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Cómo funciona</label>
                        <input
                          type="text"
                          value={formData.how_it_works}
                          onChange={(e) => setFormData(prev => ({ ...prev, how_it_works: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                          placeholder="Junta 10 sellos y reclama tu premio"
                        />
                      </div>

                      {/* Premiar invitaciones (Switch toggle) */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Premiar invitaciones (Referidos 2x2)</span>
                            <span className="text-[11px] text-slate-500">Máximo 5 invitados por cliente al mes</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, reward_invitations: prev.reward_invitations ? 0 : 1 }))}
                            className="text-purple-600 focus:outline-none"
                          >
                            {formData.reward_invitations ? (
                              <ToggleRight className="w-8 h-8 fill-purple-600 text-purple-600" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-slate-300" />
                            )}
                          </button>
                        </div>

                        {formData.reward_invitations === 1 && (
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-700 font-medium">Sellos de regalo por invitada:</span>
                            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, referral_bonus: Math.max(1, prev.referral_bonus - 1) }))}
                                className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-bold"
                              >
                                -
                              </button>
                              <span className="px-3 py-1.5 text-xs font-bold text-slate-900">
                                {formData.referral_bonus}
                              </span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, referral_bonus: Math.min(5, prev.referral_bonus + 1) }))}
                                className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECCIÓN B: PERSONALIZACIÓN DEL STICKER / SELLO */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                          2. Personalización de los Stickers (Sellos)
                        </h4>
                      </div>

                      {/* Tipo de Sticker */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">Tipo de Sticker al Marcarse</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'image', label: 'Logo PNG / Foto', icon: '🏷️' },
                            { id: 'emoji', label: 'Emoji Moda', icon: '👗' },
                            { id: 'check', label: 'Check Clásico', icon: '✔️' },
                            { id: 'star', label: 'Estrella Joya', icon: '⭐' }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, sticker_type: t.id }))}
                              className={`p-3 rounded-2xl border text-center transition-all ${
                                formData.sticker_type === t.id
                                  ? 'bg-purple-50 border-purple-600 text-purple-950 font-black shadow-sm ring-1 ring-purple-500'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-xl block mb-1">{t.icon}</span>
                              <span className="text-[11px] block">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Si el tipo es Logo PNG / Imagen */}
                      {formData.sticker_type === 'image' && (
                        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3 animate-in fade-in">
                          <label className="text-xs font-bold text-purple-950 block">Imagen PNG / Logo para el Sticker</label>
                          <div className="flex flex-wrap items-center gap-3">
                            {formData.sticker_image_url ? (
                              <div className="w-12 h-12 rounded-full p-1 bg-white border border-purple-300 shadow-sm flex items-center justify-center overflow-hidden">
                                <img src={formData.sticker_image_url} alt="Sticker Logo" className="w-full h-full object-contain" />
                              </div>
                            ) : formData.logo_url ? (
                              <div className="w-12 h-12 rounded-full p-1 bg-white border border-purple-300 shadow-sm flex items-center justify-center overflow-hidden">
                                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                              </div>
                            ) : null}

                            <label className="cursor-pointer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Subir Imagen PNG</span>
                              <input 
                                type="file" 
                                accept="image/png,image/jpeg,image/webp" 
                                onChange={(e) => handleFileUpload(e, 'sticker_image_url')} 
                                className="hidden" 
                              />
                            </label>

                            {formData.logo_url && (
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, sticker_image_url: prev.logo_url }))}
                                className="px-3.5 py-2 rounded-xl bg-white border border-purple-300 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors"
                              >
                                Usar Logo de la Tienda
                              </button>
                            )}
                          </div>
                          <span className="text-[11px] text-purple-600 block">
                            Recomendado: Archivo PNG transparente para un acabado impecable sobre la tarjeta.
                          </span>
                        </div>
                      )}

                      {/* Si el tipo es Emoji */}
                      {formData.sticker_type === 'emoji' && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in">
                          <label className="text-xs font-bold text-slate-700 block">Selecciona un Emoji de Moda</label>
                          <div className="flex flex-wrap gap-2">
                            {POPULAR_STICKER_EMOJIS.map(item => (
                              <button
                                key={item.emoji}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, sticker_emoji: item.emoji }))}
                                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                                  formData.sticker_emoji === item.emoji
                                    ? 'bg-purple-600 text-white shadow-md scale-110'
                                    : 'bg-white border border-slate-200 hover:bg-slate-100'
                                }`}
                                title={item.label}
                              >
                                {item.emoji}
                              </button>
                            ))}
                          </div>
                          <div className="pt-2 flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">O escribe otro:</span>
                            <input
                              type="text"
                              maxLength={3}
                              value={formData.sticker_emoji}
                              onChange={(e) => setFormData(prev => ({ ...prev, sticker_emoji: e.target.value }))}
                              className="w-14 bg-white border border-slate-300 rounded-xl py-1 px-2 text-center text-lg font-bold"
                            />
                          </div>
                        </div>
                      )}

                      {/* Color del Sticker */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">Color de Fondo del Sticker al Marcarse</label>
                          <span className="font-mono text-xs font-bold text-slate-500 uppercase">{formData.sticker_color}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[
                            { color: '#f59e0b', label: 'Oro' },
                            { color: '#ec4899', label: 'Fucsia' },
                            { color: '#f43f5e', label: 'Rosa' },
                            { color: '#8b5cf6', label: 'Violeta' },
                            { color: '#10b981', label: 'Esmeralda' },
                            { color: '#06b6d4', label: 'Turquesa' },
                            { color: '#18181b', label: 'Negro' },
                            { color: '#ffffff', label: 'Blanco' }
                          ].map(c => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, sticker_color: c.color }))}
                              className={`w-8 h-8 rounded-full border-2 transition-transform shadow-xs ${
                                formData.sticker_color === c.color ? 'scale-125 border-purple-600 ring-2 ring-purple-300' : 'border-slate-300 hover:scale-110'
                              }`}
                              style={{ backgroundColor: c.color }}
                              title={c.label}
                            />
                          ))}
                          <label className="cursor-pointer w-8 h-8 rounded-full border-2 border-dashed border-slate-400 hover:border-purple-600 flex items-center justify-center text-slate-400 text-xs font-bold" title="Color personalizado">
                            +
                            <input 
                              type="color" 
                              value={formData.sticker_color} 
                              onChange={(e) => setFormData(prev => ({ ...prev, sticker_color: e.target.value }))} 
                              className="sr-only" 
                            />
                          </label>
                        </div>
                      </div>

                      {/* Forma de las Casillas */}
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Forma de las Casillas</label>
                          <select
                            value={formData.stamp_shape}
                            onChange={(e) => setFormData(prev => ({ ...prev, stamp_shape: e.target.value }))}
                            className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                          >
                            <option value="circle">Círculo Perfecto</option>
                            <option value="squircle">Squircle (Esquinas Suaves)</option>
                            <option value="diamond">Rombo / Diamante Joya</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Casillas Pendientes</label>
                          <select
                            value={formData.unmarked_stamp_style}
                            onChange={(e) => setFormData(prev => ({ ...prev, unmarked_stamp_style: e.target.value }))}
                            className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                          >
                            <option value="dashed_star">Estrellita Tenue Punteada</option>
                            <option value="dashed_circle">Círculo Punteado Minimalista</option>
                            <option value="number">Número Sutil (1, 2, 3...)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* SECCIÓN C: PERSONALIZACIÓN DE LA TARJETA */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Smartphone className="w-4 h-4 text-purple-600" />
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                          3. Estilo Visual de la Tarjeta
                        </h4>
                      </div>

                      {/* Fondo de la Tarjeta */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">Color de Fondo de la Tarjeta</label>
                          <span className="font-mono text-xs font-bold text-slate-500 uppercase">{formData.card_bg_color}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[
                            { color: '#121214', label: 'Negro Noir' },
                            { color: '#2c0b4d', label: 'Púrpura Velvet' },
                            { color: '#420d18', label: 'Vino Borgoña' },
                            { color: '#032d23', label: 'Verde Joya' },
                            { color: '#0f172a', label: 'Azul Noche' },
                            { color: '#1c1917', label: 'Carbón Mate' }
                          ].map(bg => (
                            <button
                              key={bg.color}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, card_bg_color: bg.color }))}
                              className={`w-8 h-8 rounded-full border-2 transition-transform shadow-xs ${
                                formData.card_bg_color === bg.color ? 'scale-125 border-purple-600 ring-2 ring-purple-300' : 'border-slate-300 hover:scale-110'
                              }`}
                              style={{ backgroundColor: bg.color }}
                              title={bg.label}
                            />
                          ))}
                          <label className="cursor-pointer w-8 h-8 rounded-full border-2 border-dashed border-slate-400 hover:border-purple-600 flex items-center justify-center text-slate-400 text-xs font-bold" title="Color de tarjeta personalizado">
                            +
                            <input 
                              type="color" 
                              value={formData.card_bg_color} 
                              onChange={(e) => setFormData(prev => ({ ...prev, card_bg_color: e.target.value }))} 
                              className="sr-only" 
                            />
                          </label>
                        </div>
                      </div>

                      {/* Borde & Resplandor (Glow) */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Borde con Resplandor (Glow Ambiental)</label>
                        <select
                          value={formData.card_border_glow}
                          onChange={(e) => setFormData(prev => ({ ...prev, card_border_glow: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                        >
                          <option value="gold">Oro Real & Brillo Ámbar ✨</option>
                          <option value="pink">Rosa Neón & Fucsia Glamour 🌸</option>
                          <option value="purple">Violeta & Púrpura Luxury 💜</option>
                          <option value="emerald">Verde Esmeralda Joya 💎</option>
                          <option value="none">Sobrio / Borde Tenue sin Brillo</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Términos y Condiciones</label>
                        <input
                          type="text"
                          value={formData.conditions}
                          onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                          className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                          placeholder="Por compras mayores a 10.000 pesos en tienda física"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones inferiores: Descartar & Publicar cambios */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Descartar
                  </button>

                  <div className="flex items-center gap-3">
                    {saveSuccess && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> ¡Publicado!
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-lg shadow-purple-900/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {saving ? 'Publicando...' : 'Publicar cambios'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Panel Derecho: SIMULADOR DE IPHONE REALISTA (Cambia de vista según la pestaña activa!) */}
            <div className="w-full xl:w-[380px] shrink-0 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                  <span>Así lo ve tu cliente ({pageSubTab === 'welcome' ? 'Bienvenida' : pageSubTab === 'register' ? 'Registro' : 'Tarjeta'})</span>
                </span>
                <a
                  href="/"
                  target="_blank"
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                >
                  <span>Abrir web</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Marco de iPhone */}
              <div className="w-[360px] mx-auto rounded-[48px] bg-black p-3.5 shadow-2xl border-[6px] border-[#27272a] relative overflow-hidden">
                {/* Dynamic Island */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80" />
                </div>

                {/* Contenido móvil sincronizado con la sub-pestaña */}
                <div className="rounded-[36px] overflow-hidden bg-[#f8f9fa] max-h-[660px] overflow-y-auto">
                  {pageSubTab === 'welcome' && (
                    <CustomerRegisterModal
                      settings={formData}
                      onCustomerReady={() => setPageSubTab('card')}
                    />
                  )}

                  {pageSubTab === 'register' && (
                    <div className="p-5 bg-white min-h-[500px] flex flex-col justify-center space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-[#121214] flex items-center justify-center font-bold text-amber-300 text-xl mx-auto shadow-md">
                        KM
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 text-center">{formData.register_title}</h3>
                      <p className="text-xs text-slate-500 text-center">{formData.register_subtitle}</p>
                      <div className="space-y-3 pt-2">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-400">Nombre Completo</div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-400">Teléfono / WhatsApp</div>
                        <button className="w-full py-3 rounded-xl bg-[#7c3aed] text-white font-bold text-xs shadow-md">
                          {formData.register_btn_text}
                        </button>
                      </div>
                    </div>
                  )}

                  {pageSubTab === 'card' && (
                    <CustomerCardView
                      settings={formData}
                      customer={{
                        name: 'Valentina',
                        customer_code: '1937',
                        current_stamps: 3,
                        total_stamps_earned: 3
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECCIÓN MÉTRICAS & GRÁFICAS (HOME) ================= */}
        {activeMenu === 'home' && stats && (
          <div className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in">
            <div>
              <h1 className="font-bold text-2xl text-slate-900">Métricas & Rendimiento del Club</h1>
              <p className="text-xs text-slate-500 mt-1">Monitorea el crecimiento de tus clientas, retención y sellos otorgados.</p>
            </div>

            {/* 4 Tarjetas de Métricas Principales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Clientes</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900">{stats.totalCustomers}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+100%</span>
                </div>
                <span className="text-[11px] text-slate-400 block pt-1">Registrados en tienda</span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sellos Otorgados</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-purple-600">{stats.totalStampsGiven}</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-[11px] text-slate-400 block pt-1">Compras registradas</span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Premios Listos (10 Sellos)</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-amber-500">{stats.readyToRedeem}</span>
                  <Gift className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[11px] text-slate-400 block pt-1">Listos para reclamar</span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Premios Entregados</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-emerald-600">{stats.totalRedemptions}</span>
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[11px] text-slate-400 block pt-1">Ciclos completados</span>
              </div>
            </div>

            {/* ================= BLOQUE 1: RITMO DE CLIENTAS (RETENCIÓN) ================= */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span>Quién viene y quién dejó de venir - Ritmo de clientas</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clasificación inteligente según el tiempo promedio entre visitas y compras de cada clienta.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {stats.retention_metrics?.total || stats.totalCustomers} clientas analizadas
                  </span>
                </div>
              </div>

              {/* Barras de Progreso con conteo exacto de cada categoría */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* 1. Nuevos */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-slate-100/60 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                      <span className="font-bold text-slate-800">Nuevos</span>
                      <span className="text-[10px] text-slate-400">1 visita (&lt;30 días)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">
                        {stats.retention_metrics?.counts?.new || 0}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {stats.retention_metrics?.percentages?.new || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-700" 
                      style={{ width: `${stats.retention_metrics?.percentages?.new || 0}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Registrados o primera compra reciente</span>
                    <button 
                      onClick={() => navigateToCustomers('new')}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Ver clientas →
                    </button>
                  </div>
                </div>

                {/* 2. Fieles */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2 hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span className="font-bold text-emerald-950">Fieles</span>
                      <span className="text-[10px] text-emerald-600">5+ visitas regulares</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-emerald-900 text-sm">
                        {stats.retention_metrics?.counts?.loyal || 0}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {stats.retention_metrics?.percentages?.loyal || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                      style={{ width: `${stats.retention_metrics?.percentages?.loyal || 0}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-700/80">
                    <span>Visitan dentro de su ritmo habitual</span>
                    <button 
                      onClick={() => navigateToCustomers('loyal')}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Ver clientas →
                    </button>
                  </div>
                </div>

                {/* 3. Regulares */}
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-2 hover:bg-purple-50 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                      <span className="font-bold text-purple-950">Regulares</span>
                      <span className="text-[10px] text-purple-600">2 a 4 visitas constantes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-purple-900 text-sm">
                        {stats.retention_metrics?.counts?.regular || 0}
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                        {stats.retention_metrics?.percentages?.regular || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-purple-100 overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-700" 
                      style={{ width: `${stats.retention_metrics?.percentages?.regular || 0}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-purple-700/80">
                    <span>Frecuencia constante y activa</span>
                    <button 
                      onClick={() => navigateToCustomers('regular')}
                      className="text-purple-700 font-bold hover:underline"
                    >
                      Ver clientas →
                    </button>
                  </div>
                </div>

                {/* 4. Atrasados (En riesgo) */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 hover:bg-amber-50 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      <span className="font-bold text-amber-950">Atrasados (En riesgo)</span>
                      <span className="text-[10px] text-amber-600">&gt;1.5x ritmo (+14 días)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-900 text-sm">
                        {stats.retention_metrics?.counts?.at_risk || 0}
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        {stats.retention_metrics?.percentages?.at_risk || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-700" 
                      style={{ width: `${stats.retention_metrics?.percentages?.at_risk || 0}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-amber-800">
                    <span>Han tardado más de lo habitual en regresar</span>
                    <button 
                      onClick={() => navigateToCustomers('at_risk')}
                      className="text-amber-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Rescatar</span> →
                    </button>
                  </div>
                </div>

                {/* 5. Dormidos (Inactivos) */}
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2 hover:bg-rose-50 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                      <span className="font-bold text-rose-950">Dormidos (Inactivos)</span>
                      <span className="text-[10px] text-rose-600">&gt;3x ritmo o +60 días</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-rose-900 text-sm">
                        {stats.retention_metrics?.counts?.dormant || 0}
                      </span>
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                        {stats.retention_metrics?.percentages?.dormant || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-rose-100 overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full transition-all duration-700" 
                      style={{ width: `${stats.retention_metrics?.percentages?.dormant || 0}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-rose-800">
                    <span>Llevan mucho tiempo sin visitarnos</span>
                    <button 
                      onClick={() => navigateToCustomers('dormant')}
                      className="text-rose-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Reactivar por WhatsApp</span> →
                    </button>
                  </div>
                </div>

                {/* 6. No regresaron */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-slate-100/60 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                      <span className="font-bold text-slate-800">No regresaron</span>
                      <span className="text-[10px] text-slate-400">1 visita (&gt;90 días)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">
                        {stats.retention_metrics?.counts?.lost || 0}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                        {stats.retention_metrics?.percentages?.lost || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-slate-400 rounded-full transition-all duration-700" 
                      style={{ width: `${stats.retention_metrics?.percentages?.lost || 0}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Vinieron una sola vez hace más de 3 meses</span>
                    <button 
                      onClick={() => navigateToCustomers('all')}
                      className="text-slate-600 font-bold hover:underline"
                    >
                      Ver todos →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= BLOQUE 2: MAPA DE CALOR SEMANAL (HEATMAP) ================= */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>Mapa de Calor Semanal - Afluencia de Clientas</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distribución de visitas y compras registradas por día de la semana y franja horaria.
                  </p>
                </div>
              </div>

              {/* Banner Explicativo: La hora con más visitas */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-300/30 flex items-center justify-center font-bold text-lg shrink-0">
                    🔥
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300 block">
                      HORA PICO DETECTADA
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-white">
                      La hora con más visitas: {stats.heatmap_analytics?.peak?.dayName || 'Sábado'} a las {stats.heatmap_analytics?.peak?.hourLabel || '16:00'}
                    </h4>
                  </div>
                </div>
                <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
                  <span className="text-xs text-indigo-200 font-semibold block">Volumen registrado</span>
                  <span className="font-black text-amber-300 text-lg">
                    {stats.heatmap_analytics?.peak?.count || 7} compras
                  </span>
                </div>
              </div>

              {/* Matriz del Mapa de Calor */}
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[650px] space-y-1.5">
                  {/* Encabezado de Horas (8:00 a 21:00) */}
                  <div className="grid grid-cols-[80px_repeat(14,minmax(0,1fr))] gap-1 text-[10px] font-bold text-slate-400 text-center pb-1">
                    <div className="text-left pl-1">Día / Hora</div>
                    {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(h => (
                      <div key={h} className="truncate">{h}h</div>
                    ))}
                  </div>

                  {/* Filas por Día (Lunes a Domingo) */}
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dayName, dayIndex) => {
                    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
                    return (
                      <div key={dayName} className="grid grid-cols-[80px_repeat(14,minmax(0,1fr))] gap-1 items-center">
                        {/* Nombre del Día */}
                        <div className="text-xs font-bold text-slate-700 truncate pr-2">
                          {dayName}
                        </div>

                        {/* Celdas por hora */}
                        {hours.map(hour => {
                          const cell = stats.heatmap_analytics?.heatmapData?.find(
                            c => c.dayIndex === dayIndex && c.hour === hour
                          );
                          const count = cell?.count || 0;
                          const intensity = cell?.intensity || 0;

                          // Color según intensidad azul/índigo
                          let cellStyle = 'bg-slate-50 text-slate-300 border border-slate-100';
                          if (intensity > 0.75) {
                            cellStyle = 'bg-indigo-600 text-white font-black shadow-sm ring-1 ring-indigo-400';
                          } else if (intensity > 0.45) {
                            cellStyle = 'bg-indigo-400 text-white font-bold';
                          } else if (intensity > 0.2) {
                            cellStyle = 'bg-indigo-200 text-indigo-900 font-semibold';
                          } else if (intensity > 0) {
                            cellStyle = 'bg-blue-100 text-blue-800 font-medium';
                          }

                          return (
                            <div
                              key={hour}
                              title={`${dayName} ${hour}:00 - ${count} compras registradas`}
                              className={`h-8 rounded-lg flex items-center justify-center text-xs transition-all duration-200 hover:scale-105 cursor-pointer ${cellStyle}`}
                            >
                              {count > 0 ? count : ''}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leyenda de Intensidad */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="font-semibold">Leyenda de afluencia:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Menos</span>
                  <div className="w-5 h-5 rounded bg-slate-100 border border-slate-200 text-center text-[10px] leading-5 text-slate-400">0</div>
                  <div className="w-5 h-5 rounded bg-blue-100 text-blue-800 text-center text-[10px] leading-5 font-bold">1</div>
                  <div className="w-5 h-5 rounded bg-indigo-200 text-indigo-900 text-center text-[10px] leading-5 font-bold">3</div>
                  <div className="w-5 h-5 rounded bg-indigo-400 text-white text-center text-[10px] leading-5 font-bold">5</div>
                  <div className="w-5 h-5 rounded bg-indigo-600 text-white text-center text-[10px] leading-5 font-black">7+</div>
                  <span className="text-[10px] text-indigo-600 font-bold ml-1">Pico</span>
                </div>
              </div>
            </div>

            {/* ================= BLOQUE 3: PROGRAMA DE REFERIDOS ================= */}
            <div className="bg-gradient-to-br from-[#121214] to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-400 block">
                  PROGRAMA DE REFERIDOS 2x2
                </span>
                <h3 className="font-bold text-lg text-white leading-tight">
                  Clientes que llegaron por recomendación de amigas
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cada vez que una clienta comparte su código de 4 dígitos y su amiga realiza su primera compra, el sistema otorga 2 sellos de regalo a cada una automáticamente.
                </p>
              </div>
              <div className="text-center sm:text-right shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="text-4xl font-black text-amber-300">
                  {stats.totalReferrals || 0}
                </div>
                <span className="text-xs text-slate-300 font-medium block mt-0.5">
                  referidos exitosos
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECCIÓN CLIENTES ================= */}
        {activeMenu === 'customers' && (
          <div className="p-6 xl:p-8 max-w-6xl mx-auto w-full">
            <CustomerManagement 
              settings={formData} 
              initialFilter={customerFilter}
              onOpenCashierWithCustomer={() => setActiveMenu('scanner')} 
            />
          </div>
        )}

        {/* ================= SECCIÓN CAJA / MARCAR SELLO ================= */}
        {activeMenu === 'scanner' && (
          <div className="p-6 max-w-xl mx-auto w-full">
            <CashierScanner settings={formData} />
          </div>
        )}

        {/* ================= SECCIÓN QR DE UNIÓN ================= */}
        {activeMenu === 'poster' && (
          <div className="p-6 max-w-2xl mx-auto w-full">
            <StorePoster settings={formData} />
          </div>
        )}
      </main>
    </div>
  );
}
