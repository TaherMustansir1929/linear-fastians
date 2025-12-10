"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBarLabelCustom } from "@/components/charts/bar-chart-cutom-label";
import { ChartLineLinear } from "@/components/charts/line-chart-linear";
import { ChartAreaAxes } from "@/components/charts/area-chart-axes";
import { RadialChart } from "@/components/charts/radial-chart";
import { RadarChartInterests } from "@/components/charts/radar-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  Eye,
  FileText,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  Activity,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { rankingGrade } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function DashboardContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await client.api.dashboard.$get();
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return await res.json();
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
        Error loading dashboard: {error.message}
      </div>
    );
  }

  if (!data) return null;

  const {
    userStats,
    myDocs,
    recentDocs,
    totalTimeSpent,
    subjectInterests,
    uploadsChartData,
    viewsChartData,
    topDocs,
  } = data;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-mono">
          {rankingGrade(userStats?.reputationScore || 0)}
        </span>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.totalViews || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all your documents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.reputationScore || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on community interaction
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documents Shared
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myDocs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Contributions to the platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Votes</CardTitle>
            <div className="flex gap-1">
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(userStats?.totalUpvotes || 0) -
                (userStats?.totalDownvotes || 0)}
            </div>
            <div className="flex text-xs text-muted-foreground gap-2">
              <span className="flex items-center gap-1 text-green-600">
                <ThumbsUp className="h-3 w-3" /> {userStats?.totalUpvotes || 0}
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <ThumbsDown className="h-3 w-3" />{" "}
                {userStats?.totalDownvotes || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Time Spent (Radial) & Activity (Area) & Subjects (Radar) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-2">
          <RadialChart
            timeSpentSeconds={totalTimeSpent || 0}
            title="Time Invested"
            description="Total active time"
            footerText="Keep learning!"
          />
        </div>
        <div className="col-span-3">
          {viewsChartData && viewsChartData.length > 0 ? (
            <ChartAreaAxes
              data={viewsChartData}
              title="My Activity"
              description="Views over time"
              footerTitle={
                <span className="flex gap-2 items-center">
                  Logged View Activity <Activity className="h-4 w-4" />
                </span>
              }
            />
          ) : (
            <Card className="h-full flex justify-center items-center text-muted-foreground p-6">
              No activity data.
            </Card>
          )}
        </div>
        <div className="col-span-2">
          {subjectInterests.length > 0 ? (
            <RadarChartInterests
              data={subjectInterests}
              title="Interests"
              description="Most viewed subjects"
              footerText="Subject distribution"
            />
          ) : (
            <Card className="h-full flex justify-center items-center text-muted-foreground p-6">
              No subject data.
            </Card>
          )}
        </div>
      </div>

      {/* Row 2: Top Docs & Uploads */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          {topDocs.length > 0 ? (
            <ChartBarLabelCustom
              data={topDocs}
              title="Top Performing Documents"
              description="Your most viewed files"
              footerDescription="Top 5 documents by views"
            />
          ) : (
            <Card className="h-full flex flex-col justify-center items-center p-6 text-muted-foreground">
              <Trophy className="h-12 w-12 mb-4 opacity-20" />
              <p>No documents uploaded yet.</p>
            </Card>
          )}
        </div>
        <div className="col-span-3">
          {uploadsChartData && uploadsChartData.length > 0 ? (
            <ChartLineLinear
              data={uploadsChartData}
              title="Upload Frequency"
              description="Your contributions over time"
              footerTitle="Consistency Check"
            />
          ) : (
            <Card className="h-full flex flex-col justify-center items-center p-6 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>Start uploading!</p>
            </Card>
          )}
        </div>
      </div>

      {/* Recently Accessed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Accessed</CardTitle>
          <div className="text-sm text-muted-foreground">
            The last 10 documents you viewed.
          </div>
        </CardHeader>
        <CardContent>
          {recentDocs && recentDocs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead className="text-right">Accessed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDocs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/documents/${log.documentId}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                        {log.document?.title || "Unknown Document"}
                      </Link>
                    </TableCell>
                    <TableCell>{log.document?.subject || "N/A"}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3" />
                      {log.document?.uploaderName || "Unknown"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {log.accessedAt
                        ? format(new Date(log.accessedAt), "MMM d, h:mm a")
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recently accessed documents.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
