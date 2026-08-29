import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Star,
  AlertTriangle,
  Plus,
  LayoutTemplate,
  Download,
  Save,
  ArrowRightLeft,
  Trophy,
  Target,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Camera,
  Award,
  Images,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Wallet,
} from "lucide-react";
import {
  C,
  RADIUS,
  SHADOWS,
  Badge,
  FormInput,
  FormSelect,
  PrimaryButton,
  SecondaryButton,
} from "./ui";
import {
  getPlayerName,
  getPlayerInfo,
  formatFriendlyDate,
  formatFriendlyTime,
} from "../utils/helpers";

// 👇 Importamos nuestro nuevo componente visualizador de Rutinas
import RoutineDisplay from "./agenda/RoutineDisplay";

// ── Modals: Asistencia ──
export const AttendanceModal = ({
  ev,
  players,
  perms,
  onClose,
  onSave,
}: any) => {
  // 👈 NUEVO: Filtramos solo a los jugadores activos para las listas nuevas
  const activePlayers = useMemo(
    () => players.filter((p: any) => p.active !== false),
    [players],
  );

  const initialAttendees = (ev.attendees || []).map((att: string) => {
    const p = players.find((pl: any) => pl.name === att || pl.id === att);
    if (p) return p.id;
    if (att.startsWith("guest-")) return att;
    return `guest-${att}`;
  });

  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [adminAttendees, setAdminAttendees] =
    useState<string[]>(initialAttendees);
  const [newGuest, setNewGuest] = useState("");

  const isAttending = adminAttendees.includes(selectedPlayerId);

  const allUniqueIds = useMemo(() => {
    // 👈 NUEVO: Usamos activePlayers para llenar la lista de asistencia
    const ids = activePlayers.map((p: any) => p.id);
    // Pero si alguien inactivo ya estaba en la lista de un evento pasado, lo mantenemos visible
    adminAttendees.forEach((att) => {
      if (!ids.includes(att)) ids.push(att);
    });
    return ids;
  }, [activePlayers, adminAttendees]);

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
          backgroundColor: C.white,
          borderRadius: RADIUS.xl,
          padding: "1.5rem",
          width: "100%",
          maxWidth: "400px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
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
            {perms.canEditAgenda
              ? "Gestionar Asistencias"
              : "Confirmar Asistencia"}
          </h3>
          <button
            onClick={onClose}
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

        {perms.canEditAgenda ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <p
              style={{
                fontSize: "0.8125rem",
                color: C.gray500,
                marginBottom: "1rem",
              }}
            >
              Selecciona los jugadores e invitados que asistirán.
            </p>
            <div
              className="hide-scroll"
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginBottom: "1rem",
                paddingRight: "0.5rem",
              }}
            >
              {allUniqueIds.map((id: string) => {
                const attending = adminAttendees.includes(id);
                const isGuest = id.startsWith("guest-");
                const displayName = getPlayerName(id, players);

                return (
                  <label
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      borderRadius: RADIUS.md,
                      backgroundColor: attending ? C.greenLight : C.gray50,
                      border: `1px solid ${attending ? C.greenBorder : C.gray200}`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={attending}
                      onChange={() => {
                        if (attending)
                          setAdminAttendees(
                            adminAttendees.filter((n) => n !== id),
                          );
                        else setAdminAttendees([...adminAttendees, id]);
                      }}
                      style={{
                        accentColor: C.green,
                        width: "1.1rem",
                        height: "1.1rem",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: C.navy900,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {displayName}{" "}
                      {isGuest && (
                        <Badge
                          color="amber"
                          style={{ fontSize: "0.6rem", padding: "2px 4px" }}
                        >
                          Invitado
                        </Badge>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1rem",
                borderTop: `1px solid ${C.gray200}`,
                paddingTop: "1rem",
              }}
            >
              <FormInput
                value={newGuest}
                onChange={(e) => setNewGuest(e.target.value)}
                placeholder="Añadir invitado (Ej. El Güero)..."
                style={{ fontSize: "0.8125rem" }}
              />
              <SecondaryButton
                type="button"
                onClick={() => {
                  const trimmed = newGuest.trim();
                  if (trimmed) {
                    const guestId = `guest-${trimmed}`;
                    if (!adminAttendees.includes(guestId)) {
                      setAdminAttendees([...adminAttendees, guestId]);
                      setNewGuest("");
                    }
                  }
                }}
                style={{ padding: "0.5rem 0.8rem", fontSize: "0.75rem" }}
              >
                Añadir
              </SecondaryButton>
            </div>

            <PrimaryButton
              onClick={() => onSave(ev.id, adminAttendees)}
              style={{ width: "100%" }}
            >
              Guardar Lista
            </PrimaryButton>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div
              style={{
                backgroundColor: C.gray50,
                padding: "1rem",
                borderRadius: RADIUS.lg,
                border: `1px solid ${C.gray200}`,
              }}
            >
              <label
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: "600",
                  color: C.gray600,
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                ¿Quién eres?
              </label>
              <FormSelect
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
              >
                <option value="">Selecciona tu nombre...</option>
                {/* 👈 NUEVO: Solo mostramos jugadores activos en el select */}
                {activePlayers.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </FormSelect>
            </div>
            {selectedPlayerId && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                {isAttending ? (
                  <PrimaryButton
                    variant="red"
                    onClick={() =>
                      onSave(
                        ev.id,
                        adminAttendees.filter(
                          (id: string) => id !== selectedPlayerId,
                        ),
                      )
                    }
                    style={{ width: "100%" }}
                  >
                    Cancelar mi asistencia
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    variant="green"
                    onClick={() =>
                      onSave(ev.id, [...adminAttendees, selectedPlayerId])
                    }
                    style={{ width: "100%" }}
                  >
                    Confirmar asistencia
                  </PrimaryButton>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// ── Pizarra Táctica y Formaciones (Múltiples Modalidades) ──
const FORMATIONS: Record<
  string,
  Record<
    string,
    { desc: string; nodes: { id: string; top: string; left: string }[] }
  >
> = {
  "Fut-11": {
    "4-4-2": {
      desc: "El clásico por excelencia. Muy equilibrado, ofrece dos líneas de cuatro sólidas y dos delanteros.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "15%" },
        { id: "df2", top: "75%", left: "38%" },
        { id: "df3", top: "75%", left: "62%" },
        { id: "df4", top: "75%", left: "85%" },
        { id: "md1", top: "50%", left: "15%" },
        { id: "md2", top: "50%", left: "38%" },
        { id: "md3", top: "50%", left: "62%" },
        { id: "md4", top: "50%", left: "85%" },
        { id: "fw1", top: "25%", left: "35%" },
        { id: "fw2", top: "25%", left: "65%" },
      ],
    },
    "4-3-3": {
      desc: "Orientado al ataque. Excelente para dominar la posesión en el mediocampo y atacar con extremos abiertos.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "15%" },
        { id: "df2", top: "75%", left: "38%" },
        { id: "df3", top: "75%", left: "62%" },
        { id: "df4", top: "75%", left: "85%" },
        { id: "md1", top: "50%", left: "25%" },
        { id: "md2", top: "50%", left: "50%" },
        { id: "md3", top: "50%", left: "75%" },
        { id: "fw1", top: "22%", left: "20%" },
        { id: "fw2", top: "22%", left: "50%" },
        { id: "fw3", top: "22%", left: "80%" },
      ],
    },
    "4-2-3-1": {
      desc: "Moderno y flexible. Utiliza un doble pivote defensivo con un mediapunta creativo jugando libre detrás del único delantero.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "15%" },
        { id: "df2", top: "75%", left: "38%" },
        { id: "df3", top: "75%", left: "62%" },
        { id: "df4", top: "75%", left: "85%" },
        { id: "cdm1", top: "60%", left: "35%" },
        { id: "cdm2", top: "60%", left: "65%" },
        { id: "cam1", top: "40%", left: "20%" },
        { id: "cam2", top: "40%", left: "50%" },
        { id: "cam3", top: "40%", left: "80%" },
        { id: "fw1", top: "20%", left: "50%" },
      ],
    },
    "3-5-2": {
      desc: "Control total del centro del campo. Requiere carrileros por las bandas con una enorme resistencia física para atacar y defender.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "20%" },
        { id: "df2", top: "75%", left: "50%" },
        { id: "df3", top: "75%", left: "80%" },
        { id: "md1", top: "50%", left: "15%" },
        { id: "md2", top: "55%", left: "35%" },
        { id: "md3", top: "40%", left: "50%" },
        { id: "md4", top: "55%", left: "65%" },
        { id: "md5", top: "50%", left: "85%" },
        { id: "fw1", top: "25%", left: "35%" },
        { id: "fw2", top: "25%", left: "65%" },
      ],
    },
    "5-3-2": {
      desc: "Enfoque defensivo. Cierra espacios atrás con tres centrales y dos laterales, buscando ofender mediante el contragolpe rápido.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "10%" },
        { id: "df2", top: "75%", left: "30%" },
        { id: "df3", top: "75%", left: "50%" },
        { id: "df4", top: "75%", left: "70%" },
        { id: "df5", top: "75%", left: "90%" },
        { id: "md1", top: "50%", left: "25%" },
        { id: "md2", top: "50%", left: "50%" },
        { id: "md3", top: "50%", left: "75%" },
        { id: "fw1", top: "25%", left: "35%" },
        { id: "fw2", top: "25%", left: "65%" },
      ],
    },
  },
  "Fut-9": {
    "3-3-2": {
      desc: "Muy balanceado. Tres defensas, tres medios y dos puntas para asegurar transiciones estructuradas.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "20%" },
        { id: "df2", top: "75%", left: "50%" },
        { id: "df3", top: "75%", left: "80%" },
        { id: "md1", top: "50%", left: "20%" },
        { id: "md2", top: "50%", left: "50%" },
        { id: "md3", top: "50%", left: "80%" },
        { id: "fw1", top: "25%", left: "35%" },
        { id: "fw2", top: "25%", left: "65%" },
      ],
    },
    "3-2-3": {
      desc: "Agresivo al frente. Deja solo dos medios, pero ejerce mucha presión alta con tres atacantes.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "20%" },
        { id: "df2", top: "75%", left: "50%" },
        { id: "df3", top: "75%", left: "80%" },
        { id: "md1", top: "55%", left: "35%" },
        { id: "md2", top: "55%", left: "65%" },
        { id: "fw1", top: "25%", left: "20%" },
        { id: "fw2", top: "25%", left: "50%" },
        { id: "fw3", top: "25%", left: "80%" },
      ],
    },
    "2-4-2": {
      desc: "Dominio de la posesión. Los cuatro mediocampistas acaparan el centro del campo y generan superioridad numérica.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "35%" },
        { id: "df2", top: "75%", left: "65%" },
        { id: "md1", top: "50%", left: "15%" },
        { id: "md2", top: "50%", left: "38%" },
        { id: "md3", top: "50%", left: "62%" },
        { id: "md4", top: "50%", left: "85%" },
        { id: "fw1", top: "25%", left: "35%" },
        { id: "fw2", top: "25%", left: "65%" },
      ],
    },
    "2-3-3": {
      desc: "Ultra ofensivo. Ideal si el rival se encierra mucho, pero requiere defensas muy rápidos al quedar expuestos.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "35%" },
        { id: "df2", top: "75%", left: "65%" },
        { id: "md1", top: "50%", left: "25%" },
        { id: "md2", top: "50%", left: "50%" },
        { id: "md3", top: "50%", left: "75%" },
        { id: "fw1", top: "25%", left: "20%" },
        { id: "fw2", top: "25%", left: "50%" },
        { id: "fw3", top: "25%", left: "80%" },
      ],
    },
    "3-4-1": {
      desc: "Control y solidez. Se defiende en bloque con líneas muy juntas y se busca a un solo delantero referente (poste) para desahogar.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "20%" },
        { id: "df2", top: "75%", left: "50%" },
        { id: "df3", top: "75%", left: "80%" },
        { id: "md1", top: "50%", left: "15%" },
        { id: "md2", top: "50%", left: "38%" },
        { id: "md3", top: "50%", left: "62%" },
        { id: "md4", top: "50%", left: "85%" },
        { id: "fw1", top: "22%", left: "50%" },
      ],
    },
  },
  "Fut-7": {
    "2-3-1": {
      desc: "El más popular. Forma un rombo en el medio que da mucho apoyo tanto a los defensas como al delantero.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "30%" },
        { id: "df2", top: "75%", left: "70%" },
        { id: "md1", top: "48%", left: "20%" },
        { id: "md2", top: "48%", left: "50%" },
        { id: "md3", top: "48%", left: "80%" },
        { id: "fw1", top: "22%", left: "50%" },
      ],
    },
    "3-2-1": {
      desc: 'Muy conservador (el "árbol"). Cierra la puerta atrás, ideal para proteger un resultado o jugar al contraataque.',
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "20%" },
        { id: "df2", top: "75%", left: "50%" },
        { id: "df3", top: "75%", left: "80%" },
        { id: "md1", top: "48%", left: "35%" },
        { id: "md2", top: "48%", left: "65%" },
        { id: "fw1", top: "22%", left: "50%" },
      ],
    },
    "2-1-3": {
      desc: "Altamente ofensivo. Un solo medio de contención (muy exigedido) y tres delanteros asfixiando la salida rival.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "30%" },
        { id: "df2", top: "75%", left: "70%" },
        { id: "cdm1", top: "55%", left: "50%" },
        { id: "fw1", top: "25%", left: "20%" },
        { id: "fw2", top: "25%", left: "50%" },
        { id: "fw3", top: "25%", left: "80%" },
      ],
    },
    "2-2-2": {
      desc: 'El "cuadrado". Distribuye a los jugadores en parejas, es fácil de entender y ayuda a no perder el orden.',
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "30%" },
        { id: "df2", top: "75%", left: "70%" },
        { id: "md1", top: "50%", left: "30%" },
        { id: "md2", top: "50%", left: "70%" },
        { id: "fw1", top: "25%", left: "30%" },
        { id: "fw2", top: "25%", left: "70%" },
      ],
    },
    "1-3-2": {
      desc: "Riesgoso atrás, pero con mucho volumen de ataque. Requiere un líbero rápido y con excelente lectura de juego.",
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "50%" },
        { id: "md1", top: "50%", left: "20%" },
        { id: "md2", top: "50%", left: "50%" },
        { id: "md3", top: "50%", left: "80%" },
        { id: "fw1", top: "25%", left: "35%" },
        { id: "fw2", top: "25%", left: "65%" },
      ],
    },
  },
  "Fut-5": {
    "2-2": {
      desc: 'El "cuadrado". Dos defienden y dos atacan, la forma más sencilla y directa de estructurar al equipo en espacios reducidos.',
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "65%", left: "30%" },
        { id: "df2", top: "65%", left: "70%" },
        { id: "fw1", top: "30%", left: "30%" },
        { id: "fw2", top: "30%", left: "70%" },
      ],
    },
    "1-2-1": {
      desc: 'El "rombo". Un cierre, dos alas y un pívot. Es el sistema más dinámico y versátil del futsal.',
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "70%", left: "50%" },
        { id: "md1", top: "45%", left: "25%" },
        { id: "md2", top: "45%", left: "75%" },
        { id: "fw1", top: "20%", left: "50%" },
      ],
    },
    "3-1": {
      desc: 'El "cerrojo" o la pirámide. Tres atrás y un atacante aislado. Perfecto para aguantar marcadores y obligar a disparos lejanos.',
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "65%", left: "20%" },
        { id: "df2", top: "65%", left: "50%" },
        { id: "df3", top: "65%", left: "80%" },
        { id: "fw1", top: "25%", left: "50%" },
      ],
    },
    "1-1-2": {
      desc: 'La "Y". Un defensa, un medio creador y dois atacantes. Se usa mucho como recurso de emergencia si necesitas goles rápidos.',
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "75%", left: "50%" },
        { id: "md1", top: "50%", left: "50%" },
        { id: "fw1", top: "25%", left: "30%" },
        { id: "fw2", top: "25%", left: "70%" },
      ],
    },
    "2-1-1": {
      desc: 'La "Y" invertida. Dos defensas, un medio y un punta. Da solidez defensiva con un mediocampista que sirve de bisagra.',
      nodes: [
        { id: "gk", top: "92%", left: "50%" },
        { id: "df1", top: "70%", left: "30%" },
        { id: "df2", top: "70%", left: "70%" },
        { id: "md1", top: "48%", left: "50%" },
        { id: "fw1", top: "25%", left: "50%" },
      ],
    },
  },
};

export const LineupModal = ({
  ev,
  players,
  clubInfo,
  perms,
  onClose,
  onSave,
  onSaveBase,
}: any) => {
  const initialMode = ev.lineup?.mode || "Fut-7";
  const initialForm = ev.lineup?.formation || "2-3-1";

  const normalizedPositions: Record<string, string> = {};
  Object.entries(ev.lineup?.positions || {}).forEach(([pos, val]: any) => {
    const p = players.find((pl: any) => pl.name === val || pl.id === val);
    normalizedPositions[pos] = p
      ? p.id
      : val.startsWith("guest-")
        ? val
        : `guest-${val}`;
  });

  const [mode, setMode] = useState(initialMode);
  const [formation, setFormation] = useState(initialForm);
  const [positions, setPositions] =
    useState<Record<string, string>>(normalizedPositions);
  const [activePos, setActivePos] = useState<string | null>(null);

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    setFormation(Object.keys(FORMATIONS[newMode])[0]);
    setPositions({});
    setActivePos(null);
  };

  const handleFormationChange = (newForm: string) => {
    setFormation(newForm);
    setPositions({});
    setActivePos(null);
  };

  const selectPlayerForPos = (playerId: string | null) => {
    if (!activePos) return;
    const newPos = { ...positions };
    if (playerId) {
      Object.keys(newPos).forEach((key) => {
        if (newPos[key] === playerId) delete newPos[key];
      });
      newPos[activePos] = playerId;
    } else {
      delete newPos[activePos];
    }
    setPositions(newPos);
    setActivePos(null);
  };

  const handleLoadBase = () => {
    const base = clubInfo.defaultLineups?.[mode];
    if (base) {
      setFormation(base.formation);
      const normalizedBase: Record<string, string> = {};
      Object.entries(base.positions || {}).forEach(([pos, val]: any) => {
        const p = players.find((pl: any) => pl.name === val || pl.id === val);
        normalizedBase[pos] = p
          ? p.id
          : val.startsWith("guest-")
            ? val
            : `guest-${val}`;
      });
      setPositions(normalizedBase);
    } else {
      alert("Aún no hay táctica base guardada para esta modalidad.");
    }
  };

  const currentFormationData = FORMATIONS[mode][formation];
  const currentNodes = currentFormationData.nodes;
  const currentDesc = currentFormationData.desc;

  const attendeesIds = (ev.attendees || []).map((att: string) => {
    const p = players.find((pl: any) => pl.name === att || pl.id === att);
    return p ? p.id : att.startsWith("guest-") ? att : `guest-${att}`;
  });

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
          backgroundColor: C.navy900,
          borderRadius: RADIUS.xl,
          padding: "1.5rem",
          width: "100%",
          maxWidth: "450px",
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: SHADOWS.xl,
          position: "relative",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "800",
              color: C.white,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <LayoutTemplate size={20} color={C.amber} /> Pizarra Táctica
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.navy300,
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {perms.canEditAgenda ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <FormSelect
                value={mode}
                onChange={(e) => handleModeChange(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: C.white,
                  border: "none",
                }}
              >
                <option
                  value="Fut-5"
                  style={{ color: C.gray800, backgroundColor: C.white }}
                >
                  Fútbol 5
                </option>
                <option
                  value="Fut-7"
                  style={{ color: C.gray800, backgroundColor: C.white }}
                >
                  Fútbol 7
                </option>
                <option
                  value="Fut-9"
                  style={{ color: C.gray800, backgroundColor: C.white }}
                >
                  Fútbol 9
                </option>
                <option
                  value="Fut-11"
                  style={{ color: C.gray800, backgroundColor: C.white }}
                >
                  Fútbol 11
                </option>
              </FormSelect>
              <FormSelect
                value={formation}
                onChange={(e) => handleFormationChange(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: C.white,
                  border: "none",
                }}
              >
                {Object.keys(FORMATIONS[mode]).map((f) => (
                  <option
                    key={f}
                    value={f}
                    style={{ color: C.gray800, backgroundColor: C.white }}
                  >
                    {f}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div
              style={{
                padding: "0.6rem 0.8rem",
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: RADIUS.md,
                borderLeft: `3px solid ${C.amber}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.75rem",
                  color: C.navy100,
                  fontStyle: "italic",
                  lineHeight: "1.4",
                }}
              >
                {currentDesc}
              </p>
            </div>

            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
            >
              <button
                onClick={handleLoadBase}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${C.navy600}`,
                  borderRadius: RADIUS.md,
                  color: C.navy200,
                  fontSize: "0.6875rem",
                  fontWeight: "600",
                  padding: "0.5rem",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Download size={14} /> Cargar Base
              </button>
              <button
                onClick={() => onSaveBase(mode, { formation, positions })}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${C.navy600}`,
                  borderRadius: RADIUS.md,
                  color: C.navy200,
                  fontSize: "0.6875rem",
                  fontWeight: "600",
                  padding: "0.5rem",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Save size={14} /> Guardar Base
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "1rem", textAlign: "center" }}>
            <p
              style={{
                margin: "0 0 0.5rem 0",
                color: C.amber,
                fontWeight: "800",
                fontSize: "0.9rem",
              }}
            >
              Modalidad: {mode} • Formación: {formation}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: C.navy200,
                fontStyle: "italic",
              }}
            >
              {currentDesc}
            </p>
          </div>
        )}

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "420px",
            backgroundColor: "#166534",
            borderRadius: RADIUS.md,
            border: "2px solid rgba(255,255,255,0.3)",
            overflow: "hidden",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "2px",
              backgroundColor: "rgba(255,255,255,0.3)",
              transform: "translateY(-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "80px",
              height: "80px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "25%",
              right: "25%",
              height: "15%",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTop: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "25%",
              right: "25%",
              height: "15%",
              border: "2px solid rgba(255,255,255,0.3)",
              borderBottom: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "40%",
              right: "40%",
              height: "6%",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTop: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "40%",
              right: "40%",
              height: "6%",
              border: "2px solid rgba(255,255,255,0.3)",
              borderBottom: "none",
            }}
          />

          {currentNodes.map((pos) => {
            const playerId = positions[pos.id];
            const playerInfo = getPlayerInfo(playerId, players);
            const isGuest = playerId && playerId.startsWith("guest-");
            const displayName = getPlayerName(playerId, players);
            const isMissing = playerId && !attendeesIds.includes(playerId);

            return (
              <div
                key={pos.id}
                onClick={() => perms.canEditAgenda && setActivePos(pos.id)}
                style={{
                  position: "absolute",
                  top: pos.top,
                  left: pos.left,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: perms.canEditAgenda ? "pointer" : "default",
                  transition: "top 0.4s ease, left 0.4s ease",
                }}
              >
                {playerId ? (
                  <div
                    style={{
                      position: "relative",
                      opacity: isMissing ? 0.6 : 1,
                    }}
                  >
                    <img
                      src={
                        playerInfo?.imageUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${isGuest ? "475569" : "102a43"}&color=fff&size=50`
                      }
                      alt={displayName}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: isGuest
                          ? `2px dashed ${C.gray400}`
                          : `2px solid ${C.white}`,
                        objectFit: "cover",
                        backgroundColor: isGuest ? C.gray700 : C.navy900,
                        boxShadow: SHADOWS.md,
                      }}
                    />

                    {isGuest && !isMissing && (
                      <div
                        style={{
                          position: "absolute",
                          top: -5,
                          right: -5,
                          background: C.white,
                          borderRadius: "50%",
                          padding: "2px",
                          boxShadow: SHADOWS.sm,
                        }}
                        title="Invitado"
                      >
                        <Star size={10} color={C.gray600} fill={C.gray600} />
                      </div>
                    )}

                    {isMissing && (
                      <div
                        style={{
                          position: "absolute",
                          top: -5,
                          right: -5,
                          background: C.white,
                          borderRadius: "50%",
                          padding: "1px",
                          boxShadow: SHADOWS.sm,
                        }}
                        title="Falta confirmación de asistencia"
                      >
                        <AlertTriangle size={14} color={C.amber} />
                      </div>
                    )}
                    <div style={{ textAlign: "center", marginTop: "2px" }}>
                      <span
                        style={{
                          backgroundColor: "rgba(0,0,0,0.7)",
                          color: isGuest ? C.gray300 : C.white,
                          fontSize: "0.625rem",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                          textShadow: "0 1px 1px rgba(0,0,0,0.5)",
                        }}
                      >
                        {displayName.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "2px dashed rgba(255,255,255,0.5)",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {perms.canEditAgenda && (
                      <Plus size={16} color="rgba(255,255,255,0.6)" />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {activePos && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(10,25,41,0.95)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                padding: "1rem",
                animation: "fadeIn 0.2s",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h4 style={{ margin: 0, color: C.white, fontSize: "0.875rem" }}>
                  Elegir Jugador
                </h4>
                <button
                  onClick={() => setActivePos(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: C.navy300,
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                className="hide-scroll"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {attendeesIds.length === 0 ? (
                  <p
                    style={{
                      color: C.gray400,
                      fontSize: "0.8125rem",
                      textAlign: "center",
                      marginTop: "2rem",
                    }}
                  >
                    Aún no hay jugadores confirmados para este evento.
                  </p>
                ) : (
                  attendeesIds.map((attId: string) => {
                    const isSelectedElsewhere =
                      Object.values(positions).includes(attId) &&
                      positions[activePos] !== attId;
                    const playerInfo = getPlayerInfo(attId, players);
                    const isGuest = attId.startsWith("guest-");
                    const displayName = getPlayerName(attId, players);

                    return (
                      <button
                        key={attId}
                        onClick={() => selectPlayerForPos(attId)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: RADIUS.md,
                          border: "none",
                          backgroundColor: "rgba(255,255,255,0.1)",
                          color: C.white,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <span
                            style={{ fontWeight: "600", fontSize: "0.875rem" }}
                          >
                            {displayName}
                          </span>
                          {playerInfo && (
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                color: C.navy300,
                                fontWeight: "500",
                              }}
                            >
                              - {playerInfo.position}
                            </span>
                          )}
                          {isGuest && (
                            <Badge
                              color="gray"
                              style={{
                                fontSize: "0.6rem",
                                padding: "2px 4px",
                                backgroundColor: "rgba(255,255,255,0.15)",
                                color: C.gray300,
                              }}
                            >
                              Invitado
                            </Badge>
                          )}
                        </div>
                        {isSelectedElsewhere && (
                          <span
                            style={{
                              fontSize: "0.625rem",
                              color: C.amber,
                              backgroundColor: "rgba(217,119,6,0.2)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            Mover aquí
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {positions[activePos] && (
                <button
                  onClick={() => selectPlayerForPos(null)}
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    borderRadius: RADIUS.md,
                    border: `1px solid ${C.red}`,
                    backgroundColor: "transparent",
                    color: C.red,
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Quitar jugador de esta posición
                </button>
              )}
            </div>
          )}
        </div>

        {perms.canEditAgenda && (
          <PrimaryButton
            onClick={() => onSave(ev.id, { mode, formation, positions })}
            style={{ width: "100%", marginTop: "1.25rem", padding: "0.875rem" }}
          >
            Guardar Alineación Oficial
          </PrimaryButton>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// ── Comparador de Jugadores Modal ──
export const CompareModal = ({
  playersStats,
  onClose,
}: {
  playersStats: any[];
  onClose: () => void;
}) => {
  const [playerAId, setPlayerAId] = useState("");
  const [playerBId, setPlayerBId] = useState("");

  // 👈 NUEVO: Filtramos para que solo se puedan comparar jugadores activos
  const activePlayersStats = useMemo(
    () => playersStats.filter((p: any) => p.active !== false),
    [playersStats],
  );

  const pA = activePlayersStats.find((p) => p.id === playerAId);
  const pB = activePlayersStats.find((p) => p.id === playerBId);

  const renderRow = (
    label: string,
    valA: number,
    valB: number,
    reverse: boolean = false,
  ) => {
    const isTie = valA === valB;
    const aIsBetter = !isTie && (reverse ? valA < valB : valA > valB);
    const bIsBetter = !isTie && (reverse ? valB < valA : valB > valA);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.6rem 0",
          borderBottom: `1px solid ${C.gray100}`,
        }}
      >
        <span
          style={{
            fontWeight: aIsBetter ? "800" : "500",
            color: aIsBetter ? C.green : C.gray600,
            width: "25%",
            textAlign: "center",
            fontSize: "1rem",
          }}
        >
          {valA}
        </span>
        <span
          style={{
            fontWeight: "700",
            color: C.navy900,
            flex: 1,
            textAlign: "center",
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontWeight: bIsBetter ? "800" : "500",
            color: bIsBetter ? C.green : C.gray600,
            width: "25%",
            textAlign: "center",
            fontSize: "1rem",
          }}
        >
          {valB}
        </span>
      </div>
    );
  };

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
          backgroundColor: C.white,
          borderRadius: RADIUS.xl,
          padding: "1.5rem",
          width: "100%",
          maxWidth: "450px",
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
              fontWeight: "800",
              color: C.navy900,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <ArrowRightLeft size={20} color={C.blueAccent} /> Cara a Cara
          </h3>
          <button
            onClick={onClose}
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

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <FormSelect
              value={playerAId}
              onChange={(e) => setPlayerAId(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">Jugador A</option>
              {/* 👈 NUEVO: Usamos activePlayersStats en lugar de playersStats */}
              {activePlayersStats.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === playerBId}>
                  {p.name}
                </option>
              ))}
            </FormSelect>
            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: C.gray50,
                borderRadius: "50%",
                border: `3px solid ${C.gray100}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: SHADOWS.sm,
                flexShrink: 0,
              }}
            >
              {pA ? (
                <img
                  src={
                    pA.imageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(pA.name)}&background=102a43&color=fff&size=100`
                  }
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "2rem", opacity: 0.2 }}>👤</span>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 0.5rem",
            }}
          >
            <span
              style={{ fontSize: "1rem", fontWeight: "800", color: C.gray400 }}
            >
              VS
            </span>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <FormSelect
              value={playerBId}
              onChange={(e) => setPlayerBId(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">Jugador B</option>
              {/* 👈 NUEVO: Usamos activePlayersStats en lugar de playersStats */}
              {activePlayersStats.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === playerAId}>
                  {p.name}
                </option>
              ))}
            </FormSelect>
            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: C.gray50,
                borderRadius: "50%",
                border: `3px solid ${C.gray100}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: SHADOWS.sm,
                flexShrink: 0,
              }}
            >
              {pB ? (
                <img
                  src={
                    pB.imageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(pB.name)}&background=102a43&color=fff&size=100`
                  }
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "2rem", opacity: 0.2 }}>👤</span>
              )}
            </div>
          </div>
        </div>

        {pA && pB ? (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {renderRow("Goles", pA.goals, pB.goals)}
            {renderRow("Asistencias", pA.assists, pB.assists)}
            {renderRow(
              "Partidos Jugados",
              pA.matchesAttended,
              pB.matchesAttended,
            )}
            {renderRow(
              "Entrenamientos",
              pA.trainingsAttended,
              pB.trainingsAttended,
            )}
            {renderRow("Premios MVP", pA.mvps, pB.mvps)}
            {(pA.position === "Portero" || pB.position === "Portero") &&
              renderRow(
                "Goles Recibidos",
                pA.goalsConceded,
                pB.goalsConceded,
                true,
              )}
            {(pA.position === "Portero" || pB.position === "Portero") &&
              renderRow("Arcos en Cero", pA.cleanSheets, pB.cleanSheets)}
            {renderRow(
              "Tarjetas Amarillas",
              pA.yellowCards,
              pB.yellowCards,
              true,
            )}
            {renderRow("Tarjetas Rojas", pA.redCards, pB.redCards, true)}
          </div>
        ) : (
          <p
            style={{
              textAlign: "center",
              color: C.gray400,
              fontSize: "0.875rem",
              fontStyle: "italic",
              padding: "2rem 0",
            }}
          >
            Selecciona a dos jugadores para compararlos.
          </p>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// ── Nuevo Lightbox Carrusel Global (Scroll Matemático Centrado) ──
export const LightboxModal = ({
  urls,
  initialIndex = 0,
  caption,
  onClose,
}: any) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (thumbnailsRef.current && urls.length > 1) {
      const container = thumbnailsRef.current;
      const activeThumb = container.children[currentIndex] as HTMLElement;

      if (activeThumb) {
        const containerCenter = container.clientWidth / 2;
        const thumbCenter = activeThumb.clientWidth / 2;
        const scrollPos =
          activeThumb.offsetLeft - containerCenter + thumbCenter;

        container.scrollTo({
          left: scrollPos,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex, urls.length]);

  const handlePrev = (e: any) => {
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };
  const handleNext = (e: any) => {
    e.stopPropagation();
    if (currentIndex < urls.length - 1) setCurrentIndex(currentIndex + 1);
  };

  if (!urls || urls.length === 0) return null;

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.95)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s",
      }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          zIndex: 20,
          padding: "0.5rem",
        }}
      >
        <X size={32} />
      </button>

      {caption && (
        <div
          style={{
            position: "absolute",
            top: "2rem",
            left: "1.5rem",
            right: "4.5rem",
            color: "#fff",
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {caption}
            <span
              style={{
                opacity: 0.7,
                fontSize: "0.8rem",
                marginLeft: "0.5rem",
                whiteSpace: "nowrap",
              }}
            >
              ({currentIndex + 1} / {urls.length})
            </span>
          </div>
        </div>
      )}

      <div
        style={{
          position: "relative",
          width: "100%",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 0",
        }}
      >
        <img
          src={urls[currentIndex]}
          style={{
            maxWidth: "100%",
            maxHeight: "75vh",
            objectFit: "contain",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            transition: "opacity 0.2s",
          }}
          alt={`Img ${currentIndex}`}
        />

        {currentIndex > 0 && (
          <div
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "40%",
              cursor: "pointer",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              paddingLeft: "0.5rem",
            }}
          >
            <ChevronLeft
              size={36}
              color="rgba(255, 255, 255, 0.4)"
              style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))" }}
            />
          </div>
        )}

        {currentIndex < urls.length - 1 && (
          <div
            onClick={handleNext}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "40%",
              cursor: "pointer",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "0.5rem",
            }}
          >
            <ChevronRight
              size={36}
              color="rgba(255, 255, 255, 0.4)"
              style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))" }}
            />
          </div>
        )}
      </div>

      {urls.length > 1 && (
        <div
          ref={thumbnailsRef}
          className="hide-scroll"
          style={{
            width: "100%",
            padding: "1.5rem 1rem",
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            justifyContent: urls.length > 5 ? "flex-start" : "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
            zIndex: 20,
            scrollBehavior: "smooth",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {urls.map((url: string, idx: number) => (
            <img
              key={idx}
              src={url}
              loading="lazy"
              decoding="async"
              onClick={() => setCurrentIndex(idx)}
              style={{
                flexShrink: 0,
                width: "60px",
                height: "60px",
                objectFit: "cover",
                borderRadius: "4px",
                cursor: "pointer",
                border:
                  currentIndex === idx
                    ? `2px solid ${C.amber}`
                    : "2px solid transparent",
                opacity: currentIndex === idx ? 1 : 0.4,
                transition: "all 0.2s",
                boxShadow:
                  currentIndex === idx ? `0 0 10px ${C.amber}` : "none",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};

// ── Event card ──
export const EventCard = ({
  ev,
  players,
  onDelete,
  onEdit,
  onOpenAttendance,
  onOpenLineup,
  perms,
  isHighlighted,
  onImageClick,
  onEditPhoto,
  onOpenArbitration,
}: any) => {
  const isMatch = ev.eventType === "Partido";
  const attendeesCount = (ev.attendees || []).length;
  const hasLineup =
    ev.lineup && Object.keys(ev.lineup.positions || {}).length > 0;

  const photos =
    ev.photoUrls && ev.photoUrls.length > 0
      ? ev.photoUrls
      : ev.photoUrl
        ? [ev.photoUrl]
        : [];
  const hasPhotos = photos.length > 0;

  return (
    <div
      id={`event-card-${ev.id}`}
      className={isHighlighted ? "highlighted-event" : ""}
      style={{
        border: isHighlighted
          ? `2px solid ${C.amber}`
          : `1px solid ${C.gray200}`,
        borderRadius: RADIUS.lg,
        padding: "1.25rem 1.5rem",
        backgroundColor: C.white,
        transition: "all 0.3s ease",
        boxShadow: SHADOWS.sm,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div>
          <Badge color={isMatch ? "green" : "blue"}>
            {isMatch ? <Trophy size={11} /> : <Target size={11} />}
            {isMatch ? "Partido" : "Entrenamiento"}
          </Badge>
          <h3
            style={{
              margin: "0.75rem 0 0 0",
              fontSize: "1.0625rem",
              fontWeight: "700",
              color: C.navy900,
              letterSpacing: "-0.01em",
            }}
          >
            {ev.title}
          </h3>
        </div>
        {perms.canEditAgenda && (
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              onClick={onEdit}
              style={{
                background: "none",
                border: "none",
                color: C.navy600,
                cursor: "pointer",
                padding: "4px",
                opacity: 0.6,
              }}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={onDelete}
              style={{
                background: "none",
                border: "none",
                color: C.red,
                cursor: "pointer",
                padding: "4px",
                opacity: 0.6,
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {!isMatch && ev.routine && <RoutineDisplay routine={ev.routine} />}

      <div
        style={{
          fontSize: "0.8125rem",
          color: C.gray500,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "1rem",
          marginTop: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={14} /> {formatFriendlyDate(ev.eventDate)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={14} /> {formatFriendlyTime(ev.eventTime)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MapPin size={14} /> {ev.location}
        </div>
      </div>
      <div
        style={{
          borderTop: `1px solid ${C.gray200}`,
          paddingTop: "0.875rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "0.8125rem",
              fontWeight: "600",
              color: attendeesCount > 0 ? C.green : C.gray400,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Users size={14} /> {attendeesCount} confirmados
          </p>
          {attendeesCount > 0 && (
            <p
              style={{
                margin: "0.25rem 0 0 0",
                fontSize: "0.75rem",
                color: C.gray400,
              }}
            >
              {(ev.attendees || [])
                .map((id: string) => getPlayerName(id, players))
                .join(", ")}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {isMatch && (perms.canEditAgenda || hasLineup) && (
            <SecondaryButton
              onClick={onOpenLineup}
              style={{
                fontSize: "0.75rem",
                padding: "0.5rem 0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                borderColor: C.amber,
                color: C.amber,
                backgroundColor: C.amberLight,
              }}
            >
              <LayoutTemplate size={14} />{" "}
              {perms.canEditAgenda
                ? hasLineup
                  ? "Editar Alineación"
                  : "Armar Alineación"
                : "Ver Alineación"}
            </SecondaryButton>
          )}
          {isMatch && perms.canEditAgenda && (
            <SecondaryButton
              onClick={onOpenArbitration}
              style={{
                fontSize: "0.75rem",
                padding: "0.5rem 0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Wallet size={14} /> Pagos Arbitraje
            </SecondaryButton>
          )}
          <SecondaryButton
            onClick={onOpenAttendance}
            style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
          >
            Confirmar / Cambiar
          </SecondaryButton>
        </div>
      </div>

      {hasPhotos ? (
        <div style={{ marginTop: "1rem", position: "relative" }}>
          <img
            src={photos[0]}
            alt={`Foto de ${ev.title}`}
            loading="lazy"
            decoding="async"
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "cover",
              borderRadius: RADIUS.md,
              cursor: "pointer",
              boxShadow: SHADOWS.sm,
            }}
            onClick={() =>
              onImageClick &&
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
              onClick={() => onEditPhoto && onEditPhoto(ev.id)}
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
      ) : (
        (perms.canEditPortada || perms.canEditAgenda) && (
          <button
            onClick={() => onEditPhoto && onEditPhoto(ev.id)}
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
              marginTop: "1rem",
            }}
          >
            <Camera size={16} /> Crear Álbum del Evento
          </button>
        )
      )}
    </div>
  );
};
