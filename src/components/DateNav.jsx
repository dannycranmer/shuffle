export default function DateNav({ currentDate, dates, onDateChange }) {
  const currentIndex = dates.indexOf(currentDate)
  const hasNewer = currentIndex > 0
  const hasOlder = currentIndex < dates.length - 1

  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      <button
        onClick={() => hasOlder && onDateChange(dates[currentIndex + 1])}
        disabled={!hasOlder}
        className="p-2 rounded-lg hover:bg-shuffle-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Older stories"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <time className="text-sm font-medium text-shuffle-500" dateTime={currentDate}>
        {formatDate(currentDate)}
      </time>

      <button
        onClick={() => hasNewer && onDateChange(dates[currentIndex - 1])}
        disabled={!hasNewer}
        className="p-2 rounded-lg hover:bg-shuffle-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Newer stories"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
