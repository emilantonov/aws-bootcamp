"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DayCard } from "@/components/day-card";
import { learningPath } from "@/lib/learning-data";
import { Cloud, Server } from "lucide-react";

interface WeekTabsProps {
  completedDays: number[];
  currentDay: number;
  onToggleComplete: (day: number) => void;
}

export function WeekTabs({ completedDays, currentDay, onToggleComplete }: WeekTabsProps) {
  const week1Days = learningPath.filter((d) => d.week === 1);
  const week2Days = learningPath.filter((d) => d.week === 2);

  const currentWeek = currentDay <= 7 ? "week1" : "week2";

  return (
    <Tabs defaultValue={currentWeek} className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-2 bg-muted/50">
        <TabsTrigger
          value="week1"
          className="flex items-center gap-2 data-[state=active]:bg-card"
        >
          <Server className="h-4 w-4" />
          <span className="hidden sm:inline">Week 1:</span> Core Infrastructure
        </TabsTrigger>
        <TabsTrigger
          value="week2"
          className="flex items-center gap-2 data-[state=active]:bg-card"
        >
          <Cloud className="h-4 w-4" />
          <span className="hidden sm:inline">Week 2:</span> Advanced + IaC
        </TabsTrigger>
      </TabsList>

      <TabsContent value="week1" className="space-y-4">
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h3 className="font-semibold text-foreground">
            Week 1: Core Infrastructure & Databases
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Build a solid foundation with compute, storage, databases, and monitoring. By the end
            of this week, you&apos;ll have a fully functional serverless API with persistent storage.
          </p>
        </div>
        {week1Days.map((day) => (
          <DayCard
            key={day.day}
            day={day}
            isCompleted={completedDays.includes(day.day)}
            isActive={currentDay === day.day}
            onToggleComplete={() => onToggleComplete(day.day)}
          />
        ))}
      </TabsContent>

      <TabsContent value="week2" className="space-y-4">
        <div className="mb-4 rounded-lg border border-accent/20 bg-accent/5 p-4">
          <h3 className="font-semibold text-foreground">
            Week 2: Advanced Services & Infrastructure as Code
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Level up with CDN, authentication, messaging queues, and learn to deploy everything
            with Terraform and CloudFormation. Graduate as a certified cloud architect!
          </p>
        </div>
        {week2Days.map((day) => (
          <DayCard
            key={day.day}
            day={day}
            isCompleted={completedDays.includes(day.day)}
            isActive={currentDay === day.day}
            onToggleComplete={() => onToggleComplete(day.day)}
          />
        ))}
      </TabsContent>
    </Tabs>
  );
}
