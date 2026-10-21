# CLAUDE.md

PLTGM ("plate game") is a word game. The player gets a random US license plate and has 60 seconds to enter English words that contain all the plate's letters in order (plate `TEN8646` → "beaten", "tent"). Each accepted word scores its length and adds 2 seconds to the clock. High scores are kept per letter sequence (the "triplet").

Monorepo with two independent packages. There is no root `package.json`.

- `server/`: Node 24 (`.nvmrc`), Hono, socket.io, better-sqlite3, LogTape. Managed with **npm**.
- `client/`: Vue 3 + Pinia + Vite, socket.io-client. Managed with **bun** (`bun.lock`).

## Commands

Server (run in `server/`):

```sh
npm run dev          # tsx watch, port 3001
npm run mock         # dev with a fixed plate (MOCK_TEXT=6ING123 MOCK_STATE=CA)
npm test             # vitest (watch); `npx vitest run path/to/file.spec.ts` for a single file
npm run coverage
npm run lint         # eslint + tsc --noEmit
```

Client (run in `client/`):

```sh
bun run dev          # vite, port 5174, proxies /ws to the server
bun run test:unit    # vitest + jsdom; tests live in src/__tests__/**/*.spec.ts
bun run lint         # eslint + vue-tsc --noEmit
bun run build        # type-check + vite build
```

Full stack: `docker compose up` from the repo root (dev targets, source mounted). Production uses `docker-compose.prod.yml`: nginx serves the built client and terminates TLS, certbot renews certs, and `init-letsencrypt.sh` is the one-time cert bootstrap.

## Required local assets (not in git)

- `server/assets/english-words.txt`: newline-delimited word list. **The server won't start without it.** `server/assets/` is gitignored.
- `server/assets/distSettings.json` (optional): `[["Q", 1], ...]` letter weights for plate generation (4 = normal, 0 = never).
- Client: `src/assets/fonts/LicensePlate.ttf`, `src/assets/plates/ca.jpg are not committed. See `client/src/assets/LICENSES.md`. `client/nginx.conf` for prod is not committed to protect sensitive configuration details.

## Architecture

Gameplay runs entirely over **socket.io** on path `/ws`. Hono's HTTP routes are just CORS, logging, and an error handler, with no REST API. Event names are in `SOCKETS` in `server/src/common/constants.ts`.

Game flow:

1. Client emits `game:create`. In `server/src/features/games.ts`, the server picks an origin from `PlateOriginsList`, generates plate text from `PLATE_FORMAT_DICT` (`L` = weighted random letter, `N` = digit), and strips the digits and spaces to get the `triplet`. It saves the row, then emits `game:created` and `game:start`.
2. The server owns the clock. `TimerService` (an in-memory `Map` of gameId to stopTime) holds the deadline. A loop in `createGame` emits `game:ping` with the remaining ms every 5s. The client counts down locally every 100ms and resyncs on each ping.
3. Client emits `word:check`. `server/src/features/words.ts` validates the guess with `DictionaryService.checkWord`, a SQL `LIKE '%t%e%n%'` against the `dictionary` table. On success it records the guess, updates the score, extends the timer, and emits `game:score`, `game:ping`, and `word:check:result`.
4. When time runs out (or the client emits `game:end`, e.g. on `beforeunload`), the server emits `game:ended` with the top 10 scores for that triplet. The player can then submit a name with `game:high-score`, which takes an ack callback and only succeeds once per ended game.

Server layout (`server/src/`). Use the `#` import aliases defined in `server/package.json` `imports`:

- `index.ts`: bootstrap. Starts Hono, logging, socket.io, runs the SQLite migration, then loads the dictionary.
- `features/`: socket event handlers. `#features/*`
- `shared/services/`: `GameService` and `DictionaryService` (static classes over SQLite), plus `TimerService` (a singleton). `#services/*`
- `integrations/sqlite.ts`: the shared `client` (path from `DB_PATH`, default `./data/pltgm.db`, WAL mode). `queries.ts` has every SQL string, using named `@params`. `#integrations/*`
- `scripts/migrate.sql`: idempotent `CREATE TABLE IF NOT EXISTS` schema (`games`, `dictionary`, `guesses`). It runs on every boot, so schema changes must stay idempotent.
- `common/`: types and constants **shared with the client**. `#common/*`

The DB uses snake_case columns. `GameService` maps rows to the camelCase `Game` type by hand.

The dictionary is re-imported from `english-words.txt` into SQLite on every startup with `INSERT OR IGNORE`, in batches of 1000.

Ask permission before writing new tests or adding new spec files.

When adding new dependencies through npm or bun, always use exact versioning.

Client layout (`client/src/`): `App.vue` switches between `NewGame` (no game), `GamePlayer` (game in progress), and `GameOutcome` (game ended). `store/game.ts` is the Pinia store. `setupSockets()` wires socket events to pure handler functions in `store/gameSocketHandlers.ts`, which take the store state as an argument so they are easy to unit test. `sockets.ts` exports the single socket instance.

## Gotchas

- **`server/src/common` is imported by the client** through the `#common` alias in `client/vite.config.ts`. The client Docker build also copies it in. Keep `constants.ts` and `types.ts` free of Node-only code. `helpers.ts` uses date-fns, which the client doesn't depend on.
- **Prod runs the server TypeScript directly** with `node --experimental-strip-types src/index.ts`, with no `tsc` build. Use only erasable TS syntax: no `enum`, `namespace`, or constructor parameter properties. Relative imports need the `.ts` extension.
- Socket handlers must get the socket through a closure in `register*Handlers`, never from a module-level variable, or concurrent connections overwrite each other. Round-loop `AbortController`s in `features/games.ts` live in a `Map` keyed by game ID for the same reason.
- The round length is `GAME_LENGTH` (env, default 60s) on the server, but the client hardcodes `60000` in `onGameStart` and `GamePlayer.vue`.
- To add a plate origin, you need all of these: an entry in `PlateOriginsList` and `PLATE_FORMAT_DICT`, a `plates/<origin>.jpg` image, and per-origin `.plate-text` CSS in `LicensePlate.vue`.
- Server tests mock `#integrations/sqlite`, `@logtape/logtape`, `fs` (via memfs), and `timers/promises`. Follow the `vi.hoisted` + `vi.mock` patterns in the existing specs. The server ESLint vitest block matches `*.test.ts`, but the specs are named `*.spec.ts`.
- `client/e2e/vue.spec.ts` and `playwright.config.ts` are unmodified scaffolding (wrong port, placeholder assertion).

## Style

Prettier in both packages: tabs, single quotes, semicolons, trailing commas, 100-column width. Group code inside files with `/* #region ... */` comments.
