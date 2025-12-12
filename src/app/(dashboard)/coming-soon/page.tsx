import { Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/animate-ui/components/buttons/button";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="bg-primary/10 p-4 rounded-full mb-6">
        <Rocket className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        We&apos;re working hard to bring you this feature. Stay tuned for
        exciting updates!
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
