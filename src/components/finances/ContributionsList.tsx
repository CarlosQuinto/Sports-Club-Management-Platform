import React from "react";
import { Users, CheckCircle } from "lucide-react";
import { C, RADIUS, SectionCard } from "../../components/ui";
import { formatCurrency } from "../finances/helpers";
import { Player } from "../finances/types";

interface ContributionsListProps {
  players: Player[];
  canEdit: boolean;
  onUpdatePayment: (id: string, currentAmount: number, name: string) => void;
}

export function ContributionsList({
  players,
  canEdit,
  onUpdatePayment,
}: ContributionsListProps) {
  return (
    <SectionCard
      title="Control de Aportaciones"
      icon={<Users size={14} color={C.navy600} />}
    >
      {players.length === 0 ? (
        <p style={{ textAlign: "center", color: C.gray400, margin: "1rem 0" }}>
          No hay jugadores registrados.
        </p>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          {players.map((player) => {
            const amountPaid = player.amount_paid || 0;
            const hasContributed = amountPaid > 0;
            return (
              <div
                key={player.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0.75rem",
                  border: `1px solid ${C.gray200}`,
                  borderRadius: RADIUS.md,
                  backgroundColor: hasContributed ? C.greenLight : C.white,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: C.navy900,
                    fontSize: "0.8rem",
                  }}
                >
                  {player.name}
                </p>
                <div>
                  {canEdit ? (
                    <button
                      onClick={() =>
                        onUpdatePayment(player.id, amountPaid, player.name)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        color: hasContributed ? C.green : C.gray400,
                      }}
                    >
                      {hasContributed ? (
                        <>
                          <CheckCircle size={14} /> {formatCurrency(amountPaid)}
                        </>
                      ) : (
                        <>Sin aportación</>
                      )}
                    </button>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontWeight: "600",
                        color: hasContributed ? C.green : C.gray400,
                        fontSize: "0.75rem",
                      }}
                    >
                      {hasContributed ? (
                        <>
                          <CheckCircle size={14} /> {formatCurrency(amountPaid)}
                        </>
                      ) : (
                        <>Sin aportación</>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
