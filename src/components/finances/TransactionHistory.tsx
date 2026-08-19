import React from "react";
import { LayoutList, Trash2, Users } from "lucide-react";
import { C, SectionCard } from "../../components/ui";
import { formatCurrency, isPlayerPayment } from "../finances/helpers";
import { formatFriendlyDate } from "../../utils/helpers";
import { Transaction } from "../finances/types";

interface TransactionHistoryProps {
  transactions: Transaction[];
  canEdit: boolean;
  onDelete: (id: string) => void;
}

export function TransactionHistory({
  transactions,
  canEdit,
  onDelete,
}: TransactionHistoryProps) {
  return (
    <SectionCard
      title="Historial de Movimientos"
      icon={<LayoutList size={14} color={C.navy600} />}
    >
      {transactions.length === 0 ? (
        <p style={{ textAlign: "center", color: C.gray400, margin: "1rem 0" }}>
          Aún no hay movimientos.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {transactions.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: `1px solid ${C.gray100}`,
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: C.navy900,
                    fontSize: "0.8rem",
                  }}
                >
                  {tx.description}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.65rem",
                    color: C.gray400,
                    marginTop: "0.1rem",
                  }}
                >
                  {tx.category} • {formatFriendlyDate(tx.date)}
                </p>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "0.8rem",
                    color: tx.type === "ingreso" ? C.green : C.navy900,
                    fontFamily: "'Inter', monospace",
                  }}
                >
                  {tx.type === "ingreso" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
                {canEdit && !isPlayerPayment(tx.id) && (
                  <button
                    onClick={() => onDelete(tx.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: C.red,
                      cursor: "pointer",
                      opacity: 0.5,
                      padding: 0,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {canEdit && isPlayerPayment(tx.id) && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: C.gray300,
                      width: "14px",
                      textAlign: "center",
                    }}
                  >
                    <Users size={12} />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
