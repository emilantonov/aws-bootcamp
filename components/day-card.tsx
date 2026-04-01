"use client";

import { useState } from "react";
import { DayContent, categoryColors } from "@/lib/learning-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  BookOpen,
  Code,
  ExternalLink,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";

interface DayCardProps {
  day: DayContent;
  isCompleted: boolean;
  isActive: boolean;
  onToggleComplete: () => void;
}

export function DayCard({ day, isCompleted, isActive, onToggleComplete }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const colors = categoryColors[day.category];

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        isActive ? "ring-2 ring-primary" : ""
      } ${isCompleted ? "opacity-80" : ""}`}
    >
      <CardHeader
        className="cursor-pointer p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${colors.bg} ${colors.border} border`}
            >
              {day.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Day {day.day}
                </span>
                <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
                  {day.category}
                </Badge>
                {isActive && (
                  <Badge className="bg-primary/20 text-primary border border-primary/30">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Today
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold text-foreground">{day.service}</h3>
              <p className="text-sm text-muted-foreground">{day.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {day.duration}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              className={isCompleted ? "text-primary" : "text-muted-foreground"}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </Button>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 border-t border-border px-4 pb-6 pt-4">
          {/* Objectives */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-foreground">
              <Target className="h-4 w-4 text-primary" />
              Learning Objectives
            </h4>
            <ul className="grid gap-2 md:grid-cols-2">
              {day.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Concepts */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-foreground">
              <BookOpen className="h-4 w-4 text-accent" />
              Key Concepts
            </h4>
            <div className="flex flex-wrap gap-2">
              {day.concepts.map((concept, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {concept}
                </Badge>
              ))}
            </div>
          </div>

          {/* Exercise */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-foreground">
              <Code className="h-4 w-4 text-emerald-400" />
              Hands-On Exercise
              <Badge
                variant="outline"
                className={
                  day.exercise.difficulty === "easy"
                    ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                    : day.exercise.difficulty === "medium"
                    ? "border-yellow-500/30 bg-yellow-500/20 text-yellow-400"
                    : "border-red-500/30 bg-red-500/20 text-red-400"
                }
              >
                {day.exercise.difficulty}
              </Badge>
            </h4>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h5 className="mb-2 font-medium text-foreground">{day.exercise.title}</h5>
              <p className="mb-4 text-sm text-muted-foreground">{day.exercise.description}</p>
              {day.exercise.codeSnippet && (
                <pre className="overflow-x-auto rounded-lg bg-background p-4 text-xs">
                  <code className="text-muted-foreground">{day.exercise.codeSnippet}</code>
                </pre>
              )}
            </div>
          </div>

          {/* Bonus Challenge */}
          {day.bonusChallenge && (
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-accent">
                <Sparkles className="h-4 w-4" />
                Bonus Challenge
              </h4>
              <p className="text-sm text-muted-foreground">{day.bonusChallenge}</p>
            </div>
          )}

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <div className="flex flex-wrap gap-2">
              {day.resources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {resource.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
