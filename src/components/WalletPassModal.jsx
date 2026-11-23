import React, { useState, useRef } from 'react';
import { Smartphone, Download, QrCode, Check, Share, ArrowRight, ExternalLink } from 'lucide-react';
import { generateQrDataUrl } from '../utils/themeUtils';

export default function WalletPassModal({ customer, settings, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardCanvasRef = useRef(null);

  // Descargar tarjeta digital como pase de imagen para la galería o billetera de fotos
  const downloadDigitalPassImage = async () => {
    setDownloading(true);
    try {
      const qrDataUrl = await generateQrDataUrl(customer?.customer_code || 'KASS-0000', {
        width: 300,
        darkColor: '#0f172a'
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 600;
      canvas.height = 900;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 600, 900);
      gradient.addColorStop(0, settings?.primary_color || '#831843');
      gradient.addColorStop(1, '#090d16');
      ctx.fillStyle = gradient;
      ctx.roundRect ? ctx.roundRect(0, 0, 600, 900, 35) : ctx.fillRect(0, 0, 600, 900);
      ctx.fill();

      // Border
      ctx.lineWidth = 4;
      ctx.strokeStyle = settings?.secondary_color || '#db2777';
      ctx.stroke();

      // Header Brand
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(settings?.name || 'Kass moda y estilo', 300, 80);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '18px sans-serif';
      ctx.fillText(settings?.slogan || 'Moda, elegancia y tendencia', 300, 115);

      // Customer info box
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.roundRect ? ctx.roundRect(50, 150, 500, 100, 20) : ctx.fillRect(50, 150, 500, 100);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CLIENTE VIP', 80, 185);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(customer?.name || 'Cliente', 80, 220);

      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '14px sans-serif';
      ctx.fillText('CÓDIGO', 520, 185);

      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(customer?.customer_code || 'KASS-0000', 520, 220);

      // Stamps progress
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Sellos acumulados: ${customer?.current_stamps || 0} de ${settings?.stamps_target || 10}`, 300, 290);

      // White QR Box
      ctx.fillStyle = '#ffffff';
      ctx.roundRect ? ctx.roundRect(150, 330, 300, 300, 25) : ctx.fillRect(150, 330, 300, 300);
      ctx.fill();

      // Draw QR Image
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 165, 345, 270, 270);

        // Footer instructions
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Georgia, serif';
        ctx.fillText('Muestra este código al pagar en tienda', 300, 680);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '16px sans-serif';
        ctx.fillText('10 sellos = Reclama tu premio exclusivo', 300, 720);

        // Benefits banner
        ctx.fillStyle = 'rgba(244, 114, 182, 0.2)';
        ctx.roundRect ? ctx.roundRect(50, 760, 500, 80, 18) : ctx.fillRect(50, 760, 500, 80);
        ctx.fill();

        ctx.fillStyle = '#fbcfe8';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('✨ Amigos referidos ganan 2 sellos de regalo', 300, 805);

        // Trigger download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Pase_Kass_Moda_${customer?.customer_code}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccess(true);
        setDownloading(false);
        setTimeout(() => setDownloadSuccess(false), 3500);
      };
      qrImg.src = qrDataUrl;
    } catch (e) {
      console.error(e);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 max-w-md w-full relative shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Smartphone className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
            Lleva tu Tarjeta en el Celular
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Para que no tengas que buscar el link cada vez que visites <strong>{settings?.name || 'Kass moda y estilo'}</strong>
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Option 1: Add to Home Screen (Universal PWA Wallet) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                Opción 1: Guardar en tu Pantalla de Inicio
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300">
                Recomendada
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              En tu navegador (Chrome o Safari), toca el botón <strong>Compartir / Opciones (⋮ o ⎋)</strong> y selecciona <strong>"Agregar a pantalla de inicio"</strong>. Tendrás el icono directo de Kass Moda como una app nativa con tu saldo siempre actualizado.
            </p>
          </div>

          {/* Option 2: Apple Wallet & Google Wallet pass card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Opción 2: Descargar Pase Digital VIP (Offline)
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Genera una tarjeta oficial en alta resolución con tu código QR para guardarla en tu galería de fotos o álbum de boletos de tu celular. Podrás mostrarla en caja incluso si no tienes datos o internet.
            </p>

            <button
              onClick={downloadDigitalPassImage}
              disabled={downloading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {downloading ? (
                <span>Generando pase...</span>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡Pase Guardado con Éxito!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar Pase VIP en Imagen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
