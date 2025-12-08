'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { UploadModal } from '@/components/UploadModal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <Link 
      href={href} 
      className={cn(
        "transition-colors hover:text-primary px-3 py-2 rounded-md",
        isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50"
      )}
    >
      {children}
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
            <span>🍒 Cramberry</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
             <NavLink href="/">Home</NavLink>
             <NavLink href="/community">Community</NavLink>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <SignedIn>
            <Button 
                variant={pathname === '/upload/batch' ? 'secondary' : 'ghost'} 
                asChild 
                className="cursor-pointer hidden sm:inline-flex"
            >
              <Link href="/upload/batch">Batch Upload</Link>
            </Button>
            <Button 
                variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}
                asChild 
                className="cursor-pointer"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UploadModal />
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
  )
}
