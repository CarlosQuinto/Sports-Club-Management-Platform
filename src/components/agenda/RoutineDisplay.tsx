import React from "react";
import {
  Droplet,
  Clock,
  ListChecks,
  ExternalLink,
  Youtube,
} from "lucide-react";
import { C, RADIUS, SHADOWS } from "../../components/ui";

export default function RoutineDisplay({ routine }: { routine: any }) {
  if (!routine) return null;

  // 1. Compatibilidad vieja (Si guardaste un texto enorme antes)
  if (typeof routine === "string") {
    return (
      <div
        style={{
          backgroundColor: C.white,
          borderRadius: RADIUS.md,
          border: `1px solid ${C.gray200}`,
          padding: "1rem",
          marginTop: "1rem",
        }}
      >
        <p
          style={{
            margin: "0 0 0.5rem 0",
            fontWeight: "700",
            color: C.navy900,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.8125rem",
          }}
        >
          <ListChecks size={16} color={C.amber} /> Plan de Entrenamiento
        </p>
        <p
          style={{
            whiteSpace: "pre-wrap",
            color: C.gray600,
            fontSize: "0.8125rem",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {routine}
        </p>
      </div>
    );
  }

  // 2. Nuevo formato (Array de bloques interactivos)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginTop: "1rem",
      }}
    >
      {routine.map((block: any, idx: number) => {
        // Bloque de Hidratación
        if (block.type === "hydration") {
          return (
            <div
              key={block.id}
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "0.25rem 0",
              }}
            >
              <span
                style={{
                  backgroundColor: "#e0f2fe",
                  color: "#0284c7",
                  padding: "0.4rem 1rem",
                  borderRadius: RADIUS.full,
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  boxShadow: SHADOWS.sm,
                }}
              >
                <Droplet size={14} /> Pausa de Hidratación{" "}
                {block.duration ? `(${block.duration} min)` : ""}
              </span>
            </div>
          );
        }

        // Bloque de Fase / Ejercicios
        if (block.type === "phase") {
          const totalMins = block.exercises.reduce(
            (sum: number, ex: any) => sum + (Number(ex.duration) || 0),
            0,
          );
          return (
            <div
              key={block.id}
              style={{
                backgroundColor: C.white,
                borderRadius: RADIUS.md,
                border: `1px solid ${C.gray200}`,
                overflow: "hidden",
                boxShadow: SHADOWS.sm,
              }}
            >
              <div
                style={{
                  backgroundColor: C.navy50,
                  padding: "0.6rem 1rem",
                  borderBottom: `1px solid ${C.gray200}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    color: C.navy900,
                    fontSize: "0.875rem",
                  }}
                >
                  {block.title || `Fase ${idx + 1}`}
                </span>
                {totalMins > 0 && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: C.gray500,
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.2rem",
                    }}
                  >
                    <Clock size={12} /> {totalMins} min
                  </span>
                )}
              </div>

              <div
                style={{
                  padding: "0.75rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {block.exercises.length === 0 && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: C.gray400,
                      fontStyle: "italic",
                    }}
                  >
                    Sin ejercicios asignados.
                  </span>
                )}
                {block.exercises.map((ex: any) => {
                  // MAGIA: Detector de YouTube para incrustar video 🎥
                  const ytMatch = ex.link?.match(
                    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/,
                  );

                  return (
                    <div
                      key={ex.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                        borderBottom: `1px dashed ${C.gray100}`,
                        paddingBottom: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: C.navy800,
                            fontWeight: "500",
                            lineHeight: 1.4,
                          }}
                        >
                          <span
                            style={{
                              color: C.amber,
                              marginRight: "0.4rem",
                              fontWeight: "800",
                            }}
                          >
                            •
                          </span>
                          {ex.name}
                        </span>
                        {ex.duration && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: C.gray500,
                              backgroundColor: C.gray100,
                              padding: "0.1rem 0.4rem",
                              borderRadius: RADIUS.sm,
                              whiteSpace: "nowrap",
                              marginLeft: "0.5rem",
                            }}
                          >
                            {ex.duration} min
                          </span>
                        )}
                      </div>

                      {/* Si el enlace es de YouTube, renderiza el reproductor */}
                      {ytMatch ? (
                        <div
                          style={{
                            marginTop: "0.5rem",
                            borderRadius: RADIUS.sm,
                            overflow: "hidden",
                            border: `1px solid ${C.gray200}`,
                          }}
                        >
                          <iframe
                            width="100%"
                            height="180"
                            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : ex.link ? (
                        // Si es otro tipo de enlace (como fittoplay), muestra un botón bonito
                        <a
                          href={ex.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "0.7rem",
                            color: C.white,
                            backgroundColor: C.navy900,
                            padding: "0.35rem 0.75rem",
                            borderRadius: RADIUS.full,
                            textDecoration: "none",
                            fontWeight: "600",
                            alignSelf: "flex-start",
                            marginLeft: "1rem",
                            marginTop: "0.2rem",
                          }}
                        >
                          <ExternalLink size={12} /> Abrir Referencia
                        </a>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
