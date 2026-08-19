import React, { useState, useMemo, useRef } from "react";
import {
  Camera,
  Trash2,
  Images,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../hooks/useClubData";
import {
  C,
  RADIUS,
  SHADOWS,
  SectionCard,
  FormInput,
  PrimaryButton,
} from "../ui";
import { formatFriendlyDate } from "../../utils/helpers";

interface GallerySectionProps {
  gallery: any[];
  events: any[];
  perms: any;
  setLightboxData: (data: any) => void;
}

export default function GallerySection({
  gallery,
  events,
  perms,
  setLightboxData,
}: GallerySectionProps) {
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");
  const albumsRef = useRef<HTMLDivElement>(null);

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

  const scrollAlbums = (direction: "left" | "right") => {
    if (albumsRef.current) {
      albumsRef.current.scrollBy({
        left: direction === "left" ? -240 : 240,
        behavior: "smooth",
      });
    }
  };

  // ── LÓGICA DE ÁLBUMES TIPO HIGHLIGHTS ──
  const groupedAlbums = useMemo(() => {
    const albums: any[] = [];

    // 1. PRIMERO: Fotos de Eventos (Agenda) - ¡Ahora están al inicio!
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

    // 2. AL FINAL: Fotos manuales subidas por el admin (Álbum General)
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

    return albums;
  }, [gallery, events]);

  return (
    <div>
      {/* ADMIN GALERÍA (Subida Manual) */}
      {perms.canEditPortada && (
        <SectionCard
          title="Administrar Galería Manual"
          icon={<Camera size={16} color={C.navy600} />}
          style={{
            border: `2px dashed ${C.navy200}`,
            backgroundColor: C.navy50,
            marginBottom: "2rem",
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

      {/* GALERÍA GLOBAL (ÁLBUMES HIGHLIGHTS) */}
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
    </div>
  );
}
