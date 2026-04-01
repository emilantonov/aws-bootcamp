"use client";

import { useState, useEffect } from "react";
import { ProgressHeader } from "@/components/progress-header";
import { WeekTabs } from "@/components/week-tabs";
import { SidebarNav } from "@/components/sidebar-nav";

export default function LearningPathPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [currentDay, setCurrentDay] = useState(1);

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("aws-bootcamp-progress");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCompletedDays(parsed.completedDays || []);
      setCurrentDay(parsed.currentDay || 1);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(
      "aws-bootcamp-progress",
      JSON.stringify({ completedDays, currentDay })
    );
  }, [completedDays, currentDay]);

  const handleToggleComplete = (day: number) => {
    setCompletedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        // Mark as complete and advance to next day if it's the current day
        if (day === currentDay && currentDay < 14) {
          setCurrentDay(currentDay + 1);
        }
        return [...prev, day];
      }
    });
  };

  const handleDaySelect = (day: number) => {
    setCurrentDay(day);
    // Scroll to top when selecting a new day
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ProgressHeader completedDays={completedDays} currentDay={currentDay} />

        <div className="flex gap-8">
          <SidebarNav
            completedDays={completedDays}
            currentDay={currentDay}
            onDaySelect={handleDaySelect}
          />

          <div className="min-w-0 flex-1">
            <WeekTabs
              completedDays={completedDays}
              currentDay={currentDay}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js • 2 weeks • 12 AWS Services • JavaScript/TypeScript
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Remember to clean up your AWS resources after each exercise to avoid unexpected charges!
          </p>
        </footer>
      </div>
    </main>
  );
}
