/**
 * Valores por defecto del club.
 *
 * Se usan únicamente como respaldo mientras no exista (o no cargue) el
 * documento `settings/club_info` en Firestore. Una vez que un administrador
 * edita la información del club desde la interfaz, estos valores dejan de
 * mostrarse.
 *
 * Para personalizar la plantilla, cambia estos valores o simplemente edita
 * la información del club desde la app.
 */
export const DEFAULT_CLUB_NAME = "Mi Club FC";
export const DEFAULT_CLUB_SHORT_NAME = "Mi Club";
export const DEFAULT_CLUB_DESCRIPTION =
  "Club conformado por auténticos amantes del fútbol. Más que un equipo, una familia en la cancha.";
export const DEFAULT_CLUB_LOCATION = "Ciudad, País";

/** Escudo genérico. Reemplázalo subiendo un logo desde la app o cambiando `public/icon.svg`. */
export const DEFAULT_CLUB_LOGO = "/icon.svg";

/** Imagen de portada genérica (Unsplash). */
export const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
