"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BarChart3, Users, Mail, Home } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-5 w-5" />
            <span>Mini CRM</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <Button variant={isActive("/") ? "default" : "ghost"} size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/segments">
              <Button variant={isActive("/segments") ? "default" : "ghost"} size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Segments
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant={isActive("/campaigns") ? "default" : "ghost"} size="sm" className="gap-2">
                <Mail className="h-4 w-4" />
                Campaigns
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
