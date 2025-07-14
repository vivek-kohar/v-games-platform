'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-900 to-purple-900">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center max-w-md mx-4">
            <div className="text-red-400 text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-white mb-4">Critical Error</h2>
            <p className="text-gray-300 mb-6">
              A critical error occurred that prevented the application from loading.
            </p>
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Restart Application
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Reload Page
              </button>
            </div>
            {error.digest && (
              <p className="text-xs text-gray-400 mt-4">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
