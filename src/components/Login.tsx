import React, { useState } from 'react';
import { Shield, X, Lock } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { C, RADIUS, SHADOWS } from '../lib/constants';

export const LoginModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { loginWithPin } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4 && loginWithPin(pin)) {
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 41, 0.90)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ backgroundColor: C.navy900, borderRadius: RADIUS.xl, padding: '2rem', width: '100%', maxWidth: '360px', boxShadow: SHADOWS.xl }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: C.white, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color={C.amber} /> Acceso Directiva
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.navy300, cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="PIN de 4 dígitos"
            autoFocus
            style={{
              width: '100%', padding: '0.875rem 1rem', borderRadius: RADIUS.md,
              border: `2px solid ${error ? C.red : C.navy600}`, backgroundColor: 'rgba(255,255,255,0.1)',
              color: C.white, fontSize: '1.5rem', fontWeight: '800', textAlign: 'center',
              letterSpacing: '0.5em', boxSizing: 'border-box', outline: 'none',
            }}
          />
          {error && <p style={{ margin: 0, color: C.red, fontSize: '0.8125rem', fontWeight: '600', textAlign: 'center' }}>PIN incorrecto. Intenta de nuevo.</p>}
          <button type="submit" style={{ padding: '0.75rem', borderRadius: RADIUS.md, border: 'none', backgroundColor: C.amber, color: C.white, fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export const RoleBadge: React.FC<{ onOpenLogin: () => void }> = ({ onOpenLogin }) => {
  const { role, logout } = useAuth();
  if (role === 'jugador') {
    return (
      <button onClick={onOpenLogin} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: RADIUS.sm, padding: '0.3rem 0.6rem', color: C.navy300, fontSize: '0.65rem', fontWeight: '600', cursor: 'pointer' }}>
        <Shield size={12} /> Acceso Directiva
      </button>
    );
  }
  return (
    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: C.amberLight, border: `1px solid ${C.amber}40`, borderRadius: RADIUS.sm, padding: '0.3rem 0.6rem', color: C.amber, fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer' }}>
      <Shield size={12} /> {ROLE_LABELS[role]} (Salir)
    </button>
  );
};
