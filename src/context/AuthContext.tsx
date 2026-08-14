import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'jugador' | 'admin' | 'dt' | 'prensa' | 'tesorero';

interface AuthContextType {
  role: Role;
  perms: {
    isAdmin: boolean;
    isDT: boolean;
    isTesorero: boolean;
    isPrensa: boolean;
    canEditInventory: boolean;
    canEditAgenda: boolean;
    canEditJugadores: boolean;
    canEditFinanzas: boolean;
    canEditPortada: boolean;
  };
  loginWithPin: (pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PIN_MAP: Record<string, Role> = {
  '1614': 'admin',
  '0963': 'dt',
  '1023': 'prensa',
  '2409': 'tesorero',
};

const ROLE_LABELS: Record<Role, string> = {
  jugador: 'Jugador',
  admin: 'Presidente',
  dt: 'Entrenador',
  prensa: 'Prensa',
  tesorero: 'Tesorero',
};

export { ROLE_LABELS };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('jugador');

  useEffect(() => {
    const saved = localStorage.getItem('jbfc_role') as Role | null;
    if (saved && saved !== 'jugador') setRole(saved);
  }, []);

  const computePerms = (r: Role) => {
    const isAdmin = r === 'admin';
    const isDT = isAdmin || r === 'dt';
    const isTesorero = isAdmin || r === 'tesorero';
    const isPrensa = isAdmin || r === 'prensa';
    return {
      isAdmin,
      isDT,
      isTesorero,
      isPrensa,
      canEditInventory: isDT || isTesorero,
      canEditAgenda: isDT,
      canEditJugadores: isDT,
      canEditFinanzas: isTesorero,
      canEditPortada: isPrensa,
    };
  };

  const loginWithPin = (pin: string): boolean => {
    const mapped = PIN_MAP[pin];
    if (mapped) {
      setRole(mapped);
      localStorage.setItem('jbfc_role', mapped);
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole('jugador');
    localStorage.removeItem('jbfc_role');
  };

  return (
    <AuthContext.Provider value={{ role, perms: computePerms(role), loginWithPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
