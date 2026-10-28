"use client";

import React from "react";
import { Enrollment } from "@/types/enrollment";
import { getCategoryImage, getCategoryLabel } from "@/components/features/workshops/WorkshopCard";

export interface EnrollmentCardProps {
  enrollment: Enrollment;
  onCancel?: (enrollment: Enrollment) => void;
  onDownloadCertificate?: (enrollmentId: number) => void;
}

export function EnrollmentCard({
  enrollment,
  onCancel,
  onDownloadCertificate,
}: EnrollmentCardProps) {
  const isCancelled = enrollment.status === 2;

  const startDate = new Date(enrollment.startDateTime);
  const endDate = new Date(enrollment.endDateTime);
  const enrolledDate = new Date(enrollment.enrolledAt);
  const isValidDate = !isNaN(startDate.getTime());

  const dateFormatted = isValidDate
    ? `${startDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })} | ${startDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${endDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })} hrs`
    : "Fecha por confirmar";

  const enrolledAtFormatted = !isNaN(enrolledDate.getTime())
    ? enrolledDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  const category = getCategoryLabel(enrollment.workshopTitle);
  const imageUrl = getCategoryImage(category, enrollment.workshopTitle);

  const canCancel = enrollment.canParticipantCancel;
  const deadlineDate = isValidDate ? new Date(startDate.getTime() - 24 * 60 * 60 * 1000) : null;
  const deadlineFormatted = deadlineDate
    ? `${deadlineDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      })} a las ${deadlineDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })} hrs`
    : "24h antes del inicio";

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col md:flex-row border border-slate-200/80">
      {/* Thumbnail Visual */}
      <div className="md:w-72 lg:w-80 h-52 md:h-auto relative shrink-0">
        <img
          src={imageUrl}
          alt={enrollment.workshopTitle}
          className={`w-full h-full object-cover ${isCancelled ? "grayscale opacity-75" : ""}`}
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-indigo-700 tracking-wider uppercase shadow-sm text-xs font-bold">
            {enrollment.workshopCode}
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-5 sm:p-6 lg:p-7 flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Top Row: Status badge & ID */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            {isCancelled ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold uppercase tracking-wide border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Cancelada {enrollment.cancelledBy ? `(por ${enrollment.cancelledBy})` : ""}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wide border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Inscripción Activa
              </div>
            )}

            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                confirmation_number
              </span>
              <span className="font-mono">
                ID #{enrollment.id} • {enrollment.workshopCode}
              </span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
            {enrollment.workshopTitle}
          </h2>

          {/* Real DTO Metadata Chips: Schedule, Instructor, EnrolledAt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Horario del Taller
                </span>
                <span className="block text-xs font-medium text-slate-800 truncate" title={dateFormatted}>
                  {dateFormatted}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-sm">
                {enrollment.instructorName.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Instructor Asignado
                </span>
                <span
                  className="block text-xs font-medium text-slate-800 truncate"
                  title={enrollment.instructorName}
                >
                  {enrollment.instructorName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-0 sm:col-span-2 lg:col-span-1">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg">fact_check</span>
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Fecha de Matrícula
                </span>
                <span className="block text-xs font-medium text-slate-800 truncate">
                  {enrolledAtFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Rule Info */}
          {!isCancelled && (
            <div
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm mb-5 border ${
                canCancel
                  ? "bg-amber-50 text-amber-800 border-amber-200/70"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0 text-amber-600">
                timer
              </span>
              <span>
                {canCancel ? (
                  <>
                    Cancelación permitida hasta 24h antes del inicio ({deadlineFormatted}).
                  </>
                ) : (
                  <>
                    El plazo de 24h previas al inicio para cancelar por cuenta propia ha expirado.
                  </>
                )}
              </span>
            </div>
          )}

          {isCancelled && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs sm:text-sm mb-5 border border-slate-200">
              <span className="material-symbols-outlined text-[18px] shrink-0 text-slate-500">
                history
              </span>
              <span>
                Inscripción cancelada el{" "}
                {enrollment.cancelledAt
                  ? new Date(enrollment.cancelledAt).toLocaleString("es-ES")
                  : "-"}
                . El cupo fue liberado en el taller.
              </span>
            </div>
          )}
        </div>

        {/* Bottom Actions Row (Only Real Backend Operations) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span
              className={`material-symbols-outlined text-[18px] ${
                isCancelled ? "text-slate-400" : "text-emerald-600"
              }`}
            >
              {isCancelled ? "block" : "verified"}
            </span>
            <span>
              {isCancelled ? "Cupo liberado" : "Inscripción activa en base de datos"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isCancelled && canCancel && onCancel && (
              <button
                type="button"
                onClick={() => onCancel(enrollment)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                <span>Cancelar Inscripción</span>
              </button>
            )}

            {!isCancelled && onDownloadCertificate && (
              <button
                type="button"
                onClick={() => onDownloadCertificate(enrollment.id)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Constancia PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default EnrollmentCard;
