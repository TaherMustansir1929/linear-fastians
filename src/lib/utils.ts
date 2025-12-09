import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rankingGrade(score: number): string {
  if (score >= 5000) return "GRAND MASTER";
  if (score >= 2500) return "LEGENDARY";
  if (score >= 1500) return "ELITE";
  if (score >= 1000) return "GOLD";
  if (score >= 500) return "SILVER";
  if (score >= 250) return "BRONZE";
  return "ROOKIE";
}
