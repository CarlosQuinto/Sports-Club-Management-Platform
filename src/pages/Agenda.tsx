import React, { useState } from "react";
import { Trophy, Target, TrendingUp, TrendingDown } from "lucide-react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../hooks/useClubData";
import { C, StatBox } from "../components/ui";
import { useAgendaData } from "../hooks/useAgendaData";

// ── COMPONENTES GENERALES ──
import {
  EventCard,
  AttendanceModal,
  LineupModal,
  LightboxModal,
} from "../components/AppComponents";

// ── MÓDULOS EXTRAÍDOS DE AGENDA ──
import EventForm from "../components/agenda/EventForm";
import HistoryCard from "../components/agenda/HistoryCard";
import AlbumModal from "../components/agenda/AlbumModal";
import ArbitrationModal from "../components/agenda/ArbitrationModal";
import StatsModal from "../components/agenda/StatsModal";

export default function Agenda({ events, players, clubInfo, perms }: any) {
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventType, setEventType] = useState<"Partido" | "Entrenamiento">(
    "Partido",
  );
  const [eventTitle, setEventTitle] = useState("");
  // ✅ CAMBIO: Inicia como array
  const [eventRoutine, setEventRoutine] = useState<any[]>([]);
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [eventTime, setEventTime] = useState("20:00");
  const [eventLocation, setEventLocation] = useState("");

  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null,
  );
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(
    null,
  );

  const [attendanceModalEvent, setAttendanceModalEvent] = useState<any | null>(
    null,
  );
  const [lineupModalEvent, setLineupModalEvent] = useState<any | null>(null);
  const [statsModalEvent, setStatsModalEvent] = useState<any | null>(null);
  const [albumModalEvent, setAlbumModalEvent] = useState<any | null>(null);
  const [arbitrationModalEvent, setArbitrationModalEvent] = useState<
    any | null
  >(null);
  const [lightboxData, setLightboxData] = useState<{
    urls: string[];
    initialIndex: number;
    caption?: string;
  } | null>(null);

  const canEditArbitration = perms?.canEditAgenda || perms?.canEditFinanzas;
  const { statsClub, nextEvents, pastEvents } = useAgendaData(events);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      eventType,
      title: eventTitle,
      // ✅ CAMBIO: Guardamos el array, no un string
      routine: eventType === "Entrenamiento" ? eventRoutine : [],
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
    setEventRoutine([]); // ✅ CAMBIO: limpieza con array
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este evento?")) {
      await deleteDoc(doc(db, "events", id));
      await deleteDoc(doc(db, "transactions", `arb_${id}`)).catch(() => {});
    }
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        animation: "fadeIn 0.3s ease",
      }}
    >
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

      <EventForm
        perms={perms}
        editingEventId={editingEventId}
        eventType={eventType}
        setEventType={setEventType}
        eventTitle={eventTitle}
        setEventTitle={setEventTitle}
        eventRoutine={eventRoutine}
        setEventRoutine={setEventRoutine}
        eventDate={eventDate}
        setEventDate={setEventDate}
        eventTime={eventTime}
        setEventTime={setEventTime}
        eventLocation={eventLocation}
        setEventLocation={setEventLocation}
        onSubmit={handleSaveEvent}
        onCancel={() => {
          setEditingEventId(null);
          setEventTitle("");
          setEventLocation("");
          setEventRoutine([]); // ✅ CAMBIO: limpieza con array
        }}
      />

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
                setEventLocation(ev.location);
                // ✅ CAMBIO: migración de string viejo a array estructurado
                if (typeof ev.routine === "string" && ev.routine) {
                  setEventRoutine([
                    {
                      type: "phase",
                      id: Date.now().toString(),
                      title: "Rutina Guardada",
                      exercises: [
                        { id: "1", name: ev.routine, duration: "", link: "" },
                      ],
                    },
                  ]);
                } else {
                  setEventRoutine(ev.routine || []);
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenAttendance={() => setAttendanceModalEvent(ev)}
              onOpenLineup={() => setLineupModalEvent(ev)}
              onImageClick={(data: any) => setLightboxData(data)}
              onEditPhoto={(id: string) =>
                setAlbumModalEvent(events.find((e: any) => e.id === id))
              }
              onOpenArbitration={() => setArbitrationModalEvent(ev)}
            />
          ))}
        </div>
      </div>

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
              .map((ev: any) => (
                <HistoryCard
                  key={ev.id}
                  ev={ev}
                  players={players}
                  perms={perms}
                  isExpanded={expandedHistoryId === ev.id}
                  onToggle={() => {
                    const willExpand = expandedHistoryId !== ev.id;
                    setExpandedHistoryId(willExpand ? ev.id : null);
                    if (willExpand) {
                      setTimeout(() => {
                        document
                          .getElementById(`history-card-${ev.id}`)
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }, 100);
                    }
                  }}
                  onUpdateScore={handleUpdateScore}
                  onOpenStats={(ev: any) => setStatsModalEvent(ev)}
                  onOpenArbitration={(ev: any) => setArbitrationModalEvent(ev)}
                  onOpenLineup={(ev: any) => setLineupModalEvent(ev)}
                  onOpenAlbum={(id: string) =>
                    setAlbumModalEvent(events.find((e: any) => e.id === id))
                  }
                  onImageClick={(data: any) => setLightboxData(data)}
                  onOpenAttendance={(ev: any) => setAttendanceModalEvent(ev)}
                />
              ))
          )}
        </div>
      </div>

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
            alert("Alineación base guardada.");
          }}
        />
      )}

      {albumModalEvent && (
        <AlbumModal
          ev={albumModalEvent}
          onClose={() => setAlbumModalEvent(null)}
          onSave={async (cleanUrls: string[]) => {
            await updateDoc(doc(db, "events", albumModalEvent.id), {
              photoUrls: cleanUrls,
              photoUrl: cleanUrls.length > 0 ? cleanUrls[0] : null,
            });
            setAlbumModalEvent(null);
          }}
        />
      )}

      {arbitrationModalEvent && (
        <ArbitrationModal
          ev={arbitrationModalEvent}
          players={players}
          canEditArbitration={canEditArbitration}
          onClose={() => setArbitrationModalEvent(null)}
          onSave={async (cleanPayments: any[]) => {
            await updateDoc(doc(db, "events", arbitrationModalEvent.id), {
              arbitrationPayments: cleanPayments,
            });

            // ⬇️ MANTENEMOS EL CÁLCULO ORIGINAL (flexible)
            const totalArbitraje = cleanPayments.reduce(
              (sum, p) => sum + (Number(p.amount || p.monto || p.pagado) || 0),
              0,
            );

            const transRef = doc(
              db,
              "transactions",
              `arb_${arbitrationModalEvent.id}`,
            );
            if (totalArbitraje > 0) {
              await setDoc(
                transRef,
                {
                  type: "ingreso",
                  category: "Cuotas",
                  description: `Recaudación Arbitraje: ${arbitrationModalEvent.title}`,
                  amount: totalArbitraje,
                  date: arbitrationModalEvent.eventDate,
                  timestamp: new Date().toISOString(),
                },
                { merge: true },
              );
            } else {
              await deleteDoc(transRef).catch(() => {});
            }
            setArbitrationModalEvent(null);
          }}
        />
      )}

      {statsModalEvent && (
        <StatsModal
          ev={statsModalEvent}
          players={players}
          onClose={() => setStatsModalEvent(null)}
          onSave={async (statsData: any) => {
            await updateDoc(doc(db, "events", statsModalEvent.id), statsData);
            setStatsModalEvent(null);
          }}
        />
      )}

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
