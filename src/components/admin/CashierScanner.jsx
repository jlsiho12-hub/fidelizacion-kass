import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Search, UserCheck, PlusCircle, Gift, Sparkles, 
  CheckCircle2, AlertCircle, ShoppingCart, User, Phone, X, Award,
  Check, ArrowLeft, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import LoyaltyCard from '../LoyaltyCard';

export default function CashierScanner({ settings }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Camera scanner
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  // Referral code input as 4 boxes (Imagen 2)
  const [refDigits, setRefDigits] = useState(['', '', '', '']);
  const digitRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Success stamp marked screen (Imagen 4)
  const [stampResult, setStampResult] = useState(null); // { customer, isComplete, appliedReferral, referrerName }
  const [isSubmittingStamp, setIsSubmittingStamp] = useState(false);

  // Redeem modal state
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState('');
  const [customReward, setCustomReward] = useState('');
  const [rewardDetails, setRewardDetails] = useState('');
  const [isSubmittingRedeem, setIsSubmittingRedeem] = useState(false);

  const availableRewards = settings?.rewards_list || [
    "20% de Descuento en tu próxima prenda",
    "Bono de $30.000 para tu compra",
    "Accesorio o Prenda de Regalo seleccionada"
  ];

  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  const startCameraScanner = async () => {
    try {
      setScanning(true);
      setError('');
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopCameraScanner();
          handleSearchCustomer(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setError('No se pudo acceder a la cámara. Puedes escribir el código o teléfono manualmente.');
      setScanning(false);
    }
  };

  const stopCameraScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {}).then(() => {
        html5QrCodeRef.current?.clear();
        html5QrCodeRef.current = null;
      });
    }
    setScanning(false);
  };

  const handleSearchCustomer = async (term) => {
    const query = term || searchQuery;
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setStampResult(null);

    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Cliente no encontrado');
      }

      setCustomer(data);
      // Si el cliente ya tenía un referido, pre-llenar los 4 dígitos
      if (data.referred_by_code && data.referred_by_code.length >= 4) {
        const clean = data.referred_by_code.replace(/[^0-9]/g, '').slice(-4);
        if (clean.length === 4) {
          setRefDigits(clean.split(''));
        }
      } else {
        setRefDigits(['', '', '', '']);
      }
    } catch (err) {
      setError(err.message);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  // Manejador de las 4 casillas de código de referido (tipo OTP)
  const handleDigitChange = (index, value) => {
    const val = value.slice(-1); // solo 1 dígito
    const newDigits = [...refDigits];
    newDigits[index] = val;
    setRefDigits(newDigits);

    // Auto-focus en el siguiente cuadro
    if (val && index < 3) {
      digitRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !refDigits[index] && index > 0) {
      digitRefs[index - 1].current?.focus();
    }
  };

  // MARCAR SELLO (Idéntico a Imagen 2)
  const handleMarkStamp = async () => {
    if (!customer) return;
    setIsSubmittingStamp(true);
    setError('');

    // Si escribió un código de 4 dígitos de referido en las casillas y no lo tenía
    const typedRefCode = refDigits.join('');
    if (typedRefCode.length === 4 && !customer.referred_by_code) {
      try {
        await fetch(`/api/customers/${customer.id}/update-ref`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referred_by_code: typedRefCode })
        });
      } catch (e) {
        // no-op
      }
    }

    try {
      const res = await fetch(`/api/customers/${customer.id}/stamp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stamps_to_add: 1,
          note: 'Compra en tienda Kass moda y estilo'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al agregar sellos');

      const isTargetReached = data.customer.current_stamps >= (settings?.stamps_target || 10);

      // Lanzar confeti de celebración
      confetti({
        particleCount: isTargetReached ? 150 : 70,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6']
      });

      // Pasar a la pantalla de éxito (Imagen 4)
      setStampResult({
        customer: data.customer,
        isComplete: isTargetReached,
        appliedReferral: data.appliedReferralBonus,
        referrerName: data.referrerAwarded?.name
      });
      setCustomer(data.customer);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmittingStamp(false);
    }
  };

  // CANJEAR PREMIO (Imagen 4 -> Canjear)
  const handleRedeemReward = async () => {
    const cust = stampResult?.customer || customer;
    if (!cust) return;

    const finalReward = selectedReward === 'custom' ? customReward : (selectedReward || availableRewards[0]);

    setIsSubmittingRedeem(true);
    try {
      const res = await fetch(`/api/customers/${cust.id}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reward_title: finalReward,
          details: rewardDetails.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al canjear');

      confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
      setShowRedeemModal(false);
      setStampResult(null);
      setCustomer(data.customer);
      alert(`🎉 ¡Premio canjeado con éxito para ${data.customer.name}! Se descontaron los 10 sellos.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingRedeem(false);
    }
  };

  // ================= PANTALLA 1: ÉXITO "¡SELLO MARCADO!" (Imagen 4) =================
  if (stampResult) {
    const target = settings?.stamps_target || 10;
    const isCompleted = stampResult.customer.current_stamps >= target;

    return (
      <div className="max-w-md mx-auto bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-200 space-y-6">
        {/* Círculo amarillo grande con check (Imagen 4) */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 flex items-center justify-center mx-auto shadow-xl ring-8 ring-amber-100">
          <Check className="w-10 h-10 stroke-[3.5]" />
        </div>

        <div>
          <h2 className="font-extrabold text-2xl text-slate-950 tracking-tight">
            ¡Sello marcado!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isCompleted 
              ? `${stampResult.customer.name} completó su tarjeta 🎉`
              : `${stampResult.customer.name} acumuló su nuevo sello`
            }
          </p>

          {stampResult.appliedReferral && (
            <div className="mt-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-medium">
              🎁 ¡Bono de referidos aplicado! Ambos ganaron 2 sellos de regalo.
            </div>
          )}
        </div>

        {/* Tarjeta negra con los sellos (Imagen 4) */}
        <LoyaltyCard 
          settings={settings} 
          customer={stampResult.customer} 
        />

        {/* Botones de acción */}
        <div className="space-y-2.5 pt-2">
          {isCompleted && (
            <button
              onClick={() => setShowRedeemModal(true)}
              className="w-full py-4 rounded-2xl bg-slate-950 hover:bg-black text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>🎁 Canjear ahora</span>
            </button>
          )}

          <button
            onClick={() => {
              setStampResult(null);
              setCustomer(null);
              setSearchQuery('');
            }}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            ← Atender a otro cliente
          </button>
        </div>

        {/* Modal de canje */}
        {showRedeemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-white text-left space-y-4">
              <h3 className="font-bold text-lg text-white">Selecciona el Premio:</h3>
              <div className="space-y-2">
                {availableRewards.map((rew, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-700 bg-slate-800 text-xs cursor-pointer">
                    <input type="radio" name="rw" defaultChecked={idx === 0} onChange={() => setSelectedReward(rew)} />
                    <span>{rew}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowRedeemModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">
                  Cancelar
                </button>
                <button onClick={handleRedeemReward} disabled={isSubmittingRedeem} className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md">
                  {isSubmittingRedeem ? 'Canjeando...' : 'Confirmar Canje'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= PANTALLA 2: CLIENTE ENCONTRADO / MARCAR SELLO (Imagen 2) =================
  if (customer) {
    const target = settings?.stamps_target || 10;
    const isFirstVisit = customer.total_stamps_earned === 0;

    return (
      <div className="max-w-md mx-auto bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in duration-200 space-y-6 font-sans">
        {/* Header estilo Imagen 2: "< Marcar sello" */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <button
            onClick={() => setCustomer(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Marcar sello</span>
          </button>
          <span className="text-[11px] font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600">
            Cód: {customer.customer_code}
          </span>
        </div>

        {/* Ficha del cliente (Imagen 2: Inicial, Nombre, Teléfono, Badge Primera Visita) */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {customer.name}
              </h3>
              {isFirstVisit && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase">
                  Primera visita
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {customer.phone}
            </p>
          </div>
        </div>

        {/* Fila de sellos con el nuevo sello resaltado (Imagen 2) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2.5">
            <span>Sellos actuales: {customer.current_stamps}/{target}</span>
            <span className="text-purple-600 font-bold">+1 al marcar</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: Math.min(5, target) }).map((_, i) => {
              const stampNum = i + 1;
              const isAlreadyEarned = stampNum <= customer.current_stamps;
              const isNewBeingMarked = stampNum === customer.current_stamps + 1;

              if (isAlreadyEarned) {
                return (
                  <div key={i} className="aspect-square rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                );
              }
              if (isNewBeingMarked) {
                return (
                  <div key={i} className="aspect-square rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md ring-4 ring-amber-200 animate-pulse">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                );
              }
              return (
                <div key={i} className="aspect-square rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-white" />
              );
            })}
          </div>
        </div>

        {/* Sección: ¿Viene invitado por alguien? con 4 casillas grandes OTP (Imagen 2) */}
        {(!customer.referred_by_code || customer.referral_bonus_applied === 0) && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                ¿Viene invitado por alguien?
              </h4>
              <p className="text-[11px] text-slate-500">
                Código de quien lo invitó (4 dígitos)
              </p>
            </div>

            {/* 4 casillas cuadradas grandes (Imagen 2) */}
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  ref={digitRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={refDigits[idx]}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-2xl bg-white border-2 border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-slate-900 outline-none transition-all shadow-sm"
                />
              ))}
            </div>

            {refDigits.join('').length === 4 && (
              <p className="text-[11px] text-purple-700 font-bold text-center">
                ✨ ¡Código {refDigits.join('')} ingresado! Ambos recibirán 2 sellos extra.
              </p>
            )}
          </div>
        )}

        {/* Botón morado grande: "+ Marcar sello" (Imagen 2) */}
        <button
          onClick={handleMarkStamp}
          disabled={isSubmittingStamp}
          className="w-full py-4 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-base shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmittingStamp ? (
            <span>Marcando sello...</span>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>+ Marcar sello</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // ================= PANTALLA 3: BUSCADOR INICIAL =================
  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4 font-sans">
        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-600" />
          <span>Buscar Cliente para Marcar Sello</span>
        </h2>
        <p className="text-xs text-slate-500">
          Escribe el <strong>código de 4 dígitos</strong>, <strong>teléfono</strong> o <strong>nombre</strong> del cliente, o escanea su QR:
        </p>

        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchCustomer()}
              placeholder="Ej. 1937 o 300 123 4567..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 font-mono transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSearchCustomer()}
              disabled={loading}
              className="py-3 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar Cliente'}
            </button>
            <button
              onClick={scanning ? stopCameraScanner : startCameraScanner}
              className="py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4 text-purple-600" />
              <span>{scanning ? 'Detener' : 'Escanear QR'}</span>
            </button>
          </div>
        </div>

        {/* Escáner de cámara si está encendido */}
        {scanning && (
          <div className="mt-3 p-3 rounded-2xl bg-slate-100 text-center">
            <div id="qr-reader-container" className="mx-auto max-w-xs overflow-hidden rounded-xl" />
            <p className="text-[11px] text-slate-500 mt-2">Apunta al código QR del cliente</p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
