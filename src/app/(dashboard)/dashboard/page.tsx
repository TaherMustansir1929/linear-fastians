import { supabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@clerk/nextjs/server";
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
import { Button } from "@/components/ui/button";
import { DUMMY_DASHBOARD_DATA } from "@/constants/data";

export default async function DashboardPage() {
  const { userId } = await auth();

  // ENV Variable Switch
  const showDummy = process.env.SHOW_DUMMY_METRICS === "true";

  if (!userId && !showDummy) {
    return <div className="p-8">Please sign in to view your dashboard.</div>;
  }

  // --- Data Fetching ---
  let userStats, myDocs, activityLogs, recentDocs, totalTimeSpent;
  let subjectInterests = [];

  if (showDummy) {
    userStats = DUMMY_DASHBOARD_DATA.userStats;
    myDocs = DUMMY_DASHBOARD_DATA.myDocs;
    // Transforming dummy arrays to match DB response structure roughly if needed
    // But for charts we might just use the dummy data directly if processed

    // Mocking DB aggregates for consistency
    totalTimeSpent = DUMMY_DASHBOARD_DATA.totalTimeSeconds;
    recentDocs = DUMMY_DASHBOARD_DATA.recentDocs;
    subjectInterests = DUMMY_DASHBOARD_DATA.subjectInterests;
  } else {
    // 1. Fetch User Stats
    const { data: stats } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId!)
      .single();
    userStats = stats;

    // 2. Fetch User Documents
    const { data: docs } = await supabaseAdmin
      .from("documents")
      .select("id, title, created_at, view_count, upvote_count, downvote_count")
      .eq("user_id", userId!)
      .order("created_at", { ascending: true });
    myDocs = docs;

    // 3. Activity Logs & Time Spent
    const { data: logs } = await supabaseAdmin
      .from("document_access_logs")
      .select("accessed_at, time_spent_seconds, document:documents(subject)")
      .eq("user_id", userId!)
      .order("accessed_at", { ascending: true });
    activityLogs = logs;

    // Total Time
    totalTimeSpent = (logs || []).reduce(
      (acc, log) => acc + (log.time_spent_seconds || 0),
      0
    );

    // Subject Interests (Frequency by Subject)
    const subjectCounts = (logs || []).reduce((acc: any, log: any) => {
      const subject = log.document?.subject || "Uncategorized";
      acc[subject] = (acc[subject] || 0) + 1; // Or + time_spent? Let's do frequency for now as requested "frequency of documents viewed"
      return acc;
    }, {});
    subjectInterests = Object.entries(subjectCounts)
      .map(([subject, count]) => ({ subject, score: count as number }))
      .slice(0, 6); // Limit for radar chart

    // 4. Recently Accessed
    const { data: recent } = await supabaseAdmin
      .from("document_access_logs")
      .select("*, document:documents(id, title, subject, uploader_name)")
      .eq("user_id", userId!)
      .order("accessed_at", { ascending: false })
      .limit(10);
    recentDocs = recent;
  }

  // --- Data Processing for Charts ---

  // A. Uploads
  let uploadsChartData;
  if (showDummy) {
    uploadsChartData = DUMMY_DASHBOARD_DATA.uploadsOverTime;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadsByMonth = (myDocs || []).reduce((acc: any, doc: any) => {
      const month = format(new Date(doc.created_at), "MMM yyyy");
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    uploadsChartData = Object.entries(uploadsByMonth).map(([month, count]) => ({
      month,
      value: count as number,
    }));
  }

  // B. Views (Activity)
  let viewsChartData;
  if (showDummy) {
    viewsChartData = DUMMY_DASHBOARD_DATA.viewsOverTime;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viewsByMonth = (activityLogs || []).reduce((acc: any, log: any) => {
      const month = format(new Date(log.accessed_at), "MMM yyyy");
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    viewsChartData = Object.entries(viewsByMonth).map(([month, count]) => ({
      month,
      value: count as number,
    }));
  }

  // C. Top Docs
  const topDocs = [...(myDocs || [])]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5)
    .map((doc) => ({
      label: doc.title,
      value: doc.view_count || 0,
      fill: "hsl(var(--chart-2))",
    }));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {showDummy && (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-mono">
            OVERHAUL MODE
          </span>
        )}
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
              {userStats?.total_views || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all your documents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reputation Score
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.reputation_score || 0}
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
              {(userStats?.total_upvotes || 0) -
                (userStats?.total_downvotes || 0)}
            </div>
            <div className="flex text-xs text-muted-foreground gap-2">
              <span className="flex items-center gap-1 text-green-600">
                <ThumbsUp className="h-3 w-3" /> {userStats?.total_upvotes || 0}
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <ThumbsDown className="h-3 w-3" />{" "}
                {userStats?.total_downvotes || 0}
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
                {recentDocs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/documents/${log.document_id}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                        {log.document?.title || "Unknown Document"}
                      </Link>
                    </TableCell>
                    <TableCell>{log.document?.subject || "N/A"}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3" />
                      {log.document?.uploader_name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {log.accessed_at
                        ? format(new Date(log.accessed_at), "MMM d, h:mm a")
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
