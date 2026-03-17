#!/usr/bin/env bash
set -euo pipefail

# Shuffle EC2 Setup Script
# Run this on a fresh Amazon Linux 2023 or Ubuntu instance.
#
# Prerequisites:
# - Set these environment variables before running (or add to ~/.bashrc):
#   export ANTHROPIC_API_KEY="your-key"
#   export UNSPLASH_ACCESS_KEY="your-key"
# - A deploy key (~/.ssh/shuffle_deploy_key) must be configured with write
#   access to the GitHub repo, and ~/.ssh/config must route github.com to it.
#
# Usage:
#   chmod +x setup-ec2.sh && ./setup-ec2.sh

echo "=== Shuffle EC2 Setup ==="

# Detect OS
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
else
  echo "Cannot detect OS"
  exit 1
fi

# Install Node.js 20+
echo "Installing Node.js..."
if [ "$OS" = "amzn" ]; then
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo yum install -y nodejs git
elif [ "$OS" = "ubuntu" ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
  sudo apt-get install -y nodejs git
fi

# Install Claude Code CLI
echo "Installing Claude Code..."
npm install -g @anthropic-ai/claude-code

# Configure git
echo "Configuring git..."
git config --global user.name "Shuffle Agent"
git config --global user.email "shuffle-agent@noreply.github.com"

# Clone the repo
REPO_DIR="$HOME/shuffle"
if [ ! -d "$REPO_DIR" ]; then
  echo "Cloning repository..."
  git clone git@github.com:dannycranmer/shuffle.git "$REPO_DIR"
else
  echo "Repository already exists, pulling latest..."
  cd "$REPO_DIR" && git pull --rebase origin main
fi

# Make scripts executable
chmod +x "$REPO_DIR/agent/run.sh"

# Set up cron job (6 AM UTC daily)
echo "Setting up cron job..."
CRON_CMD="0 6 * * * ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY UNSPLASH_ACCESS_KEY=$UNSPLASH_ACCESS_KEY $REPO_DIR/agent/run.sh >> $REPO_DIR/agent/logs/cron.log 2>&1"

# Remove existing shuffle cron entries and add new one
(crontab -l 2>/dev/null | grep -v "shuffle/agent/run.sh"; echo "$CRON_CMD") | crontab -

echo ""
echo "=== Setup Complete ==="
echo ""
echo "The agent will run daily at 6:00 AM UTC."
echo ""
echo "To test manually:"
echo "  cd $REPO_DIR && ./agent/run.sh"
echo ""
echo "To check logs:"
echo "  ls $REPO_DIR/agent/logs/"
echo ""
echo "Make sure these env vars are set in ~/.bashrc:"
echo "  export ANTHROPIC_API_KEY=..."
echo "  export UNSPLASH_ACCESS_KEY=..."
