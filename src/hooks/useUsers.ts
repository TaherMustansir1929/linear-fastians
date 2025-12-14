import { queryOptions, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { User } from "@/types";

export const userOptions = (userId: string) =>
  queryOptions({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await client.api.users[":id"].$get({ param: { id: userId } });
      if (!res.ok) return null;
      const data = await res.json();
      if ("error" in data) return null;
      return data as User;
    },
  });

export function useUser(userId: string) {
  return useQuery(userOptions(userId));
}

export const leaderboardOptions = queryOptions({
  queryKey: ["leaderboard"],
  queryFn: async () => {
    const res = await client.api.users.leaderboard.$get();
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    const data = await res.json();
    return data as User[];
  },
});

export function useLeaderboard() {
  return useQuery(leaderboardOptions);
}
