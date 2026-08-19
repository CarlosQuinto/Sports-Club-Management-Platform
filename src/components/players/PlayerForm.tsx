import React from "react";
import { Users } from "lucide-react";
import {
  SectionCard,
  FormInput,
  FormSelect,
  PrimaryButton,
  SecondaryButton,
} from "../../components/ui";

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
      {/* Redujimos el gap de 1rem a 0.5rem aquí abajo 👇 */}
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

        {/* Le damos un pequeño margen superior al botón para separarlo sutilmente de los inputs */}
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
