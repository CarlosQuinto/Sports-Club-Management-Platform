import React from "react";
import { Users } from "lucide-react";
import {
  SectionCard,
  FormInput,
  FormSelect,
  PrimaryButton,
  SecondaryButton,
} from "../../components/ui";

// Si tu proyecto ya exporta una constante de colores `C`, importa esa en su lugar.
const C = { navy900: "#1e3a8a", gray500: "#6b7280", green: "#10b981" };

interface PlayerFormProps {
  isPressOnly: boolean;
  editingPlayerId: string | null;
  playerName: string;
  setPlayerName: (val: string) => void;
  playerNumber: string;
  setPlayerNumber: (val: string) => void;
  playerPosition: string;
  setPlayerPosition: (val: string) => void;
  playerVariant: string;
  setPlayerVariant: (val: string) => void;
  playerBirthDate: string;
  setPlayerBirthDate: (val: string) => void;
  playerImageUrl: string;
  setPlayerImageUrl: (val: string) => void;
  isDT: boolean;
  setIsDT: (val: boolean) => void;
  // 👇 NUEVAS PROPS PARA EL ESTADO ACTIVO
  playerActive: boolean;
  setPlayerActive: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function PlayerForm({
  isPressOnly,
  editingPlayerId,
  playerName,
  setPlayerName,
  playerNumber,
  setPlayerNumber,
  playerPosition,
  setPlayerPosition,
  playerVariant,
  setPlayerVariant,
  playerBirthDate,
  setPlayerBirthDate,
  playerImageUrl,
  setPlayerImageUrl,
  isDT,
  setIsDT,
  // 👇 EXTRAEMOS LAS PROPS
  playerActive,
  setPlayerActive,
  onSubmit,
  onCancel,
}: PlayerFormProps) {
  const title = editingPlayerId
    ? isPressOnly
      ? "Actualizar Foto del Jugador"
      : "Editar Jugador"
    : "Fichar Jugador";

  return (
    <SectionCard title={title} icon={<Users size={16} />}>
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <FormInput
            required
            disabled={isPressOnly}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Nombre completo"
            style={{ flex: 2 }}
          />
          <FormInput
            type="number"
            required
            disabled={isPressOnly}
            value={playerNumber}
            onChange={(e) => setPlayerNumber(e.target.value)}
            placeholder="Dorsal"
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <FormSelect
            disabled={isPressOnly}
            value={playerPosition}
            onChange={(e) => setPlayerPosition(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="Portero">Portero</option>
            <option value="Defensa">Defensa</option>
            <option value="Medio">Medio</option>
            <option value="Delantero">Delantero</option>
          </FormSelect>
          <FormInput
            disabled={isPressOnly}
            value={playerVariant}
            onChange={(e) => setPlayerVariant(e.target.value)}
            placeholder="Variante (Ej. Central)"
            style={{ flex: 1 }}
          />
        </div>

        <FormInput
          type="date"
          disabled={isPressOnly}
          value={playerBirthDate}
          onChange={(e) => setPlayerBirthDate(e.target.value)}
          placeholder="Fecha de nacimiento (opcional)"
        />

        <FormInput
          type="url"
          value={playerImageUrl}
          onChange={(e) => setPlayerImageUrl(e.target.value)}
          placeholder="Link de foto (opcional)"
        />

        {/* 👇 CONTENEDOR DE CHECKBOXES (DT Y ACTIVO) 👇 */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "0.25rem",
          }}
        >
          {/* CHECKBOX PARA EL DT */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: C.navy900,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              disabled={isPressOnly}
              checked={isDT}
              onChange={(e) => setIsDT(e.target.checked)}
              style={{ width: "1rem", height: "1rem", cursor: "pointer" }}
            />
            DT
          </label>

          {/* CHECKBOX PARA ESTADO ACTIVO/INACTIVO */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: playerActive ? C.navy900 : C.gray500,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              disabled={isPressOnly}
              checked={playerActive}
              onChange={(e) => setPlayerActive(e.target.checked)}
              style={{
                accentColor: C.green,
                width: "1rem",
                height: "1rem",
                cursor: "pointer",
              }}
            />
            Activo
          </label>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
          <PrimaryButton type="submit" style={{ flex: 1 }}>
            {editingPlayerId ? "Guardar Cambios" : "Agregar"}
          </PrimaryButton>
          {editingPlayerId && (
            <SecondaryButton
              type="button"
              onClick={onCancel}
              style={{ flex: 1 }}
            >
              Cancelar
            </SecondaryButton>
          )}
        </div>
      </form>
    </SectionCard>
  );
}
