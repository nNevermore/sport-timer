#!/bin/bash
set -e

echo "Bumping version..."

# Bump package.json (prevents creating a git tag immediately)
NEW_VERSION=$(npm version patch --no-git-tag-version)
CLEAN_VERSION=${NEW_VERSION#v}

echo "New version: $CLEAN_VERSION"

# Update tauri.conf.json
node -e "
const fs = require('fs');
const configPath = 'src-tauri/tauri.conf.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
config.version = '$CLEAN_VERSION';
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
"

echo "Version bumped to $CLEAN_VERSION"
