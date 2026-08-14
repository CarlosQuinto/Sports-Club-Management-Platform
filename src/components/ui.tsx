import React, { useState } from 'react';
import { ClipboardList, ChevronUp, ChevronDown } from 'lucide-react';

// ── Design tokens ──
export const C = {
  navy50: '#f0f4f8', navy100: '#d9e2ec', navy200: '#bcccdc', navy300: '#9fb3c8',
  navy400: '#829ab1', navy500: '#627d98', navy600: '#486581', navy700: '#334e68',
  navy800: '#243b53', navy900: '#102a43', navy950: '#0a1929',
  gray50: '#f8fafc', gray100: '#f1f5f9', gray200: '#e2e8f0', gray300: '#cbd5e1',
  gray400: '#94a3b8', gray500: '#64748b', gray600: '#475569', gray700: '#334155',
  gray800: '#1e293b', gray900: '#0f172a',
  green: '#059669', greenLight: '#ecfdf5', greenBorder: '#bbf7d0',
  red: '#dc2626', redLight: '#fef2f2', redBorder: '#fecaca',
  amber: '#d97706', amberLight: '#fffbeb',
  blueAccent: '#2563eb', blueLight: '#eff6ff',
  white: '#ffffff',
};

export const SHADOWS = {
  sm: '0 1px 2px rgba(0,0,0,0.04)',
  md: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
  xl: '0 25px 50px -12px rgba(0,0,0,0.25)',
};

export const RADIUS = { sm: '6px', md: '8px', lg: '12px', xl: '16px', full: '9999px' };

// ── Reusable UI atoms ──
export const SectionCard: React.FC<{ title?: string; icon?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, children, style }) => (
  <div style={{ backgroundColor: C.white, borderRadius: RADIUS.lg, padding: '1.5rem', boxShadow: SHADOWS.md, border: `1px solid ${C.gray200}`, ...style }}>
    {title && (
      <h2 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.navy900, letterSpacing: '-0.01em' }}>
        {icon}{title}
      </h2>
    )}
    {children}
  </div>
);

export const KPICard: React.FC<{ label: string; value: string; sublabel?: string; accent?: 'navy' | 'green' | 'red' | 'amber' | 'blue'; icon?: React.ReactNode }> = ({ label, value, sublabel, accent = 'navy', icon }) => {
  const colors: Record<string, string> = { navy: C.navy900, green: C.green, red: C.red, amber: C.amber, blue: C.blueAccent };
  return (
    <div style={{ backgroundColor: C.white, padding: '1.25rem 1.5rem', borderRadius: RADIUS.lg, border: `1px solid ${C.gray200}`, boxShadow: SHADOWS.sm, position: 'relative', overflow: 'hidden' }}>
      {icon && <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.15 }}>{icon}</div>}
      <p style={{ fontSize: '0.7rem', fontWeight: '600', color: C.gray500, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.5rem 0 0 0', color: colors[accent], letterSpacing: '-0.02em', lineHeight: '1.1' }}>{value}</p>
      {sublabel && <p style={{ fontSize: '0.7rem', color: C.gray400, margin: '0.25rem 0 0 0', fontWeight: '500' }}>{sublabel}</p>}
    </div>
  );
};

export const SegmentedControl: React.FC<{ options: { label: string; value: string; icon?: React.ReactNode }[]; value: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', backgroundColor: C.gray100, borderRadius: RADIUS.md, padding: '3px', gap: '2px' }}>
    {options.map((opt) => (
      <button key={opt.value} type="button" onClick={() => onChange(opt.value)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', borderRadius: RADIUS.sm, border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.8125rem', backgroundColor: value === opt.value ? C.white : 'transparent', color: value === opt.value ? C.navy900 : C.gray500, boxShadow: value === opt.value ? SHADOWS.sm : 'none', transition: 'all 0.2s ease' }}>
        {opt.icon}{opt.label}
      </button>
    ))}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'amber' | 'blue' | 'gray'; style?: React.CSSProperties }> = ({ children, color = 'gray', style }) => {
  const styles: Record<string, { bg: string; text: string }> = { green: { bg: C.greenLight, text: C.green }, red: { bg: C.redLight, text: C.red }, amber: { bg: C.amberLight, text: C.amber }, blue: { bg: C.blueLight, text: C.blueAccent }, gray: { bg: C.gray100, text: C.gray600 } };
  const s = styles[color];
  return (
    <span style={{ fontSize: '0.6875rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: RADIUS.full, backgroundColor: s.bg, color: s.text, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', letterSpacing: '0.02em', ...style }}>{children}</span>
  );
};

export const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: RADIUS.md, border: `1px solid ${C.gray300}`, backgroundColor: C.white, fontSize: '0.875rem', color: C.gray800, boxSizing: 'border-box', ...props.style }} />
);

export const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: RADIUS.md, border: `1px solid ${C.gray300}`, backgroundColor: C.white, fontSize: '0.875rem', color: C.gray800, boxSizing: 'border-box', cursor: 'pointer', ...props.style }} />
);

export const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: RADIUS.md, border: `1px solid ${C.gray300}`, backgroundColor: C.white, fontSize: '0.875rem', color: C.gray800, boxSizing: 'border-box', fontFamily: 'inherit', ...props.style }} />
);

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'navy' | 'green' | 'red' }> = ({ variant = 'navy', children, ...props }) => {
  const bg = variant === 'green' ? C.green : variant === 'red' ? C.red : C.navy900;
  return (
    <button {...props} style={{ padding: '0.625rem 1.5rem', borderRadius: RADIUS.md, border: 'none', backgroundColor: bg, color: C.white, fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer', letterSpacing: '0.01em', ...props.style }}>{children}</button>
  );
};

export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button {...props} style={{ padding: '0.625rem 1.5rem', borderRadius: RADIUS.md, border: `1px solid ${C.gray300}`, backgroundColor: C.white, color: C.gray600, fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer', ...props.style }}>{children}</button>
);

export const StatBox = ({ icon, label, value, valueColor = C.navy900 }: { icon: React.ReactNode; label: string; value: number | string; valueColor?: string }) => (
  <div style={{ backgroundColor: C.gray50, borderRadius: RADIUS.md, padding: '0.875rem', textAlign: 'center', border: `1px solid ${C.gray200}` }}>
    <div style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: valueColor, lineHeight: '1' }}>{value}</div>
    <div style={{ fontSize: '0.625rem', fontWeight: '600', color: C.gray500, textTransform: 'uppercase', marginTop: '0.25rem', letterSpacing: '0.04em' }}>{label}</div>
  </div>
);

export const CollapsibleRoutine = ({ routine }: { routine: string }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ backgroundColor: C.blueLight, padding: '0.75rem', borderRadius: RADIUS.md, marginBottom: '1rem', border: `1px solid ${C.blueAccent}30`, transition: 'all 0.3s ease' }}>
      <div onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: C.blueAccent, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ClipboardList size={14} /> Enfoque del Entrenamiento
        </p>
        <div style={{ backgroundColor: C.white, borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOWS.sm }}>
          {expanded ? <ChevronUp size={14} color={C.blueAccent} /> : <ChevronDown size={14} color={C.blueAccent} />}
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${C.blueAccent}20`, animation: 'fadeIn 0.3s ease' }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: C.navy800, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{routine}</p>
        </div>
      )}
    </div>
  );
};