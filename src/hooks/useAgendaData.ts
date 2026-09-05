import { useMemo } from "react";

export function useAgendaData(events: any[]) {
  // ─── CÁLCULO DEL RÉCORD DEL CLUB ───
  const statsClub = useMemo(() => {
    let jugados = 0,
      ganados = 0,
      perdidos = 0,
      entrenamientos = 0;

    events
      .filter(
        (e: any) => new Date(e.eventDate + "T" + e.eventTime) < new Date(),
      )
      .forEach((ev: any) => {
        if (ev.eventType === "Partido") {
          // 👇 REGLA DE ORO: Ignorar los amistosos en el conteo oficial 👇
          if (ev.matchType !== "Amistoso") {
            jugados++;
            if (ev.scoreOurs !== undefined && ev.scoreTheirs !== undefined) {
              if (ev.scoreOurs > ev.scoreTheirs) ganados++;
              if (ev.scoreOurs < ev.scoreTheirs) perdidos++;
            }
          }
        } else {
          entrenamientos++;
        }
      });
    return { jugados, ganados, perdidos, entrenamientos };
  }, [events]);

  // ─── FILTRO Y ORDENAMIENTO DE EVENTOS ───
  const { nextEvents, pastEvents } = useMemo(() => {
    const now = new Date();

    // Ordenamos todos los eventos cronológicamente (del más antiguo al más nuevo)
    const sorted = [...events].sort(
      (a: any, b: any) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
    );

    return {
      // Eventos futuros (incluyendo los que están pasando hoy/ahora)
      nextEvents: sorted.filter(
        (e) => new Date(e.eventDate + "T" + e.eventTime) >= now,
      ),
      // Eventos pasados
      pastEvents: sorted.filter(
        (e) => new Date(e.eventDate + "T" + e.eventTime) < now,
      ),
    };
  }, [events]);

  return {
    statsClub,
    nextEvents,
    pastEvents,
  };
}
