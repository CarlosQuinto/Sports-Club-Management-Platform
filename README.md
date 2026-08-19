# Sports-Club-Management-Platform

Panel web para la gestión integral de clubes. La aplicación centraliza la información del club, la agenda deportiva, los jugadores, las finanzas, el inventario y la galería.

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

3. Revisa la configuración de Firebase en `src/lib/firebase.ts` y `src/hooks/useClubData.ts`. La configuración actual apunta al proyecto Firebase de Joga Bonito FC. Para usar otro proyecto, reemplaza sus valores por los de tu aplicación web de Firebase.

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

2. Selecciona el proyecto Firebase correspondiente:

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
├── context/       Estado de autenticación y roles
├── hooks/         Acceso y sincronización de datos
├── lib/           Configuración y constantes de Firebase
├── pages/         Vistas principales de la aplicación
└── utils/         Utilidades compartidas
```

## Licencia

Este proyecto es de uso privado para Joga Bonito FC, salvo que se indique lo contrario.
