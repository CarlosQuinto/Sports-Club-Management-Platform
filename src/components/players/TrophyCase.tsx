import React, { useState } from "react";
import { Medal, ChevronDown, ChevronUp } from "lucide-react";
import { C, RADIUS } from "../../components/ui";

// Definimos la interfaz basada en la estructura de tus logros
export interface Achievement {
  id: number;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

interface TrophyCaseProps {
  achievements: Achievement[];
}

export default function TrophyCase({ achievements }: TrophyCaseProps) {
  // Estado local para controlar si la vitrina está abierta o cerrada
  const [isOpen, setIsOpen] = useState(false);

  // Cálculos rápidos para el contador del botón
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div
      style={{
        width: "100%",
        marginTop: "1.5rem",
        borderTop: `2px dashed ${C.gray100}`,
        paddingTop: "1rem",
      }}
    >
      {/* ── BOTÓN PARA DESPLEGAR LA VITRINA ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: C.gray50,
          border: `1px solid ${C.gray200}`,
          padding: "0.75rem 1rem",
          borderRadius: RADIUS.md,
          cursor: "pointer",
          fontWeight: "700",
          color: C.navy900,
          transition: "all 0.2s ease",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Medal size={18} color={C.amber} /> Vitrina de Trofeos (
          {unlockedCount}/{totalCount})
        </span>

        {isOpen ? (
          <ChevronUp size={18} color={C.gray500} />
        ) : (
          <ChevronDown size={18} color={C.gray500} />
        )}
      </button>

      {/* ── CUADRÍCULA DE LOGROS ── */}
      {isOpen && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
            gap: "1rem",
            marginTop: "1rem",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {achievements.map((ach) => (
            <div
              key={ach.id}
              title={ach.desc}
              style={{
                // Los trofeos bloqueados se ven opacos y en blanco y negro
                opacity: ach.unlocked ? 1 : 0.3,
                filter: ach.unlocked ? "none" : "grayscale(100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                transition: "transform 0.2s ease, opacity 0.3s ease",
                cursor: ach.unlocked ? "pointer" : "default",
              }}
              // Pequeño efecto hover solo si el trofeo está desbloqueado
              onMouseEnter={(e) => {
                if (ach.unlocked)
                  e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                if (ach.unlocked) e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {/* ÍCONO DEL TROFEO */}
              <div
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "0.25rem",
                  filter: ach.unlocked
                    ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                    : "none",
                }}
              >
                {ach.unlocked ? ach.icon : "🔒"}
              </div>

              {/* TÍTULO */}
              <div
                style={{
                  fontSize: "0.55rem",
                  fontWeight: "800",
                  color: C.navy900,
                  lineHeight: "1.1",
                  textTransform: "uppercase",
                }}
              >
                {ach.title}
              </div>

              {/* DESCRIPCIÓN */}
              <div
                style={{
                  fontSize: "0.5rem",
                  color: C.gray500,
                  marginTop: "0.1rem",
                  lineHeight: "1.1",
                }}
              >
                {ach.desc}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
