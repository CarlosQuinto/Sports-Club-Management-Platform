import React, { useState } from "react";
import { Medal, ChevronDown, ChevronUp } from "lucide-react";
import { C, RADIUS, SHADOWS } from "../../components/ui";

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
  const [isOpen, setIsOpen] = useState(false);
  // 👇 NUEVO ESTADO: Guarda qué trofeo está seleccionado para ver sus detalles
  const [selectedAch, setSelectedAch] = useState<Achievement | null>(null);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
    // Si cerramos la vitrina, limpiamos la selección
    if (isOpen) setSelectedAch(null);
  };

  return (
    <div style={{ width: "100%", padding: "0.5rem 0" }}>
      {/* ── BOTÓN PREMIUM CON BARRA DE PROGRESO ── */}
      <button
        type="button"
        onClick={handleToggle}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: C.white,
          border: `1px solid ${C.gray200}`,
          padding: "0.875rem",
          borderRadius: RADIUS.lg,
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: isOpen ? SHADOWS.sm : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                padding: "6px",
                borderRadius: RADIUS.full,
              }}
            >
              <Medal size={20} color={C.amber} />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontWeight: "800",
                  color: C.navy900,
                  fontSize: "0.875rem",
                }}
              >
                Vitrina de Trofeos
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: C.gray500,
                  fontWeight: "600",
                }}
              >
                {unlockedCount} de {totalCount} desbloqueados
              </span>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp size={20} color={C.gray400} />
          ) : (
            <ChevronDown size={20} color={C.gray400} />
          )}
        </div>

        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: C.gray100,
            borderRadius: RADIUS.full,
            marginTop: "0.75rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: C.amber,
              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
      </button>

      {/* ── INTERIOR DE LA VITRINA ── */}
      {isOpen && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          {/* 👇 NUEVO: PANEL DE DETALLE DEL TROFEO SELECCIONADO 👇 */}
          {selectedAch && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                backgroundColor: selectedAch.unlocked
                  ? "rgba(245, 158, 11, 0.05)"
                  : C.gray50,
                border: `1px solid ${selectedAch.unlocked ? "rgba(245, 158, 11, 0.3)" : C.gray200}`,
                padding: "0.875rem",
                borderRadius: RADIUS.md,
                marginTop: "0.75rem",
                animation: "fadeIn 0.2s ease",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  filter: selectedAch.unlocked
                    ? "drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))"
                    : "grayscale(100%) opacity(40%)",
                }}
              >
                {selectedAch.unlocked ? selectedAch.icon : "🔒"}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "800",
                      color: selectedAch.unlocked ? C.amber : C.gray600,
                      fontSize: "0.8125rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedAch.title}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: "800",
                      color: selectedAch.unlocked ? C.green : C.gray500,
                      backgroundColor: selectedAch.unlocked
                        ? "rgba(16,185,129,0.1)"
                        : C.gray200,
                      padding: "2px 6px",
                      borderRadius: RADIUS.full,
                    }}
                  >
                    {selectedAch.unlocked ? "DESBLOQUEADO" : "BLOQUEADO"}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: C.gray500,
                    marginTop: "0.25rem",
                    lineHeight: 1.3,
                  }}
                >
                  {selectedAch.desc}
                </span>
              </div>
            </div>
          )}

          {/* ── CUADRÍCULA CON SCROLL INTERNO ── */}
          <div
            className="hide-scroll"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(75px, 1fr))",
              gap: "0.5rem",
              marginTop: selectedAch ? "0.75rem" : "1rem", // Ajuste de margen dinámico
              padding: "0.25rem",
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            {achievements.map((ach) => {
              const isSelected = selectedAch?.id === ach.id;

              return (
                <div
                  key={ach.id}
                  onClick={() => setSelectedAch(isSelected ? null : ach)}
                  style={{
                    opacity: ach.unlocked ? 1 : 0.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    // 👇 Lógica de colores según estado y selección 👇
                    backgroundColor: isSelected
                      ? ach.unlocked
                        ? "rgba(245, 158, 11, 0.15)"
                        : C.gray100
                      : ach.unlocked
                        ? C.white
                        : "transparent",
                    border: `1px solid ${
                      isSelected
                        ? ach.unlocked
                          ? C.amber
                          : C.gray400
                        : ach.unlocked
                          ? "rgba(245, 158, 11, 0.3)"
                          : "transparent"
                    }`,
                    borderRadius: RADIUS.md,
                    padding: "0.5rem",
                    boxShadow:
                      isSelected && ach.unlocked
                        ? "0 0 0 2px rgba(245, 158, 11, 0.2)"
                        : "none",
                    transition:
                      "transform 0.1s ease, box-shadow 0.2s ease, background-color 0.2s ease",
                    cursor: "pointer", // ¡Ahora todos son clickeables!
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* ÍCONO DEL TROFEO */}
                  <div
                    style={{
                      fontSize: "1.75rem",
                      marginBottom: "0.25rem",
                      filter: ach.unlocked
                        ? "drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))"
                        : "grayscale(100%)",
                      transition: "transform 0.2s ease",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    {ach.unlocked ? ach.icon : "🔒"}
                  </div>

                  {/* TÍTULO */}
                  <div
                    style={{
                      fontSize: "0.55rem",
                      fontWeight: "800",
                      color: ach.unlocked ? C.amber : C.gray500,
                      lineHeight: "1.2",
                      textTransform: "uppercase",
                    }}
                  >
                    {ach.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
