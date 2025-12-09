"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isEmailAllowed } from "@/lib/auth-config";

export function DomainRestrictor() {
  const { user, isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      const allowed = isEmailAllowed(email);

      if (!allowed) {
        if (pathname !== "/unauthorized-domain") {
          // Force redirect if not already there
          router.push("/unauthorized-domain");
        }
      } else {
        // Allowed user
        if (pathname === "/unauthorized-domain") {
          // If they somehow got here but are allowed (switched account?), send home
          router.push("/");
        }
      }
    }
  }, [isLoaded, isSignedIn, user, pathname, router]);

  return null; // This component handles side effects only
}
