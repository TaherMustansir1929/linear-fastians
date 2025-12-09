import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Medal, Trophy } from "lucide-react";

export const metadata = {
  title: "Linear - Leaderboard",
  description: "Top contributors of the Linear community.",
};

export default async function LeaderboardPage() {
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("reputation_score", { ascending: false })
    .limit(50); // Top 50

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
            {users?.map((user, index) => (
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
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback>{user.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {user.full_name || "Anonymous"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                      {user.role || "Student"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {user.reputation_score}
                </TableCell>
                <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                  {user.total_views}
                </TableCell>
                <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                  {user.total_upvotes}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
