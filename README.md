# Sports-Club-Management-Platform

Plantilla de panel web para la gestión integral de clubes deportivos. La aplicación centraliza la información del club, la agenda deportiva, los jugadores, las finanzas, el inventario y la galería.

Está pensada como base reutilizable: el nombre, la descripción, la ubicación, el escudo y las imágenes de portada del club se administran desde la propia interfaz (rol de administración) y se guardan en Firestore, por lo que no es necesario tocar el código para adaptarla a un club concreto.

## Funcionalidades

- Página de inicio con información del club, próximos eventos, galería y reconocimientos.
- Agenda para crear y consultar partidos, entrenamientos y otros eventos.
- Gestión de jugadores, perfiles, estadísticas y logros.
- Registro de ingresos, gastos, aportaciones y resúmenes financieros.
- Control del inventario del club.
- Datos sincronizados en tiempo real mediante Cloud Firestore.
- Acceso por roles mediante PIN: administración, entrenador, prensa y tesorería.
- Interfaz responsive para escritorio y dispositivos móviles.

## Tecnologías

- React 18
- TypeScript
- Vite
- Firebase Authentication
- Cloud Firestore
- Lucide React
- Firebase Hosting

## Requisitos

- Node.js 18 o superior.
- npm.
- Un proyecto de Firebase con Authentication anónima y Cloud Firestore habilitados.

## Instalación

1. Clona el repositorio y entra en la carpeta del proyecto:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <CARPETA_DEL_PROYECTO>
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura Firebase. Copia `.env.example` a `.env` y completa los valores con los de tu aplicación web de Firebase (Consola de Firebase → Configuración del proyecto → Tus apps):

   ```bash
   cp .env.example .env
   ```

   | Variable                            | Descripción                              |
   | ----------------------------------- | ---------------------------------------- |
   | `VITE_FIREBASE_API_KEY`             | API key de la app web                    |
   | `VITE_FIREBASE_AUTH_DOMAIN`         | `<project-id>.firebaseapp.com`           |
   | `VITE_FIREBASE_PROJECT_ID`          | ID del proyecto                          |
   | `VITE_FIREBASE_STORAGE_BUCKET`      | `<project-id>.firebasestorage.app`       |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de Cloud Messaging             |
   | `VITE_FIREBASE_APP_ID`              | ID de la app web                         |

   La inicialización vive en `src/lib/firebase.ts` y lee estas variables.

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Vite mostrará la URL local, normalmente `http://localhost:5173`.

## Scripts disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo
npm run build     # Genera la versión de producción en dist/
npm run preview   # Sirve localmente la compilación de producción
```

## Personalización

- **Desde la app:** inicia sesión con el PIN de administración y edita el nombre, escudo, descripción, ubicación e imágenes de portada. Todo se guarda en el documento `settings/club_info` de Firestore.
- **Valores por defecto:** mientras no exista ese documento, la app muestra los valores de `src/lib/clubDefaults.ts` (nombre, descripción, ubicación, escudo e imagen de portada). Ajústalos si quieres que la plantilla arranque ya con tu identidad.
- **PWA:** el nombre y el ícono del manifiesto (`vite.config.ts`) también se toman de `src/lib/clubDefaults.ts` y de `public/icon.svg`. Sustituye `public/icon.svg` por el escudo de tu club.
- **Título y descripción HTML:** edita `index.html`.

## Modelo de datos

La aplicación consume estas colecciones de Cloud Firestore:

| Colección      | Uso                                                                  |
| -------------- | -------------------------------------------------------------------- |
| `settings`     | Información general del club, especialmente el documento `club_info` |
| `transactions` | Ingresos, gastos y movimientos financieros                           |
| `players`      | Jugadores, perfiles y estadísticas                                   |
| `inventory`    | Equipamiento y existencias                                           |
| `events`       | Partidos, entrenamientos y actividades                               |
| `gallery`      | Fotografías y contenido de la galería                                |
| `goals`        | Metas y objetivos del club                                           |

La autenticación anónima se realiza al cargar la aplicación para permitir la lectura de los datos definidos por las reglas de Firebase.

## Roles y permisos

- **Jugador:** consulta la información pública del club.
- **Entrenador:** administra agenda, jugadores e inventario.
- **Tesorero:** administra finanzas e inventario.
- **Prensa:** administra el contenido de portada y galería.
- **Administración:** tiene acceso de edición a todos los módulos.

Los PIN de acceso se mantienen en el código de autenticación local. Deben cambiarse y protegerse antes de publicar la aplicación en un entorno real.

## Despliegue en Firebase Hosting

1. Instala o usa Firebase CLI e inicia sesión:

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. Selecciona el proyecto Firebase correspondiente (esto actualiza `.firebaserc`, que incluye un ID de ejemplo):

   ```bash
   firebase use <ID_DEL_PROYECTO>
   ```

3. Genera la compilación:

   ```bash
   npm run build
   ```

4. Publica la carpeta `dist`:

   ```bash
   firebase deploy --only hosting
   ```

La configuración de `firebase.json` ya incluye el rewrite necesario para que las rutas de la SPA carguen `index.html`.

### Despliegue automático con GitHub Actions

En `.github/workflows/` hay dos flujos: uno despliega al canal `live` en cada push a `main` y otro crea un canal de vista previa por cada pull request. Para activarlos, configura en el repositorio (Settings → Secrets and variables → Actions):

- Secret `FIREBASE_SERVICE_ACCOUNT`: JSON de la cuenta de servicio. `firebase init hosting:github` lo genera por ti.
- Secrets `VITE_FIREBASE_*`: los mismos valores de tu `.env`, necesarios durante el `npm run build`.
- Variable `FIREBASE_PROJECT_ID`: ID del proyecto de Firebase.

## Seguridad

Antes de poner la aplicación en producción:

- Revisa y restringe las reglas de Cloud Firestore.
- Cambia los PIN incluidos en el código.
- Considera mover la gestión de roles a Firebase Authentication y validar permisos también en las reglas de Firestore.
- No dependas únicamente de `localStorage` o de la interfaz para proteger operaciones sensibles.

## Estructura principal

```text
src/
├── components/    Componentes reutilizables y formularios
├── hooks/         Acceso y sincronización de datos
├── lib/           Configuración de Firebase y valores por defecto del club
├── pages/         Vistas principales de la aplicación
└── utils/         Utilidades compartidas
```

## Licencia

Define aquí la licencia de tu proyecto (por ejemplo, MIT) antes de publicarlo.
