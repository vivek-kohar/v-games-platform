"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Gamepad2, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  LayoutDashboard,
  Trophy,
  Settings,
  Bell
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, authRequired: true },
  { name: "Games", href: "/games", icon: Gamepad2 },
  { name: "Achievements", href: "/achievements", icon: Trophy, authRequired: true },
]

export function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const filteredNavItems = navigationItems.filter(item => 
    !item.authRequired || status === "authenticated"
  )

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "glass border-b border-white/20 backdrop-blur-xl bg-gray-900/80" 
          : "bg-gray-900/60 backdrop-blur-sm"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Gamepad2 className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-all duration-200">
                  V-Games
                </h1>
                <div className="text-xs text-gray-300 -mt-1">Platform</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href))
                
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex items-center space-x-2 text-gray-200 hover:text-white hover:bg-white/15 transition-all duration-200",
                        isActive && "text-cyan-300 bg-cyan-400/15 hover:bg-cyan-400/25"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {status === "authenticated" ? (
                <>
                  {/* Notifications */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex relative text-gray-200 hover:text-white hover:bg-white/15"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                  
                  {/* User Menu */}
                  <div className="flex items-center space-x-2 glass rounded-lg px-3 py-2 bg-white/10 border-white/20">
                    <User className="h-4 w-4 text-cyan-300" />
                    <span className="hidden sm:inline text-sm text-white font-medium">
                      {session?.user?.name?.split(' ')[0] || 'Player'}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm" className="text-gray-200 hover:text-white hover:bg-white/15">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold pulse-glow">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-gray-200 hover:text-white hover:bg-white/15"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/20 backdrop-blur-xl bg-gray-900/90">
            <div className="px-4 py-4 space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href))
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-gray-200 hover:text-white hover:bg-white/15",
                        isActive && "text-cyan-300 bg-cyan-400/15"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
              
              {status !== "authenticated" && (
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-gray-200 hover:text-white hover:bg-white/15">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
} 