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
import {
  C,
  RADIUS,
  SHADOWS,
  SectionCard,
  FormInput,
  StatBox,
} from "../components/ui";
import { CompareModal } from "../components/AppComponents";

import PlayerForm from "../components/players/PlayerForm";
import PlayerRow from "../components/players/PlayerRow";
import PlayerModal from "../components/players/PlayerModal";
import { usePlayerStats } from "../hooks/usePlayerStats";

// 👇 AÑADIDO: Recibimos 'goals' por los props
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

  // 👇 AÑADIDO: Pasamos 'goals' al hook
  const { clubPlayerStats, selectedPlayerAchievements } = usePlayerStats(
    players,
    events,
    selectedPlayer,
    goals,
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <SectionCard title="Plantilla Activa" icon={<Users size={16} />}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "0.75rem",
          }}
        >
          <StatBox
            icon={<Hand size={16} color={C.navy600} />}
            label="Porteros"
            value={positionCounts.Portero}
          />
          <StatBox
            icon={<Shield size={16} color={C.navy600} />}
            label="Defensas"
            value={positionCounts.Defensa}
          />
          <StatBox
            icon={<Target size={16} color={C.navy600} />}
            label="Medios"
            value={positionCounts.Medio}
          />
          <StatBox
            icon={<Goal size={16} color={C.navy600} />}
            label="Delanteros"
            value={positionCounts.Delantero}
          />
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

      {/* 👇 Título en string, ícono nativo 👇 */}
      <SectionCard title="Plantilla Oficial" icon={<Trophy size={16} />}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          {/* 👇 FILA: BARRA DE BÚSQUEDA + BOTÓN DE COMPARAR 👇 */}
          <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
            <div style={{ position: "relative", flex: 1 }}>
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
                }}
              >
                <ArrowRightLeft size={14} /> Comparar
              </button>
            )}
          </div>

          <div
            className="hide-scroll"
            style={{
              display: "flex",
              gap: "0.4rem",
              overflowX: "auto",
              paddingBottom: "0.25rem",
            }}
          >
            {[
              "Todos",
              "Portero",
              "Defensa",
              "Medio",
              "Delantero",
              "Inactivos",
            ].map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPositionFilter(pos)}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: RADIUS.full,
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  border: `1px solid ${positionFilter === pos ? (pos === "Inactivos" ? C.red : C.navy900) : C.gray300}`,
                  backgroundColor:
                    positionFilter === pos
                      ? pos === "Inactivos"
                        ? C.red
                        : C.navy900
                      : C.white,
                  color: positionFilter === pos ? C.white : C.gray600,
                  transition: "all 0.2s ease",
                }}
              >
                {pos}
              </button>
            ))}
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
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
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
