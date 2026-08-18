import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";

import {
  Trophy,
  Target,
  Calendar,
  Clock,
  MapPin,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Users,
  Award,
  Hand,
  Plus,
  X,
  Camera,
  LayoutTemplate,
  AlertTriangle,
  Goal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Images,
  Wallet,
} from "lucide-react";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../hooks/useClubData";

import {
  C,
  RADIUS,
  SHADOWS,
  SectionCard,
  SegmentedControl,
  FormInput,
  FormSelect,
  FormTextarea,
  PrimaryButton,
  SecondaryButton,
  Badge,
  StatBox,
  CollapsibleRoutine,
} from "../components/ui";

import {
  formatFriendlyDate,
  formatFriendlyTime,
  getPlayerName,
} from "../utils/helpers";
import {
  EventCard,
  AttendanceModal,
  LineupModal,
  LightboxModal,
} from "../components/AppComponents";

export default function Agenda({ events, players, clubInfo, perms }: any) {
  // ── Estados del Formulario ──
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventType, setEventType] = useState<"Partido" | "Entrenamiento">(
    "Partido",
  );
  const [eventTitle, setEventTitle] = useState("");
  const [eventRoutine, setEventRoutine] = useState("");
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [eventTime, setEventTime] = useState("20:00");
  const [eventLocation, setEventLocation] = useState("");

  // ── Estados de la Interfaz ──
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null,
  );
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(
    null,
  );

  // ── Estados de Modales y Fotos ──
  const [attendanceModalEvent, setAttendanceModalEvent] = useState<any | null>(
    null,
  );
  const [lineupModalEvent, setLineupModalEvent] = useState<any | null>(null);
  const [statsModalEvent, setStatsModalEvent] = useState<any | null>(null);

  // ── Estados del Nuevo Álbum y Lightbox ──
  const [lightboxData, setLightboxData] = useState<{
    urls: string[];
    initialIndex: number;
    caption?: string;
  } | null>(null);
  const [albumModalEvent, setAlbumModalEvent] = useState<any | null>(null);
  const [albumUrls, setAlbumUrls] = useState<string[]>([]);

  // ── Estados del Formulario de Estadísticas ──
  const [statsFormGoalkeepers, setStatsFormGoalkeepers] = useState<
    { id: string; conceded: number }[]
  >([]);
  const [statsFormMVP, setStatsFormMVP] = useState("");
  const [statsFormYellowCards, setStatsFormYellowCards] = useState<string[]>(
    [],
  );
  const [statsFormRedCards, setStatsFormRedCards] = useState<string[]>([]);
  const [statsFormScorers, setStatsFormScorers] = useState<
    { scorer: string; assist: string }[]
  >([]);

  // ── NUEVO: Estados para Pagos de Arbitraje ──
  const [arbitrationModalEvent, setArbitrationModalEvent] = useState<
    any | null
  >(null);
  const [arbitrationPayments, setArbitrationPayments] = useState<
    { playerId: string; amount: number }[]
  >([]);

  // ── Determinar si el usuario puede editar arbitraje ──
  const canEditArbitration = perms?.canEditAgenda || perms?.canEditFinanzas;

  // ── CÁLCULOS ──
  const statsClub = useMemo(() => {
    let jugados = 0,
      ganados = 0,
      perdidos = 0,
      entrenamientos = 0;
    events
      .filter(
        (e: any) => new Date(e.eventDate + "T" + e.eventTime) < new Date(),
      )
      .forEach((ev: any) => {
        if (ev.eventType === "Partido") {
          jugados++;
          if (ev.scoreOurs !== undefined && ev.scoreTheirs !== undefined) {
            if (ev.scoreOurs > ev.scoreTheirs) ganados++;
            if (ev.scoreOurs < ev.scoreTheirs) perdidos++;
          }
        } else {
          entrenamientos++;
        }
      });
    return { jugados, ganados, perdidos, entrenamientos };
  }, [events]);

  const { nextEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const sorted = [...events].sort(
      (a: any, b: any) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
    );
    return {
      nextEvents: sorted.filter(
        (e) => new Date(e.eventDate + "T" + e.eventTime) >= now,
      ),
      pastEvents: sorted.filter(
        (e) => new Date(e.eventDate + "T" + e.eventTime) < now,
      ),
    };
  }, [events]);

  // ── FUNCIONES DE EVENTOS ──
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      eventType,
      title: eventTitle,
      routine: eventType === "Entrenamiento" ? eventRoutine.trim() : "",
      eventDate,
      eventTime,
      location: eventLocation || "Por definir",
    };
    if (editingEventId) {
      await updateDoc(doc(db, "events", editingEventId), data);
      setEditingEventId(null);
    } else {
      await addDoc(collection(db, "events"), {
        ...data,
        attendees: [],
        timestamp: new Date().toISOString(),
      });
    }
    setEventTitle("");
    setEventLocation("");
    setEventRoutine("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este evento?"))
      await deleteDoc(doc(db, "events", id));
  };

  const handleUpdateScore = async (eventId: string) => {
    const input = window.prompt(
      "Ingresa el marcador final (Nosotros - Rival)\nEjemplo: 3-1",
    );
    if (!input) return;
    const parts = input.split("-");
    if (
      parts.length === 2 &&
      !isNaN(parseInt(parts[0])) &&
      !isNaN(parseInt(parts[1]))
    ) {
      await updateDoc(doc(db, "events", eventId), {
        scoreOurs: parseInt(parts[0]),
        scoreTheirs: parseInt(parts[1]),
      });
    } else alert("Formato incorrecto.");
  };

  // ── NUEVO FLUJO DE ÁLBUM ──
  const openAlbumModal = (eventId: string) => {
    const ev = events.find((e: any) => e.id === eventId);
    if (!ev) return;
    setAlbumModalEvent(ev);
    const initialUrls =
      ev.photoUrls && ev.photoUrls.length > 0
        ? ev.photoUrls
        : ev.photoUrl
          ? [ev.photoUrl]
          : [];
    setAlbumUrls(initialUrls.length > 0 ? initialUrls : [""]);
  };

  const saveAlbum = async () => {
    if (!albumModalEvent) return;
    const cleanUrls = albumUrls
      .map((url) => url.trim())
      .filter((url) => url !== "");
    await updateDoc(doc(db, "events", albumModalEvent.id), {
      photoUrls: cleanUrls,
      photoUrl: cleanUrls.length > 0 ? cleanUrls[0] : null,
    });
    setAlbumModalEvent(null);
  };

  const movePhotoUp = (index: number) => {
    if (index === 0) return;
    const newUrls = [...albumUrls];
    const temp = newUrls[index - 1];
    newUrls[index - 1] = newUrls[index];
    newUrls[index] = temp;
    setAlbumUrls(newUrls);
  };

  // ── FUNCIONES DE ESTADÍSTICAS ──
  const openStatsModal = (ev: any) => {
    setStatsModalEvent(ev);
    let initialGks: { id: string; conceded: number }[] = [];
    if (
      ev.goalkeepers &&
      Array.isArray(ev.goalkeepers) &&
      ev.goalkeepers.length > 0
    ) {
      initialGks = ev.goalkeepers.map((gk: any) => ({
        id:
          players.find((p: any) => p.name === gk.id || p.id === gk.id)?.id ||
          (gk.id.startsWith("guest-") ? gk.id : `guest-${gk.id}`),
        conceded: gk.conceded || 0,
      }));
    } else if (ev.goalkeeper) {
      const id =
        players.find(
          (p: any) => p.name === ev.goalkeeper || p.id === ev.goalkeeper,
        )?.id ||
        (ev.goalkeeper.startsWith("guest-")
          ? ev.goalkeeper
          : `guest-${ev.goalkeeper}`);
      initialGks = [{ id, conceded: 0 }];
    }
    setStatsFormGoalkeepers(initialGks);
    setStatsFormMVP(
      players.find((p: any) => p.name === ev.mvp || p.id === ev.mvp)?.id ||
        (ev.mvp
          ? ev.mvp.startsWith("guest-")
            ? ev.mvp
            : `guest-${ev.mvp}`
          : ""),
    );
    setStatsFormYellowCards(
      (ev.yellowCards || []).map(
        (yc: string) =>
          players.find((p: any) => p.name === yc || p.id === yc)?.id ||
          (yc.startsWith("guest-") ? yc : `guest-${yc}`),
      ),
    );
    setStatsFormRedCards(
      (ev.redCards || []).map(
        (rc: string) =>
          players.find((p: any) => p.name === rc || p.id === rc)?.id ||
          (rc.startsWith("guest-") ? rc : `guest-${rc}`),
      ),
    );
    if (ev.stats && ev.stats.length === ev.scoreOurs) {
      setStatsFormScorers(
        ev.stats.map((s: any) => ({
          scorer:
            players.find((p: any) => p.name === s.scorer || p.id === s.scorer)
              ?.id ||
            (s.scorer
              ? s.scorer.startsWith("guest-")
                ? s.scorer
                : `guest-${s.scorer}`
              : ""),
          assist:
            players.find((p: any) => p.name === s.assist || p.id === s.assist)
              ?.id ||
            (s.assist
              ? s.assist.startsWith("guest-")
                ? s.assist
                : `guest-${s.assist}`
              : ""),
        })),
      );
    } else {
      const newStats = [];
      for (let i = 0; i < (ev.scoreOurs || 0); i++)
        newStats.push({ scorer: "", assist: "" });
      setStatsFormScorers(newStats);
    }
  };

  const addGoalkeeper = () =>
    setStatsFormGoalkeepers([...statsFormGoalkeepers, { id: "", conceded: 0 }]);
  const removeGoalkeeper = (index: number) =>
    setStatsFormGoalkeepers(statsFormGoalkeepers.filter((_, i) => i !== index));
  const updateGoalkeeper = (
    index: number,
    field: "id" | "conceded",
    value: string | number,
  ) => {
    const newGks = [...statsFormGoalkeepers];
    if (field === "id") newGks[index].id = value as string;
    else newGks[index].conceded = Number(value) || 0;
    setStatsFormGoalkeepers(newGks);
  };
  const handleStatChange = (
    index: number,
    field: "scorer" | "assist",
    value: string,
  ) => {
    const newStats = [...statsFormScorers];
    newStats[index][field] = value;
    setStatsFormScorers(newStats);
  };

  const saveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDoc(doc(db, "events", statsModalEvent.id), {
      goalkeepers: statsFormGoalkeepers.filter((gk) => gk.id.trim() !== ""),
      goalkeeper: null,
      stats: statsFormScorers,
      mvp: statsFormMVP,
      yellowCards: statsFormYellowCards.filter((id) => id.trim() !== ""),
      redCards: statsFormRedCards.filter((id) => id.trim() !== ""),
    });
    setStatsModalEvent(null);
  };

  // ── NUEVO: FUNCIONES PARA PAGOS DE ARBITRAJE ──
  const normalizeAttendeeId = (att: string) => {
    const p = players.find((pl: any) => pl.name === att || pl.id === att);
    return p ? p.id : att.startsWith("guest-") ? att : `guest-${att}`;
  };

  const openArbitrationModal = (ev: any) => {
    setArbitrationModalEvent(ev);
    const initial = (ev.arbitrationPayments || []).map((p: any) => ({
      playerId: normalizeAttendeeId(p.playerId),
      amount: Number(p.amount) || 0,
    }));
    setArbitrationPayments(initial);
  };

  const updateArbitrationPayment = (playerId: string, amount: number) => {
    setArbitrationPayments((prev) => {
      const exists = prev.find((p) => p.playerId === playerId);
      if (exists) {
        return prev.map((p) =>
          p.playerId === playerId ? { ...p, amount } : p,
        );
      } else {
        return [...prev, { playerId, amount }];
      }
    });
  };

  const removeArbitrationPayment = (playerId: string) => {
    setArbitrationPayments((prev) =>
      prev.filter((p) => p.playerId !== playerId),
    );
  };

  const saveArbitration = async () => {
    if (!arbitrationModalEvent) return;
    const cleanPayments = arbitrationPayments.filter(
      (p) => p.playerId && p.amount > 0,
    );
    await updateDoc(doc(db, "events", arbitrationModalEvent.id), {
      arbitrationPayments: cleanPayments,
    });
    setArbitrationModalEvent(null);
  };

  const arbitrationTotal = arbitrationPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  );

  // ── RENDER ──
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* SCORE CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "0.75rem",
        }}
      >
        <StatBox
          icon={<Trophy size={20} color={C.navy600} />}
          label="Jugados"
          value={statsClub.jugados}
        />
        <StatBox
          icon={<TrendingUp size={20} color={C.green} />}
          label="Ganados"
          value={statsClub.ganados}
          valueColor={C.green}
        />
        <StatBox
          icon={<TrendingDown size={20} color={C.red} />}
          label="Perdidos"
          value={statsClub.perdidos}
          valueColor={C.red}
        />
        <StatBox
          icon={<Target size={20} color={C.navy600} />}
          label="Entrenamientos"
          value={statsClub.entrenamientos}
        />
      </div>

      {/* FORMULARIO AGENDAR */}
      {perms.canEditAgenda && (
        <SectionCard
          title={editingEventId ? "Editar Evento" : "Programar Evento"}
          icon={<Calendar size={16} />}
        >
          <form
            onSubmit={handleSaveEvent}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <SegmentedControl
              options={[
                {
                  label: "Partido",
                  value: "Partido",
                  icon: <Trophy size={14} />,
                },
                {
                  label: "Entrenamiento",
                  value: "Entrenamiento",
                  icon: <Target size={14} />,
                },
              ]}
              value={eventType}
              onChange={(v: any) => {
                setEventType(v);
                if (v === "Partido") setEventRoutine("");
              }}
            />
            <FormInput
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder={eventType === "Partido" ? "Rival" : "Descripción"}
            />
            {eventType === "Entrenamiento" && (
              <FormTextarea
                value={eventRoutine}
                onChange={(e) => setEventRoutine(e.target.value)}
                placeholder="Rutina del día..."
                rows={3}
              />
            )}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <FormInput
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
              <FormInput
                type="time"
                required
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
            <FormInput
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Lugar o Campo"
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <PrimaryButton type="submit" style={{ flex: 1 }}>
                {editingEventId ? "Guardar Cambios" : "Agendar"}
              </PrimaryButton>
              {editingEventId && (
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    setEditingEventId(null);
                    setEventTitle("");
                    setEventLocation("");
                    setEventRoutine("");
                  }}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </SecondaryButton>
              )}
            </div>
          </form>
        </SectionCard>
      )}

      {/* PRÓXIMOS EVENTOS */}
      <div>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: "700",
            marginBottom: "1rem",
            color: C.navy900,
          }}
        >
          Próximos compromisos
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {nextEvents.map((ev: any) => (
            <EventCard
              key={ev.id}
              ev={ev}
              players={players}
              perms={perms}
              isHighlighted={highlightedEventId === ev.id}
              onDelete={() => handleDelete(ev.id)}
              onEdit={() => {
                setEditingEventId(ev.id);
                setEventTitle(ev.title);
                setEventType(ev.eventType);
                setEventDate(ev.eventDate);
                setEventTime(ev.eventTime);
                setEventRoutine(ev.routine || "");
                setEventLocation(ev.location);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenAttendance={() => setAttendanceModalEvent(ev)}
              onOpenLineup={() => setLineupModalEvent(ev)}
              onImageClick={(data: any) => setLightboxData(data)}
              onEditPhoto={openAlbumModal}
              onOpenArbitration={() => openArbitrationModal(ev)}
            />
          ))}
        </div>
      </div>

      {/* HISTORIAL COMPLETO */}
      <div>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: "700",
            marginBottom: "1rem",
            color: C.gray500,
          }}
        >
          Historial de Resultados
        </h2>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {pastEvents.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: C.gray400 }}>
              Aún no hay eventos pasados.
            </p>
          ) : (
            pastEvents
              .sort(
                (a: any, b: any) =>
                  new Date(b.eventDate + "T" + b.eventTime).getTime() -
                  new Date(a.eventDate + "T" + a.eventTime).getTime(),
              )
              .map((ev: any) => {
                const isExpanded = expandedHistoryId === ev.id;
                const hasLineup =
                  ev.lineup &&
                  Object.keys(ev.lineup.positions || {}).length > 0;
                const hasPayments =
                  ev.arbitrationPayments && ev.arbitrationPayments.length > 0;
                const totalPaid = hasPayments
                  ? ev.arbitrationPayments.reduce(
                      (sum: number, p: any) => sum + (Number(p.amount) || 0),
                      0,
                    )
                  : 0;

                return (
                  <div
                    key={ev.id}
                    id={`history-card-${ev.id}`}
                    style={{
                      border: `1px solid ${C.gray200}`,
                      borderRadius: RADIUS.md,
                      backgroundColor: C.white,
                      overflow: "hidden",
                      boxShadow: SHADOWS.sm,
                    }}
                  >
                    <div
                      onClick={() => {
                        const willExpand = !isExpanded;
                        setExpandedHistoryId(willExpand ? ev.id : null);
                        if (willExpand)
                          setTimeout(() => {
                            document
                              .getElementById(`history-card-${ev.id}`)
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }, 100);
                      }}
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
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
                        style={{
                          color: C.green,
                          fontWeight: "600",
                          fontSize: "0.8125rem",
                        }}
                      >
                        {ev.attendees?.length || 0} asistieron
                      </span>
                    </div>

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
                                      ev.scoreOurs > ev.scoreTheirs
                                        ? "#34d399"
                                        : C.white,
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
                              <span
                                style={{ fontSize: "1rem", color: C.navy400 }}
                              >
                                VS
                              </span>
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
                                      ev.scoreTheirs > ev.scoreOurs
                                        ? "#f87171"
                                        : C.white,
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

                            {/* ESTADÍSTICAS DEL PARTIDO */}
                            {(ev.mvp ||
                              (ev.goalkeepers && ev.goalkeepers.length > 0) ||
                              (ev.stats &&
                                ev.stats.some((s: any) => s.scorer)) ||
                              (ev.stats &&
                                ev.stats.some((s: any) => s.assist)) ||
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
                                    <span
                                      style={{
                                        color: C.white,
                                        fontSize: "0.8125rem",
                                      }}
                                    >
                                      <strong>MVP:</strong>{" "}
                                      {getPlayerName(ev.mvp, players)}
                                    </span>
                                  </div>
                                )}
                                {ev.stats &&
                                  ev.stats.length > 0 &&
                                  (() => {
                                    const goalsByPlayer: {
                                      [key: string]: number;
                                    } = {};
                                    ev.stats.forEach((stat: any) => {
                                      if (stat.scorer)
                                        goalsByPlayer[stat.scorer] =
                                          (goalsByPlayer[stat.scorer] || 0) + 1;
                                    });
                                    const scorerEntries =
                                      Object.entries(goalsByPlayer);
                                    if (scorerEntries.length === 0) return null;
                                    return (
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "0.4rem",
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <Goal size={14} color={C.amber} />
                                        <span
                                          style={{
                                            color: C.white,
                                            fontSize: "0.8125rem",
                                          }}
                                        >
                                          <strong>Goles:</strong>{" "}
                                          {scorerEntries.map(
                                            ([id, count], index) => {
                                              const name = getPlayerName(
                                                id,
                                                players,
                                              );
                                              const parts = name.split(" ");
                                              let shortName = parts[0];
                                              if (parts.length > 1) {
                                                shortName +=
                                                  " " +
                                                  parts[1].charAt(0) +
                                                  ".";
                                              }
                                              return (
                                                <span key={id}>
                                                  {index > 0 && ", "}{" "}
                                                  {shortName} ({count})
                                                </span>
                                              );
                                            },
                                          )}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                {ev.stats &&
                                  ev.stats.length > 0 &&
                                  (() => {
                                    const assistsByPlayer: {
                                      [key: string]: number;
                                    } = {};
                                    ev.stats.forEach((stat: any) => {
                                      if (stat.assist)
                                        assistsByPlayer[stat.assist] =
                                          (assistsByPlayer[stat.assist] || 0) +
                                          1;
                                    });
                                    const assistEntries =
                                      Object.entries(assistsByPlayer);
                                    if (assistEntries.length === 0) return null;
                                    return (
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "0.4rem",
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <span style={{ fontSize: "14px" }}>
                                          🤝
                                        </span>
                                        <span
                                          style={{
                                            color: C.white,
                                            fontSize: "0.8125rem",
                                          }}
                                        >
                                          <strong>Asistencias:</strong>{" "}
                                          {assistEntries.map(
                                            ([id, count], index) => {
                                              const name = getPlayerName(
                                                id,
                                                players,
                                              );
                                              const parts = name.split(" ");
                                              let shortName = parts[0];
                                              if (parts.length > 1) {
                                                shortName +=
                                                  " " +
                                                  parts[1].charAt(0) +
                                                  ".";
                                              }
                                              return (
                                                <span key={id}>
                                                  {index > 0 && ", "}{" "}
                                                  {shortName} ({count})
                                                </span>
                                              );
                                            },
                                          )}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                {ev.yellowCards &&
                                  ev.yellowCards.length > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.4rem",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: "12px",
                                          marginTop: "2px",
                                        }}
                                      >
                                        🟨
                                      </span>
                                      <span
                                        style={{
                                          color: C.navy100,
                                          fontSize: "0.8125rem",
                                        }}
                                      >
                                        <strong>Amarillas:</strong>{" "}
                                        {ev.yellowCards
                                          .map((yc: string) =>
                                            getPlayerName(yc, players),
                                          )
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
                                    <span
                                      style={{
                                        fontSize: "12px",
                                        marginTop: "2px",
                                      }}
                                    >
                                      🟥
                                    </span>
                                    <span
                                      style={{
                                        color: C.navy100,
                                        fontSize: "0.8125rem",
                                      }}
                                    >
                                      <strong>Rojas:</strong>{" "}
                                      {ev.redCards
                                        .map((rc: string) =>
                                          getPlayerName(rc, players),
                                        )
                                        .join(", ")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "0.5rem",
                                marginTop: "1rem",
                                flexWrap: "wrap",
                              }}
                            >
                              {perms.canEditAgenda && (
                                <button
                                  onClick={() => handleUpdateScore(ev.id)}
                                  style={{
                                    background: "rgba(255,255,255,0.1)",
                                    border: "none",
                                    borderRadius: RADIUS.md,
                                    color: C.white,
                                    cursor: "pointer",
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
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
                                  // 👇 AQUI HACEMOS QUE EL TEXTO SEA NEGRO PARA QUE SE LEA SOBRE EL BOTON DORADO 👇
                                  <button
                                    onClick={() => openStatsModal(ev)}
                                    style={{
                                      background: C.blueAccent,
                                      border: "none",
                                      borderRadius: RADIUS.md,
                                      color: C.navy900,
                                      cursor: "pointer",
                                      padding: "0.5rem 1rem",
                                      fontSize: "0.75rem",
                                      fontWeight: "800",
                                    }}
                                  >
                                    Editar Estadísticas
                                  </button>
                                )}
                              <button
                                onClick={() => openArbitrationModal(ev)}
                                style={{
                                  background: "rgba(255,255,255,0.1)",
                                  border: `1px solid ${C.amber}`,
                                  borderRadius: RADIUS.md,
                                  color: C.amber,
                                  cursor: "pointer",
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.75rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                              >
                                <Wallet size={14} /> Pagos Arbitraje
                              </button>
                              {(perms.canEditAgenda || hasLineup) && (
                                // 👇 AQUÍ TAMBIÉN CORREGIMOS EL BOTÓN "ARMAR ALINEACIÓN" 👇
                                <button
                                  onClick={() => setLineupModalEvent(ev)}
                                  style={{
                                    background: "transparent",
                                    border: `1px solid ${C.navy300}`,
                                    borderRadius: RADIUS.md,
                                    color: C.navy100,
                                    cursor: "pointer",
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
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

                            {/* RESUMEN DE PAGOS DE ARBITRAJE */}
                            {hasPayments && (
                              <div
                                style={{
                                  marginTop: "1rem",
                                  backgroundColor: "rgba(255,255,255,0.05)",
                                  borderRadius: RADIUS.md,
                                  padding: "0.75rem",
                                  textAlign: "left",
                                }}
                              >
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "0.75rem",
                                    color: C.navy300,
                                    fontWeight: "600",
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <span>
                                    <Wallet
                                      size={14}
                                      style={{ verticalAlign: "middle" }}
                                    />{" "}
                                    Total recaudado arbitraje:
                                  </span>
                                  <span
                                    style={{
                                      color: C.amber,
                                      fontWeight: "800",
                                    }}
                                  >
                                    ${totalPaid}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {ev.eventType === "Entrenamiento" && ev.routine && (
                          <CollapsibleRoutine routine={ev.routine} />
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <MapPin size={14} /> <strong>Lugar:</strong>{" "}
                            {ev.location || "No especificado"}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <Clock size={14} /> <strong>Hora:</strong>{" "}
                            {formatFriendlyTime(ev.eventTime)}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
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
                              <Users
                                size={14}
                                style={{ marginTop: "3px", flexShrink: 0 }}
                              />{" "}
                              <span>
                                <strong>Asistentes:</strong>{" "}
                                {ev.attendees?.length > 0
                                  ? ev.attendees
                                      .map((id: string) =>
                                        getPlayerName(id, players),
                                      )
                                      .join(", ")
                                  : "Ninguno"}
                              </span>
                            </div>
                            {perms.canEditAgenda && (
                              <button
                                onClick={() => setAttendanceModalEvent(ev)}
                                style={{
                                  background: C.white,
                                  border: `1px solid ${C.gray200}`,
                                  borderRadius: RADIUS.sm,
                                  padding: "0.25rem 0.5rem",
                                  color: C.navy600,
                                  cursor: "pointer",
                                  fontSize: "0.6875rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  flexShrink: 0,
                                  boxShadow: SHADOWS.sm,
                                }}
                              >
                                <Edit size={12} /> Editar
                              </button>
                            )}
                          </div>
                        </div>

                        {/* FOTO DEL EVENTO */}
                        {(() => {
                          const photos =
                            ev.photoUrls && ev.photoUrls.length > 0
                              ? ev.photoUrls
                              : ev.photoUrl
                                ? [ev.photoUrl]
                                : [];
                          const hasPhotos = photos.length > 0;

                          return hasPhotos ? (
                            <div
                              style={{
                                marginTop: "1rem",
                                position: "relative",
                              }}
                            >
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
                                  setLightboxData({
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
                              {(perms.canEditPortada ||
                                perms.canEditAgenda) && (
                                <button
                                  onClick={() => openAlbumModal(ev.id)}
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
                                  {photos.length > 1
                                    ? "Editar Álbum"
                                    : "Cambiar Foto"}
                                </button>
                              )}
                            </div>
                          ) : (
                            (perms.canEditPortada || perms.canEditAgenda) && (
                              <button
                                onClick={() => openAlbumModal(ev.id)}
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
                            )
                          );
                        })()}
                        {!ev.photoUrl &&
                          (!ev.photoUrls || ev.photoUrls.length === 0) &&
                          !perms.canEditPortada &&
                          !perms.canEditAgenda && (
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
              })
          )}
        </div>
      </div>

      {/* MODALES GLOBALES */}
      {attendanceModalEvent && (
        <AttendanceModal
          ev={attendanceModalEvent}
          players={players}
          perms={perms}
          onClose={() => setAttendanceModalEvent(null)}
          onSave={async (id: string, att: string[]) => {
            await updateDoc(doc(db, "events", id), { attendees: att });
            setAttendanceModalEvent(null);
          }}
        />
      )}

      {lineupModalEvent && (
        <LineupModal
          ev={lineupModalEvent}
          players={players}
          clubInfo={clubInfo}
          perms={perms}
          onClose={() => setLineupModalEvent(null)}
          onSave={async (id: string, lineup: any) => {
            await updateDoc(doc(db, "events", id), { lineup });
            setLineupModalEvent(null);
          }}
          onSaveBase={async (mode: string, lineup: any) => {
            await setDoc(
              doc(db, "settings", "club_info"),
              {
                ...clubInfo,
                defaultLineups: { ...clubInfo.defaultLineups, [mode]: lineup },
              },
              { merge: true },
            );
            alert("Guardada");
          }}
        />
      )}

      {/* NUEVO MODAL: GESTOR DE ÁLBUM (CON PORTAL) */}
      {albumModalEvent &&
        createPortal(
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
            onClick={() => setAlbumModalEvent(null)}
          >
            <div
              style={{
                backgroundColor: C.white,
                borderRadius: RADIUS.xl,
                padding: "2rem",
                width: "100%",
                maxWidth: "500px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: SHADOWS.xl,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    color: C.navy900,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Images size={20} color={C.blueAccent} /> Álbum del Evento
                </h3>
                <button
                  onClick={() => setAlbumModalEvent(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: C.gray400,
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <p
                style={{
                  fontSize: "0.8125rem",
                  color: C.gray500,
                  marginBottom: "1.5rem",
                }}
              >
                Pega los links de las imágenes (Imgur, Postimages). La primera
                imagen será la foto de portada.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                {albumUrls.map((url, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      padding: "0.5rem",
                      backgroundColor: C.gray50,
                      borderRadius: RADIUS.md,
                      border: `1px solid ${i === 0 ? C.amber : C.gray200}`,
                      position: "relative",
                    }}
                  >
                    {i === 0 && (
                      <Badge
                        color="amber"
                        style={{
                          position: "absolute",
                          top: "-10px",
                          left: "10px",
                          fontSize: "0.65rem",
                          padding: "2px 6px",
                          boxShadow: SHADOWS.sm,
                        }}
                      >
                        Portada
                      </Badge>
                    )}

                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: RADIUS.sm,
                        backgroundColor: C.gray200,
                        overflow: "hidden",
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {url.trim() ? (
                        <img
                          src={url}
                          alt={`Preview ${i}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      ) : (
                        <Camera size={20} color={C.gray400} />
                      )}
                    </div>

                    <FormInput
                      value={url}
                      onChange={(e) => {
                        const n = [...albumUrls];
                        n[i] = e.target.value;
                        setAlbumUrls(n);
                      }}
                      placeholder="https://ejemplo.com/foto.jpg"
                      style={{ flex: 1, fontSize: "0.8125rem" }}
                    />

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.2rem",
                      }}
                    >
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => movePhotoUp(i)}
                          style={{
                            color: C.gray500,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px",
                          }}
                          title="Mover arriba"
                        >
                          <ChevronUp size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const n = [...albumUrls];
                          n.splice(i, 1);
                          setAlbumUrls(n);
                        }}
                        style={{
                          color: C.red,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                        }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <SecondaryButton
                  type="button"
                  onClick={() => setAlbumUrls([...albumUrls, ""])}
                  style={{
                    width: "100%",
                    marginTop: "0.5rem",
                    borderStyle: "dashed",
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Plus size={16} /> Añadir otra foto
                </SecondaryButton>
              </div>

              <PrimaryButton onClick={saveAlbum} style={{ width: "100%" }}>
                Guardar Álbum
              </PrimaryButton>
            </div>
          </div>,
          document.body,
        )}

      {/* MODAL DE ESTADÍSTICAS (CON PORTAL) */}
      {statsModalEvent &&
        createPortal(
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
            onClick={() => setStatsModalEvent(null)}
          >
            <div
              style={{
                backgroundColor: C.white,
                borderRadius: RADIUS.xl,
                padding: "2rem",
                width: "100%",
                maxWidth: "400px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: SHADOWS.xl,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    color: C.navy900,
                    margin: 0,
                  }}
                >
                  Estadísticas: {statsModalEvent.title}
                </h3>
                <button
                  onClick={() => setStatsModalEvent(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: C.gray400,
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={saveStats}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: C.gray50,
                    padding: "1rem",
                    borderRadius: RADIUS.lg,
                    border: `1px solid ${C.gray200}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: "600",
                        color: C.gray600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Hand size={16} /> Porteros (Goles Recibidos)
                    </label>
                    <button
                      type="button"
                      onClick={addGoalkeeper}
                      style={{
                        background: "none",
                        border: "none",
                        color: C.blue,
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Plus size={14} /> Agregar portero
                    </button>
                  </div>

                  {statsFormGoalkeepers.length === 0 && (
                    <p
                      style={{
                        color: C.gray400,
                        fontSize: "0.75rem",
                        textAlign: "center",
                        margin: "0.5rem 0",
                      }}
                    >
                      No hay porteros registrados. Agrega uno.
                    </p>
                  )}

                  {statsFormGoalkeepers.map((gk, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <FormSelect
                        value={gk.id}
                        onChange={(e) =>
                          updateGoalkeeper(index, "id", e.target.value)
                        }
                        style={{ flex: 2 }}
                      >
                        <option value="">Seleccionar jugador</option>
                        {players.map((p: any) => (
                          <option key={`gk-${p.id}`} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                        {(statsModalEvent.attendees || [])
                          .filter((id: string) => id.startsWith("guest-"))
                          .map((guestId: string) => (
                            <option key={`gk-${guestId}`} value={guestId}>
                              {getPlayerName(guestId, players)} (Invitado)
                            </option>
                          ))}
                      </FormSelect>

                      <FormInput
                        type="number"
                        min="0"
                        value={gk.conceded}
                        onChange={(e) =>
                          updateGoalkeeper(index, "conceded", e.target.value)
                        }
                        placeholder="Goles"
                        style={{ flex: 1, width: "80px" }}
                      />

                      <button
                        type="button"
                        onClick={() => removeGoalkeeper(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: C.gray400,
                          cursor: "pointer",
                          padding: "0 0.25rem",
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    backgroundColor: C.amberLight,
                    padding: "1rem",
                    borderRadius: RADIUS.lg,
                    border: `1px solid ${C.amber}40`,
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: "700",
                      color: C.amber,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Award size={16} /> MVP del Partido
                  </label>
                  <FormSelect
                    value={statsFormMVP}
                    onChange={(e) => setStatsFormMVP(e.target.value)}
                    style={{ marginTop: "0.5rem", borderColor: `${C.amber}60` }}
                  >
                    <option value="">¿Quién fue la estrella?</option>
                    {players.map((p: any) => (
                      <option key={`mvp-${p.id}`} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    {(statsModalEvent.attendees || [])
                      .filter((id: string) => id.startsWith("guest-"))
                      .map((guestId: string) => (
                        <option key={`mvp-${guestId}`} value={guestId}>
                          {getPlayerName(guestId, players)} (Invitado)
                        </option>
                      ))}
                  </FormSelect>
                </div>

                <div>
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "0.875rem",
                      fontWeight: "700",
                      color: C.navy900,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    🟨 Tarjetas Amarillas
                  </p>
                  {statsFormYellowCards.map((yc, i) => (
                    <div
                      key={`yc-${i}`}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <FormSelect
                        value={yc}
                        onChange={(e) => {
                          const newArr = [...statsFormYellowCards];
                          newArr[i] = e.target.value;
                          setStatsFormYellowCards(newArr);
                        }}
                      >
                        <option value="">Seleccionar jugador</option>
                        {players.map((p: any) => (
                          <option key={`yc-opt-${p.id}`} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                        {(statsModalEvent.attendees || [])
                          .filter((id: string) => id.startsWith("guest-"))
                          .map((guestId: string) => (
                            <option key={`yc-opt-${guestId}`} value={guestId}>
                              {getPlayerName(guestId, players)} (Invitado)
                            </option>
                          ))}
                      </FormSelect>
                      <button
                        type="button"
                        onClick={() =>
                          setStatsFormYellowCards(
                            statsFormYellowCards.filter((_, idx) => idx !== i),
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: C.gray400,
                          cursor: "pointer",
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setStatsFormYellowCards([...statsFormYellowCards, ""])
                    }
                    style={{
                      background: "none",
                      border: `1px dashed ${C.gray300}`,
                      borderRadius: RADIUS.md,
                      width: "100%",
                      padding: "0.5rem",
                      fontSize: "0.75rem",
                      color: C.gray500,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      gap: "0.4rem",
                      fontWeight: "600",
                    }}
                  >
                    <Plus size={14} /> Agregar Amarilla
                  </button>
                </div>

                <div>
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "0.875rem",
                      fontWeight: "700",
                      color: C.navy900,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    🟥 Tarjetas Rojas
                  </p>
                  {statsFormRedCards.map((rc, i) => (
                    <div
                      key={`rc-${i}`}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <FormSelect
                        value={rc}
                        onChange={(e) => {
                          const newArr = [...statsFormRedCards];
                          newArr[i] = e.target.value;
                          setStatsFormRedCards(newArr);
                        }}
                      >
                        <option value="">Seleccionar jugador</option>
                        {players.map((p: any) => (
                          <option key={`rc-opt-${p.id}`} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                        {(statsModalEvent.attendees || [])
                          .filter((id: string) => id.startsWith("guest-"))
                          .map((guestId: string) => (
                            <option key={`rc-opt-${guestId}`} value={guestId}>
                              {getPlayerName(guestId, players)} (Invitado)
                            </option>
                          ))}
                      </FormSelect>
                      <button
                        type="button"
                        onClick={() =>
                          setStatsFormRedCards(
                            statsFormRedCards.filter((_, idx) => idx !== i),
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: C.gray400,
                          cursor: "pointer",
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setStatsFormRedCards([...statsFormRedCards, ""])
                    }
                    style={{
                      background: "none",
                      border: `1px dashed ${C.gray300}`,
                      borderRadius: RADIUS.md,
                      width: "100%",
                      padding: "0.5rem",
                      fontSize: "0.75rem",
                      color: C.gray500,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      gap: "0.4rem",
                      fontWeight: "600",
                    }}
                  >
                    <Plus size={14} /> Agregar Roja
                  </button>
                </div>

                {statsModalEvent.scoreOurs > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <p
                      style={{
                        margin: "0 0 1rem 0",
                        fontSize: "0.875rem",
                        fontWeight: "700",
                        color: C.navy900,
                        borderBottom: `2px solid ${C.gray200}`,
                        paddingBottom: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Goal size={16} /> Goles a favor (
                      {statsModalEvent.scoreOurs})
                    </p>
                    {statsFormScorers.map((stat, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: C.greenLight,
                          padding: "1rem",
                          borderRadius: RADIUS.md,
                          marginBottom: "0.75rem",
                          border: `1px solid ${C.greenBorder}`,
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 0.5rem 0",
                            fontSize: "0.8125rem",
                            fontWeight: "600",
                            color: C.green,
                          }}
                        >
                          Gol #{i + 1}
                        </p>
                        <FormSelect
                          value={stat.scorer}
                          onChange={(e) =>
                            handleStatChange(i, "scorer", e.target.value)
                          }
                          style={{ marginBottom: "0.5rem" }}
                        >
                          <option value="">¿Quién anotó el gol?</option>
                          {players.map((p: any) => (
                            <option key={`sc-${p.id}`} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                          {(statsModalEvent.attendees || [])
                            .filter((id: string) => id.startsWith("guest-"))
                            .map((guestId: string) => (
                              <option key={`sc-${guestId}`} value={guestId}>
                                {getPlayerName(guestId, players)} (Invitado)
                              </option>
                            ))}
                        </FormSelect>
                        <FormSelect
                          value={stat.assist}
                          onChange={(e) =>
                            handleStatChange(i, "assist", e.target.value)
                          }
                        >
                          <option value="">¿Asistencia? (Opcional)</option>
                          {players.map((p: any) => (
                            <option key={`as-${p.id}`} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                          {(statsModalEvent.attendees || [])
                            .filter((id: string) => id.startsWith("guest-"))
                            .map((guestId: string) => (
                              <option key={`as-${guestId}`} value={guestId}>
                                {getPlayerName(guestId, players)} (Invitado)
                              </option>
                            ))}
                        </FormSelect>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
                >
                  <PrimaryButton type="submit" style={{ flex: 1 }}>
                    Guardar Stats Completas
                  </PrimaryButton>
                  <SecondaryButton
                    type="button"
                    onClick={() => setStatsModalEvent(null)}
                  >
                    Cancelar
                  </SecondaryButton>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* NUEVO MODAL: PAGOS DE ARBITRAJE (CON PORTAL Y PERMISOS) */}
      {arbitrationModalEvent &&
        createPortal(
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
            onClick={() => setArbitrationModalEvent(null)}
          >
            <div
              style={{
                backgroundColor: C.white,
                borderRadius: RADIUS.xl,
                padding: "2rem",
                width: "100%",
                maxWidth: "400px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: SHADOWS.xl,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    color: C.navy900,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Wallet size={20} color={C.amber} /> Pagos Arbitraje
                </h3>
                <button
                  onClick={() => setArbitrationModalEvent(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: C.gray400,
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <p
                style={{
                  fontSize: "0.8125rem",
                  color: C.gray500,
                  marginBottom: "1.5rem",
                }}
              >
                {canEditArbitration
                  ? "Asigna el monto que cada asistente aportó para el arbitraje."
                  : "Estos son los pagos registrados para el arbitraje."}
              </p>

              {(() => {
                const attendeesIds = (
                  arbitrationModalEvent.attendees || []
                ).map((att: string) => normalizeAttendeeId(att));
                return attendeesIds.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: C.gray400,
                      fontStyle: "italic",
                      padding: "1rem 0",
                    }}
                  >
                    No hay asistentes confirmados. Primero gestiona la
                    asistencia.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {attendeesIds.map((id: string) => {
                      const payment = arbitrationPayments.find(
                        (p) => p.playerId === id,
                      );
                      const amount = payment ? payment.amount : 0;
                      return (
                        <div
                          key={id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem",
                            backgroundColor: C.gray50,
                            borderRadius: RADIUS.md,
                            border: `1px solid ${C.gray200}`,
                          }}
                        >
                          <span
                            style={{
                              flex: 1,
                              fontWeight: "600",
                              color: C.navy900,
                              fontSize: "0.875rem",
                            }}
                          >
                            {getPlayerName(id, players)}
                          </span>
                          {canEditArbitration ? (
                            <div
                              style={{ position: "relative", width: "80px" }}
                            >
                              <span
                                style={{
                                  position: "absolute",
                                  left: "8px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: C.gray500,
                                  fontWeight: "600",
                                  fontSize: "0.75rem",
                                }}
                              >
                                $
                              </span>
                              <FormInput
                                type="number"
                                min="0"
                                value={amount}
                                onChange={(e) =>
                                  updateArbitrationPayment(
                                    id,
                                    Number(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                                style={{
                                  paddingLeft: "20px",
                                  textAlign: "right",
                                  width: "100%",
                                }}
                              />
                            </div>
                          ) : (
                            <span
                              style={{
                                fontWeight: "700",
                                color: amount > 0 ? C.green : C.gray400,
                                fontSize: "0.875rem",
                              }}
                            >
                              {amount > 0 ? `$${amount}` : "Sin pago"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  backgroundColor: C.amberLight,
                  padding: "0.75rem",
                  borderRadius: RADIUS.md,
                  border: `1px solid ${C.amber}40`,
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    color: C.navy900,
                    fontSize: "0.875rem",
                  }}
                >
                  Total recaudado:
                </span>
                <span
                  style={{
                    fontWeight: "800",
                    color: C.amber,
                    fontSize: "1.125rem",
                  }}
                >
                  ${arbitrationTotal}
                </span>
              </div>

              {canEditArbitration ? (
                <PrimaryButton
                  onClick={saveArbitration}
                  style={{ width: "100%" }}
                >
                  Guardar Pagos
                </PrimaryButton>
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    color: C.gray400,
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                  }}
                >
                  No tienes permisos para editar los pagos.
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* NUEVO COMPONENTE: VISOR DE FOTOS GLOBAL */}
      {lightboxData && (
        <LightboxModal
          urls={lightboxData.urls}
          initialIndex={lightboxData.initialIndex}
          caption={lightboxData.caption}
          onClose={() => setLightboxData(null)}
        />
      )}
    </div>
  );
}
