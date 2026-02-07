"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { cn, rankingGrade } from "@/lib/utils";

import { useLeaderboard } from "@/hooks/useUsers";

import ClientLoader from "@/components/ui/client-loader";

export default function LeaderboardContent() {
  const { data: topUsers, isLoading, error } = useLeaderboard();

  // Filter users to only show those with positive reputation score
  const filteredUsers = topUsers?.filter(
    (user) => (user.reputationScore || 0) > 0,
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <ClientLoader label="Loading leaderboard..." />
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
        <h1 className="text-4xl font-bold bg-linear-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent inline-flex items-center gap-3">
          <Trophy className="h-10 w-10 text-gray-700" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2">
          The most dedicated <strong>Linear</strong> contributers.
        </p>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        {filteredUsers && filteredUsers.length > 0 ? (
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
              {filteredUsers.map((user, index) => (
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
                            "bg-gray-700/50":
                              rankingGrade(user.reputationScore || 0) ===
                              "IRON",
                            "bg-yellow-800/50":
                              rankingGrade(user.reputationScore || 0) ===
                              "BRONZE",
                            "bg-cyan-500/50":
                              rankingGrade(user.reputationScore || 0) ===
                              "SILVER",
                            // Changed to yellow-600 to match view
                            "bg-yellow-600/50":
                              rankingGrade(user.reputationScore || 0) ===
                              "GOLD",
                            // Changed to indigo for elite
                            "bg-indigo-500/50":
                              rankingGrade(user.reputationScore || 0) ===
                              "ELITE",
                            // Legendary
                            "bg-orange-500/50":
                              rankingGrade(user.reputationScore || 0) ===
                              "LEGENDARY",
                            // Grand master
                            "bg-red-500/50":
                              rankingGrade(user.reputationScore || 0) ===
                              "GRAND MASTER",
                          },
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
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Trophy className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No Contributors Yet
            </h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Be the first to contribute to Linear!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
