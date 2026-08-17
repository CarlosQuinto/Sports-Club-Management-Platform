import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Edit,
  Camera,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Medal,
  Goal,
  TrendingUp,
  Award,
  Shield,
  Star,
  Images,
  MapPin,
  Users,
} from "lucide-react";
import { collection, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../hooks/useClubData";
import {
  C,
  RADIUS,
  SHADOWS,
  SectionCard,
  FormInput,
  FormTextarea,
  PrimaryButton,
  SecondaryButton,
} from "../components/ui";
import { isBirthdayToday, formatFriendlyDate } from "../utils/helpers";
// ── Importamos el nuevo carrusel global ──
import { LightboxModal } from "../components/AppComponents";

export default function Home({
  clubInfo,
  players,
  events,
  gallery,
  perms,
}: any) {
  const [isEditingClubInfo, setIsEditingClubInfo] = useState(false);
  const [editClubName, setEditClubName] = useState(clubInfo.name);
  const [editClubDesc, setEditClubDesc] = useState(clubInfo.description);
  const [editClubImages, setEditClubImages] = useState(
    clubInfo.heroImages?.join("\n") || "",
  );
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // ── Estado para el Carrusel del Muro de la Fama ──
  const [hofIndex, setHofIndex] = useState(0);
  const nextHof = () => setHofIndex((prev) => (prev + 1) % 4);
  const prevHof = () => setHofIndex((prev) => (prev - 1 + 4) % 4);

  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");

  // ── Estado para el Lightbox global ──
  const [lightboxData, setLightboxData] = useState<{
    urls: string[];
    initialIndex: number;
    caption?: string;
  } | null>(null);

  const albumsRef = useRef<HTMLDivElement>(null);
  const heroTouchStartX = useRef<number | null>(null);
  const heroTouchEndX = useRef<number | null>(null);

  // ── AUTO ROTACIÓN DEL CARRUSEL DE PORTADA ──
  useEffect(() => {
    if (
      !clubInfo.heroImages ||
      clubInfo.heroImages.length <= 1 ||
      isEditingClubInfo
    )
      return;
    const timer = setTimeout(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % clubInfo.heroImages.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [clubInfo.heroImages, isEditingClubInfo, currentHeroIndex]);

  // ── GESTOS TÁCTILES DE LA PORTADA ──
  const handleHeroTouchStart = (e: React.TouchEvent) => {
    heroTouchEndX.current = null;
    heroTouchStartX.current = e.targetTouches[0].clientX;
  };
  const handleHeroTouchMove = (e: React.TouchEvent) => {
    heroTouchEndX.current = e.targetTouches[0].clientX;
  };
  const handleHeroTouchEnd = () => {
    if (
      heroTouchStartX.current === null ||
      heroTouchEndX.current === null ||
      !clubInfo.heroImages
    )
      return;
    const distance = heroTouchStartX.current - heroTouchEndX.current;
    if (distance > 50)
      setCurrentHeroIndex((prev) => (prev + 1) % clubInfo.heroImages.length);
    else if (distance < -50)
      setCurrentHeroIndex(
        (prev) =>
          (prev - 1 + clubInfo.heroImages.length) % clubInfo.heroImages.length,
      );
  };

  const handleHeroClick = () => {
    if (heroTouchStartX.current !== null && heroTouchEndX.current !== null) {
      if (Math.abs(heroTouchStartX.current - heroTouchEndX.current) > 10)
        return;
    }
    setLightboxData({
      urls: clubInfo.heroImages,
      initialIndex: currentHeroIndex,
      caption: clubInfo.name,
    });
  };

  const scrollAlbums = (direction: "left" | "right") => {
    if (albumsRef.current) {
      albumsRef.current.scrollBy({
        left: direction === "left" ? -240 : 240,
        behavior: "smooth",
      });
    }
  };

  const handleSaveClubInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = editClubImages
      .split("\n")
      .map((url: string) => url.trim())
      .filter((url: string) => url !== "");
    await setDoc(
      doc(db, "settings", "club_info"),
      {
        ...clubInfo,
        name: editClubName.trim(),
        description: editClubDesc.trim(),
        heroImages:
          imagesArray.length > 0
            ? imagesArray
            : [
                "https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              ],
      },
      { merge: true },
    );
    setCurrentHeroIndex(0);
    setIsEditingClubInfo(false);
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryUrl || !galleryCaption) return;
    await addDoc(collection(db, "gallery"), {
      url: galleryUrl.trim(),
      caption: galleryCaption,
      timestamp: new Date().toISOString(),
    });
    setGalleryUrl("");
    setGalleryCaption("");
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (
      window.confirm("¿Seguro que deseas eliminar esta foto de la galería?")
    ) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  const todaysBirthdays = useMemo(
    () => players.filter((p: any) => isBirthdayToday(p.birthDate)),
    [players],
  );
  const birthdayMessage = useMemo(() => {
    if (todaysBirthdays.length === 0) return "";
    if (todaysBirthdays.length === 1)
      return `Hoy celebramos el cumpleaños de ${todaysBirthdays[0].name}. ¡Felicidades, crack! 🎂`;
    if (todaysBirthdays.length === 2)
      return `Hoy celebramos los cumpleaños de ${todaysBirthdays[0].name} y ${todaysBirthdays[1].name}. ¡Muchas felicidades, cracks! 🎂`;
    return `Hoy celebramos a ${todaysBirthdays
      .slice(0, -1)
      .map((p: any) => p.name)
      .join(
        ", ",
      )} y ${todaysBirthdays[todaysBirthdays.length - 1].name}. ¡Un abrazo! 🎂`;
  }, [todaysBirthdays]);

  // ── CÁLCULO DE ESTADÍSTICAS PARA EL MURO DE LA FAMA ──
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
    )
    .slice(0, 5);
  const topAssists = [...clubPlayerStats]
    .filter((p: any) => p.assists > 0)
    .sort(
      (a: any, b: any) =>
        b.assists - a.assists ||
        b.goals - a.goals ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 5);
  const topMVPs = [...clubPlayerStats]
    .filter((p: any) => p.mvps > 0)
    .sort(
      (a: any, b: any) =>
        b.mvps - a.mvps || b.goals - a.goals || a.name.localeCompare(b.name),
    )
    .slice(0, 5);
  const topIronMen = [...clubPlayerStats]
    .filter((p: any) => p.totalAttendance > 0)
    .sort(
      (a: any, b: any) =>
        b.totalAttendance - a.totalAttendance ||
        b.goals - a.goals ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 5);

  // ── OPCIÓN 1: ÁLBUMES TIPO HIGHLIGHTS ──
  const groupedAlbums = useMemo(() => {
    const albums: any[] = [];

    // 1. Fotos manuales subidas por el admin (Álbum General)
    if (gallery && gallery.length > 0) {
      albums.push({
        id: "manual-gallery",
        title: "📸 Galería del Equipo",
        date: "Colección",
        photos: gallery
          .sort(
            (a: any, b: any) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .map((g: any) => ({ id: g.id, url: g.url, caption: g.caption })),
      });
    }

    // 2. Fotos de Eventos (Agenda)
    const eventsWithPhotos = events.filter(
      (e: any) => (e.photoUrls && e.photoUrls.length > 0) || e.photoUrl,
    );
    const sortedEvents = eventsWithPhotos.sort(
      (a: any, b: any) =>
        new Date(b.eventDate + "T" + b.eventTime).getTime() -
        new Date(a.eventDate + "T" + a.eventTime).getTime(),
    );

    sortedEvents.forEach((e: any) => {
      // Retrocompatibilidad
      const urls =
        e.photoUrls && e.photoUrls.length > 0 ? e.photoUrls : [e.photoUrl];
      albums.push({
        id: e.id,
        title: `${e.eventType === "Partido" ? "🏆" : "🎯"} ${e.title}`,
        date: formatFriendlyDate(e.eventDate),
        photos: urls.map((url: string) => ({ id: url, url, caption: "" })),
      });
    });

    return albums;
  }, [gallery, events]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* CUMPLEAÑOS */}
      {todaysBirthdays.length > 0 && (
        <div
          style={{
            background: "linear-gradient(270deg, #f59e0b, #fbbf24, #f59e0b)",
            color: C.white,
            padding: "1.25rem",
            borderRadius: RADIUS.lg,
            boxShadow: SHADOWS.md,
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <span style={{ fontSize: "2rem" }}>🎉</span>
          <div>
            <h3
              style={{
                margin: "0 0 0.25rem 0",
                fontSize: "1.125rem",
                fontWeight: "800",
              }}
            >
              ¡Día de Fiesta!
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "600" }}>
              {birthdayMessage}
            </p>
          </div>
        </div>
      )}

      {/* 🌟 PORTADA PREMIUM 🌟 */}
      <div
        style={{
          backgroundColor: C.white,
          borderRadius: RADIUS.xl,
          overflow: "hidden",
          boxShadow: SHADOWS.lg,
          border: `1px solid ${C.gray200}`,
          position: "relative",
        }}
      >
        {perms.canEditPortada && !isEditingClubInfo && (
          <button
            onClick={() => {
              setEditClubName(clubInfo.name);
              setEditClubDesc(clubInfo.description);
              setEditClubImages(clubInfo.heroImages?.join("\n") || "");
              setIsEditingClubInfo(true);
            }}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "rgba(255,255,255,0.95)",
              border: `1px solid ${C.gray200}`,
              borderRadius: RADIUS.md,
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: SHADOWS.sm,
              zIndex: 50,
              color: C.navy900,
            }}
          >
            <Edit size={14} /> Editar Portada
          </button>
        )}

        {isEditingClubInfo ? (
          <div style={{ padding: "2rem", backgroundColor: C.gray50 }}>
            <form
              onSubmit={handleSaveClubInfo}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <FormInput
                type="text"
                required
                value={editClubName}
                onChange={(e) => setEditClubName(e.target.value)}
                placeholder="Nombre del Club"
              />
              <FormTextarea
                required
                value={editClubDesc}
                onChange={(e) => setEditClubDesc(e.target.value)}
                placeholder="Descripción breve"
                rows={2}
              />
              <FormTextarea
                required
                value={editClubImages}
                onChange={(e) => setEditClubImages(e.target.value)}
                placeholder="Links de imágenes (una por línea)"
                rows={4}
                style={{ whiteSpace: "pre" }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <PrimaryButton type="submit" style={{ flex: 1 }}>
                  Guardar
                </PrimaryButton>
                <SecondaryButton
                  type="button"
                  onClick={() => setIsEditingClubInfo(false)}
                >
                  Cancelar
                </SecondaryButton>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* 1. Contenedor de la Imagen (Proporción 16:9 Cinemática) */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                backgroundColor: C.navy900,
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={handleHeroClick}
              onTouchStart={handleHeroTouchStart}
              onTouchMove={handleHeroTouchMove}
              onTouchEnd={handleHeroTouchEnd}
            >
              {clubInfo.heroImages?.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={clubInfo.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    opacity: idx === currentHeroIndex ? 1 : 0,
                    transition: "opacity 1s ease-in-out",
                  }}
                />
              ))}

              {/* Sombra interna para separar la imagen del texto de abajo */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "60px",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />

              {clubInfo.heroImages?.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.4rem",
                    zIndex: 20,
                  }}
                >
                  {clubInfo.heroImages.map((_: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor:
                          idx === currentHeroIndex
                            ? C.white
                            : "rgba(255,255,255,0.4)",
                        transition: "background-color 0.5s ease",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 2. Información del Club con Badges */}
            <div
              style={{
                padding: "1.75rem 1.5rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h1
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.75rem",
                  fontWeight: "900",
                  color: C.navy900,
                  letterSpacing: "-0.03em",
                  lineHeight: "1.1",
                }}
              >
                {clubInfo.name}
              </h1>

              <p
                style={{
                  margin: "0 0 1.25rem 0",
                  color: C.gray600,
                  fontSize: "0.875rem",
                  lineHeight: "1.5",
                  maxWidth: "280px",
                }}
              >
                {clubInfo.description}
              </p>

              {/* 3. Badges (Píldoras) de Información Dinámica */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    backgroundColor: C.navy50,
                    color: C.navy700,
                    padding: "0.35rem 0.75rem",
                    borderRadius: RADIUS.full,
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  <MapPin size={12} /> Guaymas, Sonora
                </span>

                {players && players.length > 0 && (
                  <span
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      color: C.green,
                      padding: "0.35rem 0.75rem",
                      borderRadius: RADIUS.full,
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                    }}
                  >
                    <Users size={12} /> {players.length} Activos
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 🏆 MURO DE LA FAMA (CARRUSEL INFINITO SMOOTH) 🏆 */}
      <div
        style={{
          backgroundColor: C.navy900,
          borderRadius: RADIUS.lg,
          padding: "1.5rem",
          boxShadow: SHADOWS.lg,
          color: C.white,
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
        }}
      >
        {/* Cabecera con Botones de Navegación */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: "800",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              letterSpacing: "-0.01em",
            }}
          >
            <Medal size={20} color={C.amber} /> Muro de la Fama
          </h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={prevHof}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: `1px solid rgba(255,255,255,0.2)`,
                backgroundColor: "rgba(255,255,255,0.1)",
                cursor: "pointer",
                color: C.white,
                transition: "all 0.2s",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextHof}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: `1px solid rgba(255,255,255,0.2)`,
                backgroundColor: "rgba(255,255,255,0.1)",
                cursor: "pointer",
                color: C.white,
                transition: "all 0.2s",
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* CONTENEDOR DEL CARRUSEL ANIMADO */}
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            position: "relative",
            borderRadius: RADIUS.lg,
          }}
        >
          <div
            style={{
              display: "flex",
              transition:
                "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)" /* Movimiento ultra smooth */,
              transform: `translateX(-${hofIndex * 100}%)`,
            }}
          >
            {/* 1. PICHICHI (GOLES) */}
            <div style={{ flex: "0 0 100%", width: "100%" }}>
              <div
                style={{
                  backgroundColor: C.white,
                  borderRadius: RADIUS.lg,
                  padding: "1.25rem",
                  color: C.navy900,
                  boxShadow: SHADOWS.md,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    paddingBottom: "0.75rem",
                    borderBottom: `1px dashed ${C.gray200}`,
                  }}
                >
                  <div
                    style={{
                      padding: "0.4rem",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      color: C.green,
                      borderRadius: RADIUS.md,
                    }}
                  >
                    <Goal size={18} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: "800",
                        color: C.navy900,
                        lineHeight: "1.2",
                      }}
                    >
                      El Pichichi
                    </h3>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: C.gray500,
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      Máximos Goleadores
                    </span>
                  </div>
                </div>
                {topScorers.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: C.gray400,
                      margin: 0,
                      fontStyle: "italic",
                      flex: 1,
                      textAlign: "center",
                      paddingTop: "1rem",
                    }}
                  >
                    Aún no hay goles.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      flex: 1,
                    }}
                  >
                    {topScorers.map((p: any, i: number) => {
                      const rankBg =
                        i === 0
                          ? "#FEF08A"
                          : i === 1
                            ? "#E2E8F0"
                            : i === 2
                              ? "#FED7AA"
                              : "#F1F5F9";
                      const rankColor =
                        i === 0
                          ? "#B45309"
                          : i === 1
                            ? "#475569"
                            : i === 2
                              ? "#9A3412"
                              : "#64748B";
                      return (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.5rem",
                            borderRadius: RADIUS.md,
                            backgroundColor:
                              i === 0
                                ? "rgba(245, 158, 11, 0.08)"
                                : "transparent",
                            border:
                              i === 0
                                ? `1px solid rgba(245, 158, 11, 0.3)`
                                : "1px solid transparent",
                          }}
                        >
                          <div
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              backgroundColor: rankBg,
                              color: rankColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "800",
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </div>
                          <img
                            src={
                              p.imageUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=102a43&color=fff&size=50`
                            }
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: i === 0 ? "38px" : "32px",
                              height: i === 0 ? "38px" : "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border:
                                i === 0
                                  ? `2px solid ${C.amber}`
                                  : `1px solid ${C.gray200}`,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: i === 0 ? "0.9rem" : "0.8125rem",
                                fontWeight: i === 0 ? "800" : "600",
                                color: C.navy900,
                              }}
                            >
                              {p.name}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                color: C.green,
                              }}
                            >
                              {p.goals} goles
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 2. ASISTENCIAS */}
            <div style={{ flex: "0 0 100%", width: "100%" }}>
              <div
                style={{
                  backgroundColor: C.white,
                  borderRadius: RADIUS.lg,
                  padding: "1.25rem",
                  color: C.navy900,
                  boxShadow: SHADOWS.md,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    paddingBottom: "0.75rem",
                    borderBottom: `1px dashed ${C.gray200}`,
                  }}
                >
                  <div
                    style={{
                      padding: "0.4rem",
                      backgroundColor: "rgba(56, 189, 248, 0.1)",
                      color: C.blueAccent,
                      borderRadius: RADIUS.md,
                    }}
                  >
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: "800",
                        color: C.navy900,
                        lineHeight: "1.2",
                      }}
                    >
                      El Maestro
                    </h3>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: C.gray500,
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      Más Asistencias
                    </span>
                  </div>
                </div>
                {topAssists.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: C.gray400,
                      margin: 0,
                      fontStyle: "italic",
                      flex: 1,
                      textAlign: "center",
                      paddingTop: "1rem",
                    }}
                  >
                    Aún no hay asistencias.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      flex: 1,
                    }}
                  >
                    {topAssists.map((p: any, i: number) => {
                      const rankBg =
                        i === 0
                          ? "#FEF08A"
                          : i === 1
                            ? "#E2E8F0"
                            : i === 2
                              ? "#FED7AA"
                              : "#F1F5F9";
                      const rankColor =
                        i === 0
                          ? "#B45309"
                          : i === 1
                            ? "#475569"
                            : i === 2
                              ? "#9A3412"
                              : "#64748B";
                      return (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.5rem",
                            borderRadius: RADIUS.md,
                            backgroundColor:
                              i === 0
                                ? "rgba(56, 189, 248, 0.08)"
                                : "transparent",
                            border:
                              i === 0
                                ? `1px solid rgba(56, 189, 248, 0.3)`
                                : "1px solid transparent",
                          }}
                        >
                          <div
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              backgroundColor: rankBg,
                              color: rankColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "800",
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </div>
                          <img
                            src={
                              p.imageUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=102a43&color=fff&size=50`
                            }
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: i === 0 ? "38px" : "32px",
                              height: i === 0 ? "38px" : "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border:
                                i === 0
                                  ? `2px solid ${C.blueAccent}`
                                  : `1px solid ${C.gray200}`,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: i === 0 ? "0.9rem" : "0.8125rem",
                                fontWeight: i === 0 ? "800" : "600",
                                color: C.navy900,
                              }}
                            >
                              {p.name}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                color: C.blueAccent,
                              }}
                            >
                              {p.assists} asistencias
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. MVPs */}
            <div style={{ flex: "0 0 100%", width: "100%" }}>
              <div
                style={{
                  backgroundColor: C.white,
                  borderRadius: RADIUS.lg,
                  padding: "1.25rem",
                  color: C.navy900,
                  boxShadow: SHADOWS.md,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    paddingBottom: "0.75rem",
                    borderBottom: `1px dashed ${C.gray200}`,
                  }}
                >
                  <div
                    style={{
                      padding: "0.4rem",
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                      color: C.amber,
                      borderRadius: RADIUS.md,
                    }}
                  >
                    <Award size={18} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: "800",
                        color: C.navy900,
                        lineHeight: "1.2",
                      }}
                    >
                      El Galáctico
                    </h3>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: C.gray500,
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      Premios MVP
                    </span>
                  </div>
                </div>
                {topMVPs.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: C.gray400,
                      margin: 0,
                      fontStyle: "italic",
                      flex: 1,
                      textAlign: "center",
                      paddingTop: "1rem",
                    }}
                  >
                    Aún no hay MVPs.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      flex: 1,
                    }}
                  >
                    {topMVPs.map((p: any, i: number) => {
                      const rankBg =
                        i === 0
                          ? "#FEF08A"
                          : i === 1
                            ? "#E2E8F0"
                            : i === 2
                              ? "#FED7AA"
                              : "#F1F5F9";
                      const rankColor =
                        i === 0
                          ? "#B45309"
                          : i === 1
                            ? "#475569"
                            : i === 2
                              ? "#9A3412"
                              : "#64748B";
                      return (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.5rem",
                            borderRadius: RADIUS.md,
                            backgroundColor:
                              i === 0
                                ? "rgba(245, 158, 11, 0.08)"
                                : "transparent",
                            border:
                              i === 0
                                ? `1px solid rgba(245, 158, 11, 0.3)`
                                : "1px solid transparent",
                          }}
                        >
                          <div
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              backgroundColor: rankBg,
                              color: rankColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "800",
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </div>
                          <img
                            src={
                              p.imageUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=102a43&color=fff&size=50`
                            }
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: i === 0 ? "38px" : "32px",
                              height: i === 0 ? "38px" : "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border:
                                i === 0
                                  ? `2px solid ${C.amber}`
                                  : `1px solid ${C.gray200}`,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: i === 0 ? "0.9rem" : "0.8125rem",
                                fontWeight: i === 0 ? "800" : "600",
                                color: C.navy900,
                              }}
                            >
                              {p.name}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                color: C.amber,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.2rem",
                              }}
                            >
                              <Star size={10} fill={C.amber} /> {p.mvps} MVPs
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 4. JUGADOR DE HIERRO */}
            <div style={{ flex: "0 0 100%", width: "100%" }}>
              <div
                style={{
                  backgroundColor: C.white,
                  borderRadius: RADIUS.lg,
                  padding: "1.25rem",
                  color: C.navy900,
                  boxShadow: SHADOWS.md,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    paddingBottom: "0.75rem",
                    borderBottom: `1px dashed ${C.gray200}`,
                  }}
                >
                  <div
                    style={{
                      padding: "0.4rem",
                      backgroundColor: "rgba(100, 116, 139, 0.1)",
                      color: C.navy500,
                      borderRadius: RADIUS.md,
                    }}
                  >
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: "800",
                        color: C.navy900,
                        lineHeight: "1.2",
                      }}
                    >
                      El de Hierro
                    </h3>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: C.gray500,
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      Más Presencias
                    </span>
                  </div>
                </div>
                {topIronMen.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: C.gray400,
                      margin: 0,
                      fontStyle: "italic",
                      flex: 1,
                      textAlign: "center",
                      paddingTop: "1rem",
                    }}
                  >
                    Aún no hay eventos.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      flex: 1,
                    }}
                  >
                    {topIronMen.map((p: any, i: number) => {
                      const rankBg =
                        i === 0
                          ? "#FEF08A"
                          : i === 1
                            ? "#E2E8F0"
                            : i === 2
                              ? "#FED7AA"
                              : "#F1F5F9";
                      const rankColor =
                        i === 0
                          ? "#B45309"
                          : i === 1
                            ? "#475569"
                            : i === 2
                              ? "#9A3412"
                              : "#64748B";
                      return (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.5rem",
                            borderRadius: RADIUS.md,
                            backgroundColor:
                              i === 0
                                ? "rgba(100, 116, 139, 0.08)"
                                : "transparent",
                            border:
                              i === 0
                                ? `1px solid rgba(100, 116, 139, 0.3)`
                                : "1px solid transparent",
                          }}
                        >
                          <div
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              backgroundColor: rankBg,
                              color: rankColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "800",
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </div>
                          <img
                            src={
                              p.imageUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=102a43&color=fff&size=50`
                            }
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: i === 0 ? "38px" : "32px",
                              height: i === 0 ? "38px" : "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border:
                                i === 0
                                  ? `2px solid ${C.navy500}`
                                  : `1px solid ${C.gray200}`,
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: i === 0 ? "0.9rem" : "0.8125rem",
                                fontWeight: i === 0 ? "800" : "600",
                                color: C.navy900,
                              }}
                            >
                              {p.name}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                color: C.navy500,
                              }}
                            >
                              {p.totalAttendance} presencias
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PUNTITOS INDICADORES DE NAVEGACIÓN */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.4rem",
            marginTop: "1rem",
          }}
        >
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              onClick={() => setHofIndex(idx)}
              style={{
                width: hofIndex === idx ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                backgroundColor:
                  hofIndex === idx ? C.amber : "rgba(255,255,255,0.3)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      {/* ADMIN GALERÍA (Subida Manual) */}
      {perms.canEditPortada && (
        <SectionCard
          title="Administrar Galería Manual"
          icon={<Camera size={16} color={C.navy600} />}
          style={{
            border: `2px dashed ${C.navy200}`,
            backgroundColor: C.navy50,
          }}
        >
          <form
            onSubmit={handleAddGalleryItem}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <FormInput
              type="url"
              required
              value={galleryUrl}
              onChange={(e) => setGalleryUrl(e.target.value)}
              placeholder="Link de la foto"
            />
            <FormInput
              type="text"
              required
              value={galleryCaption}
              onChange={(e) => setGalleryCaption(e.target.value)}
              placeholder="Leyenda"
            />
            <PrimaryButton type="submit">Agregar Foto Manual</PrimaryButton>
          </form>

          {/* Mini-grid para borrar fotos manuales */}
          {gallery && gallery.length > 0 && (
            <div
              style={{
                marginTop: "1.25rem",
                borderTop: `1px solid ${C.gray200}`,
                paddingTop: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: C.gray600,
                  margin: "0 0 0.5rem 0",
                }}
              >
                Tus fotos subidas manualmente:
              </p>
              <div
                className="hide-scroll"
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  overflowX: "auto",
                  paddingBottom: "0.5rem",
                }}
              >
                {gallery
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime(),
                  )
                  .map((g: any) => (
                    <div
                      key={g.id}
                      style={{
                        position: "relative",
                        width: "60px",
                        height: "60px",
                        flexShrink: 0,
                        borderRadius: RADIUS.sm,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={g.url}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        onClick={() => handleDelete("gallery", g.id)}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "rgba(255,255,255,0.9)",
                          color: C.red,
                          border: "none",
                          padding: "2px",
                          cursor: "pointer",
                          borderBottomLeftRadius: RADIUS.sm,
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* GALERÍA GLOBAL (OPCIÓN 1: ÁLBUMES HIGHLIGHTS) */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "800",
              color: C.navy900,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              margin: 0,
            }}
          >
            <Images size={20} color={C.navy600} /> Álbumes del Equipo
          </h3>
          {groupedAlbums.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => scrollAlbums("left")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: `1px solid ${C.gray200}`,
                  backgroundColor: C.white,
                  cursor: "pointer",
                  color: C.navy700,
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollAlbums("right")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: `1px solid ${C.gray200}`,
                  backgroundColor: C.white,
                  cursor: "pointer",
                  color: C.navy700,
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {groupedAlbums.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: C.gray400,
              fontStyle: "italic",
              padding: "2rem 0",
            }}
          >
            Aún no hay álbumes registrados.
          </p>
        ) : (
          <div
            ref={albumsRef}
            className="hide-scroll"
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "1rem",
              paddingBottom: "1rem",
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
            }}
          >
            {groupedAlbums.map((album) => (
              <div
                key={album.id}
                onClick={() =>
                  setLightboxData({
                    urls: album.photos.map((p: any) => p.url),
                    initialIndex: 0,
                    caption: album.title,
                  })
                }
                style={{
                  flex: "0 0 auto",
                  width: "220px",
                  height: "300px",
                  borderRadius: RADIUS.lg,
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: SHADOWS.md,
                  scrollSnapAlign: "start",
                  border: `1px solid ${C.gray200}`,
                }}
              >
                {/* Portada del Álbum */}
                <img
                  src={album.photos[0].url}
                  alt={album.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                />

                {/* Gradiente Oscuro */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(10,25,41,0.95) 0%, rgba(10,25,41,0) 60%)",
                  }}
                />

                {/* Badge de Cantidad de Fotos */}
                <div
                  style={{
                    position: "absolute",
                    top: "0.75rem",
                    right: "0.75rem",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    color: C.white,
                    padding: "0.3rem 0.6rem",
                    borderRadius: RADIUS.full,
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <Images size={14} /> {album.photos.length}
                </div>

                {/* Títulos y Fecha */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    left: "1rem",
                    right: "1rem",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 0.3rem 0",
                      color: C.white,
                      fontSize: "1rem",
                      fontWeight: "800",
                      lineHeight: "1.2",
                      textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {album.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      color: C.gray300,
                      fontSize: "0.75rem",
                      fontWeight: "600",
                    }}
                  >
                    {album.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
