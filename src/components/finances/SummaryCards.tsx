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

      {/* Contenedor principal en columna */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {/* 1. TARJETA PRINCIPAL: Balance (Ocupa el 100% del ancho) */}
        <KPICard
          label="Balance Total"
          value={formatCurrency(balance)}
          accent={balance >= 0 ? "navy" : "red"}
          icon={<Wallet size={20} color={C.navy900} />}
        />

        {/* 2. SUB-TARJETAS: Ingresos y Gastos (50% y 50%) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
          }}
        >
          <KPICard
            label="Ingresos"
            value={formatCurrency(totalIncome)}
            accent="green"
            icon={<TrendingUp size={16} color={C.green} />}
          />
          <KPICard
            label="Gastos"
            value={formatCurrency(totalExpense)}
            accent="red"
            icon={<TrendingDown size={16} color={C.red} />}
          />
        </div>
      </div>
    </div>
  );
}
