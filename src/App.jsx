import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
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
  const location = useLocation()

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
        // Check for story ID in hash (from shared link)
        const hashFragment = window.location.hash.slice(1)
        const linkedStory = hashFragment && data.stories.find((s) => s.id === `${currentDate}-${hashFragment}` || s.id === hashFragment)
        if (linkedStory) {
          setCurrentStory(linkedStory)
          markSeen(currentDate, linkedStory.id)
        } else {
          const seen = getSeenStories(currentDate)
          const unseen = data.stories.filter((s) => !seen.includes(s.id))
          const pick = unseen.length > 0 ? unseen[0] : data.stories[0]
          setCurrentStory(pick)
          markSeen(currentDate, pick.id)
        }
      })
      .catch(() => setError('No stories for this date.'))
      .finally(() => setLoading(false))
  }, [currentDate])

  // Shuffle to random unseen story (with flip animation)
  const shuffle = useCallback(() => {
    if (stories.length <= 1 || isFlipping) return

    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      const shortId = pick.id.replace(`${currentDate}-`, '')
      window.history.replaceState(null, '', `/date/${currentDate}#${shortId}`)
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

  // Update page title with current story
  useEffect(() => {
    if (currentStory) {
      document.title = `${currentStory.headline} — Shuffle`
    } else {
      document.title = 'Shuffle — Daily Stories'
    }
  }, [currentStory])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-shuffle-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="font-display text-2xl font-bold text-shuffle-900 tracking-tight hover:text-shuffle-700">
              shuffle
            </Link>
            <span className="text-xs text-shuffle-400 hidden md:inline">press space to shuffle</span>
            <span className="text-xs text-shuffle-400 md:hidden">{Math.min(seenCount, stories.length)} of {stories.length}</span>
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
            {stories.length > 1 && (
              <ShuffleButton
                onShuffle={shuffle}
                current={Math.min(seenCount, stories.length)}
                total={stories.length}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-shuffle-200 pt-6 pb-28">
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
              href="https://unsplash.com/?utm_source=shuffle&utm_medium=referral"
              className="hover:text-shuffle-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Unsplash
            </a>
            {' · '}
            <Link to="/about" className="hover:text-shuffle-600">
              How this site works
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
