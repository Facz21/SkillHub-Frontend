"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Workshop } from "@/types/workshop";
import { workshopService } from "@/services/workshopService";
import { WorkshopCard } from "@/components/features/workshops/WorkshopCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        setIsLoading(true);
        const data = await workshopService.getWorkshops();
        setWorkshops(data);
      } catch (err) {
        console.error("Error cargando talleres en portada:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadWorkshops();
  }, []);

  const featuredWorkshop = workshops[0] || null;
  const totalAvailableSeats = workshops.reduce((acc, w) => acc + w.availableSeats, 0);
  const totalActiveEnrollments = workshops.reduce((acc, w) => acc + w.activeEnrollmentsCount, 0);
  const uniqueInstructors = new Set(workshops.map((w) => w.instructorEmail)).size;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistema de Gestión de Talleres e Inscripciones
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Reserva tu cupo en talleres prácticos con{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  expertos reales
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Explora la programación de talleres de SkillHub, inscríbete validando disponibilidad de cupos y cruces de horario en tiempo real, y descarga tu constancia oficial en PDF.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/explorar"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <span className="material-symbols-outlined text-xl">explore</span>
                  Explorar Catálogo ({workshops.length})
                </Link>
                <Link
                  href="/mentores"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-base shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-xl text-indigo-600">school</span>
                  Ver Directorio de Instructores
                </Link>
              </div>
            </div>

            {/* Right Column: Next Upcoming Real Workshop from Backend */}
            <div className="lg:col-span-5">
              {featuredWorkshop ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                        PRÓXIMO EN INICIAR
                      </span>
                      <span className="text-xs font-mono text-indigo-300">
                        {featuredWorkshop.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-300">
                      {featuredWorkshop.availableSeats}/{featuredWorkshop.capacity} cupos libres
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
                        {featuredWorkshop.instructorSpecialty || "Taller Práctico"}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {featuredWorkshop.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {featuredWorkshop.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Instructor asignado:</span>
                        <span className="font-semibold text-slate-900">
                          {featuredWorkshop.instructorName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Fecha de inicio:</span>
                        <span className="font-semibold text-slate-900">
                          {new Date(featuredWorkshop.startDateTime).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Inscritos activos:</span>
                        <span className="font-semibold text-emerald-700">
                          {featuredWorkshop.activeEnrollmentsCount} participantes
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/explorar"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors"
                    >
                      <span>Inscribirme en este Taller</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  {isLoading ? "Sincronizando próximo taller..." : "Explora el catálogo de talleres."}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Real Database Metrics Section */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">event_available</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{workshops.length}</p>
              <h3 className="text-sm font-bold text-slate-800 mt-1">Talleres Próximos</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Programados actualmente en base de datos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">event_seat</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{totalAvailableSeats}</p>
              <h3 className="text-sm font-bold text-slate-800 mt-1">Cupos Libres</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Disponibles para inscripción inmediata ({totalActiveEnrollments} ocupados).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">groups</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{uniqueInstructors}</p>
              <h3 className="text-sm font-bold text-slate-800 mt-1">Instructores Activos</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Docentes con talleres abiertos en cartelera.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">schedule</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">24 Horas</p>
              <h3 className="text-sm font-bold text-slate-800 mt-1">Regla de Cancelación</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cancelación permitida hasta 24h antes del inicio del taller.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview of Next 3 Real Workshops */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Cartelera en Tiempo Real
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Próximos Talleres a Iniciar
              </h2>
            </div>
            <Link
              href="/explorar"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>Ver todos los talleres</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {!isLoading && workshops.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.slice(0, 3).map((w) => (
                <WorkshopCard
                  key={w.id}
                  workshop={w}
                  onEnroll={() => router.push("/explorar")}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 bg-indigo-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gestiona tus inscripciones y descarga tus constancias en PDF
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/explorar"
              className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-slate-100 shadow"
            >
              Ir al Catálogo de Talleres
            </Link>
            {!user && (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-sm border border-indigo-400/30"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
