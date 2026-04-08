"use client";

import { achievements } from "@/lib/learning-data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Target, Zap } from "lucide-react";

interface ProgressHeaderProps {
  completedDays: number[];
  currentDay: number;
}

export function ProgressHeader({ completedDays, currentDay }: ProgressHeaderProps) {
  const progress = (completedDays.length / 15) * 100;
  const unlockedAchievements = achievements.filter((a) =>
    completedDays.includes(a.day)
  );

  // Calculate streak
  let streak = 0;
  for (let i = currentDay; i >= 1; i--) {
    if (completedDays.includes(i)) {
      streak++;
    } else {
      break;
    }
  }

  return (
    <div className="mb-8 space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-10">
          <Zap className="h-64 w-64 text-primary" />
        </div>

        <div className="relative space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              AWS Cloud Bootcamp
            </h1>
            <p className="text-lg text-muted-foreground">
              Master 12 AWS services in 2 weeks with hands-on exercises
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4 text-primary" />
                Progress
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {completedDays.length}/15
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="h-4 w-4 text-orange-500" />
                Streak
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {streak} {streak === 1 ? "day" : "days"}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Achievements
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {unlockedAchievements.length}/{achievements.length}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                Current Day
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                Day {currentDay}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>
      </div>

      {/* Achievements Row */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Achievements
        </h3>
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => {
            const isUnlocked = completedDays.includes(achievement.day);
            return (
              <Badge
                key={achievement.id}
                variant="outline"
                className={`px-3 py-1.5 text-sm ${
                  isUnlocked
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                    : "border-border bg-muted/30 text-muted-foreground opacity-50"
                }`}
                title={achievement.description}
              >
                <span className="mr-1.5">{achievement.icon}</span>
                {achievement.name}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
