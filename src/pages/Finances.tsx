import React, { useState } from "react";
import { useFinancesData } from "../components/finances/hooks/useFinancesData";
import { SummaryCards } from "../components/finances/SummaryCards";
import { ContributionsList } from "../components/finances/ContributionsList";
import { TransactionForm } from "../components/finances/TransactionForm";
import { TransactionHistory } from "../components/finances/TransactionHistory";

export default function Finances({
  transactions,
  players,
  perms,
}: FinancesProps) {
  const [date] = useState(new Date().toISOString().split("T")[0]); // Solo para aportaciones sin fecha
  const {
    allTransactions,
    totalIncome,
    totalExpense,
    balance,
    aportaron,
    recaudado,
    faltante,
    addTransaction,
    updatePlayerPayment,
    deleteTransaction,
  } = useFinancesData(transactions, players, date);

  const handleUpdatePayment = (
    id: string,
    currentAmount: number,
    playerName: string,
  ) => {
    const input = window.prompt(
      `¿Cuánto ha aportado de forma voluntaria ${playerName} en total?\n\n(Aportación sugerida: $200)`,
      (currentAmount || 0).toString(),
    );
    if (input === null) return;
    const newAmount = parseFloat(input);
    if (isNaN(newAmount) || newAmount < 0) {
      alert("Por favor ingresa una cantidad válida.");
      return;
    }
    updatePlayerPayment(id, newAmount);
  };

  const handleSubmitTransaction = (data: Omit<Transaction, "id">) => {
    addTransaction(data);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        aportaron={aportaron}
        recaudado={recaudado}
        faltante={faltante}
        playersCount={players.length}
        showFaltante={perms.canEditFinanzas}
      />

      <ContributionsList
        players={players}
        canEdit={perms.canEditFinanzas}
        onUpdatePayment={handleUpdatePayment}
      />

      {perms.canEditFinanzas && (
        <TransactionForm onSubmit={handleSubmitTransaction} />
      )}

      <TransactionHistory
        transactions={allTransactions}
        canEdit={perms.canEditFinanzas}
        onDelete={deleteTransaction}
      />
    </div>
  );
}
