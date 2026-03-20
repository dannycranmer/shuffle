import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/content/blogs/${slug}.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        setPost(data)
        document.title = `${data.title} — Shuffle`
      })
      .catch(() => setError('Blog post not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-shuffle-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-display text-2xl font-bold text-shuffle-900 tracking-tight hover:text-shuffle-700">
              shuffle
            </Link>
            <Link to="/blogs" className="text-sm text-shuffle-500 hover:text-shuffle-700">
              ← All posts
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-shuffle-300 border-t-shuffle-700" />
          </div>
        )}

        {error && !loading && (
          <p className="text-shuffle-500 text-lg py-20 text-center">{error}</p>
        )}

        {!loading && !error && post && (
          <article>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-shuffle-900 leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-shuffle-500 mb-6">
              {post.subtitle}
            </p>
            <div className="flex items-center gap-3 mb-10 text-sm text-shuffle-400">
              <span>{post.date}</span>
              <span className="text-shuffle-300">·</span>
              <span>{post.readingTime}</span>
              <span className="text-shuffle-300">·</span>
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
            </div>

            <div className="text-shuffle-600 leading-relaxed space-y-10">
              {post.sections.map((section, i) => (
                <div key={i}>
                  <h2 className="font-display text-2xl font-bold text-shuffle-900 mb-4">
                    {section.heading}
                  </h2>
                  {section.body.split('\n\n').map((paragraph, j) => (
                    <p key={j} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  )
}
