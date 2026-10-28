"use client";

import React, { useState } from "react";
import { Enrollment } from "@/types/enrollment";
import { Drawer } from "@/components/ui/Drawer";

export interface CancellationDrawerProps {
  enrollment: Enrollment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (enrollmentId?: number) => Promise<void> | void;
  isLoading?: boolean;
}

export function CancellationDrawer({
  enrollment,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: CancellationDrawerProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  if (!enrollment) return null;

  const isBusy = isLoading || internalLoading;

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm(enrollment.id);
    } finally {
      setInternalLoading(false);
    }
  };

  const parsedStartDate = new Date(enrollment.startDateTime);
  const isValidDate = !isNaN(parsedStartDate.getTime());

  const dateFormatted = isValidDate
    ? parsedStartDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Próximamente";

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <span className="material-symbols-outlined text-[24px]">warning</span>
            <h3 className="font-headline-sm text-slate-900">Confirmar Cancelación</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="py-6 space-y-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="font-badge-caps text-indigo-600 uppercase tracking-wider">
              Taller Seleccionado ({enrollment.workshopCode})
            </span>
            <h4 className="font-headline-sm text-slate-900">{enrollment.workshopTitle}</h4>
            <p className="font-body-sm text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">event</span>
              <span>{dateFormatted}</span>
            </p>
            <p className="font-body-sm text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">person</span>
              <span>Instructor: {enrollment.instructorName}</span>
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-label-md text-slate-800">
              Efectos de esta operación en el sistema:
            </h5>
            <ul className="space-y-2.5 font-body-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-rose-500 text-[18px] shrink-0 mt-0.5">
                  error
                </span>
                <span>
                  El estado de tu inscripción cambiará a <strong>Cancelled</strong> y tu cupo se liberará inmediatamente en el taller.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <span>
                  Si cambias de opinión más adelante y aún quedan cupos libres, el sistema te permitirá reactivar tu inscripción.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 space-y-2 font-body-sm text-slate-600 border border-slate-100">
            <div className="flex justify-between">
              <span>ID de Inscripción:</span>
              <span className="font-mono font-semibold text-slate-900">#{enrollment.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Código de Taller:</span>
              <span className="font-mono font-semibold text-slate-900">
                {enrollment.workshopCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Validación 24h:</span>
              <span className="font-medium text-emerald-600">Dentro del plazo permitido</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
        <button
          type="button"
          disabled={isBusy}
          onClick={handleConfirm}
          className="w-full py-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-label-md shadow-sm transition-colors flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50"
        >
          {isBusy ? (
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
              <span>Cancelando...</span>
            </span>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Confirmar Cancelación</span>
            </>
          )}
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={onClose}
          className="w-full py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-label-md transition-colors flex items-center justify-center focus:outline-none"
        >
          <span>Conservar mi cupo</span>
        </button>
      </div>
    </Drawer>
  );
}

export default CancellationDrawer;
