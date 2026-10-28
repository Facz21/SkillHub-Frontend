"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  addToast: (type: ToastType, message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, title, message, type };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const defaultTitle =
        type === "success"
          ? "Éxito"
          : type === "error"
          ? "Error"
          : type === "warning"
          ? "Atención"
          : "Información";
      showToast(title || defaultTitle, message, type);
    },
    [showToast]
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, addToast }}>
      {children}
      {/* Toast Floating Container */}
      <div className="fixed top-20 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          const borderColor = isSuccess
            ? "border-emerald-500"
            : isError
            ? "border-rose-500"
            : isWarning
            ? "border-amber-500"
            : "border-indigo-500";

          const iconBg = isSuccess
            ? "bg-emerald-50 text-emerald-600"
            : isError
            ? "bg-rose-50 text-rose-600"
            : isWarning
            ? "bg-amber-50 text-amber-600"
            : "bg-indigo-50 text-indigo-600";

          const iconName = isSuccess
            ? "check_circle"
            : isError
            ? "cancel"
            : isWarning
            ? "warning"
            : "info";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-white rounded-xl shadow-xl p-4 flex items-start gap-3 transition-all duration-300 transform translate-x-0 border-l-4 ${borderColor}`}
            >
              <div className={`p-1.5 rounded-full ${iconBg} shrink-0 flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[20px]">{iconName}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-label-md text-slate-900 leading-tight">{toast.title}</h4>
                {toast.message && (
                  <p className="font-body-sm text-slate-600 mt-1 leading-snug">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
