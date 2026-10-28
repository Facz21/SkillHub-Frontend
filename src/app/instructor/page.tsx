"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Workshop, CreateWorkshopDto, InstructorSummary } from "@/types/workshop";
import { WorkshopEnrollmentDetail } from "@/types/enrollment";
import { TopWorkshopReport, ExcelImportResult } from "@/types/report";
import { workshopService } from "@/services/workshopService";
import { enrollmentService } from "@/services/enrollmentService";
import { reportService } from "@/services/reportService";
import { DiplomaMockup } from "@/components/features/certificates/DiplomaMockup";
import { Modal } from "@/components/ui/Modal";
import { BentoCard } from "@/components/ui/BentoCard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function InstructorSuitePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();

  const tableScrollRef = useRef<HTMLDivElement>(null);

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [instructors, setInstructors] = useState<InstructorSummary[]>([]);
  const [topWorkshops, setTopWorkshops] = useState<TopWorkshopReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table Filters
  const [tableFilter, setTableFilter] = useState<"all" | "mine">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal Crear Taller
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    code: "",
    title: "",
    description: "",
    instructorEmail: "",
    startDateTime: "",
    endDateTime: "",
    capacity: 20,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Modal Ver Integrantes y Reportes de Inscripción
  const [selectedWorkshopForAttendance, setSelectedWorkshopForAttendance] =
    useState<Workshop | null>(null);
  const [attendanceList, setAttendanceList] = useState<WorkshopEnrollmentDetail[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [processingEnrollmentId, setProcessingEnrollmentId] = useState<number | null>(null);
  const [previewStudentCert, setPreviewStudentCert] =
    useState<WorkshopEnrollmentDetail | null>(null);

  // Excel Import State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allWorkshops, allInstructors, top] = await Promise.all([
        workshopService.getWorkshops(),
        workshopService.getInstructors().catch(() => []),
        reportService.getTopWorkshops().catch(() => []),
      ]);
      setWorkshops(allWorkshops);
      setInstructors(allInstructors);
      setTopWorkshops(top);

      if (allInstructors.length > 0 && !createForm.instructorEmail) {
        const defaultEmail =
          allInstructors.find((i) => i.email === user?.email)?.email ||
          allInstructors[0].email;
        setCreateForm((prev) => ({ ...prev, instructorEmail: defaultEmail }));
      }

      // Check if URL has ?workshopId=... to auto-open that workshop's participants modal
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const wsIdParam = params.get("workshopId");
        if (wsIdParam) {
          const target = allWorkshops.find((w) => w.id === Number(wsIdParam));
          if (target) {
            handleOpenAttendance(target);
          }
        }
      }
    } catch (err: unknown) {
      console.error("Error al cargar datos de instructor:", err);
      addToast("error", "No se pudieron sincronizar los datos de la suite.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace("/explorar");
      return;
    }
    if (user.role !== "Employee") {
      router.replace("/mis-inscripciones");
      return;
    }
    loadData();
  }, [user, isAuthLoading, router]);

  const displayedWorkshops = useMemo(() => {
    return workshops.filter((w) => {
      const matchesTab =
        tableFilter === "all" ||
        (user &&
          (w.instructorEmail.toLowerCase() === user.email.toLowerCase() ||
            w.instructorName.toLowerCase() === user.fullName.toLowerCase()));

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        w.title.toLowerCase().includes(q) ||
        w.code.toLowerCase().includes(q) ||
        w.instructorName.toLowerCase().includes(q) ||
        (w.instructorSpecialty || "").toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [workshops, tableFilter, searchTerm, user]);

  const scrollTableHorizontally = (direction: "left" | "right") => {
    if (!tableScrollRef.current) return;
    const offset = direction === "left" ? -340 : 340;
    tableScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleOpenAttendance = async (workshop: Workshop) => {
    setSelectedWorkshopForAttendance(workshop);
    setPreviewStudentCert(null);
    try {
      setIsLoadingAttendance(true);
      const list = await workshopService.getWorkshopEnrollments(workshop.id);
      setAttendanceList(list);
    } catch (err: unknown) {
      console.error(err);
      addToast("error", "No se pudo cargar la lista de integrantes.");
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const handleEmployeeCancelEnrollment = async (enrollmentId: number) => {
    if (!selectedWorkshopForAttendance) return;
    try {
      setProcessingEnrollmentId(enrollmentId);
      await enrollmentService.cancelEnrollment(enrollmentId);
      addToast("success", "Inscripción cancelada exitosamente.");
      const updatedList = await workshopService.getWorkshopEnrollments(
        selectedWorkshopForAttendance.id
      );
      setAttendanceList(updatedList);
      if (previewStudentCert?.enrollmentId === enrollmentId) {
        setPreviewStudentCert(null);
      }
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cancelar la inscripción.";
      addToast("error", msg);
    } finally {
      setProcessingEnrollmentId(null);
    }
  };

  const handleEmployeeDownloadCertificate = async (enrollmentId: number) => {
    try {
      setProcessingEnrollmentId(enrollmentId);
      await enrollmentService.downloadCertificate(enrollmentId);
      addToast("success", "Constancia PDF del integrante descargada exitosamente.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al descargar la constancia PDF.";
      addToast("error", msg);
    } finally {
      setProcessingEnrollmentId(null);
    }
  };

  const handleExportCourseReportCsv = () => {
    if (!selectedWorkshopForAttendance) return;
    const w = selectedWorkshopForAttendance;
    const headers = [
      "ID Inscripcion",
      "Codigo Taller",
      "Titulo Taller",
      "Instructor",
      "Nombre Integrante",
      "Correo Electronico",
      "Estado",
      "Fecha Inscripcion",
      "Cancelado Por",
    ];
    const rows = attendanceList.map((item) => [
      item.enrollmentId,
      `"${w.code}"`,
      `"${w.title.replace(/"/g, '""')}"`,
      `"${w.instructorName.replace(/"/g, '""')}"`,
      `"${item.participantName.replace(/"/g, '""')}"`,
      `"${item.participantEmail}"`,
      item.status === 1 ? "Activa" : "Cancelada",
      `"${new Date(item.enrolledAt).toLocaleString("es-CO")}"`,
      `"${item.cancelledBy || "-"}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-inscripcion-${w.code.toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();

    addToast(
      "success",
      `Reporte de inscripción de ${w.code} (${attendanceList.length} registros) descargado.`
    );
  };

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.startDateTime || !createForm.endDateTime) {
      addToast("warning", "Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      setIsCreating(true);
      const payload: CreateWorkshopDto = {
        code: createForm.code.trim() || `WS-${Date.now().toString().slice(-4)}`,
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        instructorEmail: createForm.instructorEmail || user?.email || "andres.mejia@correo.com",
        startDateTime: new Date(createForm.startDateTime).toISOString(),
        endDateTime: new Date(createForm.endDateTime).toISOString(),
        capacity: createForm.capacity,
      };

      await workshopService.createWorkshop(payload);
      addToast("success", "Taller publicado con éxito en el catálogo público.");
      setIsCreateOpen(false);
      setCreateForm({
        code: "",
        title: "",
        description: "",
        instructorEmail: instructors[0]?.email || user?.email || "",
        startDateTime: "",
        endDateTime: "",
        capacity: 20,
      });
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear el taller.";
      addToast("error", msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExcelUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) {
      addToast("warning", "Selecciona un archivo Excel (.xlsx) antes de procesar.");
      return;
    }

    try {
      setIsImporting(true);
      const res = await reportService.importEnrollmentsExcel(excelFile);
      setImportResult(res);
      addToast(
        "success",
        `Importación completada: ${res.successfulCount} exitosas de ${res.totalRows} filas.`
      );
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al importar el archivo Excel.";
      addToast("error", msg);
    } finally {
      setIsImporting(false);
    }
  };

  if (!user || user.role !== "Employee") {
    return null;
  }

  const totalCapacity = workshops.reduce((acc, w) => acc + w.capacity, 0);
  const totalReserved = workshops.reduce((acc, w) => acc + w.activeEnrollmentsCount, 0);
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalReserved / totalCapacity) * 100) : 0;
  const myWorkshopsCount = workshops.filter(
    (w) =>
      w.instructorEmail.toLowerCase() === user.email.toLowerCase() ||
      w.instructorName.toLowerCase() === user.fullName.toLowerCase()
  ).length;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <span className="material-symbols-outlined text-sm">school</span>
                Panel de Control Docente &amp; Administrativo
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Suite del Instructor
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-1">
                Bienvenido, {user.fullName}. Gestiona tus cursos, consulta sus integrantes, genera reportes de inscripción y emite constancias PDF.
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all self-start md:self-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              Publicar Nuevo Taller
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Bento Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <BentoCard
            title="Talleres Activos"
            value={workshops.length}
            subtitle={`${myWorkshopsCount} asignados a tu perfil`}
            icon="auto_stories"
            accentColor="primary"
          />
          <BentoCard
            title="Capacidad Total"
            value={totalCapacity}
            subtitle="Cupos configurados"
            icon="groups"
            accentColor="emerald"
          />
          <BentoCard
            title="Integrantes Inscritos"
            value={totalReserved}
            subtitle="Inscripciones activas"
            icon="how_to_reg"
            accentColor="violet"
          />
          <BentoCard
            title="Ocupación Global"
            value={`${avgOccupancy}%`}
            subtitle={`${instructors.length} instructores registrados`}
            icon="monitoring"
            accentColor="amber"
          />
        </div>

        {/* Section 1: Workshops Management Table with Sticky Actions & Lateral Scroll Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Top Controls Bar */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Talleres Programados e Integrantes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Selecciona cualquier taller para ver sus integrantes, generar el reporte de inscripción del curso o descargar constancias en PDF.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Tabs: Todos vs Mis Cursos */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTableFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    tableFilter === "all"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Todos ({workshops.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter("mine")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    tableFilter === "mine"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Mis Cursos ({myWorkshopsCount})
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <span className="material-symbols-outlined text-slate-400 text-base absolute left-3 top-1/2 -translate-y-1/2">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar taller o código..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 w-44 sm:w-52"
                />
              </div>

              {/* Lateral Scroll Navigation Buttons */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => scrollTableHorizontally("left")}
                  className="w-7 h-7 rounded-lg hover:bg-white hover:shadow-xs flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                  title="Desplazar tabla a la izquierda"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollTableHorizontally("right")}
                  className="w-7 h-7 rounded-lg hover:bg-white hover:shadow-xs flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                  title="Desplazar tabla a la derecha"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>

              <button
                onClick={loadData}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Actualizar
              </button>
            </div>
          </div>

          {/* Scrollable Table Container with Sticky Right Column */}
          <div ref={tableScrollRef} className="overflow-x-auto scroll-smooth">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 pl-6 pr-4 min-w-[230px]">Código / Taller</th>
                  <th className="py-3.5 px-3 min-w-[160px]">Instructor</th>
                  <th className="py-3.5 px-3 min-w-[125px]">Fecha y Horario</th>
                  <th className="py-3.5 px-3 min-w-[120px]">Especialidad</th>
                  <th className="py-3.5 px-3 min-w-[140px]">Ocupación</th>
                  <th className="py-3.5 pl-3 pr-6 text-right sticky right-0 bg-slate-50/95 backdrop-blur-sm z-10 shadow-[-6px_0_12px_rgba(15,23,42,0.03)]">
                    Integrantes y Reporte
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedWorkshops.map((w) => {
                  const occupied = w.activeEnrollmentsCount;
                  const percent = w.capacity > 0 ? Math.round((occupied / w.capacity) * 100) : 0;

                  return (
                    <tr key={w.id} className="group hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pl-6 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                            {w.code}
                          </span>
                          <span className="font-bold text-slate-900 line-clamp-1">{w.title}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 max-w-[280px] truncate">
                          {w.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        <span className="line-clamp-1">{w.instructorName}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {new Date(w.startDateTime).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(w.startDateTime).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(w.endDateTime).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                          {w.instructorSpecialty || "General"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden shrink-0">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, percent)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {occupied}/{w.capacity} ({percent}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50/95 backdrop-blur-sm z-10 shadow-[-6px_0_12px_rgba(15,23,42,0.03)]">
                        <button
                          onClick={() => handleOpenAttendance(w)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-semibold text-xs transition-all cursor-pointer border border-indigo-100"
                        >
                          <span className="material-symbols-outlined text-base">groups</span>
                          <span>Integrantes y Reporte ({occupied})</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Excel Import & Top Workshops Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Excel Import Box (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-xl">
                  upload_file
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Carga Masiva de Inscripciones (Excel)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Endpoint{" "}
                <code className="font-mono text-indigo-700">POST /api/v1/enrollments/import</code>.
                Sube un archivo <code className="font-mono">.xlsx</code> con los códigos de taller y correos de participantes.
              </p>
            </div>

            <form onSubmit={handleExcelUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="excelFile"
                  accept=".xlsx, .xls"
                  onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="excelFile" className="cursor-pointer block">
                  <span className="material-symbols-outlined text-4xl text-slate-400">
                    cloud_upload
                  </span>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {excelFile ? excelFile.name : "Haz clic para seleccionar un archivo .xlsx"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Columnas esperadas: WorkshopCode, ParticipantEmail, ParticipantName (opcional)
                  </p>
                </label>
              </div>

              <button
                type="submit"
                disabled={!excelFile || isImporting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  {isImporting ? "sync" : "cloud_sync"}
                </span>
                {isImporting ? "Procesando Inscripciones..." : "Procesar Archivo Excel"}
              </button>
            </form>

            {importResult && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700">Total de Filas Leídas:</span>
                  <span>{importResult.totalRows}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-emerald-700">Inscripciones Exitosas:</span>
                  <span>{importResult.successfulCount}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-rose-700">Inscripciones Rechazadas:</span>
                  <span>{importResult.rejectedCount}</span>
                </div>

                {importResult.rejectedDetails && importResult.rejectedDetails.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <p className="font-semibold text-slate-700">Detalle de Rechazos:</p>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 max-h-40 overflow-y-auto">
                      {importResult.rejectedDetails.map((r, i) => (
                        <li key={i}>
                          <strong>Fila {r.rowNumber}</strong> [{r.workshopCode || "Sin código"} ·{" "}
                          {r.participantEmail || "Sin correo"}]: {r.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top Workshops Demand KPI (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-xl">
                  leaderboard
                </span>
                <h3 className="text-base font-bold text-slate-900">Talleres Más Demandados</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Endpoint{" "}
                <code className="font-mono text-indigo-700">
                  GET /api/v1/reports/top-workshops
                </code>
                . Ranking por inscripciones activas y porcentaje de ocupación.
              </p>
            </div>

            <div className="space-y-4">
              {topWorkshops.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No hay datos de demanda disponibles.
                </p>
              ) : (
                topWorkshops.map((t, idx) => (
                  <div key={t.workshopId || idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold gap-2">
                      <span className="text-slate-800 truncate">
                        {idx + 1}. [{t.code}] {t.title}
                      </span>
                      <span className="text-indigo-600 font-bold shrink-0">
                        {t.activeEnrollmentsCount}/{t.capacity} ({t.occupancyRate}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Instructor: {t.instructorName}</span>
                      <span>
                        {new Date(t.startDateTime).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, t.occupancyRate)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Crear Taller */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Publicar Nuevo Taller"
      >
        <form onSubmit={handleCreateWorkshop} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Código del Taller
              </label>
              <input
                type="text"
                required
                placeholder="Ej. DEV-005"
                value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cupo Máximo
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={createForm.capacity}
                onChange={(e) =>
                  setCreateForm({ ...createForm, capacity: parseInt(e.target.value) || 20 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Instructor Asignado
            </label>
            {instructors.length > 0 ? (
              <select
                value={createForm.instructorEmail}
                onChange={(e) => setCreateForm({ ...createForm, instructorEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.email}>
                    {inst.fullName} ({inst.specialty || "General"}) — {inst.email}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="email"
                required
                placeholder="correo@instructor.com"
                value={createForm.instructorEmail}
                onChange={(e) => setCreateForm({ ...createForm, instructorEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Título del Taller
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Arquitectura Limpia con .NET 10"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descripción y Objetivos
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe los temas que se abordarán en el taller..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fecha y Hora de Inicio
              </label>
              <input
                type="datetime-local"
                required
                value={createForm.startDateTime}
                onChange={(e) => setCreateForm({ ...createForm, startDateTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fecha y Hora de Fin
              </label>
              <input
                type="datetime-local"
                required
                value={createForm.endDateTime}
                onChange={(e) => setCreateForm({ ...createForm, endDateTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? "Guardando..." : "Publicar Taller"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Integrantes del Curso, Reporte de Inscripción y Constancias PDF */}
      <Modal
        isOpen={Boolean(selectedWorkshopForAttendance)}
        onClose={() => {
          setSelectedWorkshopForAttendance(null);
          setPreviewStudentCert(null);
        }}
        title={`Integrantes y Reporte: ${selectedWorkshopForAttendance?.code || ""} · ${
          selectedWorkshopForAttendance?.title || ""
        }`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-5">
          {/* Course Summary & Report Actions Header */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-900">
                  Instructor: {selectedWorkshopForAttendance?.instructorName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-bold">
                  {attendanceList.filter((a) => a.status === 1).length} integrantes activos
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  {attendanceList.filter((a) => a.status === 2).length} cancelados
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Puedes exportar el reporte general de inscritos en CSV/Excel o generar la constancia individual en PDF para cualquier integrante.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {attendanceList.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCourseReportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Descargar Reporte (CSV/Excel)
                </button>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Imprimir Planilla
              </button>
            </div>
          </div>

          {/* Inline Certificate Preview if an Integrante's preview is toggled */}
          {previewStudentCert && selectedWorkshopForAttendance && (
            <div className="bg-indigo-50/50 rounded-2xl border border-indigo-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">visibility</span>
                  Vista previa de constancia: {previewStudentCert.participantName}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewStudentCert(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Ocultar vista previa ✕
                </button>
              </div>
              <DiplomaMockup
                participantName={previewStudentCert.participantName}
                participantEmail={previewStudentCert.participantEmail}
                workshopCode={selectedWorkshopForAttendance.code}
                workshopTitle={selectedWorkshopForAttendance.title}
                instructorName={selectedWorkshopForAttendance.instructorName}
                startDateTime={selectedWorkshopForAttendance.startDateTime}
                endDateTime={selectedWorkshopForAttendance.endDateTime}
                enrolledAt={previewStudentCert.enrolledAt}
                enrollmentId={previewStudentCert.enrollmentId}
              />
            </div>
          )}

          {/* Integrantes List */}
          {isLoadingAttendance ? (
            <p className="text-center py-8 text-sm text-slate-400">
              Cargando lista de integrantes...
            </p>
          ) : attendanceList.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-400">
              Aún no hay alumnos inscritos en este taller.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-200/80 rounded-xl bg-white px-4">
              {attendanceList.map((item, idx) => {
                const isActive = item.status === 1;
                const isProcessing = processingEnrollmentId === item.enrollmentId;
                const isPreviewing = previewStudentCert?.enrollmentId === item.enrollmentId;

                return (
                  <div
                    key={item.enrollmentId || idx}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.participantName}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isActive ? "Activa" : "Cancelada"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{item.participantEmail}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Inscrito:{" "}
                          {new Date(item.enrolledAt).toLocaleString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {!isActive && item.cancelledBy && (
                            <span className="ml-2 text-rose-600">
                              · Cancelado por{" "}
                              {item.cancelledBy === "Employee" ? "Empleado" : "Participante"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewStudentCert(isPreviewing ? null : item)
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isPreviewing
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                          title="Previsualizar constancia de este integrante"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          {isPreviewing ? "Ocultar" : "Ver Constancia"}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            handleEmployeeDownloadCertificate(item.enrollmentId)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                          title="Descargar constancia PDF del integrante"
                        >
                          <span className="material-symbols-outlined text-sm">
                            picture_as_pdf
                          </span>
                          Descargar PDF
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleEmployeeCancelEnrollment(item.enrollmentId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                          title="Cancelar inscripción (Empleado)"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          Cancelar Cupo
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
