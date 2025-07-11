"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Gamepad2, 
  User, 
  LogOut, 
  Play, 
  Trophy, 
  Clock, 
  Star, 
  Users, 
  TrendingUp,
  Award,
  Target,
  Calendar,
  Activity
} from "lucide-react"

const games = [
  {
    id: "minecraft",
    name: "Minecraft Web",
    description: "Build, explore, and survive in a procedurally generated 2D world!",
    thumbnail: "⛏️",
    category: "Sandbox",
    slug: "minecraft",
    gradient: "from-green-500 to-emerald-600",
    players: "2.3K",
    rating: 4.8,
    status: "Hot",
    lastPlayed: "2 hours ago"
  },
  {
    id: "snake",
    name: "Snake Game",
    description: "Classic snake game with modern twist and multiplayer support",
    thumbnail: "🐍",
    category: "Arcade",
    slug: "snake",
    gradient: "from-purple-500 to-violet-600",
    players: "1.8K",
    rating: 4.6,
    status: "New",
    lastPlayed: "1 day ago"
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "The classic block-stacking puzzle game reimagined",
    thumbnail: "🧩",
    category: "Puzzle",
    slug: "tetris",
    gradient: "from-blue-500 to-cyan-600",
    players: "956",
    rating: 4.9,
    status: "Featured",
    lastPlayed: "3 days ago"
  }
]

const recentActivity = [
  { game: "Minecraft Web", action: "Achieved 'Master Builder'", time: "2 hours ago", icon: "🏆" },
  { game: "Snake Game", action: "High Score: 2,840 points", time: "1 day ago", icon: "🎯" },
  { game: "Tetris", action: "Completed 15 lines", time: "3 days ago", icon: "⚡" }
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState("")
  const [savedGameState, setSavedGameState] = useState<{ score: number; level: number; updatedAt?: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch saved game state
  useEffect(() => {
    const fetchSavedGame = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/games/minecraft/save")
          if (response.ok) {
            const gameState = await response.json()
            if (gameState.data) {
              setSavedGameState({
                score: gameState.score || 0,
                level: gameState.level || 1,
                updatedAt: gameState.updatedAt
              })
            }
          }
        } catch (error) {
          console.error("Failed to fetch saved game:", error)
        }
      }
    }

    fetchSavedGame()
  }, [status])

  const quickActions = [
    { 
      title: "Continue Playing", 
      subtitle: savedGameState 
        ? `Score: ${savedGameState.score} • Level ${savedGameState.level}` 
        : "Resume Minecraft", 
      icon: Play, 
      color: "text-green-600 bg-green-100",
      href: "/games/minecraft"
    },
    { 
      title: "View Achievements", 
      subtitle: "7 unlocked", 
      icon: Trophy, 
      color: "text-yellow-600 bg-yellow-100",
      href: "#achievements"
    },
    { 
      title: "Friend Activity", 
      subtitle: "3 friends online", 
      icon: Users, 
      color: "text-blue-600 bg-blue-100",
      href: "#friends"
    },
    { 
      title: "Weekly Challenge", 
      subtitle: "2 days left", 
      icon: Target, 
      color: "text-purple-600 bg-purple-100",
      href: "#challenges"
    }
  ]

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white mx-auto mb-6"></div>
            <Gamepad2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-2">Loading V-Games</div>
          <div className="text-lg text-gray-300">Preparing your gaming experience...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gray-900/20 opacity-20 pointer-events-none z-0" 
           style={{
             backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), 
                              radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)`
           }}>
      </div>
      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Player'}! 🎮
          </h2>
          <p className="text-xl text-gray-300 mb-6">Ready for your next adventure?</p>
          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action, index) => {
              const content = (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-full ${action.color} mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">{action.title}</div>
                    <div className="text-xs text-gray-400">{action.subtitle}</div>
                  </CardContent>
                </Card>
              )
              return action.href?.startsWith('/') ? (
                <Link key={index} href={action.href} legacyBehavior>
                  <a>{content}</a>
                </Link>
              ) : (
                <div key={index} onClick={() => action.href && (window.location.hash = action.href)}>
                  {content}
                </div>
              )
            })}
          </div>
        </div>
        {/* Featured Game */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 text-6xl opacity-20">⛏️</div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-green-400 uppercase tracking-wide">Featured Game</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Minecraft Web</h3>
              <p className="text-gray-300 mb-4">Build, explore, and survive with friends in real-time multiplayer!</p>
              {savedGameState && (
                <div className="mb-3 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="text-sm text-green-400 font-medium">Your Progress:</div>
                  <div className="text-white">Score: {savedGameState.score} • Level {savedGameState.level}</div>
                  {savedGameState.updatedAt && (
                    <div className="text-xs text-gray-400">Last saved: {new Date(savedGameState.updatedAt).toLocaleString()}</div>
                  )}
                </div>
              )}
              <div className="flex items-center space-x-4">
                <Link href="/games/minecraft">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
                    <Play className="h-4 w-4 mr-2" />
                    {savedGameState ? "Continue Game" : "Play Now"}
                  </Button>
                </Link>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>2.3K online</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{savedGameState?.updatedAt ? 
                      `Last played ${new Date(savedGameState.updatedAt).toLocaleDateString()}` : 
                      "Last played 2h ago"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Gamepad2 className="h-6 w-6 mr-2 text-cyan-400" />
            Your Games
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card key={game.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${game.gradient}`}></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{game.thumbnail}</div>
                      <div>
                        <CardTitle className="text-lg text-white group-hover:text-cyan-400 transition-colors">
                          {game.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-400">
                          {game.category}
                        </CardDescription>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      game.status === 'Hot' ? 'bg-red-500/20 text-red-400' :
                      game.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {game.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-300 mb-4 text-sm">{game.description}</p>
                  
                  <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{game.players}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span>{game.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{game.lastPlayed}</span>
                    </div>
                  </div>
                  
                  <Link href={`/games/${game.slug}`}>
                    <Button className={`w-full bg-gradient-to-r ${game.gradient} hover:opacity-90 transition-opacity`}>
                      <Play className="h-4 w-4 mr-2" />
                      Play Game
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dashboard Layout: Stats + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-cyan-400" />
              Your Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Games Library</CardTitle>
                    <Gamepad2 className="h-8 w-8 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400 mb-1">3</div>
                  <p className="text-gray-400 text-sm">Available games</p>
                  <div className="mt-3 bg-blue-500/20 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Total Score</CardTitle>
                    <Trophy className="h-8 w-8 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-1">12,840</div>
                  <p className="text-gray-400 text-sm">Points earned</p>
                  <div className="mt-3 bg-green-500/20 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full w-4/5"></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Achievements</CardTitle>
                    <Award className="h-8 w-8 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-400 mb-1">12</div>
                  <p className="text-gray-400 text-sm">Unlocked badges</p>
                  <div className="mt-3 bg-purple-500/20 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full w-3/5"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Activity className="h-6 w-6 mr-2 text-cyan-400" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">{activity.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {activity.game}
                        </div>
                        <div className="text-sm text-gray-300">
                          {activity.action}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white mb-1">Weekly Challenge</div>
                  <div className="text-xs text-gray-400">Beat 3 games this week</div>
                  <div className="text-xs text-cyan-400 mt-2">2 days remaining</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
