"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Users, Trophy, Shield, Star, Play, ArrowRight, Sparkles } from "lucide-react"

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
      <div className="min-h-screen flex items-center justify-center gradient-dark">
        <div className="glass rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-lg text-white">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full filter blur-3xl"></div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          {/* Hero Badge */}
          <div className="inline-flex items-center glass rounded-full px-6 py-3 mb-8">
            <Sparkles className="h-4 w-4 text-cyan-400 mr-2" />
            <span className="text-sm font-medium text-white">Welcome to the Future of Gaming</span>
            <Star className="h-4 w-4 text-yellow-400 ml-2" />
          </div>

          {/* Hero Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient-gaming">V-Games</span>
            <br />
            <span className="text-white">Platform</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Experience the next generation of web gaming with 
            <span className="text-cyan-400 font-semibold"> persistent progress</span>, 
            <span className="text-purple-400 font-semibold"> social features</span>, and 
            <span className="text-pink-400 font-semibold"> incredible adventures</span>
          </p>

          {/* Hero Actions */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-glow-lg pulse-glow">
                <Play className="h-5 w-5 mr-2" />
                Start Playing Now
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="glass border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl">
                Learn More
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { label: "Active Players", value: "2.3K+", icon: Users },
            { label: "Games Available", value: "15+", icon: Gamepad2 },
            { label: "Achievements", value: "200+", icon: Trophy },
            { label: "Hours Played", value: "50K+", icon: Star }
          ].map((stat, index) => (
            <div key={index} className="glass rounded-xl p-6 text-center card-hover">
              <stat.icon className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose <span className="text-gradient-gaming">V-Games</span>?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience gaming like never before with our cutting-edge features and community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            {
              icon: Gamepad2,
              title: "Multiple Games",
              description: "Play various web games including Minecraft, Snake, Tetris, and more with regular updates!",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: Shield,
              title: "Save Progress",
              description: "Your game progress is automatically saved and synced across all your devices seamlessly.",
              gradient: "from-green-500 to-emerald-500"
            },
            {
              icon: Trophy,
              title: "Achievements",
              description: "Unlock achievements, earn rewards, and compete with other players on global leaderboards.",
              gradient: "from-yellow-500 to-orange-500"
            },
            {
              icon: Users,
              title: "Social Gaming",
              description: "Connect with friends, share achievements, and participate in community events.",
              gradient: "from-purple-500 to-pink-500"
            }
          ].map((feature, index) => (
            <Card key={index} className="glass border-white/10 card-hover group">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-6">Featured Games</h3>
          <p className="text-xl text-gray-300">Jump into these amazing experiences right now</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              emoji: "⛏️",
              title: "Minecraft Web",
              description: "Build, explore, and survive in a procedurally generated 2D world with blocks, terrain generation, and physics-based gameplay.",
              gradient: "from-green-500 to-emerald-600",
              players: "2.3K"
            },
            {
              emoji: "🐍",
              title: "Snake Game",
              description: "Classic snake game with modern graphics, power-ups, and multiplayer support. Grow your snake and dominate!",
              gradient: "from-purple-500 to-violet-600",
              players: "1.8K"
            },
            {
              emoji: "🧩",
              title: "Tetris",
              description: "The timeless puzzle game with modern visuals and challenging game modes. Clear lines and achieve high scores!",
              gradient: "from-blue-500 to-cyan-600",
              players: "956"
            }
          ].map((game, index) => (
            <Card key={index} className="glass border-white/10 card-hover group overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${game.gradient}`}></div>
              <CardHeader className="text-center">
                <div className="text-6xl mb-4 group-hover:animate-bounce">{game.emoji}</div>
                <CardTitle className="text-white text-xl mb-2">{game.title}</CardTitle>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{game.players} playing</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center mb-4">
                  {game.description}
                </CardDescription>
                <Button className={`w-full bg-gradient-to-r ${game.gradient} hover:opacity-90 text-white`}>
                  Play Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-intense rounded-3xl p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Gaming Adventure?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of players and discover your next favorite game today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold rounded-xl pulse-glow">
                Create Free Account
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="glass border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 glass border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Gamepad2 className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl font-bold text-gradient-gaming">V-Games Platform</span>
          </div>
          <p className="text-gray-400 mb-4">
            The future of web gaming is here. Join the revolution.
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 V-Games Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
