"use client";

import React from "react";

export interface WorkshopFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange?: (category: string) => void;
  onSelectCategory?: (category: string) => void;
  sortMode?: string;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "Fotografía", label: "Fotografía" },
  { id: "Gastronomía", label: "Gastronomía" },
  { id: "Oratoria", label: "Oratoria" },
  { id: "UI/UX", label: "UI/UX" },
  { id: "Programación", label: "Programación" },
];

export function WorkshopFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onSelectCategory,
  sortMode = "upcoming",
  sortBy,
  onSortChange,
}: WorkshopFiltersProps) {
  const currentSort = sortBy || sortMode;
  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) onSelectCategory(catId);
    if (onCategoryChange) onCategoryChange(catId);
  };
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm space-y-4 border border-slate-200/80">
      {/* Search and Sort row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <svg
            className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por taller, instructor o habilidad clave..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 rounded-lg font-body-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 border border-slate-200 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative inline-block w-full sm:w-auto">
            <select
              value={currentSort}
              onChange={(e) => onSortChange && onSortChange(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 font-label-md px-4 py-2.5 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-200 cursor-pointer transition-colors"
            >
              <option value="upcoming">Próximos a iniciar</option>
              <option value="date">Próximos a iniciar</option>
              <option value="seats">Mayor disponibilidad</option>
              <option value="available">Mayor disponibilidad</option>
              <option value="popular">Más demandados</option>
              <option value="title">Título alfabético</option>
            </select>
            <svg
              className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-slate-600">
        <span className="font-label-sm uppercase tracking-wider text-slate-400 mr-2 shrink-0">
          Filtrar:
        </span>
        {CATEGORIES.map((cat) => {
          const isActive =
            (cat.id === "all" && (!selectedCategory || selectedCategory === "all")) ||
            selectedCategory.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full font-label-sm transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default WorkshopFilters;
