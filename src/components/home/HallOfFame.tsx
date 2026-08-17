import React, { useState } from "react";
import {
  Medal,
  Goal,
  TrendingUp,
  Award,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { C, RADIUS, SHADOWS } from "../ui";

interface HallOfFameProps {
  topScorers: any[];
  topAssists: any[];
  topMVPs: any[];
  topIronMen: any[];
}

// Función auxiliar para calcular rankings con empates
const calculateRanks = (list: any[], scoreKey: string) => {
  let currentRank = 1;
  let currentScore = -1;
  let itemsAtCurrentRank = 0;

  return list.map((item, index) => {
    const itemScore = item[scoreKey];

    // Si es el primero, o su score es diferente al anterior, actualiza el rango
    if (index === 0) {
      currentScore = itemScore;
      itemsAtCurrentRank = 1;
    } else if (itemScore === currentScore) {
      // Empate, mantienen el mismo rango, pero sumamos cuántos hay en este rango
      itemsAtCurrentRank++;
    } else {
      // Nuevo score, el rango salta dependiendo de cuántos estaban empatados antes
      currentRank += itemsAtCurrentRank;
      currentScore = itemScore;
      itemsAtCurrentRank = 1;
    }

    return { ...item, rank: currentRank };
  });
};

export default function HallOfFame({
  topScorers,
  topAssists,
  topMVPs,
  topIronMen,
}: HallOfFameProps) {
  // ── Estado para el Carrusel ──
  const [hofIndex, setHofIndex] = useState(0);
  const nextHof = () => setHofIndex((prev) => (prev + 1) % 4);
  const prevHof = () => setHofIndex((prev) => (prev - 1 + 4) % 4);

  // ── Estados para expandir cada lista independientemente ──
  const [expScorers, setExpScorers] = useState(false);
  const [expAssists, setExpAssists] = useState(false);
  const [expMvps, setExpMvps] = useState(false);
  const [expIronMen, setExpIronMen] = useState(false);

  // Límite de jugadores a mostrar por defecto (EL TOP 5 SAGRADO)
  const LIMIT = 5;

  // ── Calcular Rankings con Empates ──
  const rankedScorers = calculateRanks(topScorers, "goals");
  const rankedAssists = calculateRanks(topAssists, "assists");
  const rankedMVPs = calculateRanks(topMVPs, "mvps");
  const rankedIronMen = calculateRanks(topIronMen, "totalAttendance");

  // ── Botón Inteligente (Solo aparece si hay MÁS de 5 personas) ──
  const renderSeeAllButton = (
    isExpanded: boolean,
    toggle: () => void,
    totalItems: number,
  ) => {
    // Si hay 5 o menos, no mostramos el botón
    if (totalItems <= LIMIT) return null;

    return (
      <button
        onClick={toggle}
        style={{
          width: "100%",
          padding: "0.75rem",
          marginTop: "0.75rem",
          backgroundColor: C.gray50,
          color: C.navy900,
          border: `1px solid ${C.gray200}`,
          borderRadius: RADIUS.md,
          fontSize: "0.8125rem",
          fontWeight: "700",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = C.gray100;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = C.gray50;
        }}
      >
        {isExpanded ? "Ocultar tabla ↑" : `Ver más ↓`}
      </button>
    );
  };

  // Función auxiliar para determinar estilos según el RANGO (rank)
  const getRankStyles = (rank: number, accentColor: string) => {
    const isGold = rank === 1;
    const isSilver = rank === 2;
    const isBronze = rank === 3;
    const isTop3 = isGold || isSilver || isBronze;

    const rankBg = isGold
      ? "#FEF08A"
      : isSilver
        ? "#E2E8F0"
        : isBronze
          ? "#FED7AA"
          : "#F1F5F9";
    const rankColor = isGold
      ? "#B45309"
      : isSilver
        ? "#475569"
        : isBronze
          ? "#9A3412"
          : "#64748B";
    const rowBg = isGold ? "rgba(245, 158, 11, 0.08)" : "transparent";
    const rowBorder = isGold
      ? `1px solid rgba(245, 158, 11, 0.3)`
      : "1px solid transparent";
    const avatarBorder = isGold
      ? `2px solid ${accentColor}`
      : `1px solid ${C.gray200}`;
    const avatarSize = isGold ? "38px" : "32px";
    const nameSize = isGold ? "0.9rem" : "0.8125rem";
    const nameWeight = isGold ? "800" : "600";

    return {
      rankBg,
      rankColor,
      rowBg,
      rowBorder,
      avatarBorder,
      avatarSize,
      nameSize,
      nameWeight,
      isTop3,
    };
  };

  return (
    <div
      style={{
        backgroundColor: C.navy900,
        borderRadius: RADIUS.lg,
        padding: "1.5rem",
        boxShadow: SHADOWS.lg,
        color: C.white,
        backgroundImage:
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
      }}
    >
      {/* Cabecera con Botones de Navegación */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: "800",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            letterSpacing: "-0.01em",
          }}
        >
          <Medal size={20} color={C.amber} /> Muro de la Fama
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={prevHof}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: `1px solid rgba(255,255,255,0.2)`,
              backgroundColor: "rgba(255,255,255,0.1)",
              cursor: "pointer",
              color: C.white,
              transition: "all 0.2s",
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextHof}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: `1px solid rgba(255,255,255,0.2)`,
              backgroundColor: "rgba(255,255,255,0.1)",
              cursor: "pointer",
              color: C.white,
              transition: "all 0.2s",
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* CONTENEDOR DEL CARRUSEL ANIMADO */}
      <div
        style={{
          width: "100%",
          overflow: "hidden",
          position: "relative",
          borderRadius: RADIUS.lg,
        }}
      >
        <div
          style={{
            display: "flex",
            transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
            transform: `translateX(-${hofIndex * 100}%)`,
          }}
        >
          {/* 1. PICHICHI (GOLES) */}
          <div style={{ flex: "0 0 100%", width: "100%" }}>
            <div
              style={{
                backgroundColor: C.white,
                borderRadius: RADIUS.lg,
                padding: "1.25rem",
                color: C.navy900,
                boxShadow: SHADOWS.md,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  paddingBottom: "0.75rem",
                  borderBottom: `1px dashed ${C.gray200}`,
                }}
              >
                <div
                  style={{
                    padding: "0.4rem",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: C.green,
                    borderRadius: RADIUS.md,
                  }}
                >
                  <Goal size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      fontWeight: "800",
                      color: C.navy900,
                      lineHeight: "1.2",
                    }}
                  >
                    El Pichichi
                  </h3>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: C.gray500,
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    Máximos Goleadores
                  </span>
                </div>
              </div>
              {rankedScorers.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: C.gray400,
                    margin: 0,
                    fontStyle: "italic",
                    flex: 1,
                    textAlign: "center",
                    paddingTop: "1rem",
                  }}
                >
                  Aún no hay goles.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    flex: 1,
                  }}
                >
                  {(expScorers
                    ? rankedScorers
                    : rankedScorers.slice(0, LIMIT)
                  ).map((p: any) => {
                    const {
                      rankBg,
                      rankColor,
                      rowBg,
                      rowBorder,
                      avatarBorder,
                      avatarSize,
                      nameSize,
                      nameWeight,
                    } = getRankStyles(p.rank, C.amber);

                    return (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem",
                          borderRadius: RADIUS.md,
                          backgroundColor: rowBg,
                          border: rowBorder,
                        }}
                      >
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundColor: rankBg,
                            color: rankColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            flexShrink: 0,
                          }}
                        >
                          {p.rank}
                        </div>
                        <img
                          src={
                            p.imageUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=102a43&color=fff&size=50`
                          }
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: avatarSize,
                            height: avatarSize,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: avatarBorder,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: nameSize,
                              fontWeight: nameWeight,
                              color: C.navy900,
                            }}
                          >
                            {p.name}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              color: C.green,
                            }}
                          >
                            {p.goals} goles
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {renderSeeAllButton(
                    expScorers,
                    () => setExpScorers(!expScorers),
                    rankedScorers.length,
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. ASISTENCIAS */}
          <div style={{ flex: "0 0 100%", width: "100%" }}>
            <div
              style={{
                backgroundColor: C.white,
                borderRadius: RADIUS.lg,
                padding: "1.25rem",
                color: C.navy900,
                boxShadow: SHADOWS.md,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  paddingBottom: "0.75rem",
                  borderBottom: `1px dashed ${C.gray200}`,
                }}
              >
                <div
                  style={{
                    padding: "0.4rem",
                    backgroundColor: "rgba(56, 189, 248, 0.1)",
                    color: C.blueAccent,
                    borderRadius: RADIUS.md,
                  }}
                >
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      fontWeight: "800",
                      color: C.navy900,
                      lineHeight: "1.2",
                    }}
                  >
                    El Maestro
                  </h3>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: C.gray500,
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    Más Asistencias
                  </span>
                </div>
              </div>
              {rankedAssists.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: C.gray400,
                    margin: 0,
                    fontStyle: "italic",
                    flex: 1,
                    textAlign: "center",
                    paddingTop: "1rem",
                  }}
                >
                  Aún no hay asistencias.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    flex: 1,
                  }}
                >
                  {(expAssists
                    ? rankedAssists
                    : rankedAssists.slice(0, LIMIT)
                  ).map((p: any) => {
                    const {
                      rankBg,
                      rankColor,
                      rowBg,
                      rowBorder,
                      avatarBorder,
                      avatarSize,
                      nameSize,
                      nameWeight,
                    } = getRankStyles(p.rank, C.blueAccent);

                    return (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem",
                          borderRadius: RADIUS.md,
                          backgroundColor: rowBg,
                          border: rowBorder,
                        }}
                      >
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundColor: rankBg,
                            color: rankColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            flexShrink: 0,
                          }}
                        >
                          {p.rank}
                        </div>
                        <img
                          src={
                            p.imageUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=102a43&color=fff&size=50`
                          }
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: avatarSize,
                            height: avatarSize,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: avatarBorder,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: nameSize,
                              fontWeight: nameWeight,
                              color: C.navy900,
                            }}
                          >
                            {p.name}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              color: C.blueAccent,
                            }}
                          >
                            {p.assists} asistencias
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {renderSeeAllButton(
                    expAssists,
                    () => setExpAssists(!expAssists),
                    rankedAssists.length,
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. MVPs */}
          <div style={{ flex: "0 0 100%", width: "100%" }}>
            <div
              style={{
                backgroundColor: C.white,
                borderRadius: RADIUS.lg,
                padding: "1.25rem",
                color: C.navy900,
                boxShadow: SHADOWS.md,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  paddingBottom: "0.75rem",
                  borderBottom: `1px dashed ${C.gray200}`,
                }}
              >
                <div
                  style={{
                    padding: "0.4rem",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    color: C.amber,
                    borderRadius: RADIUS.md,
                  }}
                >
                  <Award size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      fontWeight: "800",
                      color: C.navy900,
                      lineHeight: "1.2",
                    }}
                  >
                    El Galáctico
                  </h3>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: C.gray500,
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    Premios MVP
                  </span>
                </div>
              </div>
              {rankedMVPs.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: C.gray400,
                    margin: 0,
                    fontStyle: "italic",
                    flex: 1,
                    textAlign: "center",
                    paddingTop: "1rem",
                  }}
                >
                  Aún no hay MVPs.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    flex: 1,
                  }}
                >
                  {(expMvps ? rankedMVPs : rankedMVPs.slice(0, LIMIT)).map(
                    (p: any) => {
                      const {
                        rankBg,
                        rankColor,
                        rowBg,
                        rowBorder,
                        avatarBorder,
                        avatarSize,
                        nameSize,
                        nameWeight,
                      } = getRankStyles(p.rank, C.amber);

                      return (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.5rem",
                            borderRadius: RADIUS.md,
                            backgroundColor: rowBg,
                            border: rowBorder,
                          }}
                        >
                          <div
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              backgroundColor: rankBg,
                              color: rankColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "800",
                              flexShrink: 0,
                            }}
                          >
                            {p.rank}
                          </div>
                          <img
                            src={
                              p.imageUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=102a43&color=fff&size=50`
                            }
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: avatarSize,
                              height: avatarSize,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: avatarBorder,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: nameSize,
                                fontWeight: nameWeight,
                                color: C.navy900,
                              }}
                            >
                              {p.name}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                color: C.amber,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.2rem",
                              }}
                            >
                              <Star size={10} fill={C.amber} /> {p.mvps} MVPs
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}
                  {renderSeeAllButton(
                    expMvps,
                    () => setExpMvps(!expMvps),
                    rankedMVPs.length,
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. JUGADOR DE HIERRO */}
          <div style={{ flex: "0 0 100%", width: "100%" }}>
            <div
              style={{
                backgroundColor: C.white,
                borderRadius: RADIUS.lg,
                padding: "1.25rem",
                color: C.navy900,
                boxShadow: SHADOWS.md,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  paddingBottom: "0.75rem",
                  borderBottom: `1px dashed ${C.gray200}`,
                }}
              >
                <div
                  style={{
                    padding: "0.4rem",
                    backgroundColor: "rgba(100, 116, 139, 0.1)",
                    color: C.navy500,
                    borderRadius: RADIUS.md,
                  }}
                >
                  <Shield size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      fontWeight: "800",
                      color: C.navy900,
                      lineHeight: "1.2",
                    }}
                  >
                    El de Hierro
                  </h3>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: C.gray500,
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    Más Presencias
                  </span>
                </div>
              </div>
              {rankedIronMen.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: C.gray400,
                    margin: 0,
                    fontStyle: "italic",
                    flex: 1,
                    textAlign: "center",
                    paddingTop: "1rem",
                  }}
                >
                  Aún no hay eventos.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    flex: 1,
                  }}
                >
                  {(expIronMen
                    ? rankedIronMen
                    : rankedIronMen.slice(0, LIMIT)
                  ).map((p: any) => {
                    const {
                      rankBg,
                      rankColor,
                      rowBg,
                      rowBorder,
                      avatarBorder,
                      avatarSize,
                      nameSize,
                      nameWeight,
                    } = getRankStyles(p.rank, C.navy500);

                    return (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem",
                          borderRadius: RADIUS.md,
                          backgroundColor: rowBg,
                          border: rowBorder,
                        }}
                      >
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundColor: rankBg,
                            color: rankColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            flexShrink: 0,
                          }}
                        >
                          {p.rank}
                        </div>
                        <img
                          src={
                            p.imageUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=102a43&color=fff&size=50`
                          }
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: avatarSize,
                            height: avatarSize,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: avatarBorder,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: nameSize,
                              fontWeight: nameWeight,
                              color: C.navy900,
                            }}
                          >
                            {p.name}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              color: C.navy500,
                            }}
                          >
                            {p.totalAttendance} presencias
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {renderSeeAllButton(
                    expIronMen,
                    () => setExpIronMen(!expIronMen),
                    rankedIronMen.length,
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PUNTITOS INDICADORES DE NAVEGACIÓN */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.4rem",
          marginTop: "1rem",
        }}
      >
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            onClick={() => setHofIndex(idx)}
            style={{
              width: hofIndex === idx ? "20px" : "6px",
              height: "6px",
              borderRadius: "3px",
              backgroundColor:
                hofIndex === idx ? C.amber : "rgba(255,255,255,0.3)",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}
