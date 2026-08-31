import React, { useState, useMemo } from "react";
import {
  Users,
  ArrowRightLeft,
  Trophy,
  Target,
  Search,
  Hand,
  Shield,
  Goal,
} from "lucide-react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../hooks/useClubData";
import { C, RADIUS, SHADOWS, SectionCard, FormInput } from "../components/ui";
import { CompareModal } from "../components/AppComponents";

import PlayerForm from "../components/players/PlayerForm";
import PlayerRow from "../components/players/PlayerRow";
import PlayerModal from "../components/players/PlayerModal";
import { usePlayerStats } from "../hooks/usePlayerStats";

export default function Players({ players, events, perms, goals }: any) {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [playerPosition, setPlayerPosition] = useState("Delantero");
  const [playerVariant, setPlayerVariant] = useState("");
  const [playerBirthDate, setPlayerBirthDate] = useState("");
  const [playerImageUrl, setPlayerImageUrl] = useState("");
  const [isDT, setIsDT] = useState(false);
  const [playerActive, setPlayerActive] = useState(true);

  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("Todos");

  const canEditAll = perms?.canEditJugadores;
  const isPressOnly =
    !canEditAll && (perms?.canEditPortada || perms?.canEditPrensa);

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName) return;

    const data = {
      name: playerName,
      number: playerNumber || "S/N",
      position: playerPosition,
      variant: playerVariant.trim(),
      birthDate: playerBirthDate || "",
      imageUrl: playerImageUrl.trim(),
      isDT: isDT,
      active: playerActive,
    };

    if (editingPlayerId) {
      await updateDoc(doc(db, "players", editingPlayerId), data);
      setEditingPlayerId(null);
    } else {
      await addDoc(collection(db, "players"), {
        ...data,
        amount_paid: 0,
        timestamp: new Date().toISOString(),
      });
    }
    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setPlayerName("");
    setPlayerNumber("");
    setPlayerPosition("Delantero");
    setPlayerVariant("");
    setPlayerBirthDate("");
    setPlayerImageUrl("");
    setIsDT(false);
    setPlayerActive(true);
  };

  const handleEdit = (p: any) => {
    setEditingPlayerId(p.id);
    setPlayerName(p.name);
    setPlayerNumber(p.number === "S/N" ? "" : p.number);
    setPlayerPosition(p.position);
    setPlayerVariant(p.variant || "");
    setPlayerBirthDate(p.birthDate || "");
    setPlayerImageUrl(p.imageUrl || "");
    setIsDT(p.isDT || false);
    setPlayerActive(p.active !== false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "¿Seguro que deseas eliminar a este jugador? Perderás todo su historial.",
      )
    )
      await deleteDoc(doc(db, "players", id));
  };

  const { clubPlayerStats, selectedPlayerAchievements } = usePlayerStats(
    players,
    events,
    selectedPlayer,
    goals,
  );

  const activePlayersCount = useMemo(
    () => players.filter((p: any) => p.active !== false).length,
    [players],
  );
  const inactivePlayersCount = useMemo(
    () => players.filter((p: any) => p.active === false).length,
    [players],
  );

  const positionCounts = useMemo(() => {
    const counts = { Portero: 0, Defensa: 0, Medio: 0, Delantero: 0 };
    players.forEach((p: any) => {
      if (p.active === false) return;
      if (counts[p.position as keyof typeof counts] !== undefined) {
        counts[p.position as keyof typeof counts]++;
      } else {
        counts.Delantero++;
      }
    });
    return counts;
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return players.filter((player: any) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.number.toString().includes(searchTerm);

      const isActive = player.active !== false;

      if (positionFilter === "Inactivos") {
        return matchesSearch && !isActive;
      }

      const matchesPosition =
        positionFilter === "Todos" || player.position === positionFilter;
      return matchesSearch && matchesPosition && isActive;
    });
  }, [players, searchTerm, positionFilter]);

  const filterOptions = [
    { label: "Todos", count: activePlayersCount },
    { label: "Portero", count: positionCounts.Portero },
    { label: "Defensa", count: positionCounts.Defensa },
    { label: "Medio", count: positionCounts.Medio },
    { label: "Delantero", count: positionCounts.Delantero },
    { label: "Inactivos", count: inactivePlayersCount },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* ── PLANTILLA ACTIVA (RESUMEN TÁCTICO MINIMALISTA) ── */}
      <SectionCard title="Plantilla Activa" icon={<Users size={16} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                color: C.gray500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Distribución de Plantilla
            </span>
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: "800",
                color: C.navy900,
              }}
            >
              {activePlayersCount} Registrados
            </span>
          </div>

          {/* Barra de Proporción Limpia */}
          <div
            style={{
              display: "flex",
              height: "8px",
              borderRadius: RADIUS.full,
              overflow: "hidden",
              backgroundColor: C.gray100,
            }}
          >
            {activePlayersCount > 0 ? (
              <>
                <div
                  style={{
                    flex: positionCounts.Portero,
                    backgroundColor: C.amber,
                  }}
                  title={`Porteros: ${positionCounts.Portero}`}
                />
                <div
                  style={{
                    flex: positionCounts.Defensa,
                    backgroundColor: "#3b82f6",
                  }}
                  title={`Defensas: ${positionCounts.Defensa}`}
                />
                <div
                  style={{
                    flex: positionCounts.Medio,
                    backgroundColor: C.green,
                  }}
                  title={`Medios: ${positionCounts.Medio}`}
                />
                <div
                  style={{
                    flex: positionCounts.Delantero,
                    backgroundColor: C.red || "#ef4444",
                  }}
                  title={`Delanteros: ${positionCounts.Delantero}`}
                />
              </>
            ) : (
              <div style={{ flex: 1, backgroundColor: C.gray200 }} />
            )}
          </div>

          {/* Estadísticas en Línea */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0.5rem",
              textAlign: "center",
              paddingTop: "0.25rem",
            }}
          >
            <div
              style={{
                backgroundColor: C.gray50,
                padding: "0.5rem",
                borderRadius: RADIUS.sm,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  color: C.gray500,
                  textTransform: "uppercase",
                }}
              >
                Porteros
              </span>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: C.navy900,
                }}
              >
                {positionCounts.Portero}
              </span>
            </div>
            <div
              style={{
                backgroundColor: C.gray50,
                padding: "0.5rem",
                borderRadius: RADIUS.sm,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  color: C.gray500,
                  textTransform: "uppercase",
                }}
              >
                Defensas
              </span>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: C.navy900,
                }}
              >
                {positionCounts.Defensa}
              </span>
            </div>
            <div
              style={{
                backgroundColor: C.gray50,
                padding: "0.5rem",
                borderRadius: RADIUS.sm,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  color: C.gray500,
                  textTransform: "uppercase",
                }}
              >
                Medios
              </span>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: C.navy900,
                }}
              >
                {positionCounts.Medio}
              </span>
            </div>
            <div
              style={{
                backgroundColor: C.gray50,
                padding: "0.5rem",
                borderRadius: RADIUS.sm,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  fontWeight: "700",
                  color: C.gray500,
                  textTransform: "uppercase",
                }}
              >
                Delantes
              </span>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: C.navy900,
                }}
              >
                {positionCounts.Delantero}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {(canEditAll || (isPressOnly && editingPlayerId)) && (
        <PlayerForm
          isPressOnly={isPressOnly}
          editingPlayerId={editingPlayerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          playerNumber={playerNumber}
          setPlayerNumber={setPlayerNumber}
          playerPosition={playerPosition}
          setPlayerPosition={setPlayerPosition}
          playerVariant={playerVariant}
          setPlayerVariant={setPlayerVariant}
          playerBirthDate={playerBirthDate}
          setPlayerBirthDate={setPlayerBirthDate}
          playerImageUrl={playerImageUrl}
          setPlayerImageUrl={setPlayerImageUrl}
          isDT={isDT}
          setIsDT={setIsDT}
          playerActive={playerActive}
          setPlayerActive={setPlayerActive}
          onSubmit={handleSavePlayer}
          onCancel={handleCancelEdit}
        />
      )}

      {/* ── PLANTILLA OFICIAL ── */}
      <SectionCard title="Plantilla Oficial" icon={<Trophy size={16} />}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          {/* BÚSQUEDA + COMPARAR */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <Search
                size={16}
                color={C.gray400}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "0.75rem",
                  transform: "translateY(-50%)",
                }}
              />
              <FormInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o dorsal..."
                style={{ paddingLeft: "2.25rem", width: "100%" }}
              />
            </div>

            {players.length > 1 && (
              <button
                onClick={() => setShowCompareModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0 1rem",
                  backgroundColor: C.blueAccent,
                  color: "#fff",
                  border: "none",
                  borderRadius: RADIUS.md,
                  fontWeight: "600",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  boxShadow: SHADOWS.sm,
                  whiteSpace: "nowrap",
                  height: "36px",
                }}
              >
                <ArrowRightLeft size={14} /> Comparar
              </button>
            )}
          </div>

          {/* FILTROS TIPO CHIP LIMPIOS */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem",
              marginTop: "0.25rem",
            }}
          >
            {filterOptions.map(({ label, count }) => {
              const isSelected = positionFilter === label;
              const isInactiveBtn = label === "Inactivos";

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setPositionFilter(label)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.3rem 0.65rem",
                    borderRadius: RADIUS.full,
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    border: `1px solid ${isSelected ? (isInactiveBtn ? C.red : C.navy900) : C.gray200}`,
                    backgroundColor: isSelected
                      ? isInactiveBtn
                        ? C.red
                        : C.navy900
                      : C.white,
                    color: isSelected ? C.white : C.gray600,
                    transition: "all 0.15s ease",
                  }}
                >
                  {label}
                  <span
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(255,255,255,0.2)"
                        : C.gray100,
                      color: isSelected ? C.white : C.gray500,
                      padding: "1px 5px",
                      borderRadius: RADIUS.full,
                      fontSize: "0.6rem",
                      fontWeight: "700",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredPlayers.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: C.gray400,
              fontStyle: "italic",
              padding: "1.5rem 0",
            }}
          >
            No se encontraron jugadores con ese filtro.
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {filteredPlayers.map((player: any) => (
              <PlayerRow
                key={player.id}
                player={player}
                canEditAll={canEditAll}
                isPressOnly={isPressOnly}
                onSelect={() => setSelectedPlayer(player)}
                onEdit={() => handleEdit(player)}
                onDelete={() => handleDelete(player.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {showCompareModal && (
        <CompareModal
          playersStats={clubPlayerStats}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          pStats={clubPlayerStats.find((p: any) => p.id === selectedPlayer.id)}
          achievements={selectedPlayerAchievements}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
