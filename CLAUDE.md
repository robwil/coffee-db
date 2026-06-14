# Coffee DB

## Rules

- **Never delete the local SQLite database** (`data/coffee.db`). Even in local dev, the user may have important data in there. If seed data changes, note that the DB needs a manual re-seed — don't delete and recreate it.
- **Verify UI changes with Playwright screenshots.** When making visual/frontend changes, use `npx playwright screenshot --wait-for-timeout 1000 [--full-page] <url> /tmp/<name>.png` to capture and review the result. Start the dev server with `npm run dev` first. This catches layout issues, clipping, and styling problems before reporting the task as complete.
