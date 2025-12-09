"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { UploadModal } from "@/components/UploadModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-primary px-3 py-2 rounded-md",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50"
      )}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-6">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2">
                    <Image
                      src={"/icon.svg"}
                      alt="logo"
                      width={24}
                      height={24}
                    />
                    Linear
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <NavLink href="/">Home</NavLink>
                  <NavLink href="/welcome">Welcome</NavLink>
                  <NavLink href="/leaderboard">Leaderboard</NavLink>
                  <NavLink href="/community">Community</NavLink>
                  <SignedIn>
                    <NavLink href="/dashboard">Dashboard</NavLink>
                    <NavLink href="/upload/batch">Batch Upload</NavLink>
                  </SignedIn>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-xl"
          >
            <Image src={"/icon.svg"} alt="logo" width={24} height={24} />
            <span className="hidden md:inline">Linear</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/welcome">Welcome</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
            <NavLink href="/community">Community</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SignedIn>
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "outline"}
              asChild
              className="cursor-pointer hidden sm:inline-flex"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            {/* <UploadModal /> */}
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
