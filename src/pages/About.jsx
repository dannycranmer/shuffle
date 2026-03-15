import { Link } from 'react-router-dom'

export default function About() {
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
        <article className="prose-custom">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-shuffle-900 leading-tight mb-4">
            I Built a News Site That Runs Itself
          </h1>
          <p className="text-xl text-shuffle-500 mb-8">
            No editors. No CMS. No human intervention. Just an AI agent, a cron job, and effectively zero running costs.
          </p>

          <div className="text-shuffle-600 leading-relaxed space-y-6">
            <p>
              Shuffle is a news website with zero human involvement. Every morning at 6 AM UTC, an AI agent
              wakes up on an EC2 instance, scans the internet for interesting stories, writes them up, finds
              relevant photos, commits everything to a GitHub repo, and goes back to sleep. Netlify picks up
              the push and rebuilds the site. By the time you pour your coffee, there are 15 fresh stories
              waiting for you.
            </p>

            <h2 className="font-display text-2xl font-bold text-shuffle-900 mt-10">How It Works</h2>

            <p>
              The entire system has three components:
            </p>

            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>The Agent</strong> — Claude (Anthropic's AI) running via Claude Code CLI on a t3.micro
                EC2 instance. It searches Reddit, Hacker News, Google Trends, and news sites for trending topics,
                picks the most interesting ones, and writes each story with a punchy hook, 2-3 paragraphs of
                detail, relevant images from Unsplash, and source links.
              </li>
              <li>
                <strong>The Repo</strong> — A GitHub repository that serves as both the codebase and the database.
                Stories are stored as JSON files. No database. No API. No backend. The agent just does a{' '}
                <code className="bg-shuffle-100 px-1.5 py-0.5 rounded text-sm">git push</code> and the content is live.
              </li>
              <li>
                <strong>The Frontend</strong> — A React app on Netlify. It reads the JSON files and presents them
                with a shuffle mechanic — hit the button and get a random story you haven't seen yet. Card-flip
                animation on desktop, simple navigation on mobile.
              </li>
            </ol>

            <h2 className="font-display text-2xl font-bold text-shuffle-900 mt-10">The Architecture</h2>

            <div className="bg-shuffle-100 rounded-xl p-6 font-mono text-sm text-shuffle-700 overflow-x-auto">
              <pre>{`[EC2 t3.micro]              [GitHub]                [Netlify]
  Claude Code  ──git push──▶  JSON files  ──auto──▶  React SPA
  (daily cron)               + React source          (static site)
       │
       ▼
  [Bluesky]
  Auto-posts top 3 stories`}</pre>
            </div>

            <p>
              That's it. There is no step four. The entire backend is a shell script, a cron job, and a
              prompt file. The "database" is a directory of JSON files tracked by git. The "deployment
              pipeline" is Netlify watching for pushes to <code className="bg-shuffle-100 px-1.5 py-0.5 rounded text-sm">main</code>.
            </p>

            <h2 className="font-display text-2xl font-bold text-shuffle-900 mt-10">What It Costs</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-shuffle-200">
                    <th className="py-2 pr-4 font-semibold text-shuffle-800">Service</th>
                    <th className="py-2 font-semibold text-shuffle-800">Monthly Cost</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-shuffle-100">
                    <td className="py-2 pr-4">EC2 t3.micro</td>
                    <td className="py-2">Free (free tier) / ~$8 after</td>
                  </tr>
                  <tr className="border-b border-shuffle-100">
                    <td className="py-2 pr-4">Netlify hosting</td>
                    <td className="py-2">Free</td>
                  </tr>
                  <tr className="border-b border-shuffle-100">
                    <td className="py-2 pr-4">Unsplash API</td>
                    <td className="py-2">Free</td>
                  </tr>
                  <tr className="border-b border-shuffle-100">
                    <td className="py-2 pr-4">Claude (via Max subscription)</td>
                    <td className="py-2">$0 marginal (included in existing subscription)</td>
                  </tr>
                  <tr className="border-b border-shuffle-200 font-semibold">
                    <td className="py-2 pr-4">Total</td>
                    <td className="py-2">Effectively free</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="font-display text-2xl font-bold text-shuffle-900 mt-10">The Daily Routine</h2>

            <p>Here's what happens every morning without any human touching anything:</p>

            <ol className="list-decimal pl-6 space-y-2">
              <li>Cron fires at 6:00 AM UTC</li>
              <li>Script pulls the latest repo changes</li>
              <li>Claude Code launches with a detailed prompt</li>
              <li>Claude searches the web for trending topics across Reddit, HN, news sites, and more</li>
              <li>It picks 10-15 of the most interesting stories</li>
              <li>For each story: writes a hook, headline, body, finds an Unsplash image, collects sources</li>
              <li>Saves everything as a JSON file</li>
              <li>Script validates the JSON, commits, and pushes to GitHub</li>
              <li>Netlify automatically rebuilds the site</li>
              <li>Top 3 stories are posted to Bluesky</li>
              <li>Agent goes back to sleep for 24 hours</li>
            </ol>

            <h2 className="font-display text-2xl font-bold text-shuffle-900 mt-10">Why Build This?</h2>

            <p>
              I wanted to see if an AI agent could genuinely run a content business end-to-end with zero
              ongoing human effort. Not as a demo or proof of concept — as a real, live website that
              publishes real content every day.
            </p>

            <p>
              The answer is yes. It works. The stories are interesting, the site looks clean, and the
              whole thing ticks along without me doing anything. The agent occasionally finds genuinely
              surprising stories I wouldn't have discovered on my own.
            </p>

            <p>
              The most interesting part isn't the AI writing — it's the architecture. Using git as the
              database, Netlify's auto-deploy as the "backend", and a cron job as the orchestrator means
              there are essentially zero moving parts that can break. If the agent fails one day, the site
              just shows yesterday's stories. No downtime, no errors, no 3 AM pages.
            </p>

            <h2 className="font-display text-2xl font-bold text-shuffle-900 mt-10">Tech Stack</h2>

            <ul className="list-disc pl-6 space-y-1">
              <li>React + Vite + Tailwind CSS (frontend)</li>
              <li>Netlify (hosting, edge functions for OG tags)</li>
              <li>Claude Code CLI on EC2 (content generation)</li>
              <li>Unsplash API (images)</li>
              <li>GitHub (repo + "database")</li>
              <li>Bluesky API (social auto-posting)</li>
              <li>Bash + cron (orchestration)</li>
            </ul>

            <p>
              The entire project — frontend, agent, infrastructure, deployment — was built in a single
              evening with Claude Code. From empty directory to live, self-operating website in about 3 hours.
              The irony of using AI to build an AI-powered website is not lost on me.
            </p>

            <div className="border-t border-shuffle-200 mt-12 pt-8 text-sm text-shuffle-400">
              <p>
                Built by{' '}
                <a href="https://www.linkedin.com/in/dannycranmer" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Danny Cranmer
                </a>
                {' '}with{' '}
                <a href="https://claude.ai" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Claude
                </a>
                . Source code on{' '}
                <a href="https://github.com/dannycranmer/shuffle" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                .
              </p>
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t border-shuffle-200 pt-6 pb-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-xs text-shuffle-400">
          <p>
            Stories generated by AI. Powered by{' '}
            <a href="https://claude.ai" className="hover:text-shuffle-600" target="_blank" rel="noopener noreferrer">
              Claude
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  )
}
