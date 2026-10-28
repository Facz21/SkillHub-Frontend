"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Workshop, InstructorSummary } from "@/types/workshop";
import { workshopService } from "@/services/workshopService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface RealMentorCard {
  name: string;
  email: string;
  specialty: string;
  workshops: Workshop[];
}

export default function MentoresPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [instructors, setInstructors] = useState<InstructorSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isEmployee } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const loadMentors = async () => {
      try {
        setIsLoading(true);
        const upcoming = await workshopService.getWorkshops();
        setWorkshops(upcoming);

        if (isEmployee) {
          const allInst = await workshopService.getInstructors().catch(() => []);
          setInstructors(allInst);
        }
      } catch (err: unknown) {
        console.error("Error al cargar instructores:", err);
        addToast("error", "No se pudo sincronizar el directorio de instructores.");
      } finally {
        setIsLoading(false);
      }
    };
    loadMentors();
  }, [isEmployee, addToast]);

  const mentorsList = useMemo(() => {
    const map = new Map<string, RealMentorCard>();

    // Populate from official instructors list if loaded (Employee)
    for (const inst of instructors) {
      map.set(inst.email.toLowerCase(), {
        name: inst.fullName,
        email: inst.email,
        specialty: inst.specialty || "General",
        workshops: [],
      });
    }

    // Populate and enrich with active upcoming workshops from DB
    for (const w of workshops) {
      const key = w.instructorEmail.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.workshops.push(w);
        if (!existing.specialty || existing.specialty === "General") {
          existing.specialty = w.instructorSpecialty || "General";
        }
      } else {
        map.set(key, {
          name: w.instructorName,
          email: w.instructorEmail,
          specialty: w.instructorSpecialty || "Especialista",
          workshops: [w],
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [workshops, instructors]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Header Banner without overlap */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent)]"></div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">school</span>
            Directorio Oficial Conectado a Base de Datos
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Instructores y Especialistas SkillHub
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Docentes registrados en el sistema y los talleres próximos que tienen a su cargo.
          </p>
        </div>
      </section>

      {/* Main Content with clean spacing (no negative margin overlap) */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-20 bg-slate-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : mentorsList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <span className="material-symbols-outlined text-5xl text-slate-400">person_off</span>
            <h3 className="mt-3 text-lg font-bold text-slate-800">
              No se encontraron instructores activos
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentorsList.map((m) => {
              const initials = m.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={m.email}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-sm shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 truncate">{m.name}</h3>
                        <p className="text-xs font-medium text-slate-500 truncate">{m.email}</p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                          {m.specialty}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Talleres Programados ({m.workshops.length})
                      </span>
                      {m.workshops.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          Sin talleres próximos asignados actualmente.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {m.workshops.map((w) => (
                            <li
                              key={w.id}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-mono font-bold text-indigo-600 block">
                                  {w.code}
                                </span>
                                <span className="font-semibold text-slate-800 truncate block">
                                  {w.title}
                                </span>
                              </div>
                              <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                                {w.availableSeats}/{w.capacity} libres
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <Link
                      href={`/explorar?q=${encodeURIComponent(m.name)}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold text-xs transition-colors"
                    >
                      <span>Ver Talleres de {m.name.split(" ")[0]} en Catálogo</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
