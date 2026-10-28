"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { isAuthenticated, isEmployee } = useAuth();

  return (
    <footer className="w-full bg-white border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="font-headline-sm text-xl tracking-tight text-slate-900 font-bold">
                Skill<span className="text-indigo-600">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              Sistema de Gestión de Talleres e Inscripciones con validación de cupos, detección de colisiones horarias, regla de cancelación de 24 horas y generación de constancias en PDF.
            </p>
          </div>

          {/* Catálogo & Instructores */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Catálogo y Docentes
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li>
                <Link href="/explorar" className="hover:text-indigo-600 transition-colors">
                  Catálogo de Talleres
                </Link>
              </li>
              <li>
                <Link href="/mentores" className="hover:text-indigo-600 transition-colors">
                  Directorio de Instructores
                </Link>
              </li>
              {isAuthenticated && isEmployee && (
                <li>
                  <Link href="/instructor" className="hover:text-indigo-600 transition-colors">
                    Suite del Instructor
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Área de Usuario (Adaptada al rol activo) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isEmployee ? "Gestión Docente" : "Área de Usuario"}
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              {!isEmployee && (
                <li>
                  <Link href="/mis-inscripciones" className="hover:text-indigo-600 transition-colors">
                    Mis Inscripciones
                  </Link>
                </li>
              )}
              <li>
                <Link href="/certificados" className="hover:text-indigo-600 transition-colors">
                  {isEmployee
                    ? "Constancias y Reportes de Curso"
                    : "Constancias de Inscripción (PDF)"}
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link href="/perfil" className="hover:text-indigo-600 transition-colors">
                    Mi Perfil y Contraseña
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 SkillHub — Plataforma de Gestión de Talleres (.NET 10 + Next.js).</p>
          <span>Conectado a SkillHub API v1</span>
        </div>
      </div>
    </footer>
  );
}
