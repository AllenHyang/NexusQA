#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Starting Project Validation...${NC}"

# 1. Linting
echo -e "\n${GREEN}👉 Running Lint Check...${NC}"
if npm run lint; then
    echo -e "${GREEN}✅ Linting Passed!${NC}"
else
    echo -e "${RED}❌ Linting Failed! Please fix the errors above.${NC}"
    exit 1
fi

# 2. Testing
echo -e "\n${GREEN}👉 Running Tests...${NC}"
# Running tests with coverage to ensure we meet standards
if npm test -- --passWithNoTests; then
    echo -e "${GREEN}✅ Tests Passed!${NC}"
else
    echo -e "${RED}❌ Tests Failed! Please fix the failing tests.${NC}"
    exit 1
fi

echo -e "\n${GREEN}🚀 Validation Successful! You are ready to commit/push.${NC}"
exit 0
