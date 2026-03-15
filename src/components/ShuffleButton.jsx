export default function ShuffleButton({ onShuffle, current, total }) {
  return (
    <div className="fixed bottom-10 left-0 right-0 flex flex-col items-center gap-2 z-20">
      <button
        onClick={onShuffle}
        className="group relative px-8 py-3 bg-shuffle-900 text-white rounded-full font-semibold text-lg
                   hover:bg-shuffle-800 active:scale-95 transition-all duration-150
                   shadow-lg hover:shadow-xl cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Shuffle
        </span>
      </button>
      <span className="text-xs font-medium text-shuffle-600 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
        {current} of {total}
      </span>
    </div>
  )
}
