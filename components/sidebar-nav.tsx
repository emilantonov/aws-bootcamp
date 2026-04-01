"use client";

import { learningPath, categoryColors } from "@/lib/learning-data";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  completedDays: number[];
  currentDay: number;
  onDaySelect: (day: number) => void;
}

export function SidebarNav({ completedDays, currentDay, onDaySelect }: SidebarNavProps) {
  return (
    <div className="sticky top-4 hidden w-64 shrink-0 lg:block">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-4 font-semibold text-foreground">Quick Navigation</h3>
        
        {/* Week 1 */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Week 1
          </h4>
          <div className="space-y-1">
            {learningPath
              .filter((d) => d.week === 1)
              .map((day) => {
                const isCompleted = completedDays.includes(day.day);
                const isActive = currentDay === day.day;
                const colors = categoryColors[day.category];

                return (
                  <button
                    key={day.day}
                    onClick={() => onDaySelect(day.day)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate flex-1">
                      Day {day.day}: {day.service}
                    </span>
                    {isActive && <ChevronRight className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Week 2 */}
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Week 2
          </h4>
          <div className="space-y-1">
            {learningPath
              .filter((d) => d.week === 2)
              .map((day) => {
                const isCompleted = completedDays.includes(day.day);
                const isActive = currentDay === day.day;

                return (
                  <button
                    key={day.day}
                    onClick={() => onDaySelect(day.day)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate flex-1">
                      Day {day.day}: {day.service}
                    </span>
                    {isActive && <ChevronRight className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="mt-4 rounded-xl border border-accent/30 bg-accent/10 p-4">
        <h4 className="mb-2 font-semibold text-accent">Pro Tips</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            Use AWS Free Tier to avoid costs
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            Always clean up resources after exercises
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            Take notes for your future self
          </li>
        </ul>
      </div>
    </div>
  );
}
