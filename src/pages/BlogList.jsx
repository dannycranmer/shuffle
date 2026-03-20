import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function BlogList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = 'Blog — Shuffle'
    fetch('/content/blogs/blog-index.json')
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => setPosts(data.posts))
      .catch(() => setError('Failed to load blog posts.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-shuffle-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-display text-2xl font-bold text-shuffle-900 tracking-tight hover:text-shuffle-700">
              shuffle
            </Link>
            <Link to="/" className="text-sm text-shuffle-500 hover:text-shuffle-700">
              ← Back to stories
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-shuffle-900 leading-tight mb-4">
          Blog
        </h1>
        <p className="text-xl text-shuffle-500 mb-10">
          Behind the scenes of an AI-powered news site.
        </p>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-shuffle-300 border-t-shuffle-700" />
          </div>
        )}

        {error && !loading && (
          <p className="text-shuffle-500 text-lg py-20 text-center">{error}</p>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blogs/${post.slug}`}
                className="block group"
              >
                <article className="border border-shuffle-200 rounded-xl p-6 hover:border-shuffle-400 transition-colors">
                  <div className="flex items-center gap-3 mb-3 text-sm text-shuffle-400">
                    <span>{post.date}</span>
                    <span className="text-shuffle-300">·</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-shuffle-900 group-hover:text-shuffle-700 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-shuffle-600 leading-relaxed mb-4">
                    {post.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 bg-shuffle-100 text-shuffle-600 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
