# MI CUENTA ISPI

Sistema web mobile-first para la consulta del estado de cuenta de alumnos del **ISPI 4019 - San Juan Bautista**. Permite a los estudiantes ingresar su DNI y visualizar su información académica, resumen de cuotas, historial de pagos y descargar comprobantes.

---

## 📋 Tabla de contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Base de datos](#base-de-datos)
- [Backend - API REST](#backend---api-rest)
- [Frontend](#frontend)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Deploy en Vercel](#deploy-en-vercel)
- [Variables de entorno](#variables-de-entorno)
- [Autor](#autor)

---

## 📝 Descripción

**MI CUENTA ISPI** es una aplicación web desarrollada como trabajo práctico para la materia de Bases de Datos. Su objetivo es demostrar la integración entre un frontend mobile, un backend en Node.js y una base de datos relacional en la nube (Supabase/PostgreSQL).

### Funcionalidades principales

- 🔐 **Consulta por DNI**: el alumno ingresa su DNI y accede a su información
- 📊 **Resumen de cuenta**: total de cuotas, pagadas y pendientes con saldo a pagar
- 💰 **Detalle de cuotas**: visualización del estado (Paga / Pendiente / Vencida)
- 📄 **Comprobantes**: descarga de comprobantes de pago en formato texto
-  **Historial**: listado de todos los pagos registrados
- 🌙 **Modo oscuro/claro**: persistente entre sesiones (localStorage)
- 📱 **Diseño mobile-first**: optimizado para pantallas de celulares
- 🎨 **Identidad institucional**: logo y paleta de colores del ISPI 4019

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| **Frontend** | HTML5, CSS3 (Variables CSS), JavaScript (ES6+) |
| **Backend** | Node.js + Express.js |
| **Base de datos** | PostgreSQL (Supabase) |
| **API** | REST (PostgREST a través de Supabase) |
| **Seguridad** | Row Level Security (RLS) + políticas de lectura |
| **Deploy** | Vercel (serverless) |
| **Control de versiones** | Git + GitHub |

---

## 📁 Estructura del proyecto
mi-cuenta-ispi/
├── public/
│ ├── index.html # Frontend completo (mobile-first)
│ └── logo-ispi.png # Logo institucional
├── .env # Variables de entorno (NO subir a Git)
├── .gitignore # Archivos ignorados por Git
├── package.json # Dependencias y scripts
├── README.md # Documentación del proyecto
├── server.js # Backend Node.js + Express + API REST
└── vercel.json # Configuración para deploy en Vercel

---

## ️ Base de datos

### Esquema de tablas

#### Tabla `alumnos`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | bigint (PK) | Identificador único autoincremental |
| `dni` | text (UNIQUE) | Documento Nacional de Identidad |
| `nombre` | text | Nombre del alumno |
| `apellido` | text | Apellido del alumno |
| `carrera` | text | Carrera en la que está inscripto |
| `curso` | text | Año/curso actual |

#### Tabla `cuotas`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | bigint (PK) | Identificador único autoincremental |
| `alumno_id` | bigint (FK) | Relación con la tabla `alumnos` |
| `concepto` | text | Descripción de la cuota |
| `vencimiento` | date | Fecha de vencimiento |
| `importe` | numeric | Monto de la cuota |
| `pagado` | boolean | Estado de pago (`true` / `false`) |

### SQL de creación

```sql
-- Crear tabla de alumnos
CREATE TABLE alumnos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dni text UNIQUE NOT NULL,
  nombre text NOT NULL,
  apellido text NOT NULL,
  carrera text,
  curso text
);

-- Crear tabla de cuotas
CREATE TABLE cuotas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  alumno_id bigint REFERENCES alumnos(id) ON DELETE CASCADE,
  concepto text NOT NULL,
  vencimiento date NOT NULL,
  importe numeric NOT NULL,
  pagado boolean DEFAULT false
);

-- Habilitar Row Level Security
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuotas ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (solo SELECT)
CREATE POLICY "lectura_alumnos" ON alumnos FOR SELECT USING (true);
CREATE POLICY "lectura_cuotas" ON cuotas FOR SELECT USING (true);

-- Permisos para el rol anon (API pública)
GRANT SELECT ON alumnos, cuotas TO anon, authenticated;
Datos de Ejemplo
-- Insertar alumnos de prueba
INSERT INTO alumnos (dni, nombre, apellido, carrera, curso) VALUES
('34567890', 'Juan', 'Pérez', 'Técnico Superior en Desarrollo de Software', '2° año'),
('35214879', 'Marcos', 'Ledante', 'Técnico Superior en Administración', '3° año'),
('38990441', 'Sofía', 'Vidal', 'Enfermería Profesional', '1° año');

-- Insertar cuotas de ejemplo
INSERT INTO cuotas (alumno_id, concepto, vencimiento, importe, pagado) VALUES
(1, 'Pago de matrícula', '2026-03-05', 60000, true),
(1, 'Cuota mensual', '2026-04-10', 45000, true),
(1, 'Cuota mensual', '2026-05-10', 45000, false);
🔌 Backend - API REST
El backend está construido con Node.js + Express y se comunica con Supabase mediante la API REST de PostgREST (sin SDK, con fetch directo).
Endpoints disponibles
GET /api/health
Verifica el estado del servidor y si está conectado a Supabase.
Respuesta:
{ "demo": false }
GET /api/estado-cuenta?dni=34567890
Consulta el estado de cuenta de un alumno por su DNI.
Parámetros:
dni (query): Documento Nacional de Identidad (7 u 8 dígitos)
Respuesta exitosa (200):
{
  "alumno": {
    "id": 1,
    "dni": "34567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "carrera": "Técnico Superior en Desarrollo de Software",
    "curso": "2° año"
  },
  "cuotas": [
    {
      "id": 1,
      "alumno_id": 1,
      "concepto": "Pago de matrícula",
      "vencimiento": "2026-03-05",
      "importe": 60000,
      "pagado": true,
      "estado": "paga"
    }
  ],
  "demo": false
}
Respuesta de error (404):
{ "error": "Alumno no encontrado" }
Lógica de estados de cuotas
El backend calcula automáticamente el estado de cada cuota:
paga: si pagado = true
vencida: si pagado = false y vencimiento < hoy
pendiente: si pagado = false y vencimiento >= hoy
Modo demo
Si no se configuran las variables de entorno de Supabase, el servidor funciona en modo demo con datos de prueba predefinidos (3 alumnos con sus cuotas).
🎨 Frontend
Características
Diseño mobile-first: optimizado para pantallas de 375px a 412px
Paleta institucional (extraída del logo del ISPI 4019):
Rojo: #DC4A1E
Verde: #8CC63E
Azul: #4FA8DC
Índigo: #2E3192
Tipografías: Baloo 2 (títulos) + Nunito (texto)
Animaciones: transiciones suaves y microinteracciones
Accesibilidad: labels semánticos, ARIA attributes, contraste adecuado
Secciones de la aplicación
Inicio: login por DNI + resumen de cuenta + accesos rápidos
Estado de cuenta: listado completo de cuotas con filtros (Todas / Pagadas / Pendientes / Vencidas)
Historial: pagos registrados y comprobantes descargables
Perfil: datos del alumno, base de datos usada y cierre de sesión
Flujo de uso
El alumno ingresa su DNI en el teclado numérico
Al consultar, el login se oculta y se muestra la información
Puede navegar entre secciones con la barra inferior
Al tocar una cuota se abre un comprobante descargable
Al final de la página puede cambiar el tema (oscuro/claro) y cerrar sesión
⚙️ Instalación y ejecución local
Requisitos previos
Node.js (versión 18 o superior)
Git
Una cuenta en Supabase (gratuita)
PASOS:
# 1. Clonar el repositorio
git clone https://github.com/rodricicilia/mi-cuenta-ispi-g01.git
cd mi-cuenta-ispi

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env con las variables de entorno
#    (ver sección "Variables de entorno" más abajo)

# 4. Iniciar el servidor
npm start
La aplicación estará disponible en: http://localhost:3000
🌐 Deploy en Vercel
El proyecto está desplegado en Vercel y disponible públicamente en:
https://mi-cuenta-ispi-g01-lsxhvgjxh-rodrigopwaispi.vercel.app
Configuración en Vercel
El archivo vercel.json define cómo Vercel debe construir y servir la aplicación:
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" },
    { "src": "public/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server.js" },
    { "src": "/(.*)", "dest": "public/$1" }
  ]
}
Deploy automático
Cada vez que se hace git push a la rama main, Vercel redeploya automáticamente el proyecto.
🔑 Variables de entorno
El proyecto requiere las siguientes variables de entorno (configuradas en el archivo .env local y en Vercel):
Variable
Descripción
Ejemplo
PORT
Puerto del servidor
3000
SUPABASE_URL
URL del proyecto en Supabase
https://xxxx.supabase.co
SUPABASE_ANON_KEY
Clave pública de Supabase (anon)
eyJhbGciOi...
⚠️ Importante: el archivo .env contiene credenciales sensibles y NO debe subirse a GitHub. Ya está incluido en .gitignore.
Cómo obtener las credenciales de Supabase
Entrar al dashboard de Supabase y seleccionar el proyecto
Ir a Project Settings (⚙️) → API
Copiar:
Project URL → para SUPABASE_URL
anon public key → para SUPABASE_ANON_KEY
👤 Autor
Rodrigo - Trabajo Práctico - Bases de Datos
ISPI 4019 - San Juan Bautista
📄 Licencia
Este proyecto fue desarrollado con fines educativos como parte del trabajo práctico de la materia Bases de Datos.
🙏 Agradecimientos
Supabase - Plataforma de base de datos PostgreSQL en la nube
Express.js - Framework web para Node.js
Vercel - Plataforma de deploy
Google Fonts - Tipografías Baloo 2 y Nunito