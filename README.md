# SkillHub — Plataforma de Gestion de Talleres e Inscripciones (Frontend Web)

Este repositorio contiene la aplicacion web Frontend de **SkillHub**, construida con **Next.js 16 (App Router)**, **React 19**, **TypeScript** y **Tailwind CSS v4**, organizada bajo una estructura modular de **Clean Architecture** en el cliente. La interfaz se comunica de forma desacoplada con la API REST en `.NET 10` para gestionar el catalogo de talleres, el directorio de instructores, las inscripciones de participantes, la emision de constancias en PDF y la suite de administracion e importacion masiva en Excel.

Repositorio del Backend (.NET 10 + PostgreSQL): [https://github.com/Facz21/SkillHub-Backend](https://github.com/Facz21/SkillHub-Backend)

---

## Arquitectura del Proyecto Frontend

El codigo fuente dentro de `src/` esta estructurado por capas para separar los modelos de dominio, los casos de uso, los adaptadores de red y los componentes de interfaz de usuario:

```text
src/
├── domain/
│   ├── entities/          # Entidades e interfaces de dominio (Workshop, Enrollment, UserProfile, TopWorkshopReport)
│   └── repositories/      # Contratos de acceso a datos (IWorkshopRepository, IEnrollmentRepository, IAuthRepository)
├── application/
│   └── use-cases/         # Casos de uso del cliente (ManageWorkshopsUseCase, ManageEnrollmentsUseCase)
├── infrastructure/
│   ├── http/              # Cliente HTTP centralizado (httpClient) con inyeccion automatica de JWT Bearer
│   └── repositories/      # Implementaciones REST conectadas a /api/v1/* (ApiWorkshopRepository, ApiEnrollmentRepository)
├── presentation/
│   ├── context/           # Estado global de sesion (AuthContext) con soporte dual localStorage / sessionStorage
│   └── components/
│       ├── layout/        # Navegacion adaptativa por rol (Header, Footer, AuthModal, ConfirmDialog)
│       └── features/      # Vistas y modulos interactivos (WorkshopsSection, MyEnrollmentsSection, InstructorSuite, CertificateModal, DiplomaMockup)
└── app/                   # Rutas de Next.js App Router (/, /explorar, /mentores, /mis-inscripciones, /certificados, /instructor, /perfil, /restablecer-clave, /confirmar-correo)
```

---

## Stack Tecnologico

- **Framework Web:** Next.js 16.2.3 (App Router) + React 19.2.4
- **Lenguaje y Tipado:** TypeScript 5 (modo estricto habilitado)
- **Estilos y Sistema de Diseno:** Tailwind CSS v4 con variables de tema semanticas y diseno adaptable (Mobile, Tablet y Desktop)
- **Iconografia:** `lucide-react`
- **Autenticacion en Cliente:** Gestion de tokens JWT Bearer con persistencia condicional:
  - `localStorage` cuando el usuario activa la opcion "Recordar sesion por 7 dias".
  - `sessionStorage` para sesiones efimeras que se cierran al cerrar la ventana del navegador.
- **Contenerizacion:** `Dockerfile` multi-stage basado en `node:22-alpine` y `docker-compose.yml` listo para produccion en el puerto `3000`.

---

## Modulos y Rutas de la Aplicacion

### 1. Inicio (`/`)
- Presentacion general del ecosistema educativo de SkillHub.
- Indicadores en tiempo real de talleres programados, cupos disponibles y categorias activas.
- Vista previa interactiva del modelo de constancia oficial (`DiplomaMockup`).
- Accesos rapidos contextualizados segun el rol del usuario autenticado (`Participant` o `Employee`).

### 2. Catalogo de Talleres (`/explorar`)
- Listado completo de talleres futuros con calculo en vivo de cupos disponibles y barra de ocupacion.
- Buscador instantaneo por nombre de taller, instructor o salon, y filtros rapidos por especialidad (Fotografia, Cocina, Oratoria, Musica, Diseno grafico, Marketing digital).
- Inscripcion directa con un clic para participantes autenticados, validando reglas de cupo, no duplicidad y no cruce de horarios.

### 3. Directorio de Mentores (`/mentores`)
- Tarjetas de perfil de todos los instructores registrados en la plataforma junto con su especialidad y correo institucional.
- Contador y desglose de talleres activos dictados por cada instructor con enlace directo de inscripcion.

### 4. Mis Inscripciones (`/mis-inscripciones`) — Exclusivo para Participantes
- Panel de control de inscripciones activas e historial de inscripciones canceladas.
- Validacion visual y funcional de la regla de negocio de cancelacion (habilitada unicamente hasta 24 horas antes del inicio del taller).
- Boton de re-inscripcion directa para talleres previamente cancelados que aun cuenten con cupos disponibles.
- Acceso directo a la vista previa y descarga de la constancia de asistencia en formato PDF.

### 5. Explorador de Constancias PDF (`/certificados`)
- **Vista de Participante:** Diseno Master-Detail sin barras de desplazamiento horizontales forzadas. Permite seleccionar cualquiera de los talleres inscritos en una lista vertical o navegar con controles `Anterior / Siguiente` para previsualizar el diploma oficial en vivo y descargar el archivo PDF generado por el Backend (`QuestPDF`).
- **Vista de Instructor (`Employee`):** Permite seleccionar cualquiera de los talleres del centro educativo, consultar la lista de participantes inscritos, filtrar por nombre o documento, previsualizar el diploma individual de cada estudiante y descargar su certificado PDF oficial.

### 6. Suite de Instructor y Administracion (`/instructor`) — Exclusivo para Empleados
- **Creacion de Talleres:** Formulario validado para publicar nuevos talleres asignando instructor titular desde el catalogo real de docentes, categoria, fecha y hora de inicio, duracion en minutos, salon y cupo maximo.
- **Gestion de Talleres e Integrantes:** Tabla con buscador en tiempo real, filtro rapido (`Todos los cursos` / `Mis cursos asignados`), controles de desplazamiento lateral y columna de acciones fija (`sticky`).
- **Nomina y Reportes por Curso:** Modal detallado de integrantes inscritos por taller con:
  - Exportacion inmediata de reporte en formato `.csv` (codificado en UTF-8 con BOM, compatible directamente con Microsoft Excel).
  - Impresion de planilla fisica de asistencia.
  - Descarga directa del certificado PDF de cada estudiante activo.
  - Cancelacion administrativa de inscripciones sin la restriccion de 24 horas.
- **Importacion Masiva desde Excel (`.xlsx`):** Cargador de hojas de calculo conectado a `POST /api/v1/enrollments/import` que muestra el resumen de inscripciones procesadas con exito y la tabla detallada de filas rechazadas con su motivo exacto.
- **Reporte de Demanda:** Ranking en vivo de los talleres con mayor numero de inscripciones activas (`GET /api/v1/reports/top-workshops`).

### 7. Seguridad, Perfil e Identidad (`/perfil`, `/restablecer-clave`, `/confirmar-correo`)
- **Modal de Autenticacion (`AuthModal`):**
  - Inicio de sesion con boton para mostrar/ocultar contrasena, casilla "Recordar sesion por 7 dias" y accesos rapidos de demostracion para pruebas.
  - Registro de nuevos participantes con validacion de campos y envio automatico de correo de verificacion.
  - Solicitud de recuperacion de contrasena mediante correo electronico.
- **Restablecimiento de Contrasena (`/restablecer-clave`):** Captura automatica de los parametros `email` y `token` enviados al correo del usuario para definir una nueva contrasena segura.
- **Confirmacion de Correo (`/confirmar-correo`):** Verificacion automatica del token de activacion de cuenta al abrir el enlace recibido por correo electronico.
- **Perfil de Usuario (`/perfil`):** Visualizacion de datos personales, estado de verificacion de correo electronico (con opcion de reenvio de enlace de confirmacion) y resumen de actividad.

---

## Guia de Despliegue y Ejecucion

### Opcion A: Ejecucion con Docker Compose (Recomendado)

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Facz21/SkillHub-Frontend.git
   cd SkillHub-Frontend
   ```
2. Construir y levantar el contenedor en el puerto `3000`:
   ```bash
   docker compose up -d --build
   ```
3. Abrir `http://localhost:3000` en el navegador (asegurandose de que el Backend este corriendo en `http://localhost:5076`).

### Opcion B: Ejecucion Local con Node.js

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables de entorno (opcional, por defecto apunta a `http://localhost:5076/api/v1`):
   ```bash
   cp .env.example .env.local
   ```
3. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Para compilar y ejecutar en modo produccion:
   ```bash
   npm run build
   npm run start
   ```

---

## Autor

Andrés Felipe Cortés Zambrano
