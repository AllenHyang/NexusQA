#!/bin/bash

# NexusQA Release Script
# Usage: ./scripts/release.sh [major|minor|patch] "Release notes"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current version from lib/version.ts
CURRENT_VERSION=$(grep -o 'APP_VERSION = "[^"]*"' lib/version.ts | sed 's/APP_VERSION = "//;s/"//')

if [ -z "$CURRENT_VERSION" ]; then
    echo -e "${RED}Error: Could not read current version from lib/version.ts${NC}"
    exit 1
fi

echo -e "${BLUE}Current version: ${YELLOW}v${CURRENT_VERSION}${NC}"

# Parse version components
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Determine version bump type
BUMP_TYPE=${1:-patch}
RELEASE_NOTES=${2:-""}

case $BUMP_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
    *)
        echo -e "${RED}Error: Invalid bump type '$BUMP_TYPE'. Use: major, minor, or patch${NC}"
        exit 1
        ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"

echo -e "${GREEN}New version: ${YELLOW}v${NEW_VERSION}${NC}"
echo ""

# Confirm with user
read -p "Proceed with release v${NEW_VERSION}? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Release cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Step 1/5: Updating version in lib/version.ts...${NC}"
sed -i '' "s/APP_VERSION = \"${CURRENT_VERSION}\"/APP_VERSION = \"${NEW_VERSION}\"/" lib/version.ts

echo -e "${BLUE}Step 2/5: Updating version in package.json...${NC}"
sed -i '' "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${NEW_VERSION}\"/" package.json

echo -e "${BLUE}Step 3/5: Committing version bump...${NC}"
git add lib/version.ts package.json
git commit -m "chore: bump version to ${NEW_VERSION}"

echo -e "${BLUE}Step 4/5: Pushing to remote...${NC}"
git push origin main

echo -e "${BLUE}Step 5/5: Creating GitHub release...${NC}"

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI (gh) not found. Please create release manually at:${NC}"
    echo -e "${BLUE}https://github.com/AllenHyang/NexusQA/releases/new?tag=v${NEW_VERSION}${NC}"
    exit 0
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Not authenticated with GitHub CLI. Please run 'gh auth login' first.${NC}"
    echo -e "${BLUE}Or create release manually at: https://github.com/AllenHyang/NexusQA/releases/new?tag=v${NEW_VERSION}${NC}"
    exit 0
fi

# Get release notes
if [ -z "$RELEASE_NOTES" ]; then
    echo ""
    echo -e "${YELLOW}Enter release notes (press Ctrl+D when done):${NC}"
    RELEASE_NOTES=$(cat)
fi

# Create release
gh release create "v${NEW_VERSION}" \
    --title "v${NEW_VERSION}" \
    --notes "${RELEASE_NOTES}" \
    --latest

echo ""
echo -e "${GREEN}✅ Release v${NEW_VERSION} created successfully!${NC}"
echo -e "${BLUE}View release: https://github.com/AllenHyang/NexusQA/releases/tag/v${NEW_VERSION}${NC}"
