# SkillHub — Frontend (Next.js 16 + TypeScript + Tailwind CSS v4)

Plataforma web frontend para **SkillHub** (Sistema de Gestión de Talleres e Inscripciones), conectada a la API REST en `.NET 10` ([SkillHub-Backend](https://github.com/Facz21/SkillHub-Backend)).

## Características Principales
- **Catálogo Público de Talleres (`/explorar`):** Búsqueda, filtros por especialidad, validación de cupos en tiempo real e inscripción directa.
- **Directorio de Instructores (`/mentores`):** Perfiles y talleres programados por cada docente especialista.
- **Gestión de Inscripciones del Participante (`/mis-inscripciones`):** Control de cupos activos, historial de cancelaciones y validación de la regla de negocio de cancelación hasta 24 horas antes del inicio.
- **Explorador de Constancias PDF (`/certificados`):**
  - *Modo Participante:* Selección Master-Detail de talleres inscritos, vista previa del certificado oficial y descarga directa en PDF (`QuestPDF`).
  - *Modo Instructor:* Selección por curso, lista de integrantes inscritos, exportación de reporte en CSV/Excel y emisión de constancias individuales.
- **Suite Docente & Administrativa (`/instructor`):** Publicación de nuevos talleres con selector de instructores, gestión de integrantes por taller, carga masiva desde Excel (`.xlsx`) con detalle de filas rechazadas y ranking de talleres más demandados.
- **Seguridad e Identity (`/perfil` y `AuthModal`):** Inicio de sesión con opción "Recordar sesión" (7 días), mostrar/ocultar contraseña, recuperación de contraseña por correo SMTP y verificación de correo electrónico al registrarse.

## Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variable de entorno (opcional, por defecto apunta a `http://localhost:5076/api/v1`):
   ```bash
   cp .env.example .env.local
   ```
3. Iniciar en modo desarrollo o producción:
   ```bash
   npm run dev
   # o para producción:
   npm run build && npm run start
   ```

## Ejecución con Docker Compose

```bash
docker compose up -d --build
```
