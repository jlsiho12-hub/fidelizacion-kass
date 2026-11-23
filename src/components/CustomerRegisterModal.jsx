import React, { useState, useEffect } from 'react';
import { Sparkles, User, Phone, ArrowRight, Star, Gift, Check } from 'lucide-react';
import LoyaltyCard from './LoyaltyCard';

export default function CustomerRegisterModal({ 
  settings, 
  initialReferralCode = '', 
  onCustomerReady 
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode.toUpperCase());
    }
  }, [initialReferralCode]);

  const defaultBanner = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop";

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Por favor ingresa tu nombre y número de teléfono.');
      return;
    }

    setLoading(true);
    setError('');

    const cleanRef = referralCode.trim() ? referralCode.trim().toUpperCase() : undefined;

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          referred_by_code: cleanRef
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.customer) {
          onCustomerReady(data.customer);
          return;
        }
        throw new Error(data.error || 'Error al crear la tarjeta');
      }

      onCustomerReady(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f8f9fa] text-slate-900 pb-20 shadow-xl overflow-hidden font-sans">
      {/* 1. PORTADA SUPERIOR (Imagen 1) */}
      <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden">
        <img 
          src={settings?.banner_url || defaultBanner} 
          alt="Portada Kass Moda" 
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* 2. LOGO FLOTANTE & NOMBRE (Imagen 1) */}
      <div className="px-5 relative -mt-12 pb-4">
        {settings?.logo_url ? (
          <img 
            src={settings.logo_url} 
            alt={settings?.name || 'Logo'} 
            className="w-20 h-20 rounded-3xl object-cover border-4 border-[#f8f9fa] shadow-xl bg-black mb-3"
          />
        ) : (
          <div className="w-20 h-20 rounded-3xl bg-[#121214] border-4 border-[#f8f9fa] shadow-xl flex items-center justify-center font-serif text-2xl font-black text-amber-300 mb-3">
            {(settings?.name || 'KM').substring(0, 2).toUpperCase()}
          </div>
        )}

        <h1 className="font-bold text-2xl text-slate-900 tracking-tight leading-tight">
          {settings?.name || 'Kass moda y estilo'}
        </h1>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {settings?.slogan || 'Moda de especialidad y tendencia. Ambiente acogedor y lo mejor en prendas y accesorios.'}
        </p>
      </div>

      {/* 3. TARJETA PROGRAMA DE FIDELIZACIÓN (Imagen 1) */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-stone-950 shadow-md shrink-0">
            <Star className="w-6 h-6 fill-stone-950 text-stone-950" />
          </div>
          <div className="flex-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
              PROGRAMA DE FIDELIZACIÓN
            </span>
            <h3 className="font-bold text-sm text-slate-900 leading-tight">
              {settings?.program_name || 'Lleva un Premio Gratis'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {settings?.how_it_works || `Junta ${settings?.stamps_target || 10} sellos y gánate un regalo exclusivo`}
            </p>
          </div>
        </div>
      </div>

      {/* 4. PREVIEW DE TARJETA NEGRA DE SELLOS (Imagen 1) */}
      <div className="px-5 mb-6">
        <LoyaltyCard 
          settings={settings} 
          customer={{ name: 'Cliente Nuevo', customer_code: '0000', current_stamps: 0 }} 
          previewStamps={0}
        />
      </div>

      {/* 5. BOTÓN ENTRAR O FORMULARIO DE REGISTRO EN 2 PASOS */}
      <div className="px-5">
        {!showForm ? (
          <div className="space-y-4">
            {initialReferralCode && !showForm && (
              <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-300 text-pink-900 text-xs font-bold flex items-center gap-2 animate-pulse">
                <Gift className="w-4 h-4 text-pink-600 shrink-0" />
                <span>¡Invitación especial! Código {initialReferralCode} detectado (+2 sellos de regalo).</span>
              </div>
            )}

            {/* Botón negro grande "Entrar" (Idéntico a la Imagen 1) */}
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 rounded-2xl bg-[#121214] hover:bg-black text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>{settings?.welcome_btn_text || 'Entrar / Obtener mi tarjeta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-400 text-center font-medium">
              Powered by Kass Moda
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {settings?.register_title || 'Registra tu Tarjeta en 10 segundos'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {settings?.register_subtitle || 'Solo ingresa tus datos. Tu tarjeta quedará guardada en tu celular.'}
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Valentina López"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 300 123 4567"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* ¿Viene invitado por alguien? Código de quien lo invitó (Estilo exacto Imagen 2) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50/50 border border-purple-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>¿Viene invitado por alguien?</span>
                </label>
                <span className="text-[10px] font-black text-pink-700 bg-white px-2 py-0.5 rounded-full border border-pink-200 shadow-xs">
                  +2 sellos de regalo 🎁
                </span>
              </div>
              
              <p className="text-[11px] text-slate-500 leading-tight">
                Código de quien te invitó (4 dígitos). Ambas recibirán 2 sellos extra al pagar tu primera compra.
              </p>

              <div className="pt-1">
                <input
                  type="text"
                  maxLength={6}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.replace(/[^0-9A-Za-z]/g, '').toUpperCase())}
                  placeholder="Código (ej. 1937 o dejar vacío)"
                  className="w-full bg-white border-2 border-purple-300 focus:border-purple-600 rounded-2xl py-2.5 px-4 text-center font-mono font-black text-base tracking-widest text-slate-900 placeholder:text-slate-300 placeholder:font-sans placeholder:text-xs placeholder:tracking-normal focus:outline-none shadow-sm transition-all"
                />
              </div>

              {referralCode && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-xl border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Código de amiga vinculado: <strong>{referralCode}</strong></span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creando tarjeta...' : (settings?.register_btn_text || '¡Listo! Ver mi tarjeta')}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 pt-1"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
