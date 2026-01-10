"use client";

import { cn } from "@/lib/utils";
import { SCENARIOS, ScenarioType, AppMode } from "@/types";
import { Swords, GraduationCap, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ScenarioSelectorProps {
  currentScenario: ScenarioType;
  currentMode: AppMode;
  onSelectScenario: (scenario: ScenarioType) => void;
  onSelectMode: (mode: AppMode) => void;
  className?: string;
}

export function ScenarioSelector({
  currentScenario,
  currentMode,
  onSelectScenario,
  onSelectMode,
  className,
}: ScenarioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentScenarioData = SCENARIOS.find((s) => s.id === currentScenario);
  const filteredScenarios = SCENARIOS.filter((s) => s.mode === currentMode);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Mode toggle */}
      <div className="flex rounded-xl bg-black/30 p-1 border border-white/10">
        <button
          onClick={() => onSelectMode("dojo")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium",
            currentMode === "dojo"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <GraduationCap className="w-4 h-4" />
          Dojo
        </button>
        <button
          onClick={() => onSelectMode("arena")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium",
            currentMode === "arena"
              ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Swords className="w-4 h-4" />
          Arena
        </button>
      </div>

      {/* Scenario dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-white/20 transition-all min-w-[240px]"
        >
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">
              {currentScenarioData?.name || "Select scenario"}
            </div>
            <div className="text-xs text-white/50 truncate">
              {currentScenarioData?.description}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-white/50 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50">
            {filteredScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => {
                  onSelectScenario(scenario.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-white/10 transition-colors",
                  scenario.id === currentScenario && "bg-white/5"
                )}
              >
                <div className="text-sm font-medium text-white">
                  {scenario.name}
                </div>
                <div className="text-xs text-white/50">{scenario.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
