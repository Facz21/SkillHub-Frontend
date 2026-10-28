"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DiplomaMockup } from "@/components/features/certificates/DiplomaMockup";
import { enrollmentService } from "@/services/enrollmentService";
import { workshopService } from "@/services/workshopService";
import { Enrollment, WorkshopEnrollmentDetail } from "@/types/enrollment";
import { Workshop } from "@/types/workshop";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function CertificadosPage() {
  const { user, isEmployee, openAuthModal, loginAsDemo } = useAuth();
  const { addToast } = useToast();

  // Participant state
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");

  // Instructor (Employee) state
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [courseFilter, setCourseFilter] = useState<"mine" | "all">("mine");
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [courseStudents, setCourseStudents] = useState<WorkshopEnrollmentDetail[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<WorkshopEnrollmentDetail | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load data depending on role
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        if (isEmployee) {
          const allWorkshops = await workshopService.getWorkshops();
          setWorkshops(allWorkshops);

          const myWorkshops = allWorkshops.filter(
            (w) =>
              w.instructorEmail.toLowerCase() === user.email.toLowerCase() ||
              w.instructorName.toLowerCase() === user.fullName.toLowerCase()
          );

          const initialList = myWorkshops.length > 0 ? myWorkshops : allWorkshops;
          if (myWorkshops.length === 0) {
            setCourseFilter("all");
          }
          const firstWorkshop =
            initialList.find((w) => w.activeEnrollmentsCount > 0) || initialList[0] || null;
          setSelectedWorkshop(firstWorkshop);
        } else {
          const data = await enrollmentService.getMyEnrollments();
          const activeEnrollments = data.filter((e) => e.status === 1);
          setEnrollments(activeEnrollments);
          setSelectedEnrollment(activeEnrollments[0] || null);
        }
      } catch (err: unknown) {
        console.error("Error cargando datos de constancias:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user, isEmployee]);

  // Load students when Instructor selects a workshop
  useEffect(() => {
    const loadStudents = async () => {
      if (!isEmployee || !selectedWorkshop) {
        setCourseStudents([]);
        setSelectedStudent(null);
        return;
      }
      try {
        setIsLoadingStudents(true);
        const list = await workshopService.getWorkshopEnrollments(selectedWorkshop.id);
        setCourseStudents(list);
        const firstActive = list.find((s) => s.status === 1) || null;
        setSelectedStudent(firstActive);
      } catch (err: unknown) {
        console.error("Error cargando integrantes del curso:", err);
        setCourseStudents([]);
        setSelectedStudent(null);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    loadStudents();
  }, [isEmployee, selectedWorkshop]);

  // Filtered list for Participant
  const filteredParticipantEnrollments = useMemo(() => {
    if (!participantSearch.trim()) return enrollments;
    const q = participantSearch.toLowerCase();
    return enrollments.filter(
      (e) =>
        e.workshopTitle.toLowerCase().includes(q) ||
        e.workshopCode.toLowerCase().includes(q) ||
        e.instructorName.toLowerCase().includes(q)
    );
  }, [enrollments, participantSearch]);

  // Filtered workshops for Instructor
  const displayedInstructorWorkshops = useMemo(() => {
    if (!user) return workshops;
    if (courseFilter === "mine") {
      return workshops.filter(
        (w) =>
          w.instructorEmail.toLowerCase() === user.email.toLowerCase() ||
          w.instructorName.toLowerCase() === user.fullName.toLowerCase()
      );
    }
    return workshops;
  }, [workshops, courseFilter, user]);

  // Carousel Previous / Next for Participant
  const currentParticipantIndex = useMemo(() => {
    if (!selectedEnrollment) return -1;
    return filteredParticipantEnrollments.findIndex((e) => e.id === selectedEnrollment.id);
  }, [filteredParticipantEnrollments, selectedEnrollment]);

  const handlePrevCertificate = () => {
    if (filteredParticipantEnrollments.length <= 1) return;
    const nextIdx =
      currentParticipantIndex > 0
        ? currentParticipantIndex - 1
        : filteredParticipantEnrollments.length - 1;
    setSelectedEnrollment(filteredParticipantEnrollments[nextIdx]);
  };

  const handleNextCertificate = () => {
    if (filteredParticipantEnrollments.length <= 1) return;
    const nextIdx =
      currentParticipantIndex < filteredParticipantEnrollments.length - 1
        ? currentParticipantIndex + 1
        : 0;
    setSelectedEnrollment(filteredParticipantEnrollments[nextIdx]);
  };

  // Download PDF handler (works for both Participant and Instructor)
  const handleDownloadPdf = async (enrollmentId: number, code: string) => {
    try {
      setIsDownloading(true);
      await enrollmentService.downloadCertificate(enrollmentId);
      addToast("success", `Constancia oficial (${code}) descargada en formato PDF.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al descargar constancia.";
      addToast("error", msg);
    } finally {
      setIsDownloading(false);
    }
  };

  // Export Course Enrollment Report (CSV / Excel compatible) for Instructor
  const handleExportCourseReportCsv = () => {
    if (!selectedWorkshop) return;
    const headers = [
      "ID Inscripcion",
      "Codigo Taller",
      "Taller",
      "Instructor",
      "Nombre Integrante",
      "Correo Integrante",
      "Estado",
      "Fecha Inscripcion",
      "Cancelado Por",
    ];
    const rows = courseStudents.map((s) => [
      s.enrollmentId,
      `"${selectedWorkshop.code}"`,
      `"${selectedWorkshop.title.replace(/"/g, '""')}"`,
      `"${selectedWorkshop.instructorName.replace(/"/g, '""')}"`,
      `"${s.participantName.replace(/"/g, '""')}"`,
      `"${s.participantEmail}"`,
      s.status === 1 ? "Activa" : "Cancelada",
      `"${new Date(s.enrolledAt).toLocaleString("es-CO")}"`,
      `"${s.cancelledBy || "-"}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-inscripciones-${selectedWorkshop.code.toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();

    addToast(
      "success",
      `Reporte de inscripción de ${selectedWorkshop.code} exportado correctamente.`
    );
  };

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50/60">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">workspace_premium</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Consulta tus Constancias PDF</h2>
          <p className="mt-2 text-sm text-slate-500">
            Inicia sesión para previsualizar y descargar tus constancias oficiales de inscripción generadas por QuestPDF.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => openAuthModal("login")}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => loginAsDemo("participant")}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              Probar Demo Participante
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // INSTRUCTOR VIEW: Course Participants & Certificate / Enrollment Report Generator
  // ============================================================================
  if (isEmployee) {
    const activeStudents = courseStudents.filter((s) => s.status === 1);

    return (
      <div className="min-h-screen bg-slate-50/60 pb-24">
        {/* Header Banner */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  Módulo Docente de Reportes y Constancias
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Integrantes y Constancias por Curso
                </h1>
                <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-2xl">
                  Selecciona cualquiera de tus talleres para consultar sus integrantes inscritos, exportar el reporte oficial de inscripción del curso o emitir constancias individuales en PDF.
                </p>
              </div>

              {/* Filter Toggle: Mis Cursos vs Todos */}
              <div className="inline-flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCourseFilter("mine");
                    const mine = workshops.filter(
                      (w) =>
                        w.instructorEmail.toLowerCase() === user.email.toLowerCase() ||
                        w.instructorName.toLowerCase() === user.fullName.toLowerCase()
                    );
                    if (mine.length > 0) setSelectedWorkshop(mine[0]);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    courseFilter === "mine"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-200 hover:text-white"
                  }`}
                >
                  Mis Cursos Dictados
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourseFilter("all");
                    if (!selectedWorkshop && workshops.length > 0) {
                      setSelectedWorkshop(workshops[0]);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    courseFilter === "all"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-200 hover:text-white"
                  }`}
                >
                  Todos los Talleres ({workshops.length})
                </button>
              </div>
            </div>
          </div>
        </section>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-sm text-slate-500">Sincronizando cursos e integrantes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (5 cols): Course Selector + Integrantes List */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Course Selector Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-600 text-lg">
                        school
                      </span>
                      1. Seleccionar Curso ({displayedInstructorWorkshops.length})
                    </h2>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {displayedInstructorWorkshops.map((w) => {
                      const isSelected = selectedWorkshop?.id === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setSelectedWorkshop(w)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-indigo-50/80 border-indigo-600 ring-1 ring-indigo-600/30"
                              : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                                  isSelected
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {w.code}
                              </span>
                              <span className="text-xs text-slate-500 truncate">
                                {new Date(w.startDateTime).toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 truncate mt-1">
                              {w.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              Instructor: {w.instructorName}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                w.activeEnrollmentsCount > 0
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">groups</span>
                              {w.activeEnrollmentsCount}/{w.capacity}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Course Participants ("Integrantes del Curso") & Course Report Actions */}
                {selectedWorkshop && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-lg">
                            groups
                          </span>
                          2. Integrantes ({activeStudents.length} activos)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Haz clic en un integrante para previsualizar o descargar su constancia.
                        </p>
                      </div>

                      {courseStudents.length > 0 && (
                        <button
                          type="button"
                          onClick={handleExportCourseReportCsv}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                          title="Descargar reporte completo de inscritos del curso en formato CSV/Excel"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          Reporte Curso (CSV)
                        </button>
                      )}
                    </div>

                    {isLoadingStudents ? (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        Cargando integrantes del curso...
                      </p>
                    ) : courseStudents.length === 0 ? (
                      <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <span className="material-symbols-outlined text-3xl text-slate-400">
                          person_off
                        </span>
                        <p className="text-xs font-semibold text-slate-700 mt-2">
                          Este taller aún no tiene integrantes inscritos
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Selecciona otro taller con cupos ocupados para ver sus integrantes y generar constancias.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                        {courseStudents.map((student, idx) => {
                          const isActive = student.status === 1;
                          const isSelected =
                            selectedStudent?.enrollmentId === student.enrollmentId;

                          return (
                            <div
                              key={student.enrollmentId}
                              onClick={() => {
                                if (isActive) setSelectedStudent(student);
                              }}
                              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                !isActive
                                  ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600/20 cursor-pointer"
                                  : "bg-white border-slate-200 hover:bg-slate-50 cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    isSelected
                                      ? "bg-indigo-600 text-white"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-slate-900 truncate">
                                      {student.participantName}
                                    </p>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        isActive
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-rose-50 text-rose-700"
                                      }`}
                                    >
                                      {isActive ? "Activo" : "Cancelado"}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate">
                                    {student.participantEmail}
                                  </p>
                                </div>
                              </div>

                              {isActive && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStudent(student);
                                    handleDownloadPdf(
                                      student.enrollmentId,
                                      selectedWorkshop.code
                                    );
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                                  title="Descargar Constancia PDF de este integrante"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    picture_as_pdf
                                  </span>
                                  PDF
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column (7 cols): Live Certificate Preview for Selected Student */}
              <div className="lg:col-span-7 space-y-6">
                {selectedWorkshop && selectedStudent ? (
                  <>
                    {/* Top Action Bar */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                          Vista Previa de Constancia Individual
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {selectedStudent.participantName} — {selectedWorkshop.code}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadPdf(
                              selectedStudent.enrollmentId,
                              selectedWorkshop.code
                            )
                          }
                          disabled={isDownloading}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-base">
                            {isDownloading ? "progress_activity" : "download"}
                          </span>
                          {isDownloading
                            ? "Generando PDF..."
                            : `Descargar Constancia PDF (#${selectedStudent.enrollmentId})`}
                        </button>
                      </div>
                    </div>

                    <DiplomaMockup
                      participantName={selectedStudent.participantName}
                      participantEmail={selectedStudent.participantEmail}
                      workshopCode={selectedWorkshop.code}
                      workshopTitle={selectedWorkshop.title}
                      instructorName={selectedWorkshop.instructorName}
                      startDateTime={selectedWorkshop.startDateTime}
                      endDateTime={selectedWorkshop.endDateTime}
                      enrolledAt={selectedStudent.enrolledAt}
                      enrollmentId={selectedStudent.enrollmentId}
                    />
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-3xl">
                        workspace_premium
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Selecciona un curso con integrantes activos
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Elige cualquiera de los talleres en el panel izquierdo y haz clic sobre un integrante activo para previsualizar y descargar su constancia de inscripción en PDF.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ============================================================================
  // PARTICIPANT VIEW: Master-Detail Certificate Explorer (No horizontal cutoff!)
  // ============================================================================
  const totalAcademicHours = enrollments.reduce((acc, e) => {
    const start = new Date(e.startDateTime);
    const end = new Date(e.endDateTime);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
      return acc + diff;
    }
    return acc + 2;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                Generación Oficial QuestPDF
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Mis Constancias de Inscripción
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-xl">
                Selecciona cualquiera de tus talleres inscritos en la lista lateral o usa los controles de navegación para visualizar y descargar tu documento oficial en PDF.
              </p>
            </div>

            {/* Real Metrics */}
            <div className="flex items-center gap-5 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 self-start md:self-auto">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{enrollments.length}</p>
                <p className="text-[11px] text-indigo-200 uppercase font-semibold">
                  Constancias Activas
                </p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-300">{totalAcademicHours} hrs</p>
                <p className="text-[11px] text-indigo-200 uppercase font-semibold">
                  Horas Programadas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-sm text-slate-500">Cargando tus constancias disponibles...</p>
          </div>
        ) : enrollments.length === 0 || !selectedEnrollment ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">workspace_premium</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No tienes inscripciones activas para generar constancia
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              El backend genera constancias PDF únicamente para inscripciones con estado Activo. Inscríbete en un taller del catálogo para obtener tu constancia inmediata.
            </p>
            <Link
              href="/explorar"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Explorar Talleres Disponibles
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (4 cols): Vertical Selector List (No horizontal scrollbar cutoff!) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Talleres Acreditados ({enrollments.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Elige un taller para ver su constancia
                  </p>
                </div>

                {/* Prev / Next quick buttons */}
                {filteredParticipantEnrollments.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevCertificate}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                      title="Constancia anterior"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextCertificate}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                      title="Siguiente constancia"
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>
                )}
              </div>

              {enrollments.length > 3 && (
                <div className="relative">
                  <span className="material-symbols-outlined text-slate-400 text-base absolute left-3 top-1/2 -translate-y-1/2">
                    search
                  </span>
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Filtrar por nombre o código..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              )}

              {/* Vertical Cards List */}
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {filteredParticipantEnrollments.map((e) => {
                  const isSelected = selectedEnrollment.id === e.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelectedEnrollment(e)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                          : "bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200/80"
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {e.workshopCode}
                          </span>
                          <span
                            className={`text-[11px] font-medium ${
                              isSelected ? "text-indigo-100" : "text-slate-500"
                            }`}
                          >
                            {new Date(e.startDateTime).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p
                          className={`text-sm font-bold leading-snug ${
                            isSelected ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {e.workshopTitle}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isSelected ? "text-indigo-100" : "text-slate-500"
                          }`}
                        >
                          Instructor: {e.instructorName}
                        </p>
                      </div>

                      <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">
                        {isSelected ? "check_circle" : "workspace_premium"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column (8 cols): Action Bar + Live DiplomaMockup + Metadata */}
            <div className="lg:col-span-8 space-y-6">
              {/* Top Action & Navigation Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {filteredParticipantEnrollments.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevCertificate}
                        className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                        title="Anterior"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextCertificate}
                        className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                        title="Siguiente"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] font-bold uppercase text-indigo-600 tracking-wider block">
                      Constancia {currentParticipantIndex + 1} de{" "}
                      {filteredParticipantEnrollments.length}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedEnrollment.workshopCode} · {selectedEnrollment.workshopTitle}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDownloadPdf(selectedEnrollment.id, selectedEnrollment.workshopCode)
                  }
                  disabled={isDownloading}
                  className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <span className="material-symbols-outlined text-lg">
                    {isDownloading ? "progress_activity" : "download"}
                  </span>
                  <span>
                    {isDownloading
                      ? "Generando PDF..."
                      : `Descargar constancia-${selectedEnrollment.workshopCode.toLowerCase()}.pdf`}
                  </span>
                </button>
              </div>

              {/* Exact QuestPDF Certificate Preview */}
              <DiplomaMockup
                participantName={user.fullName}
                participantEmail={user.email}
                workshopCode={selectedEnrollment.workshopCode}
                workshopTitle={selectedEnrollment.workshopTitle}
                instructorName={selectedEnrollment.instructorName}
                startDateTime={selectedEnrollment.startDateTime}
                endDateTime={selectedEnrollment.endDateTime}
                enrolledAt={selectedEnrollment.enrolledAt}
                enrollmentId={selectedEnrollment.id}
              />

              {/* Compact Technical Metadata Footer Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    ID Inscripción
                  </span>
                  <span className="font-mono font-bold text-indigo-700 mt-0.5 block">
                    #{selectedEnrollment.id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Código Taller
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {selectedEnrollment.workshopCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Fecha Matrícula
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {new Date(selectedEnrollment.enrolledAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Estado en BD
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Activa · Verificada
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
