'use client'

import Link from 'next/link'
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { UploadModal } from '@/components/UploadModal'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
          <span>📚 PrepShare</span>
        </Link>
        <div className="flex items-center gap-4">
          <SignedIn>
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
