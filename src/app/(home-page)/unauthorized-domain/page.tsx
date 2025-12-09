"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";

export default function UnauthorizedDomainPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6 border p-8 rounded-xl shadow-sm bg-card">
        <div className="flex justify-center">
          <div className="bg-destructive/10 p-4 rounded-full">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold">Access Restricted</h1>

        <div className="text-muted-foreground space-y-2">
          <p>
            You are currently signed in as:
            <br />
            <span className="font-semibold text-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </p>
          <p>
            This application is restricted to users with{" "}
            <span className="font-medium text-foreground">@nu.edu.pk</span>{" "}
            email addresses.
          </p>
        </div>

        <div className="pt-4">
          <SignOutButton redirectUrl="/sign-in">
            <Button variant="destructive" className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out & Try Again
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
