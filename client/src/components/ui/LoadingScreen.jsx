// src/components/ui/LoadingScreen.jsx
// Unified loading component for the entire app

const ShimmerBar = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-xl bg-white/[0.06] ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
  </div>
);

const LoadingScreen = ({ message = "Loading...", inline = false, skeleton = false }) => {
  // Inline spinner — for small sections (reviews, notes, tabs)
  if (inline) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-8 h-8 border-[3px] border-white/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">{message}</p>
        </div>
      </div>
    );
  }

  // Skeleton — for dashboards with fixed layouts (header + stats + content)
  if (skeleton) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-indigo-900">
        {/* Skeleton Header */}
        <div className="bg-white/[0.04] border-b border-white/[0.06] backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <ShimmerBar className="h-8 sm:h-10 w-48 sm:w-72 mb-3" />
            <ShimmerBar className="h-4 sm:h-5 w-64 sm:w-96" />
          </div>
        </div>

        {/* Skeleton Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <ShimmerBar key={i} className="h-10 w-24 sm:w-32 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Skeleton Stat Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 sm:p-6">
                <ShimmerBar className="h-10 w-10 rounded-xl mb-4" />
                <ShimmerBar className="h-7 w-16 mb-2" />
                <ShimmerBar className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="rounded-2xl sm:rounded-3xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
            {/* Content header */}
            <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-white/[0.06]">
              <ShimmerBar className="h-6 w-40 sm:w-56" />
            </div>
            {/* Content rows */}
            <div className="p-6 sm:p-8 space-y-4 sm:space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <ShimmerBar className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <ShimmerBar className="h-5 w-3/4" />
                      <ShimmerBar className="h-4 w-1/2" />
                      <div className="flex gap-3 pt-1">
                        <ShimmerBar className="h-8 w-20 rounded-xl" />
                        <ShimmerBar className="h-8 w-20 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shimmer keyframe (injected once) */}
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // Default — Full-page centered spinner matching index.html preloader
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/80 to-indigo-900 font-sans">
      <div className="w-[60px] h-[60px] rounded-full border-4 border-white/10 border-t-cyan-500 border-r-purple-500 animate-spin mb-5" />
      <div className="text-2xl font-extrabold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-transparent bg-clip-text tracking-wide">
        Trainify
      </div>
      {message !== "Loading..." && (
        <p className="text-white/50 text-sm font-medium mt-3 tracking-wide">{message}</p>
      )}
    </div>
  );
};

export default LoadingScreen;
