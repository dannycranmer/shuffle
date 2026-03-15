import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StoryCard from './components/StoryCard'
import DateNav from './components/DateNav'
import ShuffleButton from './components/ShuffleButton'

const SEEN_KEY_PREFIX = 'shuffle-seen-'

function getSeenStories(date) {
  try {
    const data = sessionStorage.getItem(SEEN_KEY_PREFIX + date)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function markSeen(date, storyId) {
  const seen = getSeenStories(date)
  if (!seen.includes(storyId)) {
    seen.push(storyId)
    sessionStorage.setItem(SEEN_KEY_PREFIX + date, JSON.stringify(seen))
  }
}

export default function App() {
  const { date: dateParam } = useParams()
  const navigate = useNavigate()

  const [dates, setDates] = useState([])
  const [currentDate, setCurrentDate] = useState(null)
  const [stories, setStories] = useState([])
  const [currentStory, setCurrentStory] = useState(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load index
  useEffect(() => {
    fetch('/content/index.json')
      .then((res) => res.json())
      .then((data) => {
        setDates(data.dates)
        const targetDate = dateParam && data.dates.includes(dateParam) ? dateParam : data.latestDate
        setCurrentDate(targetDate)
        if (!dateParam || dateParam !== targetDate) {
          navigate(`/date/${targetDate}`, { replace: true })
        }
      })
      .catch(() => setError('Failed to load stories index.'))
  }, [])

  // Load stories for current date
  useEffect(() => {
    if (!currentDate) return
    setLoading(true)
    setError(null)

    fetch(`/content/stories/${currentDate}.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        if (!data.stories?.length) {
          setError('The agent took the day off — no stories today.')
          setStories([])
          setCurrentStory(null)
          return
        }
        setStories(data.stories)
        // Show first unseen story, or first story
        const seen = getSeenStories(currentDate)
        const unseen = data.stories.filter((s) => !seen.includes(s.id))
        const pick = unseen.length > 0 ? unseen[0] : data.stories[0]
        setCurrentStory(pick)
        markSeen(currentDate, pick.id)
      })
      .catch(() => setError('No stories for this date.'))
      .finally(() => setLoading(false))
  }, [currentDate])

  // Get current story index
  const currentIndex = stories.findIndex((s) => s.id === currentStory?.id)

  // Navigate to a specific story by index (with flip animation)
  const goToStory = useCallback((index) => {
    if (isFlipping || !stories[index]) return
    setIsFlipping(true)
    setTimeout(() => {
      const pick = stories[index]
      markSeen(currentDate, pick.id)
      setCurrentStory(pick)
      setIsFlipping(false)
    }, 400)
  }, [stories, currentDate, isFlipping])

  // Shuffle to random unseen story (with flip animation)
  const shuffle = useCallback(() => {
    if (stories.length <= 1 || isFlipping) return

    setIsFlipping(true)
    setTimeout(() => {
      const seen = getSeenStories(currentDate)
      let pool = stories.filter((s) => !seen.includes(s.id) && s.id !== currentStory?.id)

      if (pool.length === 0) {
        sessionStorage.removeItem(SEEN_KEY_PREFIX + currentDate)
        pool = stories.filter((s) => s.id !== currentStory?.id)
      }

      const pick = pool[Math.floor(Math.random() * pool.length)]
      markSeen(currentDate, pick.id)
      setCurrentStory(pick)
      setIsFlipping(false)
    }, 400)
  }, [stories, currentDate, currentStory, isFlipping])

  // Keyboard shortcut: spacebar to shuffle
  useEffect(() => {
    function handleKey(e) {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        shuffle()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [shuffle])

  function handleDateChange(newDate) {
    setCurrentDate(newDate)
    navigate(`/date/${newDate}`)
  }

  const seenCount = currentDate ? getSeenStories(currentDate).length : 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-shuffle-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-2xl font-bold text-shuffle-900 tracking-tight">
              shuffle
            </h1>
            <span className="text-xs text-shuffle-400 hidden md:inline">press space to shuffle</span>
            <span className="text-xs text-shuffle-400 md:hidden">{currentIndex + 1} of {stories.length}</span>
          </div>
          {dates.length > 0 && currentDate && (
            <DateNav dates={dates} currentDate={currentDate} onDateChange={handleDateChange} />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-shuffle-300 border-t-shuffle-700" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-shuffle-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => setCurrentDate((d) => d)}
              className="text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && currentStory && (
          <>
            <StoryCard story={currentStory} isFlipping={isFlipping} />
            <div className="mt-10 mb-8 hidden md:block">
              <ShuffleButton
                onShuffle={shuffle}
                current={Math.min(seenCount, stories.length)}
                total={stories.length}
              />
            </div>

            {/* Mobile floating prev/next buttons */}
            {stories.length > 1 && (
              <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-4 z-20 md:hidden">
                <button
                  onClick={() => goToStory(currentIndex <= 0 ? stories.length - 1 : currentIndex - 1)}
                  disabled={isFlipping}
                  className="w-12 h-12 rounded-full bg-shuffle-900 text-white shadow-lg
                             flex items-center justify-center active:scale-95 transition-transform
                             disabled:opacity-50"
                  aria-label="Previous story"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => goToStory(currentIndex >= stories.length - 1 ? 0 : currentIndex + 1)}
                  disabled={isFlipping}
                  className="w-12 h-12 rounded-full bg-shuffle-900 text-white shadow-lg
                             flex items-center justify-center active:scale-95 transition-transform
                             disabled:opacity-50"
                  aria-label="Next story"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-shuffle-200 py-6">
        <div className="max-w-3xl mx-auto px-4 text-center text-xs text-shuffle-400">
          <p>
            Stories generated by AI. Powered by{' '}
            <a
              href="https://claude.ai"
              className="hover:text-shuffle-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claude
            </a>
            .
          </p>
          <p className="mt-1">
            Photos from{' '}
            <a
              href="https://unsplash.com"
              className="hover:text-shuffle-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Unsplash
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  )
}
