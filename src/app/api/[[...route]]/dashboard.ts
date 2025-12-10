import { Hono } from "hono";
import { db } from "@/db";
import { documentAccessLogs, documents, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { DUMMY_DASHBOARD_DATA } from "@/constants/data";
import { auth } from "@clerk/nextjs/server";

const app = new Hono().get("/", async (c) => {
  const showDummy = c.req.query("showDummy") === "true";
  const { userId } = await auth();

  if (!showDummy && !userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (showDummy) {
    const userStats = {
      totalViews: DUMMY_DASHBOARD_DATA.userStats.total_views,
      reputationScore: DUMMY_DASHBOARD_DATA.userStats.reputation_score,
      totalUpvotes: DUMMY_DASHBOARD_DATA.userStats.total_upvotes,
      totalDownvotes: DUMMY_DASHBOARD_DATA.userStats.total_downvotes,
    };

    const myDocs = DUMMY_DASHBOARD_DATA.myDocs.map((d) => ({
      id: "dummy",
      title: d.title,
      viewCount: d.view_count,
      createdAt: new Date(d.created_at),
      upvoteCount: 0,
      downvoteCount: 0,
    }));

    const recentDocs = DUMMY_DASHBOARD_DATA.recentDocs.map((d) => ({
      id: d.id,
      documentId: "dummy",
      accessedAt: new Date(d.accessed_at),
      document: {
        id: "dummy",
        title: d.document.title,
        subject: d.document.subject,
        uploaderName: d.document.uploader_name,
      },
    }));

    return c.json({
      userStats,
      myDocs,
      activityLogs: [],
      recentDocs,
      totalTimeSpent: DUMMY_DASHBOARD_DATA.totalTimeSeconds,
      subjectInterests: DUMMY_DASHBOARD_DATA.subjectInterests,
      uploadsChartData: DUMMY_DASHBOARD_DATA.uploadsOverTime,
      viewsChartData: DUMMY_DASHBOARD_DATA.viewsOverTime,
      topDocs: myDocs
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5)
        .map((doc) => ({
          label: doc.title,
          value: doc.viewCount || 0,
          fill: "hsl(var(--chart-2))",
        })),
    });
  }

  // Real Data
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  // 1. Fetch User Stats
  const stats = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  // 2. My Documents
  const myDocs = await db.query.documents.findMany({
    where: eq(documents.userId, userId),
    orderBy: [desc(documents.createdAt)],
  });

  // 3. Activity Logs
  const logs = await db.query.documentAccessLogs.findMany({
    where: eq(documentAccessLogs.userId, userId),
    orderBy: [documentAccessLogs.accessedAt],
    with: {
      document: {
        columns: {
          subject: true,
        },
      },
    },
  });

  // Total Time
  const totalTimeSpent = (logs || []).reduce(
    (acc, log) => acc + (log.timeSpentSeconds || 0),
    0
  );

  // Subject Interests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subjectCounts = (logs || []).reduce((acc: any, log: any) => {
    const subject = log.document?.subject || "Uncategorized";
    acc[subject] = (acc[subject] || 0) + 1;
    return acc;
  }, {});
  const subjectInterests = Object.entries(subjectCounts)
    .map(([subject, count]) => ({ subject, score: count as number }))
    .slice(0, 6);

  // 4. Recently Accessed
  const recent = await db.query.documentAccessLogs.findMany({
    where: eq(documentAccessLogs.userId, userId),
    orderBy: [desc(documentAccessLogs.accessedAt)],
    limit: 10,
    with: {
      document: {
        columns: {
          id: true,
          title: true,
          subject: true,
          uploaderName: true,
        },
      },
    },
  });

  // A. Uploads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uploadsByMonth = (myDocs || []).reduce((acc: any, doc: any) => {
    const month = format(new Date(doc.createdAt), "MMM yyyy");
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const uploadsChartData = Object.entries(uploadsByMonth).map(
    ([month, count]) => ({
      month,
      value: count as number,
    })
  );

  // B. Views
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewsByMonth = (logs || []).reduce((acc: any, log: any) => {
    const month = format(new Date(log.accessedAt), "MMM yyyy");
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const viewsChartData = Object.entries(viewsByMonth).map(([month, count]) => ({
    month,
    value: count as number,
  }));

  // C. Top Docs
  const topDocs = [...(myDocs || [])]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5)
    .map((doc) => ({
      label: doc.title,
      value: doc.viewCount || 0,
      fill: "hsl(var(--chart-2))",
    }));

  return c.json({
    userStats: stats
      ? {
          totalViews: stats.totalViews || 0,
          reputationScore: stats.reputationScore || 0,
          totalUpvotes: stats.totalUpvotes || 0,
          totalDownvotes: stats.totalDownvotes || 0,
        }
      : null,
    myDocs,
    activityLogs: logs,
    recentDocs: recent,
    totalTimeSpent,
    subjectInterests,
    uploadsChartData,
    viewsChartData,
    topDocs,
  });
});

export default app;
