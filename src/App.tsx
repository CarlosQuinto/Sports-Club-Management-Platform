import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Home as HomeIcon, Calendar, Users, Wallet, Package, Trophy, Shield, Camera, LayoutTemplate, X } from 'lucide-react';
import { useClubData } from './hooks/useClubData';
import { C, RADIUS, SHADOWS, FormInput, PrimaryButton } from './components/ui';
import { formatFriendlyDate, formatFriendlyTime } from './utils/helpers';

import Home from './pages/Home';
import Agenda from './pages/Agenda';
import Players from './pages/Players';
import Finances from './pages/Finances';
import Inventory from './pages/Inventory';

export default function App() {
  const { clubInfo, transactions, players, inventory, events, gallery, loading } = useClubData();
  const [activeTab, setActiveTab] = useState<'inicio' | 'agenda' | 'jugadores' | 'finanzas' | 'inventario'>('inicio');
  
  // ── ESTADO PARA EL SCROLL AUTOMÁTICO DE LAS TABS ──
  const navContainerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // ── ESTADO PARA ILUMINAR EVENTOS DESDE EL BANNER ──
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  // Refs para gestionar listeners y timeouts pendientes
  const pendingTransitionCleanup = useRef<(() => void) | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  // ── SEGURIDAD POR PIN (LOCALSTORAGE) ──
  const [modo, setModo] = useState(() => localStorage.getItem('jb_rol') || '');
  const [showLogin, setShowLogin] = useState(false);
  const [pinCode, setPinCode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let role = '';
    if (pinCode === '1614') role = 'admin';
    else if (pinCode === '0963') role = 'dt';
    else if (pinCode === '1023') role = 'prensa';
    else if (pinCode === '2409') role = 'tesorero';

    if (role) {
      setModo(role); localStorage.setItem('jb_rol', role); setShowLogin(false); setPinCode('');
    } else { alert('PIN incorrecto. Acceso denegado.'); setPinCode(''); }
  };

  const handleLogout = () => {
    if (window.confirm('¿Cerrar sesión de la Directiva?')) { setModo(''); localStorage.removeItem('jb_rol'); }
  };

  const perms = {
    isAdmin: modo === 'admin',
    canEditInventory: modo === 'dt' || modo === 'tesorero' || modo === 'admin',
    canEditAgenda: modo === 'dt' || modo === 'admin',
    canEditJugadores: modo === 'dt' || modo === 'admin',
    canEditFinanzas: modo === 'tesorero' || modo === 'admin',
    canEditPortada: modo === 'prensa' || modo === 'admin'
  };

  const navItems = [
    { key: 'inicio', label: 'Inicio', icon: <HomeIcon size={16} /> },
    { key: 'agenda', label: 'Agenda', icon: <Calendar size={16} /> },
    { key: 'jugadores', label: 'Jugadores', icon: <Users size={16} /> },
    { key: 'finanzas', label: 'Finanzas', icon: <Wallet size={16} /> },
    { key: 'inventario', label: 'Inventario', icon: <Package size={16} /> },
  ] as const;

  // ── MAPEO DE ÍNDICES PARA EL SLIDER DINÁMICO ──
  const activeIndex = useMemo(() => {
    return navItems.findIndex(item => item.key === activeTab);
  }, [activeTab]);

  // ── MAGIA: AUTO-SCROLL CENTRADO DE LA TABA ACTIVA ──
  useEffect(() => {
    if (navContainerRef.current) {
      const container = navContainerRef.current;
      const activeTabElement = container.children[activeIndex] as HTMLElement;

      if (activeTabElement) {
        const containerCenter = container.clientWidth / 2;
        const tabCenter = activeTabElement.clientWidth / 2;
        const scrollPos = activeTabElement.offsetLeft - containerCenter + tabCenter;

        container.scrollTo({
          left: scrollPos,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  // ── CÁLCULO DEL PRÓXIMO EVENTO ──
  const nextEvent = useMemo(() => {
    const now = new Date();
    const sorted = [...events].sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    return sorted.find(e => new Date(e.eventDate + 'T' + e.eventTime) >= now);
  }, [events]);

  // ── MOTOR DEL RELOJ (COUNTDOWN) ──
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!nextEvent) {
      setTimeLeft('');
      return;
    }
    
    const updateCountdown = () => {
      const targetDate = new Date(`${nextEvent.eventDate}T${nextEvent.eventTime}`).getTime();
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft('¡EN JUEGO! ⚽');
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const daysStr = d > 0 ? `${d}d ` : '';
      setTimeLeft(`${daysStr}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextEvent]);

  // ── LIMPIEZA DE SCROLL PENDIENTE Y RESALTADO ──
  const clearPendingScroll = () => {
    if (pendingTransitionCleanup.current) {
      pendingTransitionCleanup.current();
      pendingTransitionCleanup.current = null;
    }
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
    setHighlightedEventId(null);
  };

  // ── REDIRECCIÓN Y SCROLL DEL BANNER ──
  const handleBannerClick = () => {
    if (!nextEvent) return;
    clearPendingScroll();
    setHighlightedEventId(nextEvent.id);

    const scrollToEvent = () => {
      const element = document.getElementById(`event-card-${nextEvent.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      highlightTimeoutRef.current = window.setTimeout(() => {
        setHighlightedEventId(null);
      }, 3000);
    };

    if (activeTab === 'agenda') {
      // Ya estamos en Agenda, scroll directo con pequeño delay para asegurar render
      window.setTimeout(scrollToEvent, 50);
    } else {
      // Cambiar a Agenda y esperar a que termine la transición del slider
      setActiveTab('agenda');
      const slider = sliderRef.current;
      if (slider) {
        const handleTransitionEnd = () => {
          scrollToEvent();
          slider.removeEventListener('transitionend', handleTransitionEnd);
          pendingTransitionCleanup.current = null;
        };
        slider.addEventListener('transitionend', handleTransitionEnd);
        pendingTransitionCleanup.current = () => {
          slider.removeEventListener('transitionend', handleTransitionEnd);
        };
        // Fallback por si no se dispara transitionend
        window.setTimeout(() => {
          if (pendingTransitionCleanup.current) {
            pendingTransitionCleanup.current();
            pendingTransitionCleanup.current = null;
            scrollToEvent();
          }
        }, 500);
      } else {
        window.setTimeout(scrollToEvent, 50);
      }
    }
  };

  // ── MANEJADOR DE CAMBIO DE PESTAÑA (con scroll al top) ──
  const handleTabChange = (tab: typeof activeTab) => {
    clearPendingScroll();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.gray50, color: C.gray800 }}>
      
      {/* ── HEADER ── */}
      <header style={{ backgroundColor: C.navy900, color: C.white, padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(10,25,41,0.15)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* --- IMAGEN DEL ESCUDO --- */}
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              overflow: 'hidden', 
              border: '2px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="https://i.pinimg.com/736x/e5/a4/07/e5a407aea70fd07ffcdd7cc87c4daace.jpg" 
                alt="Escudo Joga Bonito FC"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
            </div>
            {/* -------------------------- */}
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>Joga Bonito FC</h1>
              <div style={{ fontSize: '0.75rem', color: C.navy300, marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {modo === 'admin' ? <><Shield size={12}/> Presidente</> : 
                 modo === 'dt' ? <><LayoutTemplate size={12}/> Director Técnico</> :
                 modo === 'tesorero' ? <><Wallet size={12}/> Tesorero</> :
                 modo === 'prensa' ? <><Camera size={12}/> Prensa</> :
                 'Jugador'}
                 
                 <span style={{ margin: '0 0.4rem', opacity: 0.3 }}>|</span>
                 {modo ? (
                   <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: C.redBorder, cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}>Cerrar sesión</button>
                 ) : (
                   <button onClick={() => setShowLogin(true)} style={{ background: 'none', border: 'none', color: C.amber, cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}>Acceso Directiva</button>
                 )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: loading ? C.amber : C.green, boxShadow: `0 0 8px ${loading ? C.amber : C.green}` }} />
            <span style={{ fontSize: '0.75rem', color: C.navy300, fontWeight: '500' }}>{loading ? 'Conectando...' : 'Sincronizado'}</span>
          </div>
        </div>
      </header>

      {/* ── NEXT EVENT BANNER ── */}
      {nextEvent && (
        <div
          onClick={handleBannerClick}
          style={{ backgroundColor: C.navy900, color: C.white, padding: '1.25rem', margin: '1rem auto', width: 'calc(100% - 2rem)', maxWidth: '768px', borderRadius: RADIUS.lg, textAlign: 'center', boxShadow: SHADOWS.lg, cursor: 'pointer', transition: 'transform 0.2s ease', boxSizing: 'border-box' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: C.navy300, fontWeight: '600' }}>
            Próximo {nextEvent.eventType}
          </p>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: "'Inter', monospace", color: C.amber, letterSpacing: '0.02em' }}>{timeLeft}</div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', fontWeight: '500', color: C.navy100 }}>
            {nextEvent.title} • {nextEvent.location} • {formatFriendlyDate(nextEvent.eventDate)} a las {formatFriendlyTime(nextEvent.eventTime)}
          </p>
        </div>
      )}

      {/* MODAL DE LOGIN */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 41, 0.95)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }} onClick={() => setShowLogin(false)}>
          <div style={{ backgroundColor: C.white, borderRadius: RADIUS.xl, padding: '2rem', width: '100%', maxWidth: '320px', boxShadow: SHADOWS.xl }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: C.navy900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={20} color={C.amber} /> Acceso Directiva</h3>
              <button onClick={() => setShowLogin(false)} style={{ background: 'none', border: 'none', color: C.gray400, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: C.gray500 }}>Ingresa tu PIN numérico de 4 dígitos.</p>
              <FormInput type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} required value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="****" style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5em', fontWeight: '800' }} autoFocus />
              <PrimaryButton type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>Desbloquear App</PrimaryButton>
            </form>
          </div>
        </div>
      )}

      {/* ── NAVIGATION (SWIPEABLE & AUTO-CENTERED TABS) ── */}
      <nav style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.gray200}`, position: 'sticky', top: 0, zIndex: 100, boxShadow: SHADOWS.sm }}>
        <div 
          ref={navContainerRef}
          className="hide-scroll"
          style={{ 
            display: 'flex', 
            gap: '0.25rem', 
            maxWidth: '800px', 
            margin: '0 auto', 
            justifyContent: 'flex-start',
            overflowX: 'auto', 
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            padding: '0 0.5rem' 
          }}
        >
          {navItems.map((item) => (
            <button 
              key={item.key} 
              onClick={() => handleTabChange(item.key)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                padding: '0.875rem 1rem', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '0.8125rem', 
                backgroundColor: 'transparent', 
                color: activeTab === item.key ? C.navy900 : C.gray500, 
                borderBottom: activeTab === item.key ? `2px solid ${C.navy900}` : '2px solid transparent', 
                transition: 'all 0.2s ease', 
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {item.icon}{item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── MAIN CONTENT (DYNAMIC SLIDER CONTAINER) ── */}
      <main style={{ maxWidth: '800px', margin: '0 auto', overflow: 'hidden' }}>
        {loading ? (
           <p style={{ textAlign: 'center', padding: '2rem', color: C.gray500 }}>Cargando datos del club...</p>
        ) : (
          <div 
            ref={sliderRef}
            style={{ 
              display: 'flex', 
              width: '100%', 
              transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)', 
              transform: `translateX(-${activeIndex * 100}%)` 
            }}
          >
            {navItems.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div 
                  key={item.key} 
                  style={{ 
                    width: '100%', 
                    flexShrink: 0, 
                    padding: '1.5rem', 
                    boxSizing: 'border-box',
                    visibility: isActive ? 'visible' : 'hidden', // Oculta elementos fuera de vista para evitar interferencias de modales
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                >
                  {item.key === 'inicio' && <Home clubInfo={clubInfo} players={players} events={events} gallery={gallery} perms={perms} setActiveTab={handleTabChange} />}
                  {item.key === 'agenda' && <Agenda events={events} players={players} clubInfo={clubInfo} perms={perms} highlightedEventId={highlightedEventId} />}
                  {item.key === 'jugadores' && <Players players={players} events={events} perms={perms} />}
                  {item.key === 'finanzas' && <Finances transactions={transactions} players={players} perms={perms} />}
                  {item.key === 'inventario' && <Inventory inventory={inventory} perms={perms} />}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}