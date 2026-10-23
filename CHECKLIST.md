# Japan Saathi: Win Checklist

Status as of 24 Oct 2026. ✅ done and verified · 🟡 partial / by design · ⬜ team action needed.

The checklist combines three sources:
1. **Everything our deck promises** (slides 2–7 of `Japan Hackathon Final.pdf`).
2. **What hackathon judges reward.** Typical weighting: Innovation 20–25%, Technical 20–25%, Impact 20–25%, Demo/Presentation 15–20%, Completeness 10–15%. Sources:
   - [Reskilll: what judges look for](https://blogs.reskilll.com/what-hackathon-judges-look-for-complete-judging-criteria-breakdown-2026/)
   - [Reskilll: 3-minute pitch](https://blogs.reskilll.com/hackathon-demo-presentation-tips-pitch-3-minutes-win-2026/)
   - [JetBrains: notes from the judging table](https://blog.jetbrains.com/ai/2026/06/how-to-win-a-hackathon-notes-from-the-judging-table/)
   - [HackerEarth: 10 tips](https://www.hackerearth.com/blog/10-tips-win-hackathon)
   - [Builderbase: judging rubrics](https://intercom.help/builderbase/en/articles/14831464-hackathon-playbook-ch-15-judging-rubrics)
3. **What a real travel app needs** to be trusted (quality, safety, offline, accessibility).

---

## A. Deck promises (slides 2–7)

| # | Deck promise | Status | Evidence in the app |
|---|---|---|---|
| A1 | **Dietary friction:** flag hidden dashi / animal fat for Veg, Jain, Halal (slide 2) | ✅ | Scan tab. The dictionary engine flags かつおエキス, ゼラチン, ラード, みりん, onion and garlic for Jain, and more. `npm run eval:rules`: 70/70, **0 false "safe"** (incl. garbled-input cases) |
| A2 | **Cultural anxiety:** onsen, shoes, shrines, trash, tipping (slide 2) | ✅ | Manners tab: step-by-step guides for shrine, onsen, temple and train; etiquette on every place page; tips in each trip day |
| A3 | **Pre-trip distance:** engaging discovery (slide 2) | ✅ | Vintage poster gallery, India–Japan connections, explore map with real photos, 3D/AR |
| A4 | **Language & last mile:** taxi drivers, station staff (slide 2) | ✅ | Full-screen Kanji taxi cards with **natural Japanese audio** ("Play for the driver"); phrases with audio |
| A5 | **Perceived cost** vs Western Europe (slide 2) | ✅ | Trip Studio prices the trip in ₹ and shows **"Same money, other places"** vs Switzerland, Paris, Singapore, Dubai |
| A6 | **Explore Japan:** interactive map, famous places, history, facts, India–Japan links (slide 4) | ✅ | Home poster gallery + map (real prefecture geometry, tap for Wikimedia photo); place pages with India connection and fun fact |
| A7 | **WebAR preview:** 3D landmarks before booking (slide 4) | ✅ | Place pages: `<model-viewer>` 3D plus "View on your table" (Android Scene Viewer / iOS Quick Look) |
| A8 | **AI trip planner** from dates, interests, travel needs (slide 4) | ✅ | Trip Studio boarding pass (who, diet, days, cities, budget, style, pace, interests) → agent → verified board |
| A9 | **Smart budget** in INR + JPY; compare transit options (slide 4) | ✅ | Receipt card in ₹ and ¥; JR Pass vs single tickets; leg-by-leg train / metro / walk times |
| A10 | **Dietary guide:** suitable food, flag animal-derived ingredients (slide 4) | ✅ | Scanner + chef cards + curated restaurants with "verified / ask staff / chef card" badges on every meal |
| A11 | **Culture companion:** simple visual guides (slide 4) | ✅ | Manners tab (seal-stamped step cards) |
| A12 | **Local mobility:** destination cards, pronunciation, transport guidance (slide 4) | ✅ | Taxi cards (kanji, romaji, phonetic, audio) + route legs |
| A13 | **One connected experience:** inspiration → on-ground (slide 4) | ✅ | Explore → Studio → Today → Scan/Manners, all linked; Today re-plans from where you are |
| A14 | PWA client with WebAR & camera UI (slide 5) | ✅ | Installable PWA (manifest, icons, service worker), camera capture on Scan |
| A15 | Central AI agent with tool router (slide 5) | ✅ | 7 tools; parallel calls; streaming; Gemini or Claude |
| A16 | Context & session memory: Redis (slide 5) | 🟡 | Trip and conversation live on the device (localStorage). **Pitch:** Redis is the production step |
| A17 | RAG etiquette: vector DB (slide 5) | 🟡 | The etiquette corpus is small enough to be a tool, not a vector DB. **Pitch:** a vector DB once the corpus grows |
| A18 | SQLite itineraries & food DB (slide 5) | 🟡 | Typed data modules in `src/data/`. **Pitch:** a DB is the production step |
| A19 | Object storage for 3D models (slide 5) | ✅ | Static `/models/*.glb` (CDN-served when deployed) |
| A20 | **Risk: dietary false negatives** → dual whitelist + chef cards (slide 6) | ✅ | "AI reads, rules decide": the AI can only make a verdict stricter. Pre-translated polite chef cards, with audio |
| A21 | **Risk: offline gaps** → PWA caches taxi cards, etiquette, dietary dictionary (slide 6) | ✅ | Service worker precaches every taxi/chef/place page, Manners, models and **all 26 audio clips**; paste-mode label check runs on the phone |
| A22 | **Risk: driver/merchant hesitation** → zero-touch high-contrast cards (slide 6) | ✅ | Taxi card: huge kanji, white background, no chrome, landscape layout, audio |
| A23 | Slide 7: "zero-ML OCR" | ⬜ **Fix the deck** | We use LLM vision to read labels and **rules to decide**. Reword to *"AI reads, rules decide: zero false 'safe'"* |
| A24 | Slide 7: "demystifying etiquette via WebAR" | 🟡 | AR is used for landmarks; etiquette is taught through visual guides. Reword or show the AR torii as the etiquette hook |
| A25 | Slide 3 says "Japan Saathi", slides 1/7 say "Yātrā Japan" | ⬜ **Fix the deck** | The app is **Japan Saathi**. Use one name everywhere |

## B. What judges reward

| # | Criterion | Status | How we hit it |
|---|---|---|---|
| B1 | **Innovation:** not "another chatbot", not an API wrapper | ✅ | Two "AI proposes, code verifies" systems: rules-decided label verdicts, and a code-verified itinerary ledger the user can see |
| B2 | Novel combination / underserved users | ✅ | Indian Jain/veg/halal families with elders: a specific, underserved segment |
| B3 | **Technical:** it works live, end to end, doesn't crash | ✅ | Prod build passes; zero console errors on all pages; error boundary + styled 404; every AI failure has a friendly fallback |
| B4 | Handles bad input | ✅ | zod validation on every API; unreadable labels → "unsure"; tool inputs validated; per-visitor rate limits |
| B5 | Sound architecture (simple is fine if well-structured) | ✅ | Provider layer (Gemini/Claude), pure verifier, pure rules engine, typed data; see README |
| B6 | Not hard-coded / pre-loaded only | ✅ | Live AI planning and label reading, live weather, live photos. The cache only replays identical requests, and says so in the UI |
| B7 | **Impact:** specific user, measurable benefit | 🟡 | User: Jain family with 68-year-old parents. **Say the number on stage:** "checks 245 hidden-ingredient spellings (kanji, kana, English) in ~5 s; every meal on a 6-day plan is checked" |
| B8 | Grounded in research, not a solution looking for a problem | ✅ | Slide 2's five barriers each map to a feature (table A1–A5) |
| B9 | **Demo:** working result within ~90 s | ✅ | Script in README: scan → verdict stamp in ~5 s; Studio board in ~20 s (instant if pre-warmed) |
| B10 | First-attempt flawless demo | ⬜ | Rehearse ×5 on the venue network; run `node scripts/record-demo.mjs` for a backup video |
| B11 | Hook in 20 s + a surprise + humour | ⬜ | Hook: "Priya's parents are Jain, and the instant noodles have fish in them." Surprise: AR torii on the judges' table, and the audio playing to an imaginary taxi driver |
| B12 | No placeholder content | ✅ | Real places, real photos (Wikimedia), real weather; no lorem ipsum |
| B13 | **Completeness:** every screen works end to end | ✅ | Explore, Place, Taxi, Chef, Scan, Studio, Today, Manners, 404, error |
| B14 | **Live URL** | ⬜ | Deploy to Vercel (see README). Judges can scan a QR code on the last slide |
| B15 | One thing done really well | ✅ | Hero moment: the 不可 stamp on a real snack, with the hidden ingredient highlighted |

## C. Quality bar for a real travel app

| # | Item | Status | Evidence |
|---|---|---|---|
| C1 | Accessibility | ✅ | **Lighthouse Accessibility 100** on all 6 main pages, light and dark; `lang="ja"` on Japanese; focus rings; reduced-motion respected |
| C2 | Best practices / SEO | ✅ | **100 / 100** on all pages; link-preview image for WhatsApp |
| C3 | Performance on slow 4G | ✅ | 66–84 (simulated slow 4G). Japanese fonts self-hosted and subset: **148 files / 2.6 MB → 4 files / ~390 KB**. CLS ≤ 0.02 |
| C4 | Offline | ✅ | Taxi, chef, manners, place pages, models and audio all precached; paste-mode scan runs offline |
| C5 | Audio works on every phone | ✅ | 26 natural-voice MP3s bundled (all validated: decodable, real volume); device voice only as fallback |
| C6 | Navigation feels native | ✅ | Directional view transitions, poster morph, anchored tab bar, optimistic tab highlight, tap-again-to-top |
| C7 | Dark mode | ✅ | "Dusk edition" palette; contrast verified |
| C8 | Secrets safe | ✅ | Keys only in `.env.local` (git-ignored); keys never sent to the browser |
| C9 | Abuse / quota protection | ✅ | Per-visitor rate limits; free-tier model chain + caching |
| C10 | Privacy | ✅ | Label photos aren't stored; location only on tap; trip stays on the device |
| C11 | Attribution / licences | ✅ | Wikimedia photo credit, Open-Meteo credit, map data (MIT) noted in code |
| C12 | Safety info | ✅ | Emergency numbers (offline, tap-to-call) |
| C13 | Tests | ✅ | `npm run check`: types + 70 rules checks + 8 verifier scenarios; `eval:scan` on photos |

## D. Team actions before demo day (cannot be done by code)

- [ ] **Verify data:** restaurants (`src/data/food.ts`), addresses (`src/data/destinations.ts`), comparison prices (`src/data/costs.ts` → `COMPARE`), embassy and hotline numbers (`src/data/culture.ts`), `FX.jpyToInr`.
- [ ] **Real label photos:** add 15–20 to `fixtures/labels/` + `expected.json`, then `npm run eval:scan` must show FALSE SAFE 0.
- [ ] **Buy the demo snack** (instant noodles / chips with かつおエキス or チキンエキス) and scan it in rehearsal.
- [ ] **Deploy** to Vercel with `GEMINI_API_KEY`; put a QR code on the final slide.
- [ ] **Pre-warm** the demo brief once on the deployed URL (instant replay on stage).
- [ ] **Fix the deck:** one name (Japan Saathi), drop "zero-ML OCR", add the "AI proposes, code verifies" slide, keep the architecture slide labelled *production roadmap*.
- [ ] **Rehearse** the 3-minute script five times; record a backup video.
- [ ] If quota is tight on demo day: a second free Gemini key in `.env.local`, or an `ANTHROPIC_API_KEY`.
