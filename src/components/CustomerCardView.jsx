import React, { useState, useEffect } from 'react';
import { 
  Share2, QrCode, Copy, Check, MessageCircle,
  MapPin, Phone, Users, Sparkles, Gift, ChevronDown, ChevronUp,
  RotateCcw, History, Award, Smartphone, Star
} from 'lucide-react';
import LoyaltyCard from './LoyaltyCard';
import WalletPassModal from './WalletPassModal';
import { generateQrDataUrl } from '../utils/themeUtils';

export default function CustomerCardView({ 
  customer, 
  settings, 
  onRefreshCustomer,
  onSwitchCustomer 
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customerQrUrl, setCustomerQrUrl] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null); // 'how', 'conditions'

  const origin = window.location.origin;
  const referralLink = `${origin}/?ref=${customer?.customer_code || ''}`;

  useEffect(() => {
    if (customer?.customer_code) {
      generateQrDataUrl(customer.customer_code, { width: 300 }).then(url => {
        setCustomerQrUrl(url || '');
      });
    }
  }, [customer]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola! Te invito a disfrutar de lo mejor en moda con ${settings?.name || 'Kass moda y estilo'} ✨🛍️\n\n` +
      `Al pagar tu primera compra, solo di mi código de invitación: *${customer?.customer_code}* o regístrate aquí:\n` +
      `${referralLink}\n\n` +
      `¡Ambos ganamos 2 sellos de regalo para reclamar premios y descuentos! 🎁👗`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const defaultBanner = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f8f9fa] text-slate-900 pb-20 shadow-xl overflow-hidden font-sans">
      {/* 1. BANNER DE PORTADA (Estilo Imagen 1) */}
      <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden">
        <img 
          src={settings?.banner_url || defaultBanner} 
          alt="Portada Kass Moda" 
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        {/* Switch customer discrete button */}
        <button
          onClick={onSwitchCustomer}
          className="absolute top-3 right-3 text-[11px] font-semibold bg-black/50 hover:bg-black/70 text-white/90 backdrop-blur-md px-3 py-1 rounded-full transition-all"
        >
          Cambiar cliente
        </button>
      </div>

      {/* 2. LOGO FLOTANTE & NOMBRE DEL NEGOCIO (Estilo Imagen 1: "NOIR / Café Aurora") */}
      <div className="px-5 relative -mt-12 pb-4">
        <div className="flex items-end justify-between mb-3">
          {/* Logo Circular/Squircle */}
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={settings?.name || 'Logo'} 
              className="w-20 h-20 rounded-3xl object-cover border-4 border-[#f8f9fa] shadow-xl bg-black"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-[#121214] border-4 border-[#f8f9fa] shadow-xl flex items-center justify-center font-serif text-2xl font-black text-amber-300">
              {(settings?.name || 'KM').substring(0, 2).toUpperCase()}
            </div>
          )}

          {/* Quick wallet/save button */}
          <button
            onClick={() => setShowWalletModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-pink-600 text-xs font-bold shadow-sm transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-pink-600" />
            <span>Guardar en Celular</span>
          </button>
        </div>

        {/* Nombre y descripción */}
        <h1 className="font-bold text-2xl text-slate-900 tracking-tight leading-tight">
          {settings?.name || 'Kass moda y estilo'}
        </h1>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {settings?.slogan || 'Moda de especialidad y tendencia. Ambiente acogedor y lo mejor en prendas y accesorios.'}
        </p>
      </div>

      {/* 3. TARJETA: PROGRAMA DE FIDELIZACIÓN (Estilo Imagen 1: "Lleva un Café Gratis") */}
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

      {/* 4. TARJETA DIGITAL DE SELLOS NEGRA (Estilo Imagen 1 y 3) */}
      <div className="px-5 mb-5">
        <LoyaltyCard 
          settings={settings} 
          customer={customer} 
        />
      </div>

      {/* 5. CÓDIGO QR: "MUÉSTRALO EN CAJA" (Estilo Imagen 3) */}
      <div className="px-5 mb-5 text-center">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm inline-block w-full">
          {customerQrUrl ? (
            <img src={customerQrUrl} alt="QR Cliente" className="w-48 h-48 mx-auto" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400 mx-auto">Cargando QR...</div>
          )}
          <p className="font-bold text-xs text-slate-900 mt-2">
            Muéstralo en caja
          </p>
          <p className="text-[11px] text-slate-400">
            El cajero lo escaneará para sumarte sellos
          </p>
        </div>
      </div>

      {/* 6. TU CÓDIGO DE INVITACIÓN (Exacto a la Imagen 5) */}
      <div className="px-5 mb-5">
        <div className="bg-[#121214] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-white/10 flex items-center justify-between gap-3">
          <div className="space-y-1 pr-2">
            <h4 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
              <span>Tu código de invitación</span>
            </h4>
            <p className="text-[11px] text-white/60 leading-tight">
              Tu amigo lo dice al pagar su primera compra. Ganas 2 sellos (máx. 5 al mes).
            </p>
            <button
              onClick={shareViaWhatsApp}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-400 hover:text-pink-300 pt-1"
            >
              <Share2 className="w-3 h-3" />
              <span>Compartir en WhatsApp</span>
            </button>
          </div>

          {/* Los 4 dígitos dorados grandes (Imagen 5) */}
          <div className="text-right shrink-0">
            <div 
              onClick={() => copyToClipboard(customer?.customer_code, 'code')}
              className="cursor-pointer font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-widest bg-white/5 py-1.5 px-3 rounded-xl border border-amber-300/30 hover:border-amber-300 transition-all flex items-center gap-1.5"
              title="Clic para copiar"
            >
              <span>{customer?.customer_code || '0197'}</span>
              {copiedCode && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <span className="text-[9px] text-white/40 block mt-1">Toca para copiar</span>
          </div>
        </div>
      </div>

      {/* 7. TARJETA DE RECOMPENSA (Estilo cupón punteado de Imagen 3) */}
      <div className="px-5 mb-5">
        <div className="bg-white rounded-2xl p-4 border-2 border-dashed border-slate-300 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 block">
              TU PREMIO
            </span>
            <h4 className="font-bold text-sm text-slate-900">
              {settings?.reward_description || '20% de Descuento en tu próxima prenda'}
            </h4>
            <span className="text-[11px] text-slate-500">
              Al completar {settings?.stamps_target || 10} sellos
            </span>
          </div>
          <div className="text-right font-mono font-bold text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
            {customer?.current_stamps || 0}/{settings?.stamps_target || 10}
          </div>
        </div>
      </div>

      {/* 8. ACORDEONES: CÓMO FUNCIONA & CONDICIONES (Estilo Imagen 3) */}
      <div className="px-5 space-y-2 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setOpenAccordion(openAccordion === 'how' ? null : 'how')}
            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800"
          >
            <span>📖 Cómo funciona</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordion === 'how' ? 'rotate-180' : ''}`} />
          </button>
          {openAccordion === 'how' && (
            <div className="px-3.5 pb-3.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5 space-y-1">
              <p>• 1 compra = 1 sello en tu tarjeta.</p>
              <p>• Invita a tus amigos con tu código de 4 dígitos ({customer?.customer_code}).</p>
              <p>• Cuando tu amigo compre, ¡ambos ganan 2 sellos de regalo!</p>
              <p>• Al completar 10 sellos, reclama tu recompensa en caja.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setOpenAccordion(openAccordion === 'conditions' ? null : 'conditions')}
            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800"
          >
            <span>📋 Condiciones</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordion === 'conditions' ? 'rotate-180' : ''}`} />
          </button>
          {openAccordion === 'conditions' && (
            <div className="px-3.5 pb-3.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
              <p>{settings?.conditions || 'Válido en compras en tienda física. Presenta tu tarjeta digital o código antes de pagar. Los beneficios no son acumulables con otras ofertas.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Wallet Pass / Save to mobile */}
      {showWalletModal && (
        <WalletPassModal
          customer={customer}
          settings={settings}
          onClose={() => setShowWalletModal(false)}
        />
      )}
    </div>
  );
}
