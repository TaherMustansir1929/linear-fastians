import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rankingGrade(score: number): string {
  if (score >= 5000) return "GRAND MASTER";
  if (score >= 3000) return "LEGENDARY";
  if (score >= 1500) return "ELITE";
  if (score >= 1000) return "GOLD";
  if (score >= 500) return "SILVER";
  if (score >= 250) return "BRONZE";
  if (score >= 100) return "IRON";
  return "ROOKIE";
}

export function getRandomHexColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
