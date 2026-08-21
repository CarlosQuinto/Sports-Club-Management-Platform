import React from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Users,
  Edit,
  Camera,
  Images,
  Award,
  Goal,
  Wallet,
  LayoutTemplate,
} from "lucide-react";
import { C, RADIUS, SHADOWS, CollapsibleRoutine } from "../../components/ui";
import {
  formatFriendlyDate,
  formatFriendlyTime,
  getPlayerName,
} from "../../utils/helpers";

interface HistoryCardProps {
  ev: any;
  players: any[];
  perms: any;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateScore: (id: string) => void;
  onOpenStats: (ev: any) => void;
  onOpenArbitration: (ev: any) => void;
  onOpenLineup: (ev: any) => void;
  onOpenAlbum: (eventId: string) => void;
  onImageClick: (data: any) => void;
  onOpenAttendance: (ev: any) => void;
}

export default function HistoryCard({
  ev,
  players,
  perms,
  isExpanded,
  onToggle,
  onUpdateScore,
  onOpenStats,
  onOpenArbitration,
  onOpenLineup,
  onOpenAlbum,
  onImageClick,
  onOpenAttendance,
}: HistoryCardProps) {
  const hasLineup =
    ev.lineup && Object.keys(ev.lineup.positions || {}).length > 0;
  const hasPayments =
    ev.arbitrationPayments && ev.arbitrationPayments.length > 0;
  const totalPaid = hasPayments
    ? ev.arbitrationPayments.reduce(
        (sum: number, p: any) => sum + (Number(p.amount) || 0),
        0,
      )
    : 0;

  const photos =
    ev.photoUrls && ev.photoUrls.length > 0
      ? ev.photoUrls
      : ev.photoUrl
        ? [ev.photoUrl]
        : [];
  const hasPhotos = photos.length > 0;

  return (
    <div
      id={`history-card-${ev.id}`}
      style={{
        border: `1px solid ${C.gray200}`,
        borderRadius: RADIUS.md,
        backgroundColor: C.white,
        overflow: "hidden",
        boxShadow: SHADOWS.sm,
      }}
    >
      {/* ── ENCABEZADO EXPANDIBLE ── */}
      <div
        onClick={onToggle}
        style={{
          fontSize: "0.875rem",
          padding: "0.875rem 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          backgroundColor: isExpanded ? C.gray50 : C.white,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isExpanded ? (
            <ChevronUp size={16} color={C.gray400} />
          ) : (
            <ChevronDown size={16} color={C.gray400} />
          )}
          <span style={{ fontWeight: "600", color: C.navy900 }}>
            {ev.title} ({formatFriendlyDate(ev.eventDate)})
          </span>
        </div>
        <span
          style={{ color: C.green, fontWeight: "600", fontSize: "0.8125rem" }}
        >
          {ev.attendees?.length || 0} asistieron
        </span>
      </div>

      {/* ── CONTENIDO EXPANDIDO ── */}
      {isExpanded && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: `1px solid ${C.gray200}`,
            backgroundColor: C.gray50,
            fontSize: "0.875rem",
            color: C.gray600,
          }}
        >
          {/* MARCADOR FINAL */}
          {ev.eventType === "Partido" && (
            <div
              style={{
                marginBottom: "1.25rem",
                padding: "1.25rem",
                backgroundColor: C.navy900,
                borderRadius: RADIUS.md,
                color: C.white,
                textAlign: "center",
                boxShadow: SHADOWS.md,
              }}
            >
              <p
                style={{
                  margin: "0 0 0.75rem 0",
                  fontSize: "0.6875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: C.navy300,
                  fontWeight: "600",
                }}
              >
                Marcador Final
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1.5rem",
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  fontFamily: "'Inter', monospace",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color:
                        ev.scoreOurs > ev.scoreTheirs ? "#34d399" : C.white,
                    }}
                  >
                    {ev.scoreOurs ?? "-"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      color: C.navy300,
                      letterSpacing: "0.05em",
                      fontWeight: "600",
                    }}
                  >
                    NOSOTROS
                  </span>
                </div>
                <span style={{ fontSize: "1rem", color: C.navy400 }}>VS</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color:
                        ev.scoreTheirs > ev.scoreOurs ? "#f87171" : C.white,
                    }}
                  >
                    {ev.scoreTheirs ?? "-"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      color: C.navy300,
                      letterSpacing: "0.05em",
                      fontWeight: "600",
                    }}
                  >
                    RIVAL
                  </span>
                </div>
              </div>

              {/* ESTADÍSTICAS DEL PARTIDO (MVP, Goles, Asistencias, Tarjetas) */}
              {(ev.mvp ||
                (ev.stats && ev.stats.some((s: any) => s.scorer || s.assist)) ||
                (ev.yellowCards && ev.yellowCards.length > 0) ||
                (ev.redCards && ev.redCards.length > 0)) && (
                <div
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderRadius: RADIUS.md,
                    padding: "0.75rem",
                    marginTop: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    textAlign: "left",
                  }}
                >
                  {ev.mvp && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <Award size={14} color={C.amber} />
                      <span style={{ color: C.white, fontSize: "0.8125rem" }}>
                        <strong>MVP:</strong> {getPlayerName(ev.mvp, players)}
                      </span>
                    </div>
                  )}

                  {ev.stats &&
                    ev.stats.length > 0 &&
                    (() => {
                      const goalsByPlayer: { [key: string]: number } = {};
                      ev.stats.forEach((stat: any) => {
                        if (stat.scorer)
                          goalsByPlayer[stat.scorer] =
                            (goalsByPlayer[stat.scorer] || 0) + 1;
                      });
                      const scorerEntries = Object.entries(goalsByPlayer);
                      if (scorerEntries.length === 0) return null;
                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.4rem",
                          }}
                        >
                          <Goal
                            size={14}
                            color={C.amber}
                            style={{ flexShrink: 0, marginTop: "2px" }}
                          />
                          <span
                            style={{ color: C.white, fontSize: "0.8125rem" }}
                          >
                            <strong>Goles:</strong>{" "}
                            {scorerEntries.map(([id, count], index) => {
                              const name = getPlayerName(id, players);
                              const parts = name.split(" ");
                              let shortName = parts[0];
                              if (parts.length > 1)
                                shortName += " " + parts[1].charAt(0) + ".";
                              return (
                                <span key={id}>
                                  {index > 0 && ", "} {shortName}{" "}
                                  {count > 1 ? `(${count})` : ""}
                                </span>
                              );
                            })}
                          </span>
                        </div>
                      );
                    })()}

                  {/* BLOQUE DE ASISTENCIAS */}
                  {ev.stats &&
                    ev.stats.length > 0 &&
                    (() => {
                      const assistsByPlayer: { [key: string]: number } = {};
                      ev.stats.forEach((stat: any) => {
                        if (stat.assist)
                          assistsByPlayer[stat.assist] =
                            (assistsByPlayer[stat.assist] || 0) + 1;
                      });
                      const assistEntries = Object.entries(assistsByPlayer);
                      if (assistEntries.length === 0) return null;
                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.4rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              marginTop: "2px",
                              flexShrink: 0,
                            }}
                          >
                            👟
                          </span>
                          <span
                            style={{ color: C.white, fontSize: "0.8125rem" }}
                          >
                            <strong>Asistencias:</strong>{" "}
                            {assistEntries.map(([id, count], index) => {
                              const name = getPlayerName(id, players);
                              const parts = name.split(" ");
                              let shortName = parts[0];
                              if (parts.length > 1)
                                shortName += " " + parts[1].charAt(0) + ".";
                              return (
                                <span key={id}>
                                  {index > 0 && ", "} {shortName}{" "}
                                  {count > 1 ? `(${count})` : ""}
                                </span>
                              );
                            })}
                          </span>
                        </div>
                      );
                    })()}

                  {ev.yellowCards && ev.yellowCards.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.4rem",
                      }}
                    >
                      <span style={{ fontSize: "12px", marginTop: "2px" }}>
                        🟨
                      </span>
                      <span style={{ color: C.navy100, fontSize: "0.8125rem" }}>
                        <strong>Amarillas:</strong>{" "}
                        {ev.yellowCards
                          .map((yc: string) => getPlayerName(yc, players))
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {ev.redCards && ev.redCards.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.4rem",
                      }}
                    >
                      <span style={{ fontSize: "12px", marginTop: "2px" }}>
                        🟥
                      </span>
                      <span style={{ color: C.navy100, fontSize: "0.8125rem" }}>
                        <strong>Rojas:</strong>{" "}
                        {ev.redCards
                          .map((rc: string) => getPlayerName(rc, players))
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BOTONES DE ACCIÓN PARA EL PARTIDO */}
          {ev.eventType === "Partido" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "1rem",
                marginBottom: "1.25rem",
                flexWrap: "wrap",
              }}
            >
              {perms.canEditAgenda && (
                <button
                  onClick={() => onUpdateScore(ev.id)}
                  style={{
                    background: C.white,
                    border: `1px solid ${C.gray300}`,
                    borderRadius: RADIUS.md,
                    color: C.navy600,
                    cursor: "pointer",
                    padding: "0.6rem 0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    boxShadow: SHADOWS.sm,
                    flex: "1 1 140px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  {ev.scoreOurs !== undefined
                    ? "Editar Marcador"
                    : "Registrar Marcador"}
                </button>
              )}
              {perms.canEditAgenda &&
                ev.scoreOurs !== undefined &&
                ev.scoreTheirs !== undefined && (
                  <button
                    onClick={() => onOpenStats(ev)}
                    style={{
                      background: C.blueAccent,
                      border: "none",
                      borderRadius: RADIUS.md,
                      color: C.navy900,
                      cursor: "pointer",
                      padding: "0.6rem 0.5rem",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      boxShadow: SHADOWS.sm,
                      flex: "1 1 140px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    Editar Estadísticas
                  </button>
                )}
              <button
                onClick={() => onOpenArbitration(ev)}
                style={{
                  background: "transparent",
                  border: `1px solid ${C.amber}`,
                  borderRadius: RADIUS.md,
                  color: C.amber,
                  cursor: "pointer",
                  padding: "0.6rem 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  boxShadow: SHADOWS.sm,
                  flex: "1 1 140px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.3rem",
                  textAlign: "center",
                }}
              >
                <Wallet size={14} /> Pagos Arbitraje
              </button>
              {(perms.canEditAgenda || hasLineup) && (
                <button
                  onClick={() => onOpenLineup(ev)}
                  style={{
                    background: C.white,
                    border: `1px solid ${C.gray300}`,
                    borderRadius: RADIUS.md,
                    color: C.navy600,
                    cursor: "pointer",
                    padding: "0.6rem 0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    boxShadow: SHADOWS.sm,
                    flex: "1 1 140px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.3rem",
                    textAlign: "center",
                  }}
                >
                  <LayoutTemplate size={14} />{" "}
                  {perms.canEditAgenda
                    ? hasLineup
                      ? "Editar Alineación"
                      : "Armar Alineación"
                    : "Ver Alineación"}
                </button>
              )}
            </div>
          )}

          {/* RESUMEN DE PAGOS DE ARBITRAJE */}
          {hasPayments && (
            <div
              style={{
                marginBottom: "1.25rem", // <-- CAMBIAMOS ESTO (antes era marginTop)
                backgroundColor: "rgba(245, 158, 11, 0.1)", // Fondo ámbar muy suave
                border: `1px solid ${C.amber}`,
                borderRadius: RADIUS.md,
                padding: "0.75rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: SHADOWS.sm,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
              >
                <div
                  style={{
                    backgroundColor: C.amber,
                    borderRadius: RADIUS.sm,
                    padding: "0.3rem",
                    display: "flex",
                  }}
                >
                  <Wallet size={16} color={C.white} />
                </div>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: C.navy900,
                    fontWeight: "700",
                  }}
                >
                  Recaudación Arbitraje
                </span>
              </div>
              <span
                style={{
                  color: C.amber,
                  fontWeight: "900",
                  fontSize: "1.1rem",
                }}
              >
                ${totalPaid}
              </span>
            </div>
          )}

          {/* RUTINA DEL ENTRENAMIENTO */}
          {ev.eventType === "Entrenamiento" && ev.routine && (
            <CollapsibleRoutine routine={ev.routine} />
          )}

          {/* INFO DE LUGAR Y HORA Y ASISTENCIA */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginBottom: "1rem",
              marginTop: ev.eventType === "Entrenamiento" ? "1rem" : "0",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <MapPin size={14} /> <strong>Lugar:</strong>{" "}
              {ev.location || "No especificado"}
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Clock size={14} /> <strong>Hora:</strong>{" "}
              {formatFriendlyTime(ev.eventTime)}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <Users size={14} style={{ marginTop: "3px", flexShrink: 0 }} />
                <span>
                  <strong>Asistentes:</strong>{" "}
                  {ev.attendees?.length > 0
                    ? ev.attendees
                        .map((id: string) => getPlayerName(id, players))
                        .join(", ")
                    : "Ninguno"}
                </span>
              </div>

              {/* 👇 BOTÓN PARA EDITAR ASISTENCIA EN EL HISTORIAL 👇 */}
              {perms.canEditAgenda && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAttendance(ev);
                  }}
                  style={{
                    alignSelf: "flex-start",
                    background: C.white,
                    border: `1px solid ${C.gray300}`,
                    borderRadius: RADIUS.md,
                    color: C.navy600,
                    cursor: "pointer",
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    boxShadow: SHADOWS.sm,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    marginLeft: "1.3rem",
                    marginTop: "0.2rem",
                  }}
                >
                  <Edit size={12} /> Editar Asistencia
                </button>
              )}
            </div>
          </div>

          {/* FOTO DEL EVENTO */}
          {hasPhotos ? (
            <div style={{ marginTop: "1rem", position: "relative" }}>
              <img
                src={photos[0]}
                alt={`Foto de ${ev.title}`}
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: RADIUS.md,
                  cursor: "pointer",
                  boxShadow: SHADOWS.sm,
                }}
                onClick={() =>
                  onImageClick({
                    urls: photos,
                    initialIndex: 0,
                    caption: `${ev.title} - ${formatFriendlyDate(ev.eventDate)}`,
                  })
                }
              />
              {photos.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "0.5rem",
                    left: "0.5rem",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    color: C.white,
                    padding: "0.3rem 0.6rem",
                    borderRadius: RADIUS.full,
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    pointerEvents: "none",
                  }}
                >
                  <Images size={14} /> 1 / {photos.length}
                </div>
              )}
              {(perms.canEditPortada || perms.canEditAgenda) && (
                <button
                  onClick={() => onOpenAlbum(ev.id)}
                  style={{
                    position: "absolute",
                    top: "0.5rem",
                    right: "0.5rem",
                    background: "rgba(255,255,255,0.95)",
                    border: `1px solid ${C.gray200}`,
                    borderRadius: RADIUS.md,
                    padding: "0.4rem 0.6rem",
                    cursor: "pointer",
                    boxShadow: SHADOWS.sm,
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    color: C.navy900,
                  }}
                >
                  <Edit size={12} />{" "}
                  {photos.length > 1 ? "Editar Álbum" : "Cambiar Foto"}
                </button>
              )}
            </div>
          ) : perms.canEditPortada || perms.canEditAgenda ? (
            <button
              onClick={() => onOpenAlbum(ev.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                width: "100%",
                padding: "0.75rem",
                border: `1px dashed ${C.gray300}`,
                borderRadius: RADIUS.md,
                backgroundColor: C.white,
                color: C.navy600,
                fontWeight: "600",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            >
              <Camera size={16} /> Crear Álbum del Evento
            </button>
          ) : (
            <p
              style={{
                textAlign: "center",
                color: C.gray400,
                fontStyle: "italic",
                margin: 0,
                marginTop: "1rem",
              }}
            >
              Sin foto del evento
            </p>
          )}
        </div>
      )}
    </div>
  );
}
