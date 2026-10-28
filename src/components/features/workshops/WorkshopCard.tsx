"use client";

import React from "react";
import Link from "next/link";
import { Workshop } from "@/types/workshop";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";

export interface WorkshopCardProps {
  workshop: Workshop;
  isEnrolled?: boolean;
  onEnroll: (workshop: Workshop) => void;
  onViewDetails?: (workshop: Workshop) => void;
}

export const getCategoryImage = (specialty: string = "", title: string = "") => {
  const text = `${specialty} ${title}`.toLowerCase();
  if (text.includes("foto")) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuBcdrFx8ejehmn3Xs6O5sqFw1zG43p6XfDzvQn2YzB0FUdRbn3_dWniHYkF2A80-UgLjQKWAD5fOV_moQVMNyINy-Tg02a-OBGqO7W_41NEj9xWqtSrsr8VrWMsjEg4qXTtE8SvaksfzV2aI7dizE1O0hol1IPTNvo6uDW6_LJPpY8EvVjkhBB3uvV_lSmTTaydJIxpMYe9zOmHnAPyr6bykyLf15Tmlgj2xAAl4COf";
  }
  if (text.includes("coci") || text.includes("panad") || text.includes("repost") || text.includes("gast")) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuCwU0b3DcsUb4tZdt-xWK2wyKz9hmS8q9CrIbMnAR_nm5TkxH4pMGoTQnwaVRLEKULcsgydq_WUWVq1OYSLMQen0uXv8y7YztuTDCdR5MAlrWP43VK1C52bMDcrVSgFfpMMFzOQTf6kQbSHIaGNwFjjPXotlzX3i8x8id7u7VY6NPL5ZMJSEUaSl-nuUgxb1M0t_xmxcGv8xUd6u9GG740mBdVsYKlHJeF2Vfx-yVc7";
  }
  if (text.includes("ora") || text.includes("story") || text.includes("presen")) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuBMWHLl3bWgc-N_J929p15DVdJDGxHCzt6bgy6jZFFEY7y1LG-9a5acXqnBrdsO78jiUWxrCy5MwXe0_MU8UZoDb_B-EkeBSAdDnTguTsBTzM_3HqJxNXkrP6BNmYC321DszBFHs7Rjd6gCiuDI6m94lKxoEmwYNbKC4WAg4t5aSg4uvVMxP7TZlVAj1R4N4H9us6Djd6G80jtD1BkuLe6DnY9UHsTGddx_AKNloZv4";
  }
  if (text.includes("dis") || text.includes("figma") || text.includes("ui") || text.includes("ux")) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuCVAnWqqTgPDtfqjM82o5wojeysGuTil0AddTZyp5xeEv5GpdMLBfOG8pM9blvAxcmr7yH5mA8TDdglMMj9dIfVK03HUVM7gPXt3N1a-x26UxkBYgs9Z8DlDbeCAztgPi-EwU9-dvTlbUTzT4yWM71I9MFZXh5nM47OyKE-aRuP14F2W1-w_dck6-uYv_r5fdeiQe7cPIFnmoweNoXv-O38ZUyI5l5jtrNwgIb73YpL";
  }
  if (text.includes("progr") || text.includes("next") || text.includes("code") || text.includes("node") || text.includes("react")) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuCYD1E1uNUmnFOucG6Ooh1BAIZz_taeIVkVApyDmjsjTNNLPFnxSL8YBtjCXwOG-tiQS6pOpkGLdk1MIYtSHBaQk9Ej4NWuZ4Eum3jZYX6yc3tkLTD6uQ8b5SfDrA6F_xfm-3vroPpVpu3RlyVYH7_vpzB2BxOmnKcC6ZgCNxqS6Zr85jaHU91Mm3C41o7Nyz1gbZuKk11qvqpFUTjqyd3RzHI5wwCjwb1oMq8N4-BG";
  }
  return "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80";
};

export const getCategoryLabel = (specialty: string = "") => {
  if (!specialty) return "General";
  if (specialty.toLowerCase().includes("foto")) return "Fotografía";
  if (specialty.toLowerCase().includes("coci")) return "Gastronomía";
  if (specialty.toLowerCase().includes("ora")) return "Oratoria";
  if (specialty.toLowerCase().includes("dis")) return "UI/UX";
  if (specialty.toLowerCase().includes("mark")) return "Marketing";
  if (specialty.toLowerCase().includes("mús")) return "Música";
  return specialty || "Especialidad";
};

export function WorkshopCard({
  workshop,
  isEnrolled = false,
  onEnroll,
  onViewDetails,
}: WorkshopCardProps) {
  const { isEmployee } = useAuth();
  const isFull = workshop.availableSeats <= 0;
  const isLow = workshop.availableSeats > 0 && workshop.availableSeats <= 3;
  const categoryLabel = getCategoryLabel(workshop.instructorSpecialty);
  const imageUrl = getCategoryImage(workshop.instructorSpecialty, workshop.title);

  const startDate = new Date(workshop.startDateTime);
  const endDate = new Date(workshop.endDateTime);
  const dateFormatted = `${startDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} | ${startDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${endDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })} hrs`;

  const initials = workshop.instructorName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-slate-200/80 ${
        isFull && !isEnrolled ? "opacity-90" : "hover:-translate-y-1"
      }`}
    >
      <div>
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={workshop.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isFull && !isEnrolled ? "grayscale-[50%]" : "group-hover:scale-105"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full font-badge-caps shadow-sm">
            {categoryLabel}
          </span>
          <div className="absolute top-3 right-3">
            {isFull ? (
              <Badge variant="full">0 CUPOS</Badge>
            ) : isLow ? (
              <Badge variant="low" pulse>
                ¡ÚLTIMOS {workshop.availableSeats} CUPOS!
              </Badge>
            ) : (
              <Badge variant="available" pulse>
                {workshop.availableSeats} CUPOS
              </Badge>
            )}
          </div>
          <span className="absolute bottom-2.5 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-mono px-2 py-0.5 rounded">
            {workshop.code}
          </span>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 text-slate-500 font-label-sm">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600 text-[16px]">
                calendar_today
              </span>
              <span>{dateFormatted}</span>
            </div>
          </div>

          <h3 className="font-headline-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {workshop.title}
          </h3>

          <p className="font-body-sm text-slate-600 line-clamp-2">{workshop.description}</p>
        </div>
      </div>

      <div className="p-5 pt-0 space-y-4">
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center ring-2 ring-slate-100 shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-slate-900 leading-tight truncate">
                {workshop.instructorName}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {workshop.instructorSpecialty || "Instructor SkillHub"}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-slate-500 shrink-0">
            {workshop.activeEnrollmentsCount}/{workshop.capacity} inscritos
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(workshop)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shrink-0"
              title="Ver ficha completa del taller"
            >
              Detalle
            </button>
          )}

          {isEmployee ? (
            <Link
              href={`/instructor?workshopId=${workshop.id}`}
              className="flex-1 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-label-md rounded-lg transition-colors flex items-center justify-center gap-2 border border-indigo-200/80"
            >
              <span className="material-symbols-outlined text-base">groups</span>
              <span>Ver Integrantes ({workshop.activeEnrollmentsCount})</span>
            </Link>
          ) : isEnrolled ? (
            <button
              disabled
              className="flex-1 py-2.5 px-4 bg-emerald-50 text-emerald-700 font-label-md rounded-lg cursor-default flex items-center justify-center gap-2 border border-emerald-200"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Ya estás inscrito</span>
            </button>
          ) : isFull ? (
            <button
              disabled
              className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-400 font-label-md rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">lock</span>
              <span>Agotado</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onEnroll(workshop)}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-label-md rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Inscribirme</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkshopCard;
