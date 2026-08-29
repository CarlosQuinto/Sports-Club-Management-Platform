import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Hand, Plus, Award, Goal } from "lucide-react";
import {
  C,
  RADIUS,
  SHADOWS,
  FormInput,
  FormSelect,
  PrimaryButton,
  SecondaryButton,
} from "../../components/ui";
import { getPlayerName } from "../../utils/helpers";

interface StatsModalProps {
  ev: any;
  players: any[];
  onClose: () => void;
  onSave: (statsData: any) => void;
}

export default function StatsModal({
  ev,
  players,
  onClose,
  onSave,
}: StatsModalProps) {
  const [statsFormGoalkeepers, setStatsFormGoalkeepers] = useState<
    { id: string; conceded: number }[]
  >([]);
  const [statsFormMVP, setStatsFormMVP] = useState("");
  const [statsFormManager, setStatsFormManager] = useState("");
  const [statsFormYellowCards, setStatsFormYellowCards] = useState<string[]>(
    [],
  );
  const [statsFormRedCards, setStatsFormRedCards] = useState<string[]>([]);
  const [statsFormScorers, setStatsFormScorers] = useState<
    { scorer: string; assist: string }[]
  >([]);

  // 👇 NUEVO: Filtramos para obtener SOLO a los jugadores que asistieron a ESTE evento
  const attendingPlayers = useMemo(() => {
    if (!ev || !ev.attendees) return [];
    return players.filter(
      (p: any) => ev.attendees.includes(p.id) || ev.attendees.includes(p.name),
    );
  }, [players, ev]);

  // Cargar datos iniciales del evento al abrir el modal
  useEffect(() => {
    if (!ev) return;

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

    setStatsFormManager(
      players.find((p: any) => p.name === ev.manager || p.id === ev.manager)
        ?.id ||
        (ev.manager
          ? ev.manager.startsWith("guest-")
            ? ev.manager
            : `guest-${ev.manager}`
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
  }, [ev, players]);

  // Funciones de control de estado
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      goalkeepers: statsFormGoalkeepers.filter((gk) => gk.id.trim() !== ""),
      goalkeeper: null,
      stats: statsFormScorers,
      mvp: statsFormMVP,
      manager: statsFormManager,
      yellowCards: statsFormYellowCards.filter((id) => id.trim() !== ""),
      redCards: statsFormRedCards.filter((id) => id.trim() !== ""),
    });
  };

  if (!ev) return null;

  return createPortal(
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
            Estadísticas: {ev.title}
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

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* ── SELECTOR DEL DIRECTOR TÉCNICO ── */}
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
                fontWeight: "700",
                color: C.navy900,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: "16px" }}>👔</span> Director Técnico (DT)
            </label>
            <FormSelect
              value={statsFormManager}
              onChange={(e) => setStatsFormManager(e.target.value)}
              style={{ marginTop: "0.5rem" }}
            >
              <option value="">¿Quién dirigió el equipo?</option>
              {attendingPlayers.map((p: any) => (
                <option key={`dt-${p.id}`} value={p.id}>
                  {p.name}
                </option>
              ))}
              {(ev.attendees || [])
                .filter((id: string) => id.startsWith("guest-"))
                .map((guestId: string) => (
                  <option key={`dt-${guestId}`} value={guestId}>
                    {getPlayerName(guestId, players)} (Invitado)
                  </option>
                ))}
            </FormSelect>
          </div>

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
                  color: C.blueAccent,
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Plus size={14} /> Agregar
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
                No hay porteros registrados.
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
                  <option value="">Jugador</option>
                  {attendingPlayers.map((p: any) => (
                    <option key={`gk-${p.id}`} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  {(ev.attendees || [])
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
              {attendingPlayers.map((p: any) => (
                <option key={`mvp-${p.id}`} value={p.id}>
                  {p.name}
                </option>
              ))}
              {(ev.attendees || [])
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
                  <option value="">Jugador</option>
                  {attendingPlayers.map((p: any) => (
                    <option key={`yc-opt-${p.id}`} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  {(ev.attendees || [])
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
                  <option value="">Jugador</option>
                  {attendingPlayers.map((p: any) => (
                    <option key={`rc-opt-${p.id}`} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  {(ev.attendees || [])
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
              onClick={() => setStatsFormRedCards([...statsFormRedCards, ""])}
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

          {ev.scoreOurs > 0 && (
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
                <Goal size={16} /> Goles a favor ({ev.scoreOurs})
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
                    {attendingPlayers.map((p: any) => (
                      <option key={`sc-${p.id}`} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    {(ev.attendees || [])
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
                    {attendingPlayers.map((p: any) => (
                      <option key={`as-${p.id}`} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    {(ev.attendees || [])
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

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <PrimaryButton type="submit" style={{ flex: 1 }}>
              Guardar Stats
            </PrimaryButton>
            <SecondaryButton type="button" onClick={onClose}>
              Cancelar
            </SecondaryButton>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
