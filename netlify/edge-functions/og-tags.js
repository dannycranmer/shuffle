const BOT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot|Googlebot/i

export default async function handler(request, context) {
  const ua = request.headers.get('user-agent') || ''

  // Only intercept for social crawlers
  if (!BOT_PATTERN.test(ua)) {
    return context.next()
  }

  const url = new URL(request.url)
  const dateMatch = url.pathname.match(/^\/date\/(\d{4}-\d{2}-\d{2})/)

  if (!dateMatch) {
    return context.next()
  }

  const date = dateMatch[1]
  const storyIndex = url.hash?.slice(1) || url.searchParams.get('story')

  try {
    // Fetch the stories JSON
    const storiesUrl = new URL(`/content/stories/${date}.json`, url.origin)
    const res = await fetch(storiesUrl)
    if (!res.ok) return context.next()

    const data = await res.json()
    if (!data.stories?.length) return context.next()

    // Find the specific story or default to first
    let story = data.stories[0]
    if (storyIndex) {
      const found = data.stories.find(
        (s) => s.id === `${date}-${storyIndex}` || s.id === storyIndex
      )
      if (found) story = found
    }

    const siteUrl = `${url.origin}/date/${date}`
    const title = `${story.headline} — Shuffle`
    const description = story.hook
    const image = story.image?.url || `${url.origin}/og-image.png`

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Shuffle" />
  <meta property="og:title" content="${escapeHtml(story.headline)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${siteUrl}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(story.headline)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <meta http-equiv="refresh" content="0;url=${siteUrl}" />
</head>
<body>
  <h1>${escapeHtml(story.headline)}</h1>
  <p>${escapeHtml(story.hook)}</p>
</body>
</html>`

    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  } catch {
    return context.next()
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export const config = {
  path: '/date/*',
}
