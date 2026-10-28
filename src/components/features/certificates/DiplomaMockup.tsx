"use client";

import React from "react";

export interface DiplomaMockupProps {
  participantName: string;
  participantEmail: string;
  workshopCode: string;
  workshopTitle: string;
  instructorName: string;
  startDateTime: string;
  endDateTime: string;
  enrolledAt: string;
  enrollmentId: number;
}

export function DiplomaMockup({
  participantName,
  participantEmail,
  workshopCode,
  workshopTitle,
  instructorName,
  startDateTime,
  endDateTime,
  enrolledAt,
  enrollmentId,
}: DiplomaMockupProps) {
  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl border-2 border-indigo-100 p-6 sm:p-10 overflow-hidden text-slate-800 flex flex-col justify-between select-none">
      {/* Subtle watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <span className="material-symbols-outlined text-[300px] text-indigo-900">school</span>
      </div>

      {/* Header matching QuestPdfCertificateService */}
      <div className="relative z-10 flex items-start justify-between border-b-2 border-indigo-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            S
          </div>
          <div>
            <span className="text-2xl font-extrabold text-indigo-700 leading-none block">
              SkillHub
            </span>
            <span className="text-xs text-slate-500 font-medium block mt-1">
              Centro de Formación y Talleres Prácticos
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-indigo-700 block">
            Código: {workshopCode}
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
            Inscripción #{enrollmentId}
          </span>
        </div>
      </div>

      {/* Core Content matching QuestPdfCertificateService */}
      <div className="relative z-10 py-8 text-center space-y-3">
        <h2 className="text-xl sm:text-2xl font-extrabold text-indigo-950 tracking-wide uppercase">
          Constancia de Inscripción
        </h2>

        <p className="text-sm italic text-slate-500">Se hace constar que:</p>

        <div className="py-1">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-950">
            {participantName}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Correo electrónico: {participantEmail}
          </p>
        </div>

        <p className="text-sm text-slate-700 pt-2">
          Se encuentra formalmente inscrito(a) en el taller:
        </p>

        <div className="py-2">
          <span className="inline-block bg-indigo-50/90 text-indigo-800 font-bold text-base sm:text-lg px-6 py-2.5 rounded-xl border border-indigo-100">
            &ldquo;{workshopTitle}&rdquo;
          </span>
        </div>

        {/* 4 Metadata Columns matching QuestPdfCertificateService */}
        <div className="mt-6 bg-slate-50 border border-slate-200/80 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left text-xs">
          <div>
            <span className="font-bold text-slate-700 block">Instructor:</span>
            <span className="text-slate-900 font-medium mt-0.5 block">{instructorName}</span>
          </div>
          <div>
            <span className="font-bold text-slate-700 block">Fecha y Hora de Inicio:</span>
            <span className="text-slate-900 font-medium mt-0.5 block">
              {formatDateTime(startDateTime)}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-700 block">Fecha y Hora de Fin:</span>
            <span className="text-slate-900 font-medium mt-0.5 block">
              {formatDateTime(endDateTime)}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-700 block">Fecha de Inscripción:</span>
            <span className="text-slate-900 font-medium mt-0.5 block">
              {formatDateTime(enrolledAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer matching QuestPdfCertificateService */}
      <div className="relative z-10 flex flex-wrap items-center justify-between border-t border-slate-200 pt-4 text-[11px] text-slate-400 gap-2">
        <span>Documento generado oficialmente por SkillHub</span>
        <span className="font-medium text-slate-500">Válido sin enmiendas</span>
      </div>
    </div>
  );
}

export default DiplomaMockup;
