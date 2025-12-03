# cleanup-github

A React/Vite application to list and delete GitHub repositories.

## Features

- List all your GitHub repositories
- Select repositories for deletion
- Delete selected repositories
- Personal Access Token (PAT) authentication

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

4. Enter your GitHub Personal Access Token (PAT) with `delete_repo` scope to use the app

## Creating a GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate a new token with the following scopes:
   - `repo` (Full control of private repositories)
   - `delete_repo` (Delete repositories)
3. Copy the token and use it in the app

## Tech Stack

- React 19
- Vite
- GitHub REST API
