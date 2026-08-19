import React from "react";
import { createPortal } from "react-dom";
import {
  X,
  Trophy,
  Medal,
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
  if (!player || !pStats) return null;

  const modalContent = (
    <div
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
          padding: "2.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: SHADOWS.xl,
          maxHeight: "95vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()} // Evita que un click adentro cierre el modal
      >
        {/* BOTÓN DE CERRAR */}
        <button
          onClick={onClose}
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

        {/* FOTO DE PERFIL */}
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
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            objectFit: "cover",
            border: `4px solid ${C.gray100}`,
            boxShadow: SHADOWS.md,
            marginBottom: "1.5rem",
            backgroundColor: C.navy900,
          }}
        />

        {/* NOMBRE */}
        <h2
          style={{
            margin: "0 0 0.25rem 0",
            fontSize: "1.625rem",
            fontWeight: "800",
            color: C.navy900,
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
          }}
        >
          <span
            style={{ fontSize: "1.25rem", fontWeight: "800", color: C.navy900 }}
          >
            #{player.number}
          </span>
          <span
            style={{ width: "1px", height: "16px", backgroundColor: C.navy200 }}
          />
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: "600",
              color: C.navy600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {player.position} {player.variant ? ` • ${player.variant}` : ""}
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
            Rendimiento de la Temporada
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            {player.position === "Portero" ? (
              <>
                <StatBox
                  icon={<Hand size={20} color={C.navy600} />}
                  label="Goles Recibidos"
                  value={pStats.goalsConceded}
                />
                <StatBox
                  icon={<Shield size={20} color={C.navy600} />}
                  label="Arcos en Cero"
                  value={pStats.cleanSheets}
                />
              </>
            ) : (
              <>
                <StatBox
                  icon={<Goal size={20} color={C.navy600} />}
                  label="Goles Anotados"
                  value={pStats.goals}
                />
                <StatBox
                  icon={<TrendingUp size={20} color={C.navy600} />}
                  label="Asistencias"
                  value={pStats.assists}
                />
              </>
            )}
            <StatBox
              icon={<Target size={20} color={C.navy600} />}
              label="Entrenamientos"
              value={pStats.trainingsAttended}
            />
            <StatBox
              icon={<Trophy size={20} color={C.navy600} />}
              label="Partidos Jugados"
              value={pStats.matchesAttended}
            />
          </div>

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
              value={pStats.mvps}
              valueColor={C.amber}
            />
            <StatBox
              icon={<span style={{ fontSize: "16px" }}>🟨</span>}
              label="Amarillas"
              value={pStats.yellowCards}
            />
            <StatBox
              icon={<span style={{ fontSize: "16px" }}>🟥</span>}
              label="Rojas"
              value={pStats.redCards}
            />
          </div>
        </div>

        {/* VITRINA DE TROFEOS */}
        <TrophyCase achievements={achievements} />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
