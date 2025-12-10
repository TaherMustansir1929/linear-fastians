import DashboardContent from "./DashboardContent";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();

  // ENV Variable Switch - we might want to pass this to the client component or let API handle it
  // The API dashboard.ts already handles SHOW_DUMMY_METRICS env on server side.
  // So we just need to render the client component.

  if (!userId) {
    const showDummy = process.env.SHOW_DUMMY_METRICS === "true";
    if (!showDummy) {
      return <div className="p-8">Please sign in to view your dashboard.</div>;
    }
  }

  return <DashboardContent />;
}
