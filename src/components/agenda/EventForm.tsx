import React from "react";
import { Calendar, Trophy, Target } from "lucide-react";
import {
  SectionCard,
  SegmentedControl,
  FormInput,
  PrimaryButton,
  SecondaryButton,
} from "../../components/ui";

// 👇 Importamos nuestro nuevo constructor de rutinas
import RoutineBuilder from "./RoutineBuilder";

interface EventFormProps {
  perms: any;
  editingEventId: string | null;
  eventType: "Partido" | "Entrenamiento";
  setEventType: (val: "Partido" | "Entrenamiento") => void;
  eventTitle: string;
  setEventTitle: (val: string) => void;
  // 👇 CAMBIO: eventRoutine ahora es un arreglo (Array) de bloques, no un texto
  eventRoutine: any[];
  setEventRoutine: (val: any[]) => void;
  eventDate: string;
  setEventDate: (val: string) => void;
  eventTime: string;
  setEventTime: (val: string) => void;
  eventLocation: string;
  setEventLocation: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function EventForm({
  perms,
  editingEventId,
  eventType,
  setEventType,
  eventTitle,
  setEventTitle,
  eventRoutine,
  setEventRoutine,
  eventDate,
  setEventDate,
  eventTime,
  setEventTime,
  eventLocation,
  setEventLocation,
  onSubmit,
  onCancel,
}: EventFormProps) {
  if (!perms.canEditAgenda) return null;

  return (
    <SectionCard
      title={editingEventId ? "Editar Evento" : "Programar Evento"}
      icon={<Calendar size={16} />}
    >
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <SegmentedControl
          options={[
            { label: "Partido", value: "Partido", icon: <Trophy size={14} /> },
            {
              label: "Entrenamiento",
              value: "Entrenamiento",
              icon: <Target size={14} />,
            },
          ]}
          value={eventType}
          onChange={(v: any) => {
            setEventType(v);
            // 👇 CAMBIO: Al cambiar a partido, limpiamos con un array vacío
            if (v === "Partido") setEventRoutine([]);
          }}
        />

        <FormInput
          required
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder={
            eventType === "Partido" ? "Rival" : "Título del Entrenamiento"
          }
        />

        {/* 👇 CAMBIO: Reemplazamos FormTextarea por RoutineBuilder */}
        {eventType === "Entrenamiento" && (
          <RoutineBuilder routine={eventRoutine} onChange={setEventRoutine} />
        )}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <FormInput
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
          <FormInput
            type="time"
            required
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
          />
        </div>

        <FormInput
          value={eventLocation}
          onChange={(e) => setEventLocation(e.target.value)}
          placeholder="Lugar o Campo"
        />

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <PrimaryButton type="submit" style={{ flex: 1 }}>
            {editingEventId ? "Guardar Cambios" : "Agendar"}
          </PrimaryButton>
          {editingEventId && (
            <SecondaryButton
              type="button"
              onClick={onCancel}
              style={{ flex: 1 }}
            >
              Cancelar
            </SecondaryButton>
          )}
        </div>
      </form>
    </SectionCard>
  );
}
