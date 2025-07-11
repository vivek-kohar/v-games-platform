"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Users, Trophy, Shield } from "lucide-react"

export default function Home() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">V-Games Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to V-Games Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Play amazing web games with persistent progress, achievements, and social features. 
            Your gaming journey starts here!
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                Start Playing Now
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Gamepad2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Multiple Games</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Play various web games including Minecraft, Snake, Tetris, and more!
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Save Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your game progress is automatically saved and synced across devices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Unlock achievements and compete with other players on leaderboards.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Social Gaming</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect with friends and share your gaming achievements.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Featured Games */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">Featured Games</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-6xl text-center mb-4">🎮</div>
                <CardTitle className="text-center">Minecraft Web</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Build, explore, and survive in a procedurally generated 2D world with blocks, 
                  terrain generation, and physics-based gameplay.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-6xl text-center mb-4">🐍</div>
                <CardTitle className="text-center">Snake Game</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Classic snake game with modern graphics and power-ups. 
                  Grow your snake and avoid obstacles!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-6xl text-center mb-4">🧩</div>
                <CardTitle className="text-center">Tetris</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  The timeless puzzle game where you arrange falling blocks 
                  to clear lines and achieve high scores.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Gaming?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of players and start your gaming adventure today!
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Gamepad2 className="h-6 w-6" />
            <span className="text-lg font-semibold">V-Games Platform</span>
          </div>
          <p className="text-gray-400">
            © 2024 V-Games Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
