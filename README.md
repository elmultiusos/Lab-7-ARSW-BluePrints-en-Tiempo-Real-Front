# BluePrints en Tiempo Real - Sistema Completo

Sistema full-stack de colaboración en tiempo real para crear y editar blueprints (planos de dibujo) con múltiples usuarios simultáneos. Implementa autenticación JWT, autorización granular, validación de datos y arquitectura limpia.

---

## Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Ejecución](#-ejecución)
- [Endpoints API](#-endpoints-api)
- [Documentación](#-documentación)
- [Scripts de Prueba](#-scripts-de-prueba)
- [Arquitectura](#-arquitectura)
- [Seguridad](#-seguridad)
- [Contribuir](#-contribuir)

---

## ✨ Características

### 🔐 Autenticación y Autorización

- Sistema completo de registro/login con JWT
- Contraseñas hasheadas con bcrypt (10 salt rounds)
- Tokens con expiración configurable (24h por defecto)
- Autorización granular por recurso (solo el autor puede modificar sus blueprints)
- Protección de WebSockets con JWT

### 🎨 Gestión de Blueprints

- CRUD completo (Create, Read, Update, Delete)
- Dibujo en canvas HTML5 (600x400px)
- Colaboración en tiempo real con múltiples usuarios
- Sincronización automática entre pestañas/dispositivos
- Límite de 1000 puntos por blueprint para prevenir DoS

### 🔌 Comunicación en Tiempo Real

- WebSocket bidireccional con Socket.IO
- Sistema de salas (rooms) por blueprint
- Broadcasting automático de cambios
- Indicador de estado de conexión en UI
- Reconexión automática

### 🛡️ Validación y Seguridad

- Validación robusta con Zod schemas
- CORS configurable por ambiente (desarrollo/producción)
- Sanitización de inputs (alphanumeric)
- Límites de payload (100KB max)
- Rate limiting en memoria
- Manejo estructurado de errores

### 📊 Observabilidad

- Health check endpoint (`/health`)
- Métricas del sistema (`/metrics`)
- Logging estructurado con emojis
- Tracking de requests HTTP
- Monitoreo de conexiones WebSocket

---

## 🛠️ Tecnologías

### Backend

- **Node.js** (v18+) - Runtime JavaScript
- **Express** (v4.19) - Framework web
- **Socket.IO** (v4.8) - WebSocket bidireccional
- **JWT** (jsonwebtoken v9.0) - Autenticación stateless
- **Bcrypt** (v5.1) - Hash de contraseñas
- **Zod** (v3.22) - Validación de schemas
- **CORS** (v2.8) - Control de orígenes

### Frontend

- **React** (v18.3) - Biblioteca UI
- **Vite** (v5.4) - Build tool y dev server
- **Socket.IO Client** (v4.8) - Cliente WebSocket
- **STOMP** (v7.2) - Protocolo de mensajería
- **Canvas API** - Dibujo en navegador

---

## 📁 Estructura del Proyecto

```
JWT/
├── example-backend-socketio-node-/     ← Backend (Node.js + Express + Socket.IO)
│   ├── server.js                       ← Punto de entrada (50 líneas)
│   ├── package.json
│   └── src/
│       ├── config/                     ← Configuración (env, CORS)
│       ├── middleware/                 ← Auth, validación, logging
│       ├── models/                     ← Schemas y base de datos
│       ├── services/                   ← Lógica de negocio
│       ├── controllers/                ← Controladores HTTP
│       ├── routes/                     ← Definición de rutas
│       ├── sockets/                    ← Handlers WebSocket
│       └── utils/                      ← Utilidades (logger)
│
├── Lab_P4_BluePrints_RealTime-Sokets/  ← Frontend (React + Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                     ← Componente principal (150 líneas)
│       ├── main.jsx
│       ├── components/                 ← Componentes UI reutilizables
│       ├── contexts/                   ← Context API (AuthContext)
│       ├── hooks/                      ← Custom hooks
│       ├── services/api/               ← Servicios de API
│       ├── utils/                      ← Utilidades (auth, logger)
│       └── lib/                        ← Librerías (Socket.IO, STOMP)
│
├── *.md                                ← Documentación completa
└── test-*.ps1                          ← Scripts de prueba PowerShell
```

---

## 🚀 Instalación

### Requisitos Previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Git** (opcional)

### 1. Clonar o Descargar el Proyecto

```powershell
git clone <repository-url>
cd JWT
```

### 2. Instalar Dependencias del Backend

```powershell
cd example-backend-socketio-node-
npm install
```

### 3. Instalar Dependencias del Frontend

```powershell
cd ..\Lab_P4_BluePrints_RealTime-Sokets
npm install
```

### 4. Configurar Variables de Entorno (Opcional)

#### Backend (.env)

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend (.env.local)

```env
VITE_API_BASE=http://localhost:3001/api
VITE_IO_BASE=http://localhost:3001
```

---

## ▶️ Ejecución

### Opción 1: Ejecución Manual

#### Terminal 1 - Backend

```powershell
cd example-backend-socketio-node-
npm run dev
```

Servidor corriendo en **http://localhost:3001**

#### Terminal 2 - Frontend

```powershell
cd Lab_P4_BluePrints_RealTime-Sokets
npm run dev
```

Aplicación disponible en **http://localhost:5173**

### Opción 2: Ejecución Simultánea (Windows)

```powershell
# En la raíz del proyecto
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd example-backend-socketio-node-; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Lab_P4_BluePrints_RealTime-Sokets; npm run dev"
```

---

## 📡 Endpoints API

### Autenticación

| Método | Endpoint             | Descripción       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Registrar usuario |
| POST   | `/api/auth/login`    | Iniciar sesión    |
| GET    | `/api/auth/verify`   | Verificar token   |

### Blueprints

| Método | Endpoint                        | Descripción          |
| ------ | ------------------------------- | -------------------- |
| GET    | `/api/blueprints/:author`       | Lista de blueprints  |
| GET    | `/api/blueprints/:author/:name` | Blueprint específico |
| POST   | `/api/blueprints`               | Crear blueprint      |
| PUT    | `/api/blueprints/:author/:name` | Actualizar blueprint |
| DELETE | `/api/blueprints/:author/:name` | Eliminar blueprint   |

### Monitoreo

| Método | Endpoint   | Descripción          |
| ------ | ---------- | -------------------- |
| GET    | `/health`  | Estado del servidor  |
| GET    | `/metrics` | Métricas del sistema |

### Eventos WebSocket

| Evento                   | Dirección          | Descripción                  |
| ------------------------ | ------------------ | ---------------------------- |
| `connection`             | Cliente → Servidor | Conexión establecida         |
| `join-room`              | Cliente → Servidor | Unirse a sala de blueprint   |
| `draw-event`             | Cliente → Servidor | Enviar nuevo punto dibujado  |
| `blueprint-update`       | Servidor → Cliente | Blueprint actualizado        |
| `blueprints-list-update` | Servidor → Cliente | Lista de blueprints cambiada |
| `disconnect`             | Cliente → Servidor | Desconexión                  |

## 🏗️ Arquitectura

### Backend - Clean Architecture

```
┌─────────────────────────────────────────┐
│           HTTP/WebSocket                │
├─────────────────────────────────────────┤
│  Middleware (Auth, Validation, Logger)  │
├─────────────────────────────────────────┤
│     Controllers (HTTP Handlers)         │
├─────────────────────────────────────────┤
│      Services (Business Logic)          │
├─────────────────────────────────────────┤
│    Models (Schemas + Data Access)       │
├─────────────────────────────────────────┤
│        Database (In-Memory)             │
└─────────────────────────────────────────┘
```

### Frontend - Component Architecture

```
┌─────────────────────────────────────────┐
│       Components (Presentation)         │
├─────────────────────────────────────────┤
│      Hooks (Shared Logic)               │
├─────────────────────────────────────────┤
│    Context API (Global State)           │
├─────────────────────────────────────────┤
│   Services (API Communication)          │
├─────────────────────────────────────────┤
│      Utils (Helper Functions)           │
└─────────────────────────────────────────┘
```

## 🔒 Seguridad

### Implementaciones de Seguridad

✅ **Autenticación:**

- JWT con firma HMAC SHA-256
- Secret key configurable (nunca hardcodeado en producción)
- Tokens con expiración automática

✅ **Contraseñas:**

- Hash con bcrypt (10 salt rounds)
- Nunca se almacenan en texto plano
- Validación de longitud mínima (6 caracteres)

✅ **Validación:**

- Schemas Zod para todos los payloads
- Sanitización de inputs (alphanumeric)
- Límites de tamaño y cantidad

✅ **CORS:**

- Configuración por ambiente
- Lista blanca en producción
- Headers controlados

✅ **Autorización:**

- Middleware de autenticación JWT
- Verificación de propiedad de recursos
- Solo el autor puede modificar sus blueprints

✅ **Prevención de Ataques:**

- SQL/NoSQL Injection (validación de tipos)
- XSS (sanitización de strings)
- DoS (límites de payload y puntos)
- CSRF (tokens JWT)

⚠️ **IMPORTANTE: Crear antes de ejecutar**

**Variables de Entorno:**

```env
NODE_ENV=production
JWT_SECRET=<generar-clave-segura-256-bits>
ALLOWED_ORIGINS=https://tuapp.com
```

---
