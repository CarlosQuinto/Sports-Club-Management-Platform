import React, { useState, useEffect, useRef } from "react";
import { Edit, MapPin, Users, Plus, Trash2, Camera } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../hooks/useClubData";
import {
  C,
  RADIUS,
  SHADOWS,
  FormInput,
  FormTextarea,
  PrimaryButton,
  SecondaryButton,
} from "../ui";

interface HeroSectionProps {
  clubInfo: any;
  players: any[];
  perms: any;
  setLightboxData: (data: any) => void;
}

export default function HeroSection({
  clubInfo,
  players,
  perms,
  setLightboxData,
}: HeroSectionProps) {
  const [isEditingClubInfo, setIsEditingClubInfo] = useState(false);
  const [editClubName, setEditClubName] = useState(clubInfo.name || "");
  const [editClubDesc, setEditClubDesc] = useState(clubInfo.description || "");

  // 👇 MEJORA 2: Ubicación dinámica (con fallback a Guaymas por defecto)
  const [editLocation, setEditLocation] = useState(
    clubInfo.location || "Guaymas, Sonora",
  );

  // 👇 MEJORA 1: Arreglo dinámico en lugar de un texto gigante
  const [editHeroImages, setEditHeroImages] = useState<string[]>(
    clubInfo.heroImages?.length > 0 ? clubInfo.heroImages : [""],
  );

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const heroTouchStartX = useRef<number | null>(null);
  const heroTouchEndX = useRef<number | null>(null);

  const activePlayersCount = players
    ? players.filter((p: any) => p.active !== false).length
    : 0;

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

  // ── GESTIÓN DE LA LISTA DE IMÁGENES ──
  const handleUpdateImage = (index: number, value: string) => {
    const newImages = [...editHeroImages];
    newImages[index] = value;
    setEditHeroImages(newImages);
  };

  const handleAddImageField = () => {
    setEditHeroImages([...editHeroImages, ""]);
  };

  const handleRemoveImageField = (index: number) => {
    setEditHeroImages(editHeroImages.filter((_, i) => i !== index));
  };

  const handleSaveClubInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filtramos los inputs vacíos
    const validImages = editHeroImages
      .map((url) => url.trim())
      .filter((url) => url !== "");

    await setDoc(
      doc(db, "settings", "club_info"),
      {
        ...clubInfo,
        name: editClubName.trim(),
        description: editClubDesc.trim(),
        location: editLocation.trim(), // Guardamos la ubicación
        heroImages:
          validImages.length > 0
            ? validImages
            : [
                "https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              ],
      },
      { merge: true },
    );
    setCurrentHeroIndex(0);
    setIsEditingClubInfo(false);
  };

  return (
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
            setEditClubName(clubInfo.name || "");
            setEditClubDesc(clubInfo.description || "");
            setEditLocation(clubInfo.location || "Guaymas, Sonora");
            setEditHeroImages(
              clubInfo.heroImages?.length > 0 ? clubInfo.heroImages : [""],
            );
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: "700",
                  color: C.navy900,
                }}
              >
                Nombre del Club
              </label>
              <FormInput
                type="text"
                required
                value={editClubName}
                onChange={(e) => setEditClubName(e.target.value)}
                placeholder="Joga Bonito FC"
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: "700",
                  color: C.navy900,
                }}
              >
                Sede o Ciudad
              </label>
              <FormInput
                type="text"
                required
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Ej. Guaymas, Sonora"
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: "700",
                  color: C.navy900,
                }}
              >
                Descripción (Lema o historia breve)
              </label>
              <FormTextarea
                required
                value={editClubDesc}
                onChange={(e) => setEditClubDesc(e.target.value)}
                placeholder="Descripción breve"
                rows={2}
              />
            </div>

            {/* 👇 MEJORA 1: Listado dinámico de fotos tipo Galería 👇 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: "700",
                  color: C.navy900,
                }}
              >
                Imágenes del Carrusel
              </label>

              {editHeroImages.map((url, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    backgroundColor: C.white,
                    padding: "0.5rem",
                    borderRadius: RADIUS.md,
                    border: `1px solid ${C.gray200}`,
                  }}
                >
                  {/* Vista previa miniatura inteligente */}
                  <div
                    style={{
                      position: "relative",
                      width: "36px",
                      height: "36px",
                      backgroundColor: C.gray50,
                      borderRadius: RADIUS.sm,
                      color: C.gray300,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                      border: `1px solid ${C.gray200}`,
                    }}
                  >
                    <Camera
                      size={16}
                      style={{ position: "absolute", zIndex: 0 }}
                    />
                    {url && (
                      <img
                        src={url}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          position: "relative",
                          zIndex: 1,
                          backgroundColor: C.white,
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        onLoad={(e) => {
                          e.currentTarget.style.display = "block";
                        }}
                      />
                    )}
                  </div>

                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUpdateImage(index, e.target.value)}
                    placeholder="Link de la imagen..."
                    required={index === 0} // La primera es obligatoria
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      fontSize: "0.8125rem",
                      color: C.navy900,
                      backgroundColor: "transparent",
                    }}
                  />

                  {editHeroImages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageField(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: C.red,
                        cursor: "pointer",
                        padding: "0.25rem",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddImageField}
                style={{
                  background: "none",
                  border: `1px dashed ${C.gray300}`,
                  borderRadius: RADIUS.md,
                  padding: "0.5rem",
                  color: C.gray600,
                  fontWeight: "600",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.4rem",
                  alignItems: "center",
                }}
              >
                <Plus size={14} /> Añadir imagen al carrusel
              </button>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <PrimaryButton type="submit" style={{ flex: 1 }}>
                Guardar Portada
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
          {/* CARRUSEL CON IMAGEN COMPLETA (contain) */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              backgroundColor: "black",
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
                  objectFit: "contain",
                  objectPosition: "center",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  opacity: idx === currentHeroIndex ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                }}
              />
            ))}

            {/* Degradado inferior */}
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

            {/* Indicadores */}
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
                onClick={(e) => e.stopPropagation()} // Para que no abra el modal si tocan cerca
              >
                {clubInfo.heroImages.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    // 👇 MEJORA 3: Puntitos clickables
                    onClick={(e) => {
                      e.stopPropagation(); // Evita abrir la imagen en grande
                      setCurrentHeroIndex(idx);
                    }}
                    style={{
                      width: "12px", // Un poco más grandes para que sean fáciles de tocar
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor:
                        idx === currentHeroIndex
                          ? C.white
                          : "rgba(255,255,255,0.4)",
                      transition: "background-color 0.3s ease",
                      cursor: "pointer", // Cursor de manita
                      boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Información del club */}
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
                <MapPin size={12} /> {clubInfo.location || "Guaymas, Sonora"}
              </span>

              {activePlayersCount > 0 && (
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
                  <Users size={12} /> {activePlayersCount} Activos
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
