"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Enrollment } from "@/types/enrollment";
import { enrollmentService } from "@/services/enrollmentService";
import { EnrollmentCard } from "@/components/features/enrollments/EnrollmentCard";
import { CancellationDrawer } from "@/components/features/enrollments/CancellationDrawer";
import { BentoCard } from "@/components/ui/BentoCard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

type TabType = "active" | "cancelled";

export default function MisInscripcionesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [selectedEnrollmentForCancel, setSelectedEnrollmentForCancel] = useState<Enrollment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const { user, isAuthenticated, isEmployee, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await enrollmentService.getMyEnrollments();
      setEnrollments(data);
    } catch (err: unknown) {
      console.error("Error al cargar inscripciones:", err);
      addToast("error", "No pudimos cargar tus inscripciones.");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (isEmployee) {
      router.replace("/instructor");
      return;
    }
    if (isAuthenticated && user?.role === "Participant") {
      fetchEnrollments();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, isEmployee, user?.role, fetchEnrollments, router]);

  const activeCount = useMemo(
    () => enrollments.filter((e) => e.status === 1).length,
    [enrollments]
  );
  const cancelledCount = useMemo(
    () => enrollments.filter((e) => e.status === 2).length,
    [enrollments]
  );

  const displayedEnrollments = useMemo(() => {
    if (activeTab === "active") {
      return enrollments.filter((e) => e.status === 1);
    }
    return enrollments.filter((e) => e.status === 2);
  }, [enrollments, activeTab]);

  const handleCancelClick = (enrollment: Enrollment) => {
    setSelectedEnrollmentForCancel(enrollment);
  };

  const handleConfirmCancel = async () => {
    if (!selectedEnrollmentForCancel) return;
    try {
      setIsCancelling(true);
      await enrollmentService.cancelEnrollment(selectedEnrollmentForCancel.id);
      addToast("success", "Inscripción cancelada exitosamente. Tu cupo ha sido liberado.");
      setSelectedEnrollmentForCancel(null);
      await fetchEnrollments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo cancelar la inscripción.";
      addToast("error", msg);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadCertificate = async (enrollmentId: number) => {
    try {
      addToast("info", "Generando constancia de inscripción en PDF...");
      await enrollmentService.downloadCertificate(enrollmentId);
      addToast("success", "Constancia PDF descargada exitosamente.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al descargar constancia.";
      addToast("error", msg);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Inicia sesión para ver tus inscripciones</h2>
          <p className="mt-2 text-sm text-slate-500">
            Accede a tus talleres reservados, cancela cupos hasta 24h antes y descarga tus constancias en PDF.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => openAuthModal("login")}
              className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Iniciar Sesión
            </button>
            <Link
              href="/explorar"
              className="w-full py-2.5 px-4 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
            >
              Explorar Catálogo Público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isEmployee) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* 24h Policy Banner */}
      <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-3 text-amber-900 text-xs sm:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
            <span>
              <strong>Regla de Negocio (24h):</strong> Puedes cancelar tu inscripción hasta 24 horas antes de la fecha y hora de inicio del taller.
            </span>
          </div>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            Control de Cupos
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Mis Inscripciones
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {user?.fullName}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Consulta tus talleres activos, descarga constancias oficiales en PDF o libera cupos oportunamente.
            </p>
          </div>

          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Inscribir Otro Taller
          </Link>
        </div>

        {/* 3 Bento Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 my-8">
          <BentoCard
            title="Inscripciones Activas"
            value={activeCount}
            subtitle="Con cupo confirmado en base de datos"
            icon="event_seat"
            badge="Activas"
            accentColor="primary"
          />
          <BentoCard
            title="Constancias PDF"
            value={activeCount}
            subtitle="Habilitadas para descarga inmediata"
            icon="description"
            badge="Disponibles"
            accentColor="emerald"
          />
          <BentoCard
            title="Inscripciones Canceladas"
            value={cancelledCount}
            subtitle="Cupos liberados en el historial"
            icon="history"
            badge="Canceladas"
            accentColor="amber"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === "active"
                ? "border-indigo-600 text-indigo-700 bg-indigo-50/40"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-lg">event_available</span>
            Inscripciones Activas
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-bold">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("cancelled")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === "cancelled"
                ? "border-indigo-600 text-indigo-700 bg-indigo-50/40"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-lg">cancel</span>
            Historial de Canceladas
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700 font-bold">
              {cancelledCount}
            </span>
          </button>
        </div>

        {/* Content Section */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        )}

        {!isLoading && displayedEnrollments.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <span className="material-symbols-outlined text-5xl text-slate-400">
              {activeTab === "active" ? "calendar_today" : "folder_open"}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-slate-800">
              {activeTab === "active"
                ? "No tienes inscripciones activas por el momento"
                : "No tienes cancelaciones registradas"}
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              {activeTab === "active"
                ? "Explora los talleres disponibles en el catálogo y reserva tu cupo."
                : "Las inscripciones que canceles se archivarán aquí."}
            </p>
            {activeTab === "active" && (
              <Link
                href="/explorar"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Explorar Talleres Disponibles
              </Link>
            )}
          </div>
        )}

        {!isLoading && displayedEnrollments.length > 0 && (
          <div className="flex flex-col gap-6">
            {displayedEnrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                onCancel={() => handleCancelClick(enrollment)}
                onDownloadCertificate={handleDownloadCertificate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Drawer */}
      <CancellationDrawer
        enrollment={selectedEnrollmentForCancel}
        isOpen={Boolean(selectedEnrollmentForCancel)}
        onClose={() => setSelectedEnrollmentForCancel(null)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}
