"use client";

import React, { useState } from "react";
import { Workshop } from "@/types/workshop";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface EnrollModalProps {
  workshop: Workshop | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (workshop?: any) => Promise<void> | void;
  isLoading?: boolean;
}

export function EnrollModal({
  workshop,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: EnrollModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  if (!workshop) return null;

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm(workshop);
    } finally {
      setInternalLoading(false);
    }
  };

  const isBusy = isLoading || internalLoading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-3xl">school</span>
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-headline-md text-slate-900 leading-tight">{workshop.title}</h3>
        <p className="font-body-md text-slate-600">
          ¿Deseas asegurar tu plaza en este taller? Recibirás de inmediato los accesos directos al
          aula virtual y material preparatorio.
        </p>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-left border border-slate-100">
        <div className="flex justify-between items-center font-body-sm">
          <span className="text-slate-500">Instructor</span>
          <span className="text-slate-900 font-medium">{workshop.instructorName}</span>
        </div>
        <div className="flex justify-between items-center font-body-sm">
          <span className="text-slate-500">Modalidad</span>
          <span className="text-slate-900 font-medium">100% En Vivo con Tutor</span>
        </div>
        <div className="flex justify-between items-center font-body-sm">
          <span className="text-slate-500">Certificado</span>
          <span className="text-emerald-700 font-medium">Incluido con verificación digital</span>
        </div>
        <div className="flex justify-between items-center font-body-sm">
          <span className="text-slate-500">Política de baja</span>
          <span className="text-slate-700 font-medium">Cancelación sin penalidad hasta 24h antes</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button variant="secondary" onClick={onClose} disabled={isBusy}>
          Revisar otros
        </Button>
        <Button variant="primary" onClick={handleConfirm} isLoading={isBusy}>
          <span>Confirmar plaza</span>
          <span className="material-symbols-outlined text-sm ml-1.5">done</span>
        </Button>
      </div>
    </Modal>
  );
}

export default EnrollModal;
