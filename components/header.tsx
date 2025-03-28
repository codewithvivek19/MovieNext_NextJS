"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, Ticket, User, X, LogIn, TicketIcon, Film, CalendarDays, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/theaters", label: "Theaters" },
  { href: "/my-bookings", label: "My Bookings" },
]

export default function Header() {
  const pathname = usePathname()
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-8">
          <Link href="/" className="flex items-center gap-1 font-bold text-lg md:text-xl">
            <TicketIcon className="h-5 w-5" />
            <span>MovieTix</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="relative flex items-center">
              <Input
                type="search"
                placeholder="Search movies, theaters..."
                className="w-[180px] sm:w-[200px] md:w-[300px] pr-8"
                autoFocus
              />
              <Button variant="ghost" size="icon" className="absolute right-0" onClick={() => setShowSearch(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <ThemeToggle />

          <Link href="/my-bookings">
            <Button variant="ghost" size="icon">
              <Ticket className="h-5 w-5" />
              <span className="sr-only">My Bookings</span>
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item.href === "/" && <Film className="h-4 w-4" />}
                      {item.href === "/movies" && <TicketIcon className="h-4 w-4" />}
                      {item.href === "/upcoming" && <CalendarDays className="h-4 w-4" />}
                      {item.href === "/theaters" && <MapPin className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <Separator className="my-2" />
                <SheetClose asChild>
                  <Link href="/my-bookings" className="flex items-center gap-2 text-sm font-medium">
                    <Ticket className="h-4 w-4" />
                    My Bookings
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/login" className="flex items-center gap-2 text-sm font-medium">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] w-full bg-border ${className}`} />
}

