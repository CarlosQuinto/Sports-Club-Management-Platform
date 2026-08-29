import React from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { C, KPICard } from "../../components/ui";
import { formatCurrency } from "../finances/helpers";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
}: SummaryCardsProps) {
  return (
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
        Estado de Cuenta General
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {/* ✅ Envoltura para Balance */}
        <div style={{ padding: "0.75rem", fontSize: "0.75rem" }}>
          <KPICard
            label="Balance"
            value={formatCurrency(balance)}
            accent={balance >= 0 ? "navy" : "red"}
            icon={<Wallet size={20} color={C.navy900} />}
          />
        </div>

        {/* ✅ Envoltura para Ingresos */}
        <div style={{ padding: "0.75rem", fontSize: "0.75rem" }}>
          <KPICard
            label="Ingresos"
            value={formatCurrency(totalIncome)}
            accent="green"
            icon={<TrendingUp size={20} color={C.green} />}
          />
        </div>

        {/* ✅ Envoltura para Gastos */}
        <div style={{ padding: "0.75rem", fontSize: "0.75rem" }}>
          <KPICard
            label="Gastos"
            value={formatCurrency(totalExpense)}
            accent="red"
            icon={<TrendingDown size={20} color={C.red} />}
          />
        </div>
      </div>
    </div>
  );
}
