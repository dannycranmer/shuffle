#!/bin/bash
set -euxo pipefail

# Log everything
exec > /var/log/shuffle-setup.log 2>&1

# Install Node.js 20
dnf install -y nodejs git

# Install Claude Code CLI globally
npm install -g @anthropic-ai/claude-code

# Create shuffle user
useradd -m shuffle || true

# Switch to shuffle user for the rest
su - shuffle << 'SETUP'
set -euxo pipefail

# Configure git
git config --global user.name "Shuffle Agent"
git config --global user.email "shuffle-agent@noreply.github.com"

# Clone the repo
git clone https://${GITHUB_TOKEN}@github.com/dannycranmer/shuffle.git ~/shuffle

# Make scripts executable
chmod +x ~/shuffle/agent/run.sh

echo "Setup complete. Run 'claude login' as the shuffle user to authenticate."
SETUP
