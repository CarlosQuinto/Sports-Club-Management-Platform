import React from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { C, KPICard } from "../../components/ui";
import { formatCurrency } from "../finances/helpers";
import { CUOTA } from "../finances/constants";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  aportaron: number;
  recaudado: number;
  faltante: number;
  playersCount: number;
  showFaltante: boolean;
}

export function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
  aportaron,
  recaudado,
  faltante,
  playersCount,
  showFaltante,
}: SummaryCardsProps) {
  return (
    <>
      {/* Resumen general */}
      <div>
        <h2
          style={{
            fontSize: "0.9rem",
            fontWeight: "700",
            marginBottom: "0.75rem",
            color: C.navy900,
            letterSpacing: "-0.01em",
          }}
        >
          Resumen General
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "0.75rem",
          }}
        >
          <KPICard
            label="Balance"
            value={formatCurrency(balance)}
            sublabel="Total disponible"
            accent={balance >= 0 ? "navy" : "red"}
            icon={<Wallet size={20} color={C.navy900} />}
            style={{ padding: "0.75rem", fontSize: "0.75rem" }}
          />
          <KPICard
            label="Ingresos"
            value={formatCurrency(totalIncome)}
            sublabel="Acumulado"
            accent="green"
            icon={<TrendingUp size={20} color={C.green} />}
            style={{ padding: "0.75rem", fontSize: "0.75rem" }}
          />
          <KPICard
            label="Gastos"
            value={formatCurrency(totalExpense)}
            sublabel="Acumulado"
            accent="red"
            icon={<TrendingDown size={20} color={C.red} />}
            style={{ padding: "0.75rem", fontSize: "0.75rem" }}
          />
        </div>
      </div>

      {/* Aportaciones */}
      <div>
        <h2
          style={{
            fontSize: "0.9rem",
            fontWeight: "700",
            marginBottom: "0.75rem",
            color: C.navy900,
            letterSpacing: "-0.01em",
          }}
        >
          Aportaciones Voluntarias (Sugerido: ${CUOTA})
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "0.75rem",
          }}
        >
          <KPICard
            label="Han apoyado"
            value={`${aportaron} / ${playersCount}`}
            sublabel="Jugadores"
            accent="green"
            style={{ padding: "0.75rem", fontSize: "0.75rem" }}
          />
          <KPICard
            label="Recaudado"
            value={formatCurrency(recaudado)}
            sublabel="Total"
            accent="navy"
            style={{ padding: "0.75rem", fontSize: "0.75rem" }}
          />
          {showFaltante && (
            <KPICard
              label="Falta p/ Meta"
              value={formatCurrency(faltante)}
              sublabel="Meta ideal"
              accent="red"
              style={{ padding: "0.75rem", fontSize: "0.75rem" }}
            />
          )}
        </div>
      </div>
    </>
  );
}
