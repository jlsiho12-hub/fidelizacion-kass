import React, { useState, useEffect } from 'react';
import { Printer, Sparkles, Gift, QrCode, Share2, Download } from 'lucide-react';
import { generateQrDataUrl } from '../../utils/themeUtils';

export default function StorePoster({ settings }) {
  const [storeQrUrl, setStoreQrUrl] = useState('');
  const origin = window.location.origin;
  const storeRegisterUrl = `${origin}/`;

  useEffect(() => {
    generateQrDataUrl(storeRegisterUrl, { 
      width: 450,
      margin: 1,
      darkColor: settings?.primary_color || '#831843'
    }).then(url => {
      setStoreQrUrl(url || '');
    });
  }, [storeRegisterUrl, settings]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="no-print flex items-center justify-between glass-panel p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-pink-400" />
            Póster QR para Mostrador / Caja
          </h2>
          <p className="text-xs text-slate-400">
            Imprime este cartel y colócalo en el mostrador de <strong>{settings?.name || 'Kass moda y estilo'}</strong> para que los clientes escaneen y se registren.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-5 py-3 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-900/40 flex items-center gap-2 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Cartel</span>
        </button>
      </div>

      {/* The Printable Poster Container */}
      <div className="printable-area max-w-lg mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border-4 border-slate-200 text-center relative overflow-hidden">
        {/* Decorative corner accent */}
        <div 
          className="absolute -top-14 -right-14 w-36 h-36 rounded-full opacity-10"
          style={{ backgroundColor: settings?.primary_color || '#831843' }}
        />
        <div 
          className="absolute -bottom-14 -left-14 w-36 h-36 rounded-full opacity-10"
          style={{ backgroundColor: settings?.secondary_color || '#db2777' }}
        />

        {/* Brand Header */}
        <div className="mb-6 relative z-10">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={settings.name || 'Kass moda y estilo'} 
              className="w-20 h-20 rounded-2xl mx-auto mb-3 object-cover shadow-md border-2"
              style={{ borderColor: settings?.primary_color || '#831843' }}
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center font-serif text-3xl font-bold text-white shadow-lg"
              style={{ backgroundColor: settings?.primary_color || '#831843' }}
            >
              {(settings?.name || 'KM').substring(0, 2).toUpperCase()}
            </div>
          )}

          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {settings?.name || 'Kass moda y estilo'}
          </h1>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-widest mt-1">
            {settings?.slogan || 'Moda, elegancia y tendencia'}
          </p>
        </div>

        {/* Call to action */}
        <div className="my-5 py-2 px-4 rounded-full bg-pink-50 border border-pink-200 inline-block">
          <span className="text-xs sm:text-sm font-extrabold text-pink-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-600" />
            ¡CLUB DE FIDELIZACIÓN & PREMIOS!
          </span>
        </div>

        {/* Big QR Code */}
        <div className="my-4 p-4 bg-white rounded-3xl border-2 border-slate-900 inline-block shadow-xl relative z-10">
          {storeQrUrl ? (
            <img 
              src={storeQrUrl} 
              alt="QR Kass moda y estilo" 
              className="w-56 h-56 sm:w-64 sm:h-64 mx-auto"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-slate-400">
              Generando código QR...
            </div>
          )}
        </div>

        <p className="font-serif text-lg font-bold text-slate-900 mt-2">
          📱 Escanea aquí con la cámara de tu celular
        </p>

        {/* 3 Steps instructions */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-200 text-left">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">
              1
            </span>
            <h4 className="font-bold text-[11px] text-slate-900">Escanea</h4>
            <p className="text-[10px] text-slate-600 leading-tight">Abre tu tarjeta digital gratis en 10 seg.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">
              2
            </span>
            <h4 className="font-bold text-[11px] text-slate-900">Compra</h4>
            <p className="text-[10px] text-slate-600 leading-tight">Acumula 1 sello en cada compra.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-6 h-6 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">
              3
            </span>
            <h4 className="font-bold text-[11px] text-slate-900">Gana</h4>
            <p className="text-[10px] text-slate-600 leading-tight">10 sellos = Descuentos, bonos o regalos.</p>
          </div>
        </div>

        {/* Referral Highlight Footer */}
        <div className="mt-5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
          🎁 <strong>¡Gana 2 sellos extra!</strong> Invita a tus amigas/os con tu código y ambos recibirán 2 sellos de regalo cuando compren.
        </div>
      </div>
    </div>
  );
}
