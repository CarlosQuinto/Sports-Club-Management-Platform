import { Achievement } from "./TrophyCase";

export function generatePlayerAchievements(
  selectedPlayer: any,
  pStats: any,
  safeEvents: any[],
): Achievement[] {
  if (!selectedPlayer || !pStats) return [];

  // Calcular récords en un solo partido para este jugador
  let maxGoalsInMatch = 0;
  let maxAssistsInMatch = 0;

  safeEvents.forEach((ev: any) => {
    if (ev.eventType === "Partido" && ev.stats) {
      let goalsHere = ev.stats.filter(
        (s: any) =>
          s.scorer === selectedPlayer.id || s.scorer === selectedPlayer.name,
      ).length;
      let assistsHere = ev.stats.filter(
        (s: any) =>
          s.assist === selectedPlayer.id || s.assist === selectedPlayer.name,
      ).length;

      if (goalsHere > maxGoalsInMatch) maxGoalsInMatch = goalsHere;
      if (assistsHere > maxAssistsInMatch) maxAssistsInMatch = assistsHere;
    }
  });

  const amountPaid = selectedPlayer.amount_paid || 0;

  return [
    // ─── GOLES ──────────────────────────────────────
    {
      id: 1,
      title: "El Bautizo",
      desc: "Anota 1 gol",
      icon: "⚽",
      unlocked: pStats.goals >= 1,
    },
    {
      id: 2,
      title: "El Francotirador",
      desc: "Llega a 10 goles",
      icon: "🎯",
      unlocked: pStats.goals >= 10,
    },
    {
      id: 3,
      title: "Killer del Área",
      desc: "Llega a 25 goles",
      icon: "🦈",
      unlocked: pStats.goals >= 25,
    },
    {
      id: 4,
      title: "Bota de Oro",
      desc: "Llega a 50 goles",
      icon: "👢",
      unlocked: pStats.goals >= 50,
    },
    {
      id: 36,
      title: "Goleador Legendario",
      desc: "Llega a 75 goles",
      icon: "⚡",
      unlocked: pStats.goals >= 75,
    },
    {
      id: 49,
      title: "Máquina de Goles",
      desc: "Llega a 100 goles",
      icon: "🚀",
      unlocked: pStats.goals >= 100,
    },

    // ─── GOLES EN UN PARTIDO ────────────────────────
    {
      id: 5,
      title: "Hat-Trick",
      desc: "3 goles en 1 partido",
      icon: "🎩",
      unlocked: maxGoalsInMatch >= 3,
    },
    {
      id: 6,
      title: "El Póker",
      desc: "4 goles en 1 partido",
      icon: "🃏",
      unlocked: maxGoalsInMatch >= 4,
    },
    {
      id: 37,
      title: "Manita",
      desc: "5 goles en 1 partido",
      icon: "✋",
      unlocked: maxGoalsInMatch >= 5,
    },

    // ─── ASISTENCIAS ──────────────────────────────────
    {
      id: 7,
      title: "El Buen Socio",
      desc: "Da 1 asistencia",
      icon: "🤝",
      unlocked: pStats.assists >= 1,
    },
    {
      id: 8,
      title: "Guante en el Pie",
      desc: "Llega a 5 asistencias",
      icon: "🧤",
      unlocked: pStats.assists >= 5,
    },
    {
      id: 9,
      title: "Dueño del Medio",
      desc: "Llega a 10 asistencias",
      icon: "🧠",
      unlocked: pStats.assists >= 10,
    },
    {
      id: 10,
      title: "El De Bruyne",
      desc: "Llega a 25 asistencias",
      icon: "👑",
      unlocked: pStats.assists >= 25,
    },
    {
      id: 38,
      title: "Asistente Legendario",
      desc: "Llega a 50 asistencias",
      icon: "🧩",
      unlocked: pStats.assists >= 50,
    },

    // ─── ASISTENCIAS EN UN PARTIDO ──────────────────
    {
      id: 11,
      title: "Dúo Dinámico",
      desc: "2 asistencias en 1 partido",
      icon: "👯",
      unlocked: maxAssistsInMatch >= 2,
    },
    {
      id: 12,
      title: "El Repartidor",
      desc: "3 asistencias en 1 partido",
      icon: "🛵",
      unlocked: maxAssistsInMatch >= 3,
    },
    {
      id: 39,
      title: "Asistencia Estelar",
      desc: "5 asistencias en 1 partido",
      icon: "🤹",
      unlocked: maxAssistsInMatch >= 5,
    },

    // ─── MVPs ──────────────────────────────────────
    {
      id: 13,
      title: "MVP",
      desc: "Gana 1 MVP",
      icon: "🏅",
      unlocked: pStats.mvps >= 1,
    },
    {
      id: 14,
      title: "El Galáctico",
      desc: "Gana 3 MVPs",
      icon: "🌠",
      unlocked: pStats.mvps >= 3,
    },
    {
      id: 40,
      title: "MVP Estrella",
      desc: "Gana 5 MVPs",
      icon: "⭐",
      unlocked: pStats.mvps >= 5,
    },
    {
      id: 15,
      title: "Balón de Oro",
      desc: "Gana 10 MVPs",
      icon: "🌍",
      unlocked: pStats.mvps >= 10,
    },
    {
      id: 41,
      title: "MVP Legendario",
      desc: "Gana 20 MVPs",
      icon: "🌟",
      unlocked: pStats.mvps >= 20,
    },

    // ─── ARCOS EN CERO ──────────────────────────────
    {
      id: 16,
      title: "Candado Cerrado",
      desc: "1 arco en cero",
      icon: "🔒",
      unlocked: pStats.cleanSheets >= 1,
    },
    {
      id: 17,
      title: "La Muralla",
      desc: "3 arcos en cero",
      icon: "🧱",
      unlocked: pStats.cleanSheets >= 3,
    },
    {
      id: 42,
      title: "Impermeable",
      desc: "5 arcos en cero",
      icon: "🧤",
      unlocked: pStats.cleanSheets >= 5,
    },
    {
      id: 18,
      title: "El Pulpo",
      desc: "10 arcos en cero",
      icon: "🐙",
      unlocked: pStats.cleanSheets >= 10,
    },
    {
      id: 43,
      title: "Muro Invencible",
      desc: "20 arcos en cero",
      icon: "🏰",
      unlocked: pStats.cleanSheets >= 20,
    },

    // ─── PARTIDOS JUGADOS ────────────────────────────
    {
      id: 19,
      title: "El Debutante",
      desc: "Juega 1 partido",
      icon: "👕",
      unlocked: pStats.matchesAttended >= 1,
    },
    {
      id: 20,
      title: "Titular Habitual",
      desc: "Juega 5 partidos",
      icon: "🏃",
      unlocked: pStats.matchesAttended >= 5,
    },
    {
      id: 21,
      title: "Veterano",
      desc: "Juega 15 partidos",
      icon: "🎖️",
      unlocked: pStats.matchesAttended >= 15,
    },
    {
      id: 44,
      title: "Veterano de Guerra",
      desc: "Juega 20 partidos",
      icon: "⚔️",
      unlocked: pStats.matchesAttended >= 20,
    },
    {
      id: 22,
      title: "Leyenda del Llano",
      desc: "Juega 30 partidos",
      icon: "🏛️",
      unlocked: pStats.matchesAttended >= 30,
    },
    {
      id: 45,
      title: "Maratón",
      desc: "Juega 50 partidos",
      icon: "🏃‍♂️",
      unlocked: pStats.matchesAttended >= 50,
    },
    {
      id: 50,
      title: "El Inmortal",
      desc: "Juega 100 partidos",
      icon: "🏅",
      unlocked: pStats.matchesAttended >= 100,
    },

    // ─── ENTRENAMIENTOS ──────────────────────────────
    {
      id: 23,
      title: "Primer Sudor",
      desc: "1 entrenamiento",
      icon: "💧",
      unlocked: pStats.trainingsAttended >= 1,
    },
    {
      id: 24,
      title: "El Disciplinado",
      desc: "10 entrenamientos",
      icon: "🔋",
      unlocked: pStats.trainingsAttended >= 10,
    },
    {
      id: 25,
      title: "El Profe",
      desc: "25 entrenamientos",
      icon: "📋",
      unlocked: pStats.trainingsAttended >= 25,
    },
    {
      id: 26,
      title: "Máquina Perfecta",
      desc: "50 entrenamientos",
      icon: "🤖",
      unlocked: pStats.trainingsAttended >= 50,
    },
    {
      id: 46,
      title: "Entrenamiento Élite",
      desc: "100 entrenamientos",
      icon: "💪",
      unlocked: pStats.trainingsAttended >= 100,
    },

    // ─── TARJETAS ────────────────────────────────────
    {
      id: 27,
      title: "1ra Advertencia",
      desc: "Recibe 1 amarilla",
      icon: "🟨",
      unlocked: pStats.yellowCards >= 1,
    },
    {
      id: 28,
      title: "El Carnicero",
      desc: "Acumula 3 amarillas",
      icon: "🪓",
      unlocked: pStats.yellowCards >= 3,
    },
    {
      id: 29,
      title: "A las regaderas",
      desc: "Recibe 1 roja",
      icon: "🟥",
      unlocked: pStats.redCards >= 1,
    },
    {
      id: 30,
      title: "Peligro Público",
      desc: "Acumula 3 rojas",
      icon: "☣️",
      unlocked: pStats.redCards >= 3,
    },

    // ─── COMBINADOS ──────────────────────────────────
    {
      id: 31,
      title: "Doble Amenaza",
      desc: "5 goles y 5 asist.",
      icon: "⚔️",
      unlocked: pStats.goals >= 5 && pStats.assists >= 5,
    },
    {
      id: 32,
      title: "Franquicia",
      desc: "10G, 10A, 10 Partidos",
      icon: "💎",
      unlocked:
        pStats.goals >= 10 &&
        pStats.assists >= 10 &&
        pStats.matchesAttended >= 10,
    },
    {
      id: 47,
      title: "Triple Amenaza",
      desc: "15G, 15A, 15 Partidos",
      icon: "🔱",
      unlocked:
        pStats.goals >= 15 &&
        pStats.assists >= 15 &&
        pStats.matchesAttended >= 15,
    },

    // ─── APORTACIONES VOLUNTARIAS ──────────────────
    {
      id: 33,
      title: "Caridad",
      desc: "Hizo 1 aportación",
      icon: "💝",
      unlocked: amountPaid >= 1,
    },
    {
      id: 34,
      title: "Socio",
      desc: "Aportó ≥ $200",
      icon: "💳",
      unlocked: amountPaid >= 200,
    },
    {
      id: 35,
      title: "El Padrino",
      desc: "Aportó ≥ $500",
      icon: "💰",
      unlocked: amountPaid >= 500,
    },
    {
      id: 48,
      title: "Filántropo",
      desc: "Aportó ≥ $1000",
      icon: "💎",
      unlocked: amountPaid >= 1000,
    },
  ];
}
