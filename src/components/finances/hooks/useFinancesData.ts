import { useMemo } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../hooks/useClubData";
import { CUOTA } from "../constants";
import { Transaction, Player } from "../types";

export function useFinancesData(
  transactions: Transaction[],
  players: Player[],
  date: string,
) {
  // Combina transacciones manuales y aportaciones de jugadores
  const allTransactions = useMemo(() => {
    const playerPayments = players
      .filter((p) => (p.amount_paid || 0) > 0)
      .map(
        (p): Transaction => ({
          id: `pago-${p.id}`,
          type: "ingreso",
          description: `Aportación de: ${p.name}`,
          category: "Cuotas",
          amount: p.amount_paid,
          date: p.payment_timestamp
            ? p.payment_timestamp.split("T")[0]
            : p.timestamp
              ? p.timestamp.split("T")[0]
              : date,
        }),
      );

    return [...transactions, ...playerPayments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions, players, date]);

  // Cálculo de totales
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    return allTransactions.reduce(
      (acc, curr) => {
        if (curr.type === "ingreso") {
          acc.totalIncome += curr.amount;
          acc.balance += curr.amount;
        } else {
          acc.totalExpense += curr.amount;
          acc.balance -= curr.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 },
    );
  }, [allTransactions]);

  // Métricas de aportaciones
  const { aportaron, recaudado, faltante } = useMemo(() => {
    const aportaronCount = players.filter(
      (p) => (p.amount_paid || 0) > 0,
    ).length;
    const totalRecaudado = players.reduce(
      (sum, p) => sum + (p.amount_paid || 0),
      0,
    );
    const totalEsperado = players.length * CUOTA;
    return {
      aportaron: aportaronCount,
      recaudado: totalRecaudado,
      faltante: totalEsperado - totalRecaudado,
    };
  }, [players]);

  // Acciones de Firebase
  const addTransaction = async (data: Omit<Transaction, "id">) => {
    await addDoc(collection(db, "transactions"), {
      ...data,
      timestamp: new Date().toISOString(),
    });
  };

  const updatePlayerPayment = async (id: string, newAmount: number) => {
    await updateDoc(doc(db, "players", id), {
      amount_paid: newAmount,
      payment_timestamp: new Date().toISOString(),
    });
  };

  const deleteTransaction = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este movimiento?")) {
      await deleteDoc(doc(db, "transactions", id));
    }
  };

  return {
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
  };
}
