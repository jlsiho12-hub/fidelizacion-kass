import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Download, Gift, Award, Eye, 
  Sparkles, CheckCircle2, ChevronRight, Phone, Calendar,
  MessageCircle, ArrowUpRight, Filter, Star, Clock
} from 'lucide-react';

export default function CustomerManagement({ 
  settings, 
  onOpenCashierWithCustomer,
  initialFilter = 'all'
}) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter); // 'all', 'ready', 'at_risk', 'dormant', 'loyal', 'regular', 'new', 'referred'
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);

  // Sincronizar initialFilter si cambia desde el padre
  useEffect(() => {
    if (initialFilter) setFilter(initialFilter);
  }, [initialFilter]);

  // New customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newReferralCode, setNewReferralCode] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  // Cargar detalles de un cliente
  const handleOpenDetails = async (cust) => {
    try {
      const res = await fetch(`/api/customers/${cust.id}`);
      const data = await res.json();
      setSelectedCustomerDetails(data);
    } catch (e) {
      setSelectedCustomerDetails(cust);
    }
  };

  // Filtrado inteligente por ritmo de visitas y estado
  const target = settings?.stamps_target || 10;
  const filteredCustomers = customers.filter(c => {
    if (filter === 'ready') return c.current_stamps >= target;
    if (filter === 'at_risk') return c.segment?.key === 'at_risk';
    if (filter === 'dormant') return c.segment?.key === 'dormant';
    if (filter === 'loyal') return c.segment?.key === 'loyal';
    if (filter === 'regular') return c.segment?.key === 'regular';
    if (filter === 'new') return c.segment?.key === 'new';
    if (filter === 'referred') return Boolean(c.referred_by_code);
    return true;
  });

  // Métricas rápidas por ritmo
  const readyCount = customers.filter(c => c.current_stamps >= target).length;
  const atRiskCount = customers.filter(c => c.segment?.key === 'at_risk').length;
  const dormantCount = customers.filter(c => c.segment?.key === 'dormant').length;
  const loyalCount = customers.filter(c => c.segment?.key === 'loyal').length;
  const regularCount = customers.filter(c => c.segment?.key === 'regular').length;
  const newCount = customers.filter(c => c.segment?.key === 'new').length;
  const referredCount = customers.filter(c => Boolean(c.referred_by_code)).length;

  // Registrar cliente manual
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      setAddError('Nombre y teléfono son obligatorios.');
      return;
    }

    setAddLoading(true);
    setAddError('');

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim() || undefined,
          referred_by_code: newReferralCode.trim() ? newReferralCode.trim().toUpperCase() : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear cliente');

      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewReferralCode('');
      fetchCustomers();
      if (onOpenCashierWithCustomer) {
        onOpenCashierWithCustomer(data);
      }
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  // Exportar a CSV
  const exportToCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Código', 'Nombre', 'Teléfono', 'Email', 'Sellos Actuales', 'Total Sellos', 'Tarjetas Completadas', 'Referido Por', 'Fecha Registro'];
    const rows = customers.map(c => [
      c.customer_code,
      `"${c.name.replace(/"/g, '""')}"`,
      c.phone,
      c.email || '',
      c.current_stamps,
      c.total_stamps_earned,
      c.cards_completed,
      c.referred_by_code || '',
      c.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clientes_kass_moda_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openWhatsApp = (phone, name) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`¡Hola ${name}! Te escribimos de Kass moda y estilo ✨ Tienes sellos acumulados en tu tarjeta de fidelización.`);
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  // Acción Rápida de Rescate por WhatsApp (Reactivación de clientas atrasadas o dormidas)
  const sendReactivationWhatsApp = (cust) => {
    const clean = (cust.phone || '').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `¡Hola ${cust.name}! Te extrañamos en Kass moda y estilo ✨ Hace unos días no nos visitas. Tenemos prendas nuevas que te encantarán. Pasa esta semana y obtén un sello extra en tu tarjeta de fidelización 👗`
    );
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header con métricas de clientes y alertas de rescate */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Clientes</span>
            <span className="text-2xl font-black text-slate-900">{customers.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Premios Listos</span>
            <span className="text-2xl font-black text-amber-600">{readyCount} 🔥</span>
          </div>
        </div>

        <div 
          onClick={() => setFilter('at_risk')}
          className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Atrasadas (Riesgo)</span>
            <span className="text-2xl font-black text-amber-600">{atRiskCount}</span>
          </div>
        </div>

        <div 
          onClick={() => setFilter('dormant')}
          className="bg-white p-5 rounded-3xl border border-rose-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-rose-400 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Dormidas (Inactivas)</span>
            <span className="text-2xl font-black text-rose-600">{dormantCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Barra de Herramientas & Filtros de Ritmo */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por Nombre, Teléfono o Código (ej. 1937)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold shadow-md shadow-purple-900/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {/* Filter Pills con Ritmo de Clientas */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {[
            { id: 'all', label: `Todos (${customers.length})` },
            { id: 'at_risk', label: `⚠️ Atrasadas (${atRiskCount})`, color: 'text-amber-800 bg-amber-50 border-amber-300' },
            { id: 'dormant', label: `💤 Dormidas (${dormantCount})`, color: 'text-rose-800 bg-rose-50 border-rose-300' },
            { id: 'ready', label: `🎁 Premio Listo (${readyCount})`, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { id: 'loyal', label: `⭐ Fieles (${loyalCount})`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { id: 'regular', label: `💜 Regulares (${regularCount})`, color: 'text-purple-700 bg-purple-50 border-purple-200' },
            { id: 'new', label: `✨ Nuevas (${newCount})`, color: 'text-blue-700 bg-blue-50 border-blue-200' },
            { id: 'referred', label: `👥 Con Referidos (${referredCount})`, color: 'text-pink-700 bg-pink-50 border-pink-200' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setFilter(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                filter === p.id 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                  : (p.color || 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100')
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 3. Lista de Clientes con segmentación de visitas y botón de 1 clic WhatsApp */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                <th className="py-3 px-3">Cliente</th>
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Progreso de Sellos</th>
                <th className="py-3 px-3">Ritmo de Visita / Estado</th>
                <th className="py-3 px-3 text-right">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => {
                  const isReady = c.current_stamps >= target;
                  const isAtRiskOrDormant = c.segment?.key === 'at_risk' || c.segment?.key === 'dormant';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Cliente (Avatar, Nombre y Teléfono) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block leading-tight">{c.name}</span>
                            <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                              <span>{c.phone}</span>
                              <button 
                                onClick={() => openWhatsApp(c.phone, c.name)}
                                className="text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 font-bold"
                                title="Escribir mensaje libre por WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Código de 4 dígitos */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-sm font-black px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 border border-slate-800 shadow-sm">
                          {c.customer_code}
                        </span>
                      </td>

                      {/* Progreso de sellos */}
                      <td className="py-3 px-3">
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900">{c.current_stamps} de {target} sellos</span>
                            <span className="text-slate-400 text-[10px]">{Math.round((c.current_stamps / target) * 100)}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isReady ? 'bg-amber-400 shadow-sm' : 'bg-purple-600'
                              }`}
                              style={{ width: `${Math.min(100, (c.current_stamps / target) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Ritmo de Visitas / Estado dinámico */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          {c.segment ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${c.segment.badge}`}>
                              {c.segment.label}
                              {c.segment.sublabel ? ` (${c.segment.sublabel})` : ''}
                            </span>
                          ) : isReady ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-stone-950 shadow-sm animate-pulse">
                              <Gift className="w-3.5 h-3.5" />
                              ¡PREMIO LISTO!
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                              {c.total_stamps_earned} compras
                            </span>
                          )}

                          {c.segment?.daysSinceLastVisit !== undefined && (
                            <span className="block text-[10px] text-slate-400">
                              Última visita: hace {c.segment.daysSinceLastVisit} días
                            </span>
                          )}

                          {c.referred_by_code && (
                            <span className="block text-[10px] text-pink-600 font-bold">
                              👥 Invitada por: {c.referred_by_code}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acciones Rápidas (Incluye Rescate por WhatsApp de 1 Clic) */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón de 1 Clic para Rescatar si está Atrasada o Dormida */}
                          {isAtRiskOrDormant ? (
                            <button
                              onClick={() => sendReactivationWhatsApp(c)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-900/10 transition-all flex items-center gap-1 active:scale-95"
                              title="Enviar mensaje de reactivación por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Rescatar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => sendReactivationWhatsApp(c)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors"
                              title="Enviar mensaje de reactivación por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onOpenCashierWithCustomer && onOpenCashierWithCustomer(c)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Sello</span>
                          </button>

                          <button
                            onClick={() => handleOpenDetails(c)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Ver Historial y Detalles"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No se encontraron clientes con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: DETALLES E HISTORIAL DEL CLIENTE */}
      {selectedCustomerDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setSelectedCustomerDetails(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {selectedCustomerDetails.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedCustomerDetails.name}</h3>
                <p className="text-xs text-slate-500">{selectedCustomerDetails.phone}</p>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-purple-700 inline-block mt-1">
                  Código: {selectedCustomerDetails.customer_code}
                </span>
              </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Sellos Activos</span>
                <span className="text-base font-black text-purple-600">{selectedCustomerDetails.current_stamps}/10</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Históricos</span>
                <span className="text-base font-black text-slate-900">{selectedCustomerDetails.total_stamps_earned}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Completadas</span>
                <span className="text-base font-black text-amber-500">{selectedCustomerDetails.cards_completed || 0} 🏆</span>
              </div>
            </div>

            {/* Historial de transacciones */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Historial de Compras & Sellos:</span>
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {selectedCustomerDetails.history && selectedCustomerDetails.history.length > 0 ? (
                  selectedCustomerDetails.history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{h.note || 'Compra registrada'}</div>
                        <div className="text-[10px] text-slate-400">{new Date(h.created_at).toLocaleDateString()}</div>
                      </div>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        h.stamps_added > 0 ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {h.stamps_added > 0 ? `+${h.stamps_added}` : h.stamps_added} sellos
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">No hay compras registradas aún.</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => sendReactivationWhatsApp(selectedCustomerDetails)}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar mensaje de reactivación por WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCustomerDetails(null);
                  if (onOpenCashierWithCustomer) {
                    onOpenCashierWithCustomer(selectedCustomerDetails);
                  }
                }}
                className="w-full py-2.5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Marcar Sello para este Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR CLIENTE MANUAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-bold text-lg text-slate-900">Registrar Cliente en Mostrador</h3>

            {addError && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Carolina Martínez"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Ej. 300 123 4567"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Código de Referido (Opcional)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newReferralCode}
                  onChange={(e) => setNewReferralCode(e.target.value)}
                  placeholder="Ej. 1937"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {addLoading ? 'Guardando...' : 'Crear Tarjeta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
