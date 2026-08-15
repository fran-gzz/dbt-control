# DBT Control

Aplicación web para el **control de glucemia**: registrá tus mediciones de glucosa, seguí tus tendencias y descubrí cómo la comida y la actividad afectan tus niveles. Todo con una interfaz simple, privada y en español.

El flujo principal es: **Landing → Login → Dashboard**.

## ✨ Características

- **Landing page** con presentación del proyecto e invitación a iniciar sesión.
- **Autenticación con Google** vía Firebase Authentication.
- **Registro de mediciones** con fecha, hora, tipo (ayunas, desayuno, almuerzo, cena, antes de dormir), comida relacionada, actividad física, estado emocional y observaciones.
- **Dashboard** con glucemia actual, promedio semanal, HbA1c estimada (fórmula ADAG) y cantidad de mediciones.
- **Gráficos interactivos**: evolución glucémica diaria, promedios por momento del día, tendencia semanal, distribución por estado y porcentaje en rango (70–140 mg/dL).
- **Historial filtrable** por fecha, tipo de medición y rango glucémico, con edición y eliminación.
- **Biblioteca de comidas** con información nutricional (carbohidratos, proteínas, grasas), vinculable a las mediciones.
- **Modo claro / oscuro** y almacenamiento seguro de datos por usuario en Cloud Firestore.

## 🛠️ Tecnologías y dependencias

### Core

| Dependencia | Versión | Rol |
| --- | --- | --- |
| **Next.js** | 16.2.7 | Framework React con App Router y renderizado por defecto. |
| **React** | 19.2.4 | Biblioteca de UI. |
| **TypeScript** | ^5 | Tipado estático. |

### Backend y datos

| Dependencia | Versión | Rol |
| --- | --- | --- |
| **Firebase** | ^12.15.0 | Authentication (Google) + Cloud Firestore (base de datos en tiempo real). |

### Estilos y UI

| Dependencia | Versión | Rol |
| --- | --- | --- |
| **Tailwind CSS** | ^4 | Framework de estilos (utility classes). |
| **shadcn/ui** | ^4.10.0 | Componentes accesibles construidos sobre Radix UI. |
| **Radix UI** | ^1.5.0 | Primitivas headless (menús, dialogs, selects, switches). |
| **class-variance-authority** | ^0.7.1 | Variantes de componentes (estilos condicionales). |
| **clsx** | ^2.1.1 | Construcción de strings de clases. |
| **tailwind-merge** | ^3.6.0 | Merge inteligente de clases de Tailwind. |
| **tw-animate-css** | ^1.4.0 | Animaciones CSS para Tailwind. |
| **next-themes** | ^0.4.6 | Manejo de temas claro/oscuro. |
| **lucide-react** | ^1.17.0 | Set de íconos. |

### Visualización

| Dependencia | Versión | Rol |
| --- | --- | --- |
| **Recharts** | ^3.8.0 | Gráficos (línea, barras, pie, radial). |

### Desarrollo

| Dependencia | Versión | Rol |
| --- | --- | --- |
| **ESLint** + `eslint-config-next` | ^9 / 16.2.7 | Linting. |
| **@tailwindcss/postcss** | ^4 | Integración de Tailwind con PostCSS. |
| **@types/node**, **@types/react**, **@types/react-dom** | — | Tipos para TypeScript. |

## 🏗️ Cómo funciona

### Flujo de la aplicación

1. **Landing (`/`)** — página pública que presenta el proyecto.
2. **Login (`/login`)** — autenticación con Google.
3. **Dashboard (`/dashboard`)** — panel principal del usuario autenticado.

Las rutas públicas son `/` y `/login`. El resto de las rutas (`/dashboard`, `/historial`, `/estadisticas`, `/comidas`, `/configuracion`, `/nueva-medicion`) requieren sesión: `components/app-shell.tsx` redirige a `/login` si no hay usuario y a `/dashboard` si ya hay sesión iniciada.

### Estado global

- `components/auth-provider.tsx` — escucha el estado de autenticación (`onAuthStateChanged`) y expone `user`, `login()` y `logout()`.
- `components/readings-provider.tsx` y `components/meals-provider.tsx` — escuchan cambios en Firestore (`onSnapshot`) y exponen la data del usuario más operaciones CRUD. Se montan por usuario mediante `key={user?.uid}`.

### Modelo de datos en Firestore

Cada usuario tiene sus propias subcolecciones dentro de `users/{userId}`:

```
users/{userId}
├── readings/    # mediciones de glucemia
└── meals/       # comidas con información nutricional
```

Una medición (`readings`) tiene: `value`, `date`, `time`, `type`, `meal`, `activity`, `mood`, `notes`, `status` (normal / alta / baja). El estado se calcula con `computeStatus()`: `> 140` es "alta", `< 70` es "baja", el resto "normal".

### Cálculos (`lib/data.ts`)

- `statsFrom` → glucemia actual, promedios, mín/máx.
- `hba1cFrom` → HbA1c estimada con la fórmula ADAG: `(promedio + 46.7) / 28.7`.
- `dailyTrendFrom`, `timeOfDayAveragesFrom`, `weeklyTrendFrom`, `distributionFrom`, `inRangePercentFrom` → datos para los gráficos.

## 📁 Estructura del proyecto

```
app/
├── page.tsx              # Landing page (pública)
├── layout.tsx            # Layout raíz (providers + tema)
├── login/page.tsx        # Login con Google
├── dashboard/page.tsx    # Panel principal
├── historial/            # Historial con filtros
├── estadisticas/         # Gráficos y métricas
├── comidas/              # Biblioteca de comidas
├── configuracion/        # Perfil y preferencias
└── nueva-medicion/       # Formulario de medición
components/
├── app-shell.tsx         # Enrutado protegido + layout con sidebar
├── app-sidebar.tsx       # Navegación lateral
├── readings-provider.tsx # Estado global de mediciones (Firestore)
├── meals-provider.tsx    # Estado global de comidas (Firestore)
├── auth-provider.tsx     # Estado global de autenticación
├── charts/               # Gráficos de Recharts
└── ui/                   # Componentes shadcn/ui
lib/
├── firebase.ts           # Inicialización de Firebase
├── firestore.ts          # Operaciones CRUD contra Firestore
├── data.ts               # Cálculos y transformaciones de datos
└── types.ts              # Tipos TypeScript
```

## 🚀 Puesta en marcha

### Requisitos previos

- **Node.js** 20 o superior y npm.
- Un proyecto de **Firebase** con Authentication y Cloud Firestore habilitados.

### 1. Configurar Firebase

1. Creá un proyecto en [Firebase Console](https://console.firebase.google.com).
2. En **Authentication → Sign-in method**, habilitá **Google**.
3. En **Firestore Database**, creá una base de datos (modo de producción recomendado).
4. En **Project settings**, copiá las credenciales de la aplicación web (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId`).

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiá `.env.example` a `.env.local` y completá los valores:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### 4. Reglas de seguridad de Firestore

Para que cada usuario solo pueda acceder a sus propios datos:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Levantar el servidor

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## 📜 Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción. |
| `npm run start` | Servidor de producción (requiere build previo). |
| `npm run lint` | Ejecuta ESLint. |

## ☁️ Deploy

La app está lista para desplegarse en [Vercel](https://vercel.com) (o cualquier plataforma compatible con Next.js). En el dashboard de Vercel agregá las mismas variables de entorno `NEXT_PUBLIC_FIREBASE_*` usadas en local.

## 📄 Licencia

Proyecto personal. Uso libre con fines educativos y de seguimiento personal de la salud.
