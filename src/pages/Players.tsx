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

// ─── MÓDULOS EXTRAÍDOS ───
import PlayerForm from "../components/players/PlayerForm";
import PlayerRow from "../components/players/PlayerRow";
import PlayerModal from "../components/players/PlayerModal";
import { usePlayerStats } from "../hooks/usePlayerStats";

export default function Players({ players, events, perms }: any) {
  // Estados de Formulario
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [playerPosition, setPlayerPosition] = useState("Delantero");
  const [playerVariant, setPlayerVariant] = useState("");
  const [playerBirthDate, setPlayerBirthDate] = useState("");
  const [playerImageUrl, setPlayerImageUrl] = useState("");
  const [isDT, setIsDT] = useState(false); // NUEVO ESTADO

  // Estados de UI y Filtros
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("Todos");

  // ─── LÓGICA DE PERMISOS GRANULARES ───
  const canEditAll = perms?.canEditJugadores;
  const isPressOnly =
    !canEditAll && (perms?.canEditPortada || perms?.canEditPrensa);

  // ─── MANEJADORES DE ESTADO (CRUD) ───
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
      isDT: isDT, // NUEVO CAMPO A LA BASE DE DATOS
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

    // Resetear formulario usando la función de cancelar
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
    setIsDT(false); // Resetear
  };

  const handleEdit = (p: any) => {
    setEditingPlayerId(p.id);
    setPlayerName(p.name);
    setPlayerNumber(p.number === "S/N" ? "" : p.number);
    setPlayerPosition(p.position);
    setPlayerVariant(p.variant || "");
    setPlayerBirthDate(p.birthDate || "");
    setPlayerImageUrl(p.imageUrl || "");
    setIsDT(p.isDT || false); // Cargar si existe
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar a este jugador?"))
      await deleteDoc(doc(db, "players", id));
  };

  // ─── CÁLCULOS Y ESTADÍSTICAS (AHORA DESDE EL HOOK) ───
  const { clubPlayerStats, selectedPlayerAchievements } = usePlayerStats(
    players,
    events,
    selectedPlayer,
  );

  // ─── FILTROS Y CONTADORES DE UI ───
  const positionCounts = useMemo(() => {
    const counts = { Portero: 0, Defensa: 0, Medio: 0, Delantero: 0 };
    players.forEach((p: any) => {
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
      const matchesPosition =
        positionFilter === "Todos" || player.position === positionFilter;
      return matchesSearch && matchesPosition;
    });
  }, [players, searchTerm, positionFilter]);

  // ─── RENDER ───
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* ── DISTRIBUCIÓN DE LA PLANTILLA ── */}
      <SectionCard
        title="Distribución de la Plantilla"
        icon={<Users size={16} />}
      >
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
            style={{ padding: "0.75rem", fontSize: "0.75rem" }}
          />
          <StatBox
            icon={<Shield size={16} color={C.navy600} />}
            label="Defensas"
            value={positionCounts.Defensa}
            style={{ padding: "0.75rem", fontSize: "0.75rem" }}
          />
          <StatBox
            icon={<Target size={16} color={C.navy600} />}
            label="Medios"
            value={positionCounts.Medio}
            style={{ padding: "0.75rem", fontSize: "0.75rem" }}
          />
          <StatBox
            icon={<Goal size={16} color={C.navy600} />}
            label="Delanteros"
            value={positionCounts.Delantero}
            style={{ padding: "0.75rem", fontSize: "0.75rem" }}
          />
        </div>
      </SectionCard>

      {/* ── FORMULARIO DE EDICIÓN ── */}
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
          isDT={isDT} // NUEVA PROP
          setIsDT={setIsDT} // NUEVA PROP
          onSubmit={handleSavePlayer}
          onCancel={handleCancelEdit}
        />
      )}

      {/* ── PLANTILLA OFICIAL ── */}
      <SectionCard
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Trophy size={16} /> Plantilla Oficial
            </span>
            {players.length > 1 && (
              <button
                onClick={() => setShowCompareModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.3rem 0.7rem",
                  backgroundColor: C.blueAccent,
                  color: "#fff",
                  border: "none",
                  borderRadius: RADIUS.md,
                  fontWeight: "600",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  boxShadow: SHADOWS.sm,
                  whiteSpace: "nowrap",
                }}
              >
                <ArrowRightLeft size={14} /> Comparar
              </button>
            )}
          </div>
        }
      >
        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ position: "relative" }}>
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
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {["Todos", "Portero", "Defensa", "Medio", "Delantero"].map(
              (pos) => (
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
                    border: `1px solid ${positionFilter === pos ? C.navy900 : C.gray300}`,
                    backgroundColor:
                      positionFilter === pos ? C.navy900 : C.white,
                    color: positionFilter === pos ? C.white : C.gray600,
                    transition: "all 0.2s ease",
                  }}
                >
                  {pos}
                </button>
              ),
            )}
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
                onSelect={setSelectedPlayer}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── MODALES EXTERNOS ── */}
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
