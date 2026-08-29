import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Trophy,
  Star,
  Goal,
  Shield,
  TrendingUp,
  Hand,
  Target,
} from "lucide-react";
import { C, RADIUS, SHADOWS, StatBox } from "../../components/ui";
import { calculateAge } from "../../utils/helpers";
import TrophyCase, { Achievement } from "./TrophyCase";

interface PlayerModalProps {
  player: any;
  pStats: any;
  achievements: Achievement[];
  onClose: () => void;
}

export default function PlayerModal({
  player,
  pStats,
  achievements,
  onClose,
}: PlayerModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Bloquear scroll del fondo y manejar tecla Escape
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!player || !pStats) return null;

  // Normalización de datos
  const isDT = Boolean(player.isDT);
  const isGoalkeeper = player.position?.trim().toLowerCase() === "portero";
  const isActive = player.active !== false; // 👈 NUEVO: Validación de estado activo

  // Estadísticas con valores por defecto
  const {
    goals = 0,
    assists = 0,
    matchesAttended = 0,
    trainingsAttended = 0,
    cleanSheets = 0,
    goalsConceded = 0,
    mvps = 0,
    yellowCards = 0,
    redCards = 0,
    matchesManaged = 0,
    winsManaged = 0,
  } = pStats || {};

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-player-name"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 25, 41, 0.90)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "450px",
          width: "100%",
          backgroundColor: C.white,
          borderRadius: RADIUS.xl,
          padding: "clamp(1.5rem, 5vw, 2.5rem) clamp(1rem, 4vw, 2rem)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: SHADOWS.xl,
          maxHeight: "95vh",
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN DE CERRAR */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Cerrar modal"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: C.gray400,
            cursor: "pointer",
          }}
        >
          <X size={24} />
        </button>

        {/* FOTO DE PERFIL CON INSIGNIA DT FLOTANTE */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={
              player.imageUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                player.name,
              )}&background=102a43&color=fff&size=200&bold=true`
            }
            alt={player.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                player.name,
              )}&background=102a43&color=fff&size=200&bold=true`;
            }}
            style={{
              width: "min(140px, 35vw)",
              height: "min(140px, 35vw)",
              borderRadius: "50%",
              objectFit: "cover",
              border: `4px solid ${!isActive ? C.gray200 : isDT ? C.amberLight : C.gray100}`, // 👈 Borde gris si está inactivo
              boxShadow: SHADOWS.md,
              marginBottom: "1.5rem",
              backgroundColor: C.navy900,
              filter: isActive ? "none" : "grayscale(100%)", // 👈 NUEVO: Filtro gris para inactivos
            }}
          />

          {isDT && (
            <span
              title="Director Técnico"
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "28px",
                height: "28px",
                backgroundColor: C.amber,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              📋
            </span>
          )}
        </div>

        {/* NOMBRE */}
        <h2
          id="modal-player-name"
          style={{
            margin: "0 0 0.25rem 0",
            fontSize: "1.625rem",
            fontWeight: "800",
            color: isActive ? C.navy900 : C.gray500, // 👈 Color atenuado si es baja
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          {player.name}
        </h2>

        {/* DORSAL Y POSICIÓN (PÍLDORA) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "0.5rem",
            backgroundColor: C.navy50,
            padding: "0.5rem 1.25rem",
            borderRadius: RADIUS.full,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* 👈 NUEVO: Etiqueta de INACTIVO */}
          {!isActive && (
            <>
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: "800",
                  color: C.red,
                }}
              >
                INACTIVO
              </span>
              <span
                style={{
                  width: "1px",
                  height: "16px",
                  backgroundColor: C.navy200,
                }}
              />
            </>
          )}

          {!isDT && (
            <>
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "800",
                  color: C.navy900,
                }}
              >
                #{player.number}
              </span>
              <span
                style={{
                  width: "1px",
                  height: "16px",
                  backgroundColor: C.navy200,
                }}
              />
            </>
          )}
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: "600",
              color: isDT ? C.amber : C.navy600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {isDT ? "Director Técnico" : player.position}{" "}
            {player.variant ? ` • ${player.variant}` : ""}
          </span>

          {player.birthDate && (
            <>
              <span
                style={{
                  width: "1px",
                  height: "16px",
                  backgroundColor: C.navy200,
                }}
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: "700",
                  color: C.navy600,
                }}
                title={`Fecha de nacimiento: ${player.birthDate}`}
              >
                {calculateAge(player.birthDate)} años
              </span>
            </>
          )}
        </div>

        {/* ESTADÍSTICAS DE TEMPORADA */}
        <div
          style={{
            width: "100%",
            marginTop: "2rem",
            borderTop: `2px dashed ${C.gray100}`,
            paddingTop: "1.5rem",
          }}
        >
          <p
            style={{
              margin: "0 0 1rem 0",
              textAlign: "center",
              fontWeight: "600",
              color: C.gray500,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "0.6875rem",
            }}
          >
            Rendimiento histórico
          </p>

          {/* ── SECCIÓN DE DT ── */}
          {isDT && (
            <div
              style={{
                marginBottom: "0.75rem",
                padding: "0.75rem",
                backgroundColor: "#FFFBEB",
                borderRadius: RADIUS.md,
                border: `1px solid ${C.amber}`,
              }}
            >
              <p
                style={{
                  margin: "0 0 0.5rem 0",
                  textAlign: "center",
                  fontWeight: "700",
                  color: C.amber,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontSize: "0.625rem",
                }}
              >
                👔 Banquillo Técnico
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <StatBox
                  icon={<span style={{ fontSize: "18px" }}>📋</span>}
                  label="Partidos Dirigidos"
                  value={matchesManaged}
                />
                <StatBox
                  icon={<span style={{ fontSize: "18px" }}>🏆</span>}
                  label="Victorias como DT"
                  value={winsManaged}
                  valueColor={C.amber}
                />
              </div>
            </div>
          )}

          {/* ESTADÍSTICAS PRINCIPALES (JUGADOR / PORTERO) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            {isGoalkeeper ? (
              <>
                <StatBox
                  icon={<Hand size={20} color={C.navy600} />}
                  label="Goles Recibidos"
                  value={goalsConceded}
                />
                <StatBox
                  icon={<Shield size={20} color={C.navy600} />}
                  label="Arcos en Cero"
                  value={cleanSheets}
                />
              </>
            ) : (
              <>
                <StatBox
                  icon={<Goal size={20} color={C.navy600} />}
                  label="Goles Anotados"
                  value={goals}
                />
                <StatBox
                  icon={<TrendingUp size={20} color={C.navy600} />}
                  label="Asistencias"
                  value={assists}
                />
              </>
            )}
            <StatBox
              icon={<Target size={20} color={C.navy600} />}
              label="Entrenamientos"
              value={trainingsAttended}
            />
            <StatBox
              icon={<Trophy size={20} color={C.navy600} />}
              label="Partidos Jugados"
              value={matchesAttended}
            />
          </div>

          {/* ESTADÍSTICAS DE TARJETAS Y MVPS (No mostradas para DTs) */}
          {!isDT && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "0.5rem",
              }}
            >
              <StatBox
                icon={<Star size={16} color={C.amber} fill={C.amber} />}
                label="MVPs"
                value={mvps}
                valueColor={C.amber}
              />
              <StatBox
                icon={<span style={{ fontSize: "16px" }}>🟨</span>}
                label="Amarillas"
                value={yellowCards}
              />
              <StatBox
                icon={<span style={{ fontSize: "16px" }}>🟥</span>}
                label="Rojas"
                value={redCards}
              />
            </div>
          )}
        </div>

        {/* VITRINA DE TROFEOS */}
        {!isDT && <TrophyCase achievements={achievements} />}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
