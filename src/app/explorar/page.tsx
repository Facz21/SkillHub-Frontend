"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Workshop } from "@/types/workshop";
import { workshopService } from "@/services/workshopService";
import { enrollmentService } from "@/services/enrollmentService";
import { WorkshopCard } from "@/components/features/workshops/WorkshopCard";
import { WorkshopFilters } from "@/components/features/workshops/WorkshopFilters";
import { EnrollModal } from "@/components/features/workshops/EnrollModal";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function ExplorarPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [enrolledWorkshopIds, setEnrolledWorkshopIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("upcoming");

  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Detail modal state (GET /api/v1/workshops/{id})
  const [detailWorkshop, setDetailWorkshop] = useState<Workshop | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const fetchCatalogData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await workshopService.getWorkshops();
      setWorkshops(data);

      if (isAuthenticated && user?.role === "Participant") {
        const myEnrollments = await enrollmentService.getMyEnrollments().catch(() => []);
        const activeIds = new Set(
          myEnrollments.filter((e) => e.status === 1).map((e) => e.workshopId)
        );
        setEnrolledWorkshopIds(activeIds);
      } else {
        setEnrolledWorkshopIds(new Set());
      }
    } catch (err: unknown) {
      console.error("Error al cargar talleres:", err);
      addToast("error", "No se pudo conectar con el catálogo de talleres.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.role, addToast]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  const filteredWorkshops = useMemo(() => {
    return workshops
      .filter((w) => {
        const specialty = w.instructorSpecialty || "";
        const matchesCategory =
          selectedCategory === "all" ||
          !selectedCategory ||
          specialty.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          w.title.toLowerCase().includes(selectedCategory.toLowerCase());

        const matchesSearch =
          w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.instructorName.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "upcoming" || sortBy === "date") {
          return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
        }
        if (sortBy === "seats" || sortBy === "available") {
          return b.availableSeats - a.availableSeats;
        }
        if (sortBy === "popular") {
          return b.activeEnrollmentsCount - a.activeEnrollmentsCount;
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [workshops, selectedCategory, searchQuery, sortBy]);

  const handleOpenEnroll = (workshop: Workshop) => {
    if (!isAuthenticated || !user) {
      addToast("info", "Inicia sesión como participante para inscribirte en el taller.");
      openAuthModal("login");
      return;
    }
    if (user.role === "Employee") {
      addToast(
        "warning",
        "Tu cuenta actual tiene rol de Instructor (Employee). Cambia a una cuenta de Participante para inscribirte."
      );
      return;
    }
    setSelectedWorkshop(workshop);
    setIsEnrollModalOpen(true);
  };

  const handleViewDetails = async (workshop: Workshop) => {
    setDetailWorkshop(workshop);
    try {
      setIsDetailLoading(true);
      const fresh = await workshopService.getWorkshopById(workshop.id);
      setDetailWorkshop(fresh);
    } catch {
      // Keep cached workshop data if endpoint fails
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleConfirmEnroll = async () => {
    if (!selectedWorkshop) return;
    try {
      setIsEnrolling(true);
      const res = await enrollmentService.enroll(selectedWorkshop.id);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#4f46e5", "#7c3aed", "#10b981", "#f59e0b"],
      });

      addToast(
        "success",
        `¡Inscripción exitosa en ${res.workshopTitle} (${res.workshopCode})!`
      );
      setIsEnrollModalOpen(false);
      setSelectedWorkshop(null);

      await fetchCatalogData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al procesar inscripción.";
      addToast("error", errorMsg);
    } finally {
      setIsEnrolling(false);
    }
  };

  const totalSeatsLeft = workshops.reduce((acc, w) => acc + w.availableSeats, 0);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Catalog Header Banner without overlap */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">event_available</span>
                Catálogo Sincronizado con Base de Datos
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                Catálogo de Talleres Próximos
              </h1>
              <p className="text-slate-300 max-w-xl text-sm sm:text-base">
                Consulta talleres con fecha futura, verifica disponibilidad de cupos en tiempo real e inscríbete sin cruces de horario.
              </p>
            </div>

            {/* Real Database Stats Strip */}
            <div className="flex items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 self-start md:self-auto">
              <div>
                <p className="text-2xl font-bold text-white">{workshops.length}</p>
                <p className="text-[11px] text-indigo-200 uppercase font-medium">Talleres</p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{totalSeatsLeft}</p>
                <p className="text-[11px] text-indigo-200 uppercase font-medium">Cupos Libres</p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div>
                <p className="text-2xl font-bold text-amber-400">24h</p>
                <p className="text-[11px] text-indigo-200 uppercase font-medium">Límite Baja</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area (clean spacing, no negative margin overlap) */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <WorkshopFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortMode={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Status Indicator Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-1 text-sm text-slate-500">
          <div>
            Mostrando <span className="font-semibold text-slate-800">{filteredWorkshops.length}</span> talleres disponibles
            {searchQuery && <span> para &ldquo;{searchQuery}&rdquo;</span>}
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Cupos Libres
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Últimos Cupos (&le; 3)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Agotado
            </span>
          </div>
        </div>

        {/* Loading Skeleton State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
                <div className="h-44 bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                <div className="h-10 bg-slate-200 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredWorkshops.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <span className="material-symbols-outlined text-5xl text-slate-400">search_off</span>
            <h3 className="mt-3 text-lg font-semibold text-slate-800">No encontramos talleres que coincidan</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Intenta ajustar tus filtros de búsqueda o categoría para ver otros resultados disponibles.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 rounded-lg transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        )}

        {/* Workshops Grid */}
        {!isLoading && filteredWorkshops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                isEnrolled={enrolledWorkshopIds.has(workshop.id)}
                onEnroll={handleOpenEnroll}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>

      {/* Enroll Confirmation Modal */}
      <EnrollModal
        workshop={selectedWorkshop}
        isOpen={isEnrollModalOpen}
        onClose={() => {
          setIsEnrollModalOpen(false);
          setSelectedWorkshop(null);
        }}
        onConfirm={handleConfirmEnroll}
        isLoading={isEnrolling}
      />

      {/* Workshop Detail Modal (GET /api/v1/workshops/{id}) */}
      <Modal
        isOpen={Boolean(detailWorkshop)}
        onClose={() => setDetailWorkshop(null)}
        title={detailWorkshop ? `${detailWorkshop.code} — ${detailWorkshop.title}` : "Detalle del Taller"}
        maxWidth="max-w-xl"
      >
        {detailWorkshop && (
          <div className="space-y-4 text-sm">
            {isDetailLoading && (
              <p className="text-xs text-indigo-600 font-medium">Sincronizando datos actualizados...</p>
            )}
            <p className="text-slate-600 leading-relaxed">{detailWorkshop.description}</p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Código Único:</span>
                <span className="font-mono font-bold text-indigo-700">{detailWorkshop.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Instructor Titular:</span>
                <span className="font-semibold text-slate-900">{detailWorkshop.instructorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Correo Instructor:</span>
                <span className="font-medium text-slate-700">{detailWorkshop.instructorEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Especialidad:</span>
                <span className="font-medium text-slate-800">
                  {detailWorkshop.instructorSpecialty || "General"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inicio Programado:</span>
                <span className="font-semibold text-slate-900">
                  {new Date(detailWorkshop.startDateTime).toLocaleString("es-ES")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Finalización:</span>
                <span className="font-semibold text-slate-900">
                  {new Date(detailWorkshop.endDateTime).toLocaleString("es-ES")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ocupación Actual:</span>
                <span className="font-bold text-emerald-700">
                  {detailWorkshop.activeEnrollmentsCount} inscritos / {detailWorkshop.capacity} cupos ({detailWorkshop.availableSeats} disponibles)
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDetailWorkshop(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cerrar
              </button>
              {user?.role === "Employee" ? (
                <Link
                  href={`/instructor?workshopId=${detailWorkshop.id}`}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">groups</span>
                  Ver Integrantes y Reporte
                </Link>
              ) : (
                !enrolledWorkshopIds.has(detailWorkshop.id) &&
                detailWorkshop.availableSeats > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const w = detailWorkshop;
                      setDetailWorkshop(null);
                      handleOpenEnroll(w);
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm cursor-pointer"
                  >
                    Inscribirme en este Taller
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
