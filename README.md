# Shuffle

An agent-driven news website that generates and publishes interesting stories every day — completely autonomously.

A Claude agent runs daily on EC2, scans the internet for trending and fascinating topics, writes up 10-20 stories, and commits them to this repo. Netlify auto-deploys the React frontend. No human intervention required.

## How It Works

```
EC2 (Claude Agent)  →  git push  →  GitHub Repo  →  Netlify Auto-Deploy
     ↑ daily cron                    (JSON content)      (React SPA)
```

1. **Daily cron** triggers the agent at 6:00 AM UTC
2. **Agent discovers topics** from Reddit, Hacker News, Google Trends, news sites, and web search
3. **Agent generates stories** with headlines, hooks, body text, Unsplash images, tags, and source links
4. **Agent commits** the day's stories as a JSON file to `public/content/stories/`
5. **Netlify rebuilds** the site automatically
6. **Users visit the site**, navigate between days, and press **Shuffle** to cycle through random stories

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sample stories are included for development.

## Project Structure

```
shuffle/
  src/                          # React frontend
    components/
      StoryCard.jsx             # Story display (image, headline, hook, body, links)
      DateNav.jsx               # Date navigation arrows
      ShuffleButton.jsx         # Shuffle button with story counter
      TagPills.jsx              # Colored tag chips
    App.jsx                     # Main app with routing and shuffle logic
    main.jsx                    # Entry point with React Router
    index.css                   # Tailwind + card-flip animation
  public/content/               # Story data (the "database")
    index.json                  # Available dates index
    stories/YYYY-MM-DD.json     # Daily story files
  agent/
    prompt.md                   # Claude Code prompt for story generation
    run.sh                      # Cron entry point script
    setup-ec2.sh                # EC2 provisioning script
    schema/                     # JSON validation schema
  netlify.toml                  # Netlify build config + SPA redirect
```

## Story Format

Each day's stories are stored in `public/content/stories/YYYY-MM-DD.json`:

```json
{
  "date": "2026-03-15",
  "stories": [
    {
      "id": "2026-03-15-001",
      "headline": "Scientists Discover New Species of Glowing Shark",
      "hook": "A punchy one-liner that grabs attention.",
      "body": "2-3 paragraphs of detail...",
      "image": { "url": "...", "alt": "...", "credit": "...", "creditUrl": "..." },
      "links": [{ "title": "Source", "url": "..." }],
      "tags": ["Science", "Marine Biology"],
      "readingTime": "2 min read",
      "sources": ["Reddit r/science"]
    }
  ]
}
```

## EC2 Agent Setup

1. Launch a **t3.micro** instance (free tier eligible)
2. SSH in and set environment variables:
   ```bash
   export ANTHROPIC_API_KEY="your-anthropic-key"
   export UNSPLASH_ACCESS_KEY="your-unsplash-key"
   ```
3. Add a **deploy key** to the repo (Settings → Deploy keys) with write access:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/shuffle_deploy_key -N ""
   cat ~/.ssh/shuffle_deploy_key.pub  # Add this to GitHub
   ```
   Configure SSH to use it:
   ```bash
   cat >> ~/.ssh/config << 'EOF'
   Host github.com
     IdentityFile ~/.ssh/shuffle_deploy_key
     IdentitiesOnly yes
   EOF
   ```
4. Run the setup script:
   ```bash
   curl -O https://raw.githubusercontent.com/dannycranmer/shuffle/main/agent/setup-ec2.sh
   chmod +x setup-ec2.sh
   ./setup-ec2.sh
   ```
5. Test manually: `cd ~/shuffle && ./agent/run.sh`
6. The cron job is already configured to run daily at 6 AM UTC

## Netlify Deployment

Connect this repo to Netlify with these settings:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Auto-deploy:** on push to `main`

The `netlify.toml` handles SPA routing automatically.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router
- **Content:** Static JSON files committed to the repo
- **Agent:** Claude Code CLI running on EC2 via cron
- **Images:** Unsplash API (free tier)
- **Hosting:** Netlify (free tier)

## Cost

| Service | Cost |
|---------|------|
| EC2 t3.micro | Free (12 months), then ~$8/mo |
| Netlify | Free |
| Unsplash API | Free |
| Claude API | ~$1-3/day |
| **Total** | **~$30-90/month** (mostly Claude API) |

## License

MIT
