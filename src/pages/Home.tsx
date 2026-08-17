import React, { useState, useMemo } from "react";
import { LightboxModal } from "../components/AppComponents";

// ── Importamos nuestros nuevos módulos limpios ──
import BirthdayBanner from "../components/home/BirthdayBanner";
import HeroSection from "../components/home/HeroSection";
import HallOfFame from "../components/home/HallOfFame";
import GallerySection from "../components/home/GallerySection";

export default function Home({
  clubInfo,
  players,
  events,
  gallery,
  perms,
  setActiveTab,
}: any) {
  // ── Estado global para el visor de fotos (Lightbox) ──
  const [lightboxData, setLightboxData] = useState<{
    urls: string[];
    initialIndex: number;
    caption?: string;
  } | null>(null);

  // ── CÁLCULO DE ESTADÍSTICAS PARA EL MURO DE LA FAMA ──
  // Lo mantenemos aquí para no recargar el componente hijo y solo pasarle los datos finales
  const clubPlayerStats = useMemo(() => {
    return players.map((p: any) => {
      let goals = 0,
        assists = 0,
        matchesAttended = 0,
        trainingsAttended = 0,
        mvps = 0;

      events
        .filter(
          (e: any) => new Date(e.eventDate + "T" + e.eventTime) < new Date(),
        )
        .forEach((ev: any) => {
          const attended = (ev.attendees || []).some(
            (att: string) => att === p.id || att === p.name,
          );
          if (ev.eventType === "Partido" && attended) matchesAttended++;
          if (ev.eventType === "Entrenamiento" && attended) trainingsAttended++;

          if (ev.eventType === "Partido") {
            ev.stats?.forEach((s: any) => {
              if (s.scorer === p.id || s.scorer === p.name) goals++;
              if (s.assist === p.id || s.assist === p.name) assists++;
            });
            if (ev.mvp === p.id || ev.mvp === p.name) mvps++;
          }
        });

      return {
        ...p,
        goals,
        assists,
        matchesAttended,
        trainingsAttended,
        mvps,
        totalAttendance: matchesAttended + trainingsAttended,
      };
    });
  }, [players, events]);

  const topScorers = [...clubPlayerStats]
    .filter((p: any) => p.goals > 0)
    .sort(
      (a: any, b: any) =>
        b.goals - a.goals ||
        b.assists - a.assists ||
        a.name.localeCompare(b.name),
    );

  const topAssists = [...clubPlayerStats]
    .filter((p: any) => p.assists > 0)
    .sort(
      (a: any, b: any) =>
        b.assists - a.assists ||
        b.goals - a.goals ||
        a.name.localeCompare(b.name),
    );

  const topMVPs = [...clubPlayerStats]
    .filter((p: any) => p.mvps > 0)
    .sort(
      (a: any, b: any) =>
        b.mvps - a.mvps || b.goals - a.goals || a.name.localeCompare(b.name),
    );

  const topIronMen = [...clubPlayerStats]
    .filter((p: any) => p.totalAttendance > 0)
    .sort(
      (a: any, b: any) =>
        b.totalAttendance - a.totalAttendance ||
        b.goals - a.goals ||
        a.name.localeCompare(b.name),
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <BirthdayBanner players={players} />

      <HeroSection
        clubInfo={clubInfo}
        players={players}
        perms={perms}
        setLightboxData={setLightboxData}
      />

      <HallOfFame
        topScorers={topScorers}
        topAssists={topAssists}
        topMVPs={topMVPs}
        topIronMen={topIronMen}
        setActiveTab={setActiveTab}
      />

      <GallerySection
        gallery={gallery}
        events={events}
        perms={perms}
        setLightboxData={setLightboxData}
      />

      {/* VISOR DE FOTOS GLOBAL (LIGHTBOX) */}
      {lightboxData && (
        <LightboxModal
          urls={lightboxData.urls}
          initialIndex={lightboxData.initialIndex}
          caption={lightboxData.caption}
          onClose={() => setLightboxData(null)}
        />
      )}
    </div>
  );
}
