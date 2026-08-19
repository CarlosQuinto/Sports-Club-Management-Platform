import React from "react";
import { Calendar, Trophy, Target } from "lucide-react";
import {
  SectionCard,
  SegmentedControl,
  FormInput,
  FormTextarea,
  PrimaryButton,
  SecondaryButton,
} from "../../components/ui";

interface EventFormProps {
  perms: any;
  editingEventId: string | null;
  eventType: "Partido" | "Entrenamiento";
  setEventType: (val: "Partido" | "Entrenamiento") => void;
  eventTitle: string;
  setEventTitle: (val: string) => void;
  eventRoutine: string;
  setEventRoutine: (val: string) => void;
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
            if (v === "Partido") setEventRoutine("");
          }}
        />

        <FormInput
          required
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder={eventType === "Partido" ? "Rival" : "Descripción"}
        />

        {eventType === "Entrenamiento" && (
          <FormTextarea
            value={eventRoutine}
            onChange={(e) => setEventRoutine(e.target.value)}
            placeholder="Rutina del día..."
            rows={3}
          />
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
