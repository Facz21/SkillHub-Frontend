"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

export default function Header() {
  const pathname = usePathname();
  const {
    user,
    isAuthenticated,
    isEmployee,
    logout,
    openAuthModal,
    loginAsParticipantDemo,
    loginAsInstructorDemo,
  } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Strictly filter navigation links based on role so users only see views they have access to
  const navLinks = [
    { label: "Explorar Talleres", href: "/explorar" },
    { label: "Mentores", href: "/mentores" },
    ...(isAuthenticated && !isEmployee
      ? [
          { label: "Mis Inscripciones", href: "/mis-inscripciones" },
          { label: "Mis Constancias", href: "/certificados" },
        ]
      : []),
    ...(isAuthenticated && isEmployee
      ? [
          { label: "Suite Instructor", href: "/instructor" },
          { label: "Constancias y Reportes", href: "/certificados" },
        ]
      : []),
    ...(isAuthenticated ? [{ label: "Mi Perfil", href: "/perfil" }] : []),
  ];

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "SH";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 36 36"
                width="36"
                height="36"
                className="shrink-0 transition-transform group-hover:scale-105"
              >
                <rect width="36" height="36" rx="10" fill="#4F46E5" />
                <path
                  d="M24 12c-1.5-1.5-3.5-2-6-2-4 0-6.5 2-6.5 5 0 5 13 3 13 9 0 3.5-2.5 5.5-6.5 5.5-3 0-5.5-1-7-2.5m1 0l1.5-2m10-10l-1.5 2"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-headline-sm text-xl tracking-tight text-slate-900 font-bold">
                Skill<span className="text-indigo-600">Hub</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 transition-colors text-xs lg:text-sm font-semibold rounded-lg whitespace-nowrap ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
                >
                  <div className="hidden sm:flex flex-col items-end text-right">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {user.fullName}
                    </span>
                    <span
                      className={`text-[11px] font-semibold mt-0.5 ${
                        isEmployee ? "text-indigo-600" : "text-emerald-600"
                      }`}
                    >
                      {isEmployee
                        ? `Instructor${user.specialty ? ` • ${user.specialty}` : ""}`
                        : "Participante"}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-100">
                    {initials}
                  </div>
                </button>

                {isMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                    onMouseLeave={() => setIsMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                        Rol: {isEmployee ? "Instructor / Empleado" : "Participante"}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/perfil"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-base text-slate-500">
                          person
                        </span>
                        Mi Perfil y Contraseña
                      </Link>

                      {!isEmployee && (
                        <Link
                          href="/mis-inscripciones"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <span className="material-symbols-outlined text-base text-slate-500">
                            event_seat
                          </span>
                          Mis Inscripciones
                        </Link>
                      )}

                      {isEmployee && (
                        <Link
                          href="/instructor"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50/50"
                        >
                          <span className="material-symbols-outlined text-base">
                            admin_panel_settings
                          </span>
                          Suite del Instructor
                        </Link>
                      )}

                      <Link
                        href="/certificados"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-base text-slate-500">
                          description
                        </span>
                        {isEmployee ? "Constancias y Reportes de Curso" : "Mis Constancias PDF"}
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsMenuOpen(false);
                          if (isEmployee) {
                            await loginAsParticipantDemo();
                          } else {
                            await loginAsInstructorDemo();
                          }
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">swap_horiz</span>
                        Cambiar a {isEmployee ? "Participante (Jorge)" : "Instructor (Andrés)"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("register")}
                  className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal />
    </>
  );
}
