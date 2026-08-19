import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { C, RADIUS } from "../../components/ui";
import { isBirthdayToday } from "../../utils/helpers";

interface PlayerRowProps {
  player: any;
  canEditAll: boolean;
  isPressOnly: boolean;
  onSelect: (player: any) => void;
  onEdit: (player: any) => void;
  onDelete: (id: string) => void;
}

export default function PlayerRow({
  player,
  canEditAll,
  isPressOnly,
  onSelect,
  onEdit,
  onDelete,
}: PlayerRowProps) {
  const isBday = isBirthdayToday(player.birthDate);

  return (
    <div
      onClick={() => onSelect(player)}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.875rem 1rem",
        border: `1px solid ${isBday ? C.amber : C.gray200}`,
        borderRadius: RADIUS.md,
        backgroundColor: isBday ? C.amberLight : C.white,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        {/* Contenedor de la foto con posición relativa para la insignia */}
        <div style={{ position: "relative", display: "inline-flex" }}>
          <img
            src={
              player.imageUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                player.name,
              )}&background=102a43&color=fff`
            }
            alt={player.name}
            loading="lazy"
            decoding="async"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                player.name,
              )}&background=102a43&color=fff`;
            }}
          />

          {/* Insignia flotante para Director Técnico */}
          {player.isDT && (
            <span
              title="Director Técnico"
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                width: "20px",
                height: "20px",
                backgroundColor: C.amber,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                border: "2px solid white",
              }}
            >
              📋
            </span>
          )}
        </div>

        <div>
          <p style={{ margin: 0, fontWeight: "700", color: C.navy900 }}>
            {player.name} {isBday && "🍰"}
          </p>
          <p style={{ margin: 0, fontSize: "0.75rem", color: C.navy500 }}>
            #{player.number} • {player.position}{" "}
            {player.variant ? `(${player.variant})` : ""}
          </p>
        </div>
      </div>

      {/* Acciones de Edición/Borrado */}
      {(canEditAll || isPressOnly) && (
        <div
          style={{ display: "flex", gap: "0.5rem" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(player)}
            aria-label={`Editar a ${player.name}`}
            title="Editar"
            style={{
              background: "none",
              border: "none",
              color: C.navy600,
              cursor: "pointer",
            }}
          >
            <Edit size={16} />
          </button>

          {canEditAll && (
            <button
              onClick={() => onDelete(player.id)}
              aria-label={`Eliminar a ${player.name}`}
              title="Eliminar"
              style={{
                background: "none",
                border: "none",
                color: C.red,
                cursor: "pointer",
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
