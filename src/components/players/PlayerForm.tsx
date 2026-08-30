import React, { useState } from "react";
import { Users, UploadCloud, Camera } from "lucide-react";
import {
  SectionCard,
  FormInput,
  FormSelect,
  PrimaryButton,
  SecondaryButton,
  RADIUS,
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

// Si tu proyecto ya exporta una constante de colores `C`, importa esa en su lugar.
const C = {
  navy900: "#1e3a8a",
  gray500: "#6b7280",
  gray300: "#d1d5db",
  green: "#10b981",
  amber: "#f59e0b",
  gray200: "#e5e7eb",
  gray50: "#f9fafb",
  white: "#ffffff",
  red: "#ef4444",
};

interface PlayerFormProps {
  isPressOnly: boolean;
  editingPlayerId: string | null;
  playerName: string;
  setPlayerName: (val: string) => void;
  playerNumber: string;
  setPlayerNumber: (val: string) => void;
  playerPosition: string;
  setPlayerPosition: (val: string) => void;
  playerVariant: string;
  setPlayerVariant: (val: string) => void;
  playerBirthDate: string;
  setPlayerBirthDate: (val: string) => void;
  playerImageUrl: string;
  setPlayerImageUrl: (val: string) => void;
  isDT: boolean;
  setIsDT: (val: boolean) => void;
  playerActive: boolean;
  setPlayerActive: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function PlayerForm({
  isPressOnly,
  editingPlayerId,
  playerName,
  setPlayerName,
  playerNumber,
  setPlayerNumber,
  playerPosition,
  setPlayerPosition,
  playerVariant,
  setPlayerVariant,
  playerBirthDate,
  setPlayerBirthDate,
  playerImageUrl,
  setPlayerImageUrl,
  isDT,
  setIsDT,
  playerActive,
  setPlayerActive,
  onSubmit,
  onCancel,
}: PlayerFormProps) {
  const title = editingPlayerId
    ? isPressOnly
      ? "Actualizar Foto del Jugador"
      : "Editar Jugador"
    : "Fichar Jugador";

  // 👇 ESTADOS PARA SUBIDA EN LA SECCIÓN PRINCIPAL 👇
  const [isUploading, setIsUploading] = useState(false);
  const [newlyUploadedPhotos, setNewlyUploadedPhotos] = useState<string[]>([]);

  // 👇 FUNCIÓN MAGIA: Comprime, Sube a Firebase y guarda el Link 👇
  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    try {
      setIsUploading(true);

      // Opciones para foto de perfil: Más pequeña y ultra ligera (Máximo 100 KB y 800px)
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        initialQuality: 0.8,
      };

      const compressedFile = await imageCompression(file, options);
      const storage = getStorage();
      const fileRef = ref(
        storage,
        `players/profile_${Date.now()}_${compressedFile.name}`,
      );

      await uploadBytes(fileRef, compressedFile);
      const url = await getDownloadURL(fileRef);

      // Rastreamos la foto subida en caso de que el usuario decida darle a "Cancelar"
      setNewlyUploadedPhotos((prev) => [...prev, url]);
      setPlayerImageUrl(url); // Actualizamos el estado que se irá a la BD
    } catch (error) {
      console.error("Error subiendo foto:", error);
      alert("Error al subir la imagen. Verifica tu conexión.");
    } finally {
      setIsUploading(false);
    }
  };

  // 👇 SOBREESCRIBIMOS EL CANCELAR PARA LIMPIAR BASURA 👇
  const handleCancelWithCleanup = async () => {
    if (newlyUploadedPhotos.length > 0) {
      const storage = getStorage();
      for (const url of newlyUploadedPhotos) {
        try {
          await deleteObject(ref(storage, url));
          console.log("Foto temporal del jugador eliminada");
        } catch (e) {
          console.error("Error limpiando foto temporal", e);
        }
      }
    }
    setNewlyUploadedPhotos([]);
    onCancel(); // Llamamos a la función original que viene de `Players.tsx`
  };

  // 👇 SOBREESCRIBIMOS EL SUBMIT PARA LIMPIAR LAS FOTOS "INTENTADAS" Y BORRAR LA VIEJA 👇
  const handleSubmitWithCleanup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si subió fotos y se quedó con la última, las anteriores de esta misma sesión son basura
    const orphanedPhotos = newlyUploadedPhotos.filter(
      (url) => url !== playerImageUrl,
    );

    // Además, si el jugador ya tenía una foto vieja (firebasestorage) y subió una nueva,
    // debemos borrar la vieja para no llenar la nube de basura (si te parece bien).
    // Nota: Esta parte se ejecuta asíncronamente para no retrasar la experiencia del usuario.
    const cleanUpTask = async () => {
      const storage = getStorage();
      for (const url of orphanedPhotos) {
        try {
          await deleteObject(ref(storage, url));
        } catch (err) {}
      }
    };
    cleanUpTask();

    // Dejamos que `Players.tsx` guarde los datos en la base de datos
    onSubmit(e);
    setNewlyUploadedPhotos([]); // Limpiamos para el próximo fichaje
  };

  return (
    <SectionCard title={title} icon={<Users size={16} />}>
      <form
        onSubmit={handleSubmitWithCleanup}
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <FormInput
            required
            disabled={isPressOnly}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Nombre completo"
            style={{ flex: 2 }}
          />
          <FormInput
            type="number"
            required
            disabled={isPressOnly}
            value={playerNumber}
            onChange={(e) => setPlayerNumber(e.target.value)}
            placeholder="Dorsal"
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <FormSelect
            disabled={isPressOnly}
            value={playerPosition}
            onChange={(e) => setPlayerPosition(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="Portero">Portero</option>
            <option value="Defensa">Defensa</option>
            <option value="Medio">Medio</option>
            <option value="Delantero">Delantero</option>
          </FormSelect>
          <FormInput
            disabled={isPressOnly}
            value={playerVariant}
            onChange={(e) => setPlayerVariant(e.target.value)}
            placeholder="Variante (Ej. Central)"
            style={{ flex: 1 }}
          />
        </div>

        <FormInput
          type="date"
          disabled={isPressOnly}
          value={playerBirthDate}
          onChange={(e) => setPlayerBirthDate(e.target.value)}
          placeholder="Fecha de nacimiento (opcional)"
        />

        {/* 👇 NUEVA SECCIÓN DE FOTO DE PERFIL 👇 */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            backgroundColor: C.white,
            padding: "0.5rem",
            borderRadius: RADIUS.md,
            border: `1px solid ${C.gray200}`,
            marginTop: "0.2rem",
          }}
        >
          {/* Vista previa miniatura */}
          <div
            style={{
              position: "relative",
              width: "42px",
              height: "42px",
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
            <Camera size={18} style={{ position: "absolute", zIndex: 0 }} />
            {playerImageUrl && (
              <img
                src={playerImageUrl}
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

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            <input
              type="url"
              value={playerImageUrl}
              onChange={(e) => setPlayerImageUrl(e.target.value)}
              placeholder="Link de foto de perfil (Opcional)"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "0.8125rem",
                color: C.navy900,
                backgroundColor: "transparent",
              }}
            />

            {/* Botón Mágico Subir desde Dispositivo */}
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
              {isUploading ? "Procesando foto..." : "Subir desde dispositivo"}
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePhotoUpload(e.target.files[0]);
                  }
                }}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        {/* CONTENEDOR DE CHECKBOXES (DT Y ACTIVO) */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "0.25rem",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: C.navy900,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              disabled={isPressOnly}
              checked={isDT}
              onChange={(e) => setIsDT(e.target.checked)}
              style={{ width: "1rem", height: "1rem", cursor: "pointer" }}
            />
            DT
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: playerActive ? C.navy900 : C.gray500,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              disabled={isPressOnly}
              checked={playerActive}
              onChange={(e) => setPlayerActive(e.target.checked)}
              style={{
                accentColor: C.green,
                width: "1rem",
                height: "1rem",
                cursor: "pointer",
              }}
            />
            Activo
          </label>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
          <PrimaryButton
            type="submit"
            style={{ flex: 1, opacity: isUploading ? 0.7 : 1 }}
            disabled={isUploading}
          >
            {isUploading
              ? "Cargando..."
              : editingPlayerId
                ? "Guardar Cambios"
                : "Agregar"}
          </PrimaryButton>
          {editingPlayerId && (
            <SecondaryButton
              type="button"
              onClick={handleCancelWithCleanup}
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
