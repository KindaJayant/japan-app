# Run Japan Saathi locally: prompt for your coding agent

Unzip the project, open the folder in your editor, and paste everything in the box below into your coding agent (Cursor, Copilot, Codex, Gemini CLI, Claude Code, Windsurf, anything). It's written to work with any agent.

You need: **Node.js 20 or newer** and a **free Gemini API key** from https://aistudio.google.com/apikey (each teammate should use their own key; the free tier is per key).

---

```text
You are helping me run and modify "Japan Saathi", a Next.js 16 + React 19 + TypeScript + Tailwind v4 PWA
(a Japan travel companion for Indian travellers). The project folder is the current working directory.

STEP 1: Set up and run it
1. Check `node -v` is 20 or newer. If not, tell me to install Node 22 LTS and stop.
2. Run `npm install`.
3. Create a file named `.env.local` in the project root containing exactly:
       GEMINI_API_KEY=<ask me for my key and paste it here>
   Never print the key back to me, never commit it, never put it in any other file.
   (`.env.local` is already in .gitignore.)
4. Run `npm run check`. Expect "64/64 checks passed · FALSE SAFE: 0" and "8 plans · all checks behave".
   If anything fails, show me the output and stop.
5. Start the dev server with `npm run dev` and give me the URL (http://localhost:3000).
6. Smoke test (open each URL, or use a browser tool if you have one):
   /           home: vintage posters, map, tab bar with 5 tabs
   /scan       "Paste ingredients instead" → "Try a sample" → a red 不可 (Avoid) stamp appears
   /plan       press "Design my trip" → tool steps tick by → a "Checked for you" trip board appears (~20-40 s)
   /today      live weather for the day's city
   /manners    "Play" buttons play Japanese audio
   /taxi/fushimi-inari  full-screen kanji card with "Play for the driver"
   Report what worked and what didn't.

STEP 2: Learn the project before changing anything
Read, in order: README.md, CHECKLIST.md, then skim:
- src/lib/diet/engine.ts + dictionary.ts  (label verdicts: AI reads, RULES decide; the AI may only make a verdict stricter)
- src/lib/itinerary.ts                    (code that verifies every AI trip plan: diet, budget, stairs, routing)
- src/lib/llm/                            (Gemini free-tier client with model fallback, throttling, cache; Claude alternative)
- src/lib/agent/tools.ts + prompt.ts      (the planner's tools and instructions)
- src/data/                               (places, food, costs, etiquette, culture: plain TypeScript data)
- src/app/globals.css                     (design tokens and the vintage design language)

STEP 3: House rules for every change
- Keep the design language: 1930s Japan Tourist Bureau poster in pastel inks on washi paper. Use the CSS tokens
  (bg-washi, text-sumi, bg-sakura, bg-mizu, bg-yamabuki, bg-matcha, text-shu…), the `ink`/`ink-shadow`/`press`
  utility classes, Fraunces for display (`display` class), Zen Maru Gothic for body, Shippori Mincho (`font-mincho`)
  for Japanese. No generic SaaS look: no purple gradients, no emoji-as-icons, no stock or AI-generated images.
- Safety rule: never let AI output alone mark food "safe". Add new ingredients to dictionary.ts and a test case
  to scripts/eval-rules.ts; FALSE SAFE must stay 0.
- New planner constraints go in src/lib/itinerary.ts with a case in scripts/eval-plan.ts.
- Japanese text: put `lang="ja"` on it. If you add NEW fixed Japanese lines or kanji, run `npm run fonts`
  (re-subsets fonts) and `npm run audio` (generates speech clips; free tier ≈10 clips/day per model).
- Internal links: use next/link with transitionTypes={["nav-forward"]} for "go deeper" navigation.
- Next.js 16 differs from older versions: page `params` are Promises (await them). Check
  node_modules/next/dist/docs/ before using an unfamiliar Next API.
- After every change: `npm run check`, `npx eslint src`, and `npm run build` must all pass.
- Commit in small steps with clear messages. Never commit .env.local or anything containing a key.

STEP 4: Troubleshooting
- "Saathi isn't connected": .env.local is missing or misnamed, or you didn't restart the dev server after creating it.
- "Every free Gemini model is busy" / slow plans: free-tier limits. Wait a minute, or add a second key.
  Optional overrides in .env.local: GEMINI_MODELS=..., GEMINI_RPM=...
- Port 3000 in use: `npm run dev -- -p 3001`.
- Windows: run commands in PowerShell or Git Bash from the project root.

When setup is done, summarise the state of the app and ask me what I want to change.
```

---

**Repo:** https://github.com/KindaJayant/japan-app (this zip includes the git history, so `git pull` / `git push` work once you have access).
