"use client";

import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, rankingGrade } from "@/lib/utils";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ClientLoader from "@/components/ui/client-loader";

export default function CommunityContent() {
  const { data: documents, isLoading } = useDocuments();
  const router = useRouter();

  if (isLoading)
    return (
      <ClientLoader label="Loading community stats..." className="py-20" />
    );

  // Client-side aggregation
  const contributorStats = documents?.reduce((acc, doc) => {
    if (!doc.uploaderName) return acc;
    if (!acc[doc.userId]) {
      acc[doc.userId] = {
        name: doc.uploaderName,
        avatar: doc.uploaderAvatar,
        count: 0,
        reputationScore: doc.uploader?.reputationScore || 0,
      };
    }
    acc[doc.userId].count += 1;
    // Prefer the latest reputation score from the uploader relation
    if (doc.uploader?.reputationScore) {
      acc[doc.userId].reputationScore = doc.uploader.reputationScore;
    }
    return acc;
  }, {} as Record<string, { name: string; avatar: string | null | undefined; count: number; reputationScore: number }>);

  const sortedContributors = Object.entries(contributorStats || {}).sort(
    ([, a], [, b]) => b.count - a.count
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Contributors</h1>
        <Button
          className="flex items-center cursor-pointer bg-linear-to-r from-gray-900 to-gray-700"
          onClick={() => router.push("/community/leaderboard")}
        >
          <Trophy className="size-4" />
          Visit Leaderboard
        </Button>
      </div>

      {sortedContributors.length === 0 ? (
        <div className="text-center py-12">
          <Link href={"/documents/me"} className="hover:underline">
            No contributions yet. Be the first!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedContributors.map(([userId, stats]) => (
            <Link href={`/users/${userId}`} key={userId}>
              <Card className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center gap-4">
                  {stats.avatar ? (
                    <img
                      src={stats.avatar}
                      alt={stats.name}
                      className="w-12 h-12 rounded-full border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                      {stats.name[0]}
                    </div>
                  )}
                  <div>
                    <CardTitle className="flex gap-4 justify-start items-center">
                      <span className="text-lg">{stats.name}</span>
                      <Badge
                        variant={"outline"}
                        className={cn("font-sans border", {
                          "border-gray-500 text-gray-500":
                            rankingGrade(stats.reputationScore || 0) ===
                            "ROOKIE",
                          "border-gray-700 text-gray-700":
                            rankingGrade(stats.reputationScore || 0) === "IRON",
                          "border-yellow-800 text-yellow-800":
                            rankingGrade(stats.reputationScore || 0) ===
                            "BRONZE",
                          "border-cyan-500 text-cyan-500":
                            rankingGrade(stats.reputationScore || 0) ===
                            "SILVER",
                          "border-yellow-600 text-yellow-600":
                            rankingGrade(stats.reputationScore || 0) === "GOLD",
                          "border-indigo-500 text-indigo-500":
                            rankingGrade(stats.reputationScore || 0) ===
                            "ELITE",
                          "border-orange-500 text-orange-500":
                            rankingGrade(stats.reputationScore || 0) ===
                            "LEGENDARY",
                          "border-red-500 text-red-500":
                            rankingGrade(stats.reputationScore || 0) ===
                            "GRAND MASTER",
                        })}
                      >
                        {rankingGrade(stats.reputationScore)}
                      </Badge>
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {stats.count} Document{stats.count !== 1 && "s"}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
