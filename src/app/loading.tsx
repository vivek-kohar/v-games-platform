export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <div className="text-lg text-white">Loading V-Games Platform...</div>
        <div className="text-sm text-gray-300 mt-2">Please wait while we prepare your gaming experience</div>
      </div>
    </div>
  )
}
