import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import CustomerCardView from './components/CustomerCardView';
import CustomerRegisterModal from './components/CustomerRegisterModal';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const [settings, setSettings] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialRefCode, setInitialRefCode] = useState('');

  // 1. Cargar configuración del negocio
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // 2. Verificar URL params & persistencia de cliente/admin
  useEffect(() => {
    const initApp = async () => {
      await fetchSettings();

      const urlParams = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      const cardParam = urlParams.get('card') || urlParams.get('code');
      const refParam = urlParams.get('ref');
      const adminParam = urlParams.get('admin');

      // Determinar si entra como Administrador
      if (pathname.includes('/admin') || hash.includes('admin') || adminParam === 'true') {
        setIsAdminView(true);
      }

      if (refParam) {
        setInitialRefCode(refParam.toUpperCase());
      }

      // Si ya hay un código guardado en este celular o en la URL, cargar cliente sin pedir login
      const savedCode = cardParam || localStorage.getItem('kassmoda_customer_code') || localStorage.getItem('casmoda_customer_code');
      if (savedCode) {
        try {
          const res = await fetch(`/api/customers/${encodeURIComponent(savedCode)}`);
          if (res.ok) {
            const cust = await res.json();
            setCurrentCustomer(cust);
          }
        } catch (e) {
          console.error(e);
        }
      }

      setLoading(false);
    };

    initApp();
  }, []);

  // Guardar cliente listo y persistir en el celular
  const handleCustomerReady = (customer) => {
    setCurrentCustomer(customer);
    if (customer?.customer_code) {
      localStorage.setItem('kassmoda_customer_code', customer.customer_code);
    }
  };

  // Cambiar cliente
  const handleSwitchCustomer = () => {
    localStorage.removeItem('kassmoda_customer_code');
    localStorage.removeItem('casmoda_customer_code');
    setCurrentCustomer(null);
  };

  // Refrescar datos del cliente actual
  const handleRefreshCustomer = async () => {
    if (!currentCustomer?.customer_code) return;
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(currentCustomer.customer_code)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentCustomer(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Guardar configuración (Admin)
  const handleSaveSettings = async (newSettings) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    if (!res.ok) throw new Error('Error al guardar');
    const data = await res.json();
    setSettings(data);
    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
          <span className="font-serif text-lg tracking-wide">Cargando Kass moda y estilo...</span>
        </div>
      </div>
    );
  }

  // VISTA ADMINISTRADOR / DUEÑO (Acceso independiente)
  if (isAdminView) {
    return (
      <AdminDashboard
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onExitAdmin={() => {
          setIsAdminView(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // VISTA CLIENTE
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-pink-500">
      <main className="flex-1">
        {currentCustomer ? (
          <CustomerCardView
            customer={currentCustomer}
            settings={settings}
            onRefreshCustomer={handleRefreshCustomer}
            onSwitchCustomer={handleSwitchCustomer}
          />
        ) : (
          <CustomerRegisterModal
            settings={settings}
            initialReferralCode={initialRefCode}
            onCustomerReady={handleCustomerReady}
          />
        )}
      </main>

      {/* Discreto pie para administradores */}
      <footer className="no-print py-4 text-center border-t border-slate-900 bg-slate-950/80">
        <button
          onClick={() => {
            setIsAdminView(true);
            window.history.pushState({}, '', '/admin');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-500 hover:text-pink-400 hover:bg-slate-900 transition-colors"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Acceso Dueño del Negocio / Caja</span>
        </button>
      </footer>
    </div>
  );
}
