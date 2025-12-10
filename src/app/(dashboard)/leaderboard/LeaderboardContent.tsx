"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Loader2 } from "lucide-react";
import { cn, rankingGrade } from "@/lib/utils";
import { User } from "@/types";

export default function LeaderboardContent() {
  const {
    data: topUsers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await client.api.users.leaderboard.$get();
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data = await res.json();
      return data as User[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading leaderboard: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-linear-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent inline-flex items-center gap-3">
          <Trophy className="h-10 w-10 text-gray-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2">
          The most dedicated <strong>Linear</strong> contributers.
        </p>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Credits</TableHead>
              <TableHead className="text-right hidden sm:table-cell">
                Views
              </TableHead>
              <TableHead className="text-right hidden sm:table-cell">
                Upvotes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topUsers?.map((user, index) => (
              <TableRow key={user.id} className="hover:bg-muted/20">
                <TableCell className="text-center font-bold text-lg">
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                  {index > 2 && index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || ""} />
                      <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {user.fullName || "Anonymous"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                      {user.role || "Student"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-secondary-foreground",
                        {
                          "bg-gray-500/50":
                            rankingGrade(user.reputationScore || 0) ===
                            "ROOKIE",
                          "bg-yellow-800/50":
                            rankingGrade(user.reputationScore || 0) ===
                            "BRONZE",
                          "bg-cyan-500/50":
                            rankingGrade(user.reputationScore || 0) ===
                            "SILVER",
                          // Changed to yellow-600 to match view
                          "bg-yellow-600/50":
                            rankingGrade(user.reputationScore || 0) === "GOLD",
                          // Changed to indigo for elite
                          "bg-indigo-500/50":
                            rankingGrade(user.reputationScore || 0) === "ELITE",
                          // Legendary
                          "bg-orange-500/50":
                            rankingGrade(user.reputationScore || 0) ===
                            "LEGENDARY",
                          // Grand master
                          "bg-red-500/50":
                            rankingGrade(user.reputationScore || 0) ===
                            "GRAND MASTER",
                        }
                      )}
                    >
                      {rankingGrade(user.reputationScore || 0)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {user.reputationScore || 0}
                </TableCell>
                <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                  {user.totalViews || 0}
                </TableCell>
                <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                  {user.totalUpvotes || 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
