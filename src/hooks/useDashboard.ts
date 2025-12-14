import { queryOptions, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const dashboardOptions = queryOptions({
  queryKey: ["dashboard"],
  queryFn: async () => {
    const res = await client.api.dashboard.$get();
    if (!res.ok) throw new Error("Failed to fetch dashboard data");
    return await res.json();
  },
});

export function useDashboard() {
  return useQuery(dashboardOptions);
}
