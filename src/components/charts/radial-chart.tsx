"use client";

import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

export function RadialChart({
  timeSpentSeconds,
  title,
  description,
  footerText,
  subtitle,
}: {
  timeSpentSeconds: number;
  title: string;
  description: string;
  footerText: string;
  subtitle: string;
}) {
  // Goal: e.g. 50 Hours (to make the chart look nice)
  const goalSeconds = 50 * 3600;
  // Limit max to goal to avoid overflowing visual (or let it loop?)
  // Let's just cap for visual percentage, but show real number.

  const minutes = Math.floor(timeSpentSeconds / 60);
  const hours = (timeSpentSeconds / 3600).toFixed(1);
  const degrees = Math.min((timeSpentSeconds / goalSeconds) * 360, 360);

  const chartData = [
    { name: "time", score: timeSpentSeconds, fill: "var(--color-time)" },
  ];

  const chartConfig = {
    time: {
      label: "Time Spent",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            // endAngle={90 - degrees} // This would be dynamic arc
            // Recharts RadialBar is tricky for simple "gauge".
            // Simplified: classic radial bar props
            endAngle={
              90 - Math.min(360, (timeSpentSeconds / goalSeconds) * 360)
            }
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="score" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {hours}h
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          {subtitle}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {footerText} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total active time reading documents
        </div>
      </CardFooter>
    </Card>
  );
}
