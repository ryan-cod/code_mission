#!/usr/bin/env bash
set -euo pipefail

# create_private_repo.sh
# Usage: ./create_private_repo.sh
# This script initializes a git repo in the current folder, creates a .gitignore,
# makes an initial commit and (optionally) creates a private GitHub repo via the
# GitHub CLI `gh` or by adding an HTTPS remote and pushing (you'll enter credentials).

# Check prerequisites
if ! command -v git >/dev/null 2>&1; then
  echo "git is required but not installed. Install git and try again." >&2
  exit 1
fi

CREATE_REMOTE=true
if ! command -v gh >/dev/null 2>&1; then
  CREATE_REMOTE=false
fi

# Ask for repo name and privacy
read -p "Repository name to create on GitHub (default: code_mission): " REPO_NAME
REPO_NAME=${REPO_NAME:-code_mission}

if [[ "$CREATE_REMOTE" == true ]]; then
  read -p "Create remote as private repo on GitHub? [Y/n]: " PRIVATE_ANS
  PRIVATE_ANS=${PRIVATE_ANS:-Y}
  if [[ "$PRIVATE_ANS" =~ ^[Nn]$ ]]; then
    PRIVATE_FLAG="--public"
  else
    PRIVATE_FLAG="--private"
  fi
fi

# Create .gitignore if not present
if [[ ! -f .gitignore ]]; then
  cat > .gitignore <<'EOF'
# macOS
.DS_Store

# Node / common
node_modules/
npm-debug.log
yarn-error.log

# Python
__pycache__/
*.pyc

# Editor configs
.vscode/
*.swp

# Logs
*.log
EOF
  echo "Created .gitignore"
else
  echo ".gitignore already exists — leaving it alone."
fi

# Initialize git and commit
if [[ ! -d .git ]]; then
  git init
  echo "Initialized empty git repository"
else
  echo "Git repository already initialized"
fi

git add .
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "Initial commit — add project files"
  echo "Committed files"
fi

# Ensure branch main
git branch -M main 2>/dev/null || true

# Create remote and push
if [[ "$CREATE_REMOTE" == true ]]; then
  echo "Creating private repo on GitHub (interactive) using gh..."
  gh repo create "$REPO_NAME" $PRIVATE_FLAG --source=. --remote=origin --push
  echo "Remote created and pushed to origin"
else
  echo "gh not available. You can add a remote now (HTTPS) and push; you'll be prompted for credentials."
  read -p "Add HTTPS remote and push now? [y/N]: " ADD_HTTPS
  ADD_HTTPS=${ADD_HTTPS:-N}
  if [[ "$ADD_HTTPS" =~ ^[Yy]$ ]]; then
    read -p "GitHub username (for HTTPS remote): " GITHUB_USER
    read -p "Repo name on GitHub (default: $REPO_NAME): " REMOTE_NAME
    REMOTE_NAME=${REMOTE_NAME:-$REPO_NAME}
    git remote add origin https://github.com/$GITHUB_USER/$REMOTE_NAME.git
    echo "Pushing to https://github.com/$GITHUB_USER/$REMOTE_NAME.git (you will be prompted for credentials)..."
    git push -u origin main
  else
    echo "Skipping remote creation. To add a remote later run:"
    echo "  git remote add origin git@github.com:USERNAME/$REPO_NAME.git  # or https URL"
    echo "  git push -u origin main"
  fi
fi

echo "All done."
