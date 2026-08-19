import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Images, X, Plus, Camera, Trash2, ChevronUp } from "lucide-react";
import {
  C,
  RADIUS,
  SHADOWS,
  Badge,
  FormInput,
  PrimaryButton,
  SecondaryButton,
} from "../../components/ui";

interface AlbumModalProps {
  ev: any;
  onClose: () => void;
  onSave: (cleanUrls: string[]) => void;
}

export default function AlbumModal({ ev, onClose, onSave }: AlbumModalProps) {
  const [albumUrls, setAlbumUrls] = useState<string[]>([]);

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

  const handleSave = () => {
    const cleanUrls = albumUrls
      .map((url) => url.trim())
      .filter((url) => url !== "");
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
      onClick={onClose}
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
            onClick={onClose}
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
          Pega los links de las imágenes (Imgur, Postimages). La primera imagen
          será la foto de portada.
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
              <div
                style={{
                  width: "44px",
                  height: "44px",
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
                  />
                ) : (
                  <Camera size={20} color={C.gray400} />
                )}
              </div>
              <FormInput
                value={url}
                onChange={(e) => {
                  const n = [...albumUrls];
                  n[i] = e.target.value;
                  setAlbumUrls(n);
                }}
                placeholder="https://ejemplo.com/foto.jpg"
                style={{ flex: 1, fontSize: "0.8125rem" }}
              />
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

        <PrimaryButton onClick={handleSave} style={{ width: "100%" }}>
          Guardar Álbum
        </PrimaryButton>
      </div>
    </div>,
    document.body,
  );
}
