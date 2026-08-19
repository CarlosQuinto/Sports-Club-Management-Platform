import React, { useState } from "react";
import { PlusCircle, TrendingUp, TrendingDown } from "lucide-react";
import {
  C,
  SectionCard,
  SegmentedControl,
  FormInput,
  FormSelect,
  PrimaryButton,
} from "../../components/ui";
import { CATEGORIAS_INGRESO, CATEGORIAS_GASTO } from "../finances/constants";

interface TransactionFormProps {
  onSubmit: (data: {
    type: "ingreso" | "gasto";
    description: string;
    category: string;
    amount: number;
    date: string;
  }) => void;
}

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"ingreso" | "gasto">("ingreso");
  const [category, setCategory] = useState("Cuotas");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onSubmit({
      type,
      description,
      category,
      amount: parseFloat(amount),
      date,
    });
    setDescription("");
    setAmount("");
  };

  return (
    <SectionCard
      title="Registrar Movimiento"
      icon={<PlusCircle size={14} color={C.navy600} />}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
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

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <FormSelect
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ flex: 1.5 }}
            >
              {(type === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO).map(
                (cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ),
              )}
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

          <FormInput
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Pago de arbitraje contra Tigres..."
            style={{ width: "100%" }}
          />

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
  );
}
