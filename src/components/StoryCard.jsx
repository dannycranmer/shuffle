import { useState, useEffect } from 'react'
import TagPills from './TagPills'

export default function StoryCard({ story, isFlipping }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Reset image state when story changes
  useEffect(() => {
    setImageError(false)
    setImageLoading(true)
  }, [story?.id])

  if (!story) return null

  return (
    <div className="flip-container">
      <article className={`flip-card ${isFlipping ? 'flipping' : ''} md:pb-0 pb-24`}>
        {/* Hero Image */}
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-shuffle-200 to-shuffle-300">
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-shuffle-300 border-t-shuffle-600" />
            </div>
          )}
          {!imageError ? (
            <img
              src={story.image.url}
              alt={story.image.alt}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoading(false)}
              onError={() => { setImageError(true); setImageLoading(false) }}
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-shuffle-400 text-lg font-medium">
                {story.tags?.[0] || 'Story'}
              </span>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-shuffle-400 text-sm">{story.readingTime}</span>
          <span className="text-shuffle-300">·</span>
          <TagPills tags={story.tags} />
        </div>

        {/* Headline */}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-shuffle-900 leading-tight mb-4">
          {story.headline}
        </h1>

        {/* Hook */}
        <p className="text-lg md:text-xl text-shuffle-700 font-medium leading-relaxed mb-6">
          {story.hook}
        </p>

        {/* Body */}
        <div className="prose prose-shuffle max-w-none mb-8">
          {story.body.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-shuffle-600 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Related Links */}
        {story.links?.length > 0 && (
          <div className="border-t border-shuffle-200 pt-6 mb-6">
            <h3 className="text-sm font-semibold text-shuffle-500 uppercase tracking-wide mb-3">
              Related
            </h3>
            <ul className="space-y-2">
              {story.links.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                  >
                    {link.title} →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources & Image Credit */}
        <div className="border-t border-shuffle-200 pt-4 text-xs text-shuffle-400">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Sources: {story.sources?.join(', ')}</span>
            {story.image.credit && (
              <a
                href={story.image.creditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-shuffle-600"
              >
                {story.image.credit}
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
