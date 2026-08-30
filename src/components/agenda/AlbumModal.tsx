import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Images,
  X,
  Plus,
  Camera,
  Trash2,
  ChevronUp,
  UploadCloud,
} from "lucide-react";
import {
  C,
  RADIUS,
  SHADOWS,
  Badge,
  FormInput,
  PrimaryButton,
  SecondaryButton,
} from "../../components/ui";

// 👇 IMPORTACIONES DE STORAGE Y COMPRESIÓN 👇
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import imageCompression from "browser-image-compression";

interface AlbumModalProps {
  ev: any;
  onClose: () => void;
  onSave: (cleanUrls: string[]) => void;
}

export default function AlbumModal({ ev, onClose, onSave }: AlbumModalProps) {
  const [albumUrls, setAlbumUrls] = useState<string[]>([]);

  // 👇 ESTADOS PARA SUBIDA Y BASURA 👇
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [newlyUploadedPhotos, setNewlyUploadedPhotos] = useState<string[]>([]);

  // Inicializar estado cuando se abre el modal
  useEffect(() => {
    if (ev) {
      const initialUrls =
        ev.photoUrls && ev.photoUrls.length > 0
          ? ev.photoUrls
          : ev.photoUrl
            ? [ev.photoUrl]
            : [];
      setAlbumUrls(initialUrls.length > 0 ? initialUrls : [""]);
      setNewlyUploadedPhotos([]); // Reiniciamos el rastreador al abrir
    }
  }, [ev]);

  const movePhotoUp = (index: number) => {
    if (index === 0) return;
    const newUrls = [...albumUrls];
    const temp = newUrls[index - 1];
    newUrls[index - 1] = newUrls[index];
    newUrls[index] = temp;
    setAlbumUrls(newUrls);
  };

  // 👇 NUEVA FUNCIÓN: Subir foto comprimida al Storage 👇
  const handleFileUpload = async (index: number, file: File) => {
    if (!file) return;
    try {
      setUploadingIndex(index);

      const options = {
        maxSizeMB: 0.2, // 200 KB máximo
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        initialQuality: 0.8,
      };

      const compressedFile = await imageCompression(file, options);
      const storage = getStorage();
      const fileRef = ref(
        storage,
        `events/album_${Date.now()}_${compressedFile.name}`,
      );

      await uploadBytes(fileRef, compressedFile);
      const url = await getDownloadURL(fileRef);

      setNewlyUploadedPhotos((prev) => [...prev, url]);

      const newUrls = [...albumUrls];
      newUrls[index] = url;
      setAlbumUrls(newUrls);
    } catch (error) {
      console.error("Error subiendo foto:", error);
      alert("Error al subir la imagen. Verifica tu conexión.");
    } finally {
      setUploadingIndex(null);
    }
  };

  // 👇 LIMPIEZA AL CANCELAR 👇
  const handleCloseWithCleanup = async () => {
    if (newlyUploadedPhotos.length > 0) {
      const storage = getStorage();
      for (const url of newlyUploadedPhotos) {
        try {
          await deleteObject(ref(storage, url));
          console.log("Foto cancelada eliminada:", url);
        } catch (e) {
          console.error("Error borrando foto cancelada", e);
        }
      }
    }
    setNewlyUploadedPhotos([]);
    onClose();
  };

  // 👇 LIMPIEZA AL GUARDAR 👇
  const handleSaveWithCleanup = async () => {
    const cleanUrls = albumUrls
      .map((url) => url.trim())
      .filter((url) => url !== "");

    const storage = getStorage();

    // 1. Borrar fotos nuevas que subió y luego quitó antes de guardar
    const orphanedNew = newlyUploadedPhotos.filter(
      (url) => !cleanUrls.includes(url),
    );

    // 2. Borrar fotos viejas que estaban en la base de datos y decidió quitar del álbum
    const oldUrls =
      ev.photoUrls && ev.photoUrls.length > 0
        ? ev.photoUrls
        : ev.photoUrl
          ? [ev.photoUrl]
          : [];

    const orphanedOld = oldUrls.filter(
      (oldUrl: string) =>
        !cleanUrls.includes(oldUrl) &&
        oldUrl.includes("firebasestorage.googleapis.com"),
    );

    // Unimos toda la basura y la destruimos en Storage
    const urlsToDelete = [...orphanedNew, ...orphanedOld];
    for (const url of urlsToDelete) {
      try {
        await deleteObject(ref(storage, url));
        console.log("Foto eliminada definitivamente del servidor:", url);
      } catch (error) {
        console.error("Error limpiando foto", error);
      }
    }

    setNewlyUploadedPhotos([]);
    onSave(cleanUrls);
  };

  if (!ev) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 25, 41, 0.90)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
      }}
      onClick={handleCloseWithCleanup} // 👈 Click fuera limpia
    >
      <div
        style={{
          backgroundColor: C.white,
          borderRadius: RADIUS.xl,
          padding: "2rem",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: SHADOWS.xl,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "700",
              color: C.navy900,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Images size={20} color={C.blueAccent} /> Álbum del Evento
          </h3>
          <button
            onClick={handleCloseWithCleanup} // 👈 Botón X limpia
            style={{
              background: "none",
              border: "none",
              color: C.gray400,
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p
          style={{
            fontSize: "0.8125rem",
            color: C.gray500,
            marginBottom: "1.5rem",
          }}
        >
          Sube imágenes directo de tu dispositivo o pega los links. La primera
          imagen será la foto de portada.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {albumUrls.map((url, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                padding: "0.5rem",
                backgroundColor: C.gray50,
                borderRadius: RADIUS.md,
                border: `1px solid ${i === 0 ? C.amber : C.gray200}`,
                position: "relative",
              }}
            >
              {i === 0 && (
                <Badge
                  color="amber"
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: "10px",
                    fontSize: "0.65rem",
                    padding: "2px 6px",
                    boxShadow: SHADOWS.sm,
                  }}
                >
                  Portada
                </Badge>
              )}

              {/* Miniatura inteligente */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: RADIUS.sm,
                  backgroundColor: C.gray200,
                  overflow: "hidden",
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {url.trim() ? (
                  <img
                    src={url}
                    alt={`Preview ${i}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    onLoad={(e) => (e.currentTarget.style.display = "block")}
                  />
                ) : (
                  <Camera size={20} color={C.gray400} />
                )}
              </div>

              {/* Contenedor del Input y Botón de Subida */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                }}
              >
                <FormInput
                  value={url}
                  onChange={(e) => {
                    const n = [...albumUrls];
                    n[i] = e.target.value;
                    setAlbumUrls(n);
                  }}
                  placeholder="https://ejemplo.com/foto.jpg"
                  style={{
                    flex: 1,
                    fontSize: "0.8125rem",
                    border: "none",
                    background: "transparent",
                    padding: "0.2rem 0",
                  }}
                />

                {/* 👇 BOTÓN PARA SUBIR DESDE DISPOSITIVO 👇 */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    color: C.amber,
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    width: "fit-content",
                  }}
                >
                  <UploadCloud size={14} />
                  {uploadingIndex === i
                    ? "Subiendo..."
                    : "Subir desde dispositivo"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingIndex !== null}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(i, e.target.files[0]);
                      }
                    }}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Botones de acción (Mover y Borrar) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                }}
              >
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => movePhotoUp(i)}
                    style={{
                      color: C.gray500,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px",
                    }}
                    title="Mover arriba"
                  >
                    <ChevronUp size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const n = [...albumUrls];
                    n.splice(i, 1);
                    setAlbumUrls(n);
                  }}
                  style={{
                    color: C.red,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px",
                  }}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <SecondaryButton
            type="button"
            onClick={() => setAlbumUrls([...albumUrls, ""])}
            style={{
              width: "100%",
              marginTop: "0.5rem",
              borderStyle: "dashed",
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <Plus size={16} /> Añadir otra foto
          </SecondaryButton>
        </div>

        <PrimaryButton
          onClick={handleSaveWithCleanup}
          style={{ width: "100%", opacity: uploadingIndex !== null ? 0.7 : 1 }}
          disabled={uploadingIndex !== null}
        >
          {uploadingIndex !== null ? "Procesando imágenes..." : "Guardar Álbum"}
        </PrimaryButton>
      </div>
    </div>,
    document.body,
  );
}
