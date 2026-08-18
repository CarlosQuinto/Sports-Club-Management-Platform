import React, { useState, useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  PlusCircle,
  LayoutList,
  Trash2,
  CheckCircle,
} from "lucide-react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../hooks/useClubData";
import {
  C,
  RADIUS,
  SectionCard,
  KPICard,
  SegmentedControl,
  FormInput,
  FormSelect,
  PrimaryButton,
} from "../components/ui";
import { formatFriendlyDate } from "../utils/helpers";

export default function Finances({ transactions, players, perms }: any) {
  const CUOTA = 200;

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"ingreso" | "gasto">("ingreso");
  const [category, setCategory] = useState("Cuotas");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const categoriasIngreso = ["Cuotas", "Ventas", "Patrocinio", "Otro"];
  const categoriasGasto = [
    "Equipo/Balones",
    "Canchas",
    "Arbitraje",
    "Bebidas/Comida",
    "Botiquín",
    "Otro",
  ];

  const allTransactions = useMemo(() => {
    const playerPayments = players
      .filter((p: any) => (p.amount_paid || 0) > 0)
      .map((p: any) => ({
        id: `pago-${p.id}`,
        type: "ingreso",
        description: `Aportación de: ${p.name}`,
        category: "Cuotas",
        amount: p.amount_paid,
        // 🔹 Primero usamos la fecha de pago si existe, luego la de creación, y por último la del form
        date: p.payment_timestamp
          ? p.payment_timestamp.split("T")[0]
          : p.timestamp
            ? p.timestamp.split("T")[0]
            : date,
      }));
    return [...transactions, ...playerPayments].sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions, players, date]);

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

  const { aportaron, recaudado, faltante } = useMemo(() => {
    const aportaronCount = players.filter(
      (p: any) => (p.amount_paid || 0) > 0,
    ).length;
    const totalRecaudado = players.reduce(
      (sum: number, p: any) => sum + (p.amount_paid || 0),
      0,
    );
    const totalEsperado = players.length * CUOTA;
    return {
      aportaron: aportaronCount,
      recaudado: totalRecaudado,
      faltante: totalEsperado - totalRecaudado,
    };
  }, [players]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    await addDoc(collection(db, "transactions"), {
      type,
      description,
      category,
      amount: parseFloat(amount),
      date,
      timestamp: new Date().toISOString(),
    });
    setDescription("");
    setAmount("");
  };

  const handleUpdatePayment = async (
    id: string,
    currentAmount: number,
    playerName: string,
  ) => {
    const input = window.prompt(
      `¿Cuánto ha aportado de forma voluntaria ${playerName} en total?\n\n(Aportación sugerida: $${CUOTA})`,
      (currentAmount || 0).toString(),
    );
    if (input === null) return;
    const newAmount = parseFloat(input);
    if (isNaN(newAmount) || newAmount < 0)
      return alert("Por favor ingresa una cantidad válida.");

    await updateDoc(doc(db, "players", id), {
      amount_paid: newAmount,
      payment_timestamp: new Date().toISOString(),
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);

  const handleDelete = async (collectionName: string, id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este movimiento?")) {
      await deleteDoc(doc(db, collectionName, id));
    }
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
      {/* ── KPI CARDS: RESUMEN GENERAL ── */}
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

      {/* ── KPI CARDS: APORTACIONES ── */}
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
            value={`${aportaron} / ${players.length}`}
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
          {perms.canEditFinanzas && (
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

      {/* ── LISTA DE JUGADORES Y APORTACIONES ── */}
      <SectionCard
        title="Control de Aportaciones"
        icon={<Users size={14} color={C.navy600} />}
      >
        {players.length === 0 ? (
          <p
            style={{ textAlign: "center", color: C.gray400, margin: "1rem 0" }}
          >
            No hay jugadores registrados.
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            {players.map((player: any) => {
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
                    {perms.canEditFinanzas ? (
                      <button
                        onClick={() =>
                          handleUpdatePayment(
                            player.id,
                            amountPaid,
                            player.name,
                          )
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
                            <CheckCircle size={14} />{" "}
                            {formatCurrency(amountPaid)}
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
                            <CheckCircle size={14} />{" "}
                            {formatCurrency(amountPaid)}
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

      {/* ── FORMULARIO DE GASTOS/INGRESOS (ESTRUCTURA CORREGIDA) ── */}
      {perms.canEditFinanzas && (
        <SectionCard
          title="Registrar Movimiento"
          icon={<PlusCircle size={14} color={C.navy600} />}
        >
          <form
            onSubmit={handleAddTransaction}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* TIPO DE MOVIMIENTO */}
            <SegmentedControl
              options={[
                {
                  label: "Ingreso",
                  value: "ingreso",
                  icon: <TrendingUp size={12} />,
                },
                {
                  label: "Gasto",
                  value: "gasto",
                  icon: <TrendingDown size={12} />,
                },
              ]}
              value={type}
              onChange={(v) => {
                setType(v as "ingreso" | "gasto");
                setCategory(v === "ingreso" ? "Cuotas" : "Equipo/Balones");
              }}
            />

            {/* INPUTS ORDENADOS EN FILAS PARA MÓVIL Y DESKTOP */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {/* Fila 1: Categoría y Monto */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <FormSelect
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ flex: 1.5 }}
                >
                  {(type === "ingreso"
                    ? categoriasIngreso
                    : categoriasGasto
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </FormSelect>
                <FormInput
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="$ Monto"
                  style={{ flex: 1 }}
                />
              </div>

              {/* Fila 2: Descripción */}
              <FormInput
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Pago de arbitraje contra Tigres..."
                style={{ width: "100%" }}
              />

              {/* Fila 3: Fecha y Botón de Acción */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <FormInput
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ flex: 1 }}
                />
                <PrimaryButton
                  type="submit"
                  variant={type === "ingreso" ? "green" : "red"}
                  style={{ flex: 1 }}
                >
                  {type === "ingreso" ? "Registrar Ingreso" : "Registrar Gasto"}
                </PrimaryButton>
              </div>
            </div>
          </form>
        </SectionCard>
      )}

      {/* ── HISTORIAL DE TRANSACCIONES ── */}
      <SectionCard
        title="Historial de Movimientos"
        icon={<LayoutList size={14} color={C.navy600} />}
      >
        {allTransactions.length === 0 ? (
          <p
            style={{ textAlign: "center", color: C.gray400, margin: "1rem 0" }}
          >
            Aún no hay movimientos.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {allTransactions.map((tx: any) => (
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
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
                  {perms.canEditFinanzas && !tx.id.startsWith("pago-") && (
                    <button
                      onClick={() => handleDelete("transactions", tx.id)}
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
                  {perms.canEditFinanzas && tx.id.startsWith("pago-") && (
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
    </div>
  );
}
