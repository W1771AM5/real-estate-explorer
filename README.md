# Real Estate Explorer

A full-stack real estate exploration app with a **React + Vite** frontend and an **ASP.NET Core Web API** backend backed by **PostgreSQL**.

```
real-estate-explorer/
├── backend/         # ASP.NET Core 10 Web API (RealEstate.Api)
├── database/        # docker-compose.yml for PostgreSQL
├── docs/            # api-contract.md, dataset notes
└── frontend/        # Vite + React frontend (real-estate-ui)
```

---

## Prerequisites

| Tool       | Version       | Notes                                      |
| ---------- | ------------- | ------------------------------------------ |
| **.NET SDK** | 10.0+         | https://dotnet.microsoft.com/download     |
| **Node.js**  | 20+           | https://nodejs.org                         |
| **Docker**   | any recent    | only required for the PostgreSQL container |
| **Git**    | any recent    |                                            |

Verify your tools:
```bash
dotnet --version
node --version
npm --version
docker --version
```

---

## Quick Start (TL;DR)

Three terminals — one per service:

```bash
# 1. Database (PostgreSQL in Docker)
cd database
docker compose up -d

# 2. Backend API (http://localhost:5064)
cd backend/RealEstate.Api
dotnet ef database update        # apply migrations on first run
dotnet run

# 3. Frontend (http://localhost:5173)
cd frontend/real-estate-ui
npm install
npm run dev
```

Open **http://localhost:5173** and the SPA will reach the API at **http://localhost:5064**.

---

## 1. Database (PostgreSQL via Docker)

The `database/docker-compose.yml` runs PostgreSQL 18 on the default port 5432 with a persistent volume.

```bash
cd database
docker compose up -d            # start in background
docker compose logs -f          # follow logs
docker compose down             # stop and remove container (keeps volume)
docker compose down -v          # stop and WIPE data
```

Connection string used by the API:
```
Host=localhost;Port=5432;Database=realestate;Username=realestate_user;Password=realestate_password
```

If you change credentials in `docker-compose.yml`, update `appsettings.json` to match.

---

## 2. Backend — ASP.NET Core API

### Project layout
```
backend/RealEstate.Api/
├── Controllers/       # API endpoints (PropertiesController)
├── Data/              # EF Core DbContext
├── Migrations/        # EF Core migrations
├── Models/            # Entity models
├── Properties/        # launchSettings.json
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

### Run
```bash
cd backend/RealEstate.Api
dotnet restore
dotnet build
dotnet ef database update        # only needed on first run / after migration changes
dotnet run
```

The API listens on **http://localhost:5064** (profile `http` in `Properties/launchSettings.json`).

Swagger/OpenAPI is mapped in development mode at **http://localhost:5064/openapi/v1.json**.

Health check: `GET http://localhost:5064/api/health` → `{ "status": "ok" }`

### Migrations
```bash
# create a new migration after model changes
dotnet ef migrations add YourMigrationName

# apply pending migrations to the running database
dotnet ef database update
```

### Reset database
```bash
docker compose down -v            # wipe Postgres volume
docker compose up -d
dotnet ef database update          # re-create schema
```

---

## 3. Frontend — React + Vite

### Run
```bash
cd frontend/real-estate-ui
npm install
npm run dev                        # http://localhost:5173
```

### Build
```bash
npm run build                      # outputs to dist/
npm run preview                    # serve the production build locally
```

### Lint
```bash
npm run lint
```

### Environment variables
The frontend reads `VITE_API_BASE_URL` to locate the API (defaults to `http://localhost:5064`).

Create `frontend/real-estate-ui/.env.local`:
```
VITE_API_BASE_URL=http://localhost:5064
```

---

## API Endpoints

| Method | Path                | Description                          |
| ------ | ------------------- | ------------------------------------ |
| GET    | `/api/health`       | Liveness probe                       |
| GET    | `/api/properties`   | List properties (used by Analytics)  |

See `docs/api-contract.md` for the full contract and `backend/RealEstate.Api/RealEstate.Api.http` for example requests.

---

## Ports Reference

| Service       | Port  | URL                                      |
| ------------- | ----- | ---------------------------------------- |
| Frontend (Vite) | 5173 | http://localhost:5173                  |
| Backend (API)   | 5064 | http://localhost:5064                  |
| Postgres        | 5432 | postgresql://localhost:5432/realestate |

---

## Troubleshooting

- **Frontend shows "Could not load properties"** — the API isn't running, or `VITE_API_BASE_URL` is wrong. Check the browser Network tab.
- **Backend exits with a Postgres connection error** — the Docker container isn't up (`docker compose ps`) or the password in `appsettings.json` doesn't match `docker-compose.yml`.
- **CORS errors in the browser console** — the API only allows `http://localhost:5173`. Update the `WithOrigins(...)` list in `Program.cs` for other origins.
- **`dotnet ef` not found** — install the EF Core CLI: `dotnet tool install --global dotnet-ef`.

---

# Versión en Español

## Descripción
Aplicación full-stack para explorar propiedades: frontend en **React + Vite**, backend en **ASP.NET Core Web API** y base de datos **PostgreSQL** (ejecutada en Docker).

## Requisitos previos

| Herramienta | Versión   | Notas                                      |
| ----------- | --------- | ------------------------------------------ |
| **.NET SDK** | 10.0+     | https://dotnet.microsoft.com/download     |
| **Node.js**  | 20+       | https://nodejs.org                         |
| **Docker**   | reciente  | solo necesario para el contenedor Postgres |
| **Git**      | reciente  |                                            |

Verifica las herramientas:
```bash
dotnet --version
node --version
npm --version
docker --version
```

## Inicio rápido

Tres terminales — uno por servicio:

```bash
# 1. Base de datos (PostgreSQL en Docker)
cd database
docker compose up -d

# 2. Backend API (http://localhost:5064)
cd backend/RealEstate.Api
dotnet ef database update        # aplicar migraciones la primera vez
dotnet run

# 3. Frontend (http://localhost:5173)
cd frontend/real-estate-ui
npm install
npm run dev
```

Abre **http://localhost:5173**. La SPA se conectará al API en **http://localhost:5064**.

---

## 1. Base de datos (PostgreSQL con Docker)

`database/docker-compose.yml` ejecuta PostgreSQL 18 en el puerto 5432 con un volumen persistente.

```bash
cd database
docker compose up -d            # iniciar en segundo plano
docker compose logs -f          # ver logs
docker compose down             # detener (conserva el volumen)
docker compose down -v          # detener y BORRAR los datos
```

Cadena de conexión usada por el API:
```
Host=localhost;Port=5432;Database=realestate;Username=realestate_user;Password=realestate_password
```

Si cambias las credenciales en `docker-compose.yml`, actualiza `appsettings.json` para que coincidan.

---

## 2. Backend — API en ASP.NET Core

### Estructura del proyecto
```
backend/RealEstate.Api/
├── Controllers/       # endpoints (PropertiesController)
├── Data/              # DbContext de EF Core
├── Migrations/        # migraciones de EF Core
├── Models/            # modelos de entidad
├── Properties/        # launchSettings.json
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

### Ejecución
```bash
cd backend/RealEstate.Api
dotnet restore
dotnet build
dotnet ef database update        # solo la primera vez / tras nuevas migraciones
dotnet run
```

El API escucha en **http://localhost:5064** (perfil `http` en `Properties/launchSettings.json`).

OpenAPI está disponible en modo desarrollo en **http://localhost:5064/openapi/v1.json**.

Health check: `GET http://localhost:5064/api/health` → `{ "status": "ok" }`

### Migraciones
```bash
# crear nueva migración tras cambios en modelos
dotnet ef migrations add NombreDeLaMigracion

# aplicar migraciones pendientes
dotnet ef database update
```

### Reiniciar la base de datos
```bash
docker compose down -v            # borra el volumen de Postgres
docker compose up -d
dotnet ef database update          # recrea el esquema
```

---

## 3. Frontend — React + Vite

### Ejecución
```bash
cd frontend/real-estate-ui
npm install
npm run dev                        # http://localhost:5173
```

### Build de producción
```bash
npm run build                      # salida en dist/
npm run preview                    # sirve el build localmente
```

### Lint
```bash
npm run lint
```

### Variables de entorno
El frontend lee `VITE_API_BASE_URL` para localizar el API (por defecto `http://localhost:5064`).

Crea `frontend/real-estate-ui/.env.local`:
```
VITE_API_BASE_URL=http://localhost:5064
```

---

## Endpoints del API

| Método | Ruta                | Descripción                              |
| ------ | ------------------- | ---------------------------------------- |
| GET    | `/api/health`       | Comprobación de estado                   |
| GET    | `/api/properties`   | Lista de propiedades (usado en Analytics) |

Consulta `docs/api-contract.md` para el contrato completo y `backend/RealEstate.Api/RealEstate.Api.http` para ejemplos de peticiones.

---

## Referencia de puertos

| Servicio       | Puerto | URL                                      |
| ------------- | ------ | ---------------------------------------- |
| Frontend (Vite) | 5173  | http://localhost:5173                    |
| Backend (API)   | 5064  | http://localhost:5064                    |
| Postgres        | 5432  | postgresql://localhost:5432/realestate   |

---

## Problemas frecuentes

- **El frontend muestra "Could not load properties"** — el API no está corriendo, o `VITE_API_BASE_URL` es incorrecto. Revisa la pestaña Network del navegador.
- **El backend falla al conectar a Postgres** — el contenedor Docker no está activo (`docker compose ps`) o la contraseña en `appsettings.json` no coincide con la de `docker-compose.yml`.
- **Errores de CORS en la consola del navegador** — el API solo permite `http://localhost:5173`. Actualiza la lista `WithOrigins(...)` en `Program.cs` para otros orígenes.
- **`dotnet ef` no se reconoce** — instala la CLI de EF Core: `dotnet tool install --global dotnet-ef`.