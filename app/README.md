# Nova — Anime Maker (MVP)

A real implementation of the `Anime Maker MVP.dc.html` design exported from Claude Design (see `../README.md` and `../chats/chat1.md` for the design brief and decisions).

Dark-mode SPA covering the full approval-based flow: Characters → Episode Setup → Story → Scenes → Images → Videos → Export, plus lightly-stubbed Landing/Login/Dashboard/Project Detail screens.

Unlike the original clickable prototype (which faked all "AI generation" with `setTimeout`), this build wires up real AI calls:

| Step | Model |
| --- | --- |
| Character bio + image prompt, story, scene breakdown, captions | OpenAI (ChatGPT) |
| Character portraits & scene images | Google Gemini "Nano Banana" (`gemini-2.5-flash-image`) |
| Scene videos (image → motion clip) | Google Veo (`veo-3.1-generate-preview` by default) |

## Structure

- `client/` — React + TypeScript + Vite front end (all UI/state)
- `server/` — Node + Express + TypeScript backend that holds the API keys and proxies to OpenAI / Gemini / Veo

The client never talks to OpenAI/Google directly — it only calls `/api/...` on the server, which is proxied by Vite in dev (`client/vite.config.ts`).

## Setup

```bash
cd app
npm install
cp server/.env.example server/.env
# edit server/.env and fill in OPENAI_API_KEY and GOOGLE_API_KEY
npm run dev
```

This starts the server on `http://localhost:8787` and the client on `http://localhost:5173`.

If a key is missing, the affected screen shows a clear inline error ("OPENAI_API_KEY is not configured on the server…") with a **Retry** button instead of failing silently — you can click through the whole flow immediately after adding keys, no restart-from-scratch needed (just retry the step that failed).

### Getting keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Google (Gemini + Veo, same key)**: https://aistudio.google.com/apikey — note Veo access may require a billing-enabled Google Cloud project.
- **Veo model name varies by account.** Not every key has access to the same Veo model names. If video generation fails with a `404 ... is not found for API version v1beta`, list what your key can actually use and set `VEO_MODEL` in `server/.env` accordingly:
  ```bash
  curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_GOOGLE_API_KEY" | grep -i veo
  ```
- **Getting a `429 RESOURCE_EXHAUSTED` / quota error, especially with Google Cloud credits?** The Gemini Developer API key (`GOOGLE_API_KEY`, from AI Studio) has its own quota that's separate from a GCP project's Cloud credits — credits don't apply to it. Switch to Vertex AI (below) to bill against the project the credits are on.

### Using Vertex AI instead of a Gemini API key

Set these in `server/.env` instead of `GOOGLE_API_KEY`:

```bash
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
# pick one auth method:
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
# — or, if you can't mount a file (e.g. some PaaS hosts) —
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
```

Notes:
- The service account needs the **Vertex AI User** role on that project, and the project needs the Vertex AI API enabled (and billing/credits attached).
- No key file handy? Run `gcloud auth application-default login` locally instead — it sets up ADC without any of the above env vars.
- Vertex AI model availability can differ from the Developer API's — if `GEMINI_IMAGE_MODEL` or `VEO_MODEL` 404 under Vertex, check the [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden) for the exact model IDs available to your project.
- Switching this on affects **both** Nano Banana image generation and Veo video generation (they share one client); OpenAI/ChatGPT is unaffected either way.

## Final export: transitions & full-episode video

The Final screen can stitch every **approved** scene clip into a single downloadable MP4:

- **Transitions**: Cut, Fade, Dissolve, Wipe Left/Right, Slide Left/Right, Circle Crop, Zoom In — implemented with ffmpeg's `xfade` (video) and `acrossfade` (audio) filters chained across all clips (durations are probed per-clip so the crossfade timing lines up correctly even if Veo's actual output duration differs slightly from what was requested).
- **Format-aware export**: picking Landscape video / Square video / YouTube Shorts / Instagram Reels / TikTok crops+scales the final export to that aspect ratio (16:9 native, 1:1 centered crop, or 9:16 centered crop) — same export format selector that used to be decorative now actually reformats the output.
- Runs server-side via `ffmpeg-static` (a bundled ffmpeg binary — no system ffmpeg install needed, and it's portable to Render/most Linux hosts). "Cut" + landscape uses a fast stream-copy concat; every other combination re-encodes (libx264/aac), so it takes a bit longer.
- Same start-job → poll-status → download pattern as video generation (`POST /api/export/generate`, `POST /api/export/status`, `GET /api/export/file/:id`), all in-memory (no persistence — an export disappears if the server restarts before you download it).
- **Not included**: burning the background-music selection or captions into the exported file — those two controls on the Final screen remain preview-only for now (the "Download active clip" and per-scene downloads are unaffected).

## Login & saving your project

- **Login** checks against a single fixed test credential (no real accounts): **`demo@nova.app` / `anime123`** by default, shown right on the login screen. Override it via `TEST_LOGIN_EMAIL` / `TEST_LOGIN_PASSWORD` in `server/.env`. The Sign up tab remains a stub, unchanged from before.
- **Autosave**: once you have at least one character or scene, the app autosaves your whole in-progress episode (characters with portraits, episode config, story, scenes, image variants, video references, final settings) to the server a couple seconds after each change — watch for the "Saving…" / "Saved" indicator next to the avatar in the top right.
- **Resume**: the Dashboard shows a "Resume in-progress episode" banner whenever a saved project exists — clicking it restores everything and jumps back to exactly where you left off (even after closing the tab or restarting the server).
- This is single-slot (one in-progress episode at a time, matching the app's single continuous flow) and stored as `server/data/project.json` plus `server/data/videos/*.mp4`, not a database — fine for local/dev use. **On most hosting platforms this directory must live on a persistent volume to survive restarts/redeploys** (see Deploying below); Render's default free-tier disk is ephemeral.

## Known MVP boundaries
- **Regenerate scene**: uses a scoped OpenAI call that rewrites just that one scene (not the whole batch), keeping the rest of the story-to-scene continuity intact.
- Generated character portraits are used as reference images when generating scene images that include that character, for visual consistency across a scene.
- **Veo's safety filters may reject video generation for scenes depicting children** ("Your prompt conflicted with our safety policies..."). This is Google's policy, not a bug — the video request still completes (`done: true`) with a clear `error` message and a **Retry** button rather than hanging. If you hit this often, consider aging characters up (e.g. "Teen" or "Young adult") for the video-generation step, or trying a different framing/motion prompt.

## Scripts (from `app/`)

- `npm run dev` — run both client and server in dev mode
- `npm run build` — typecheck + build both
- `npm run typecheck` — typecheck both without emitting

## Deploying (Render)

A `render.yaml` blueprint at the repo root defines two services:

- `anime-maker-server` — Node web service (`app/server`)
- `anime-maker-client` — static site (`app/client`)

To deploy:

1. Push this repo to GitHub.
2. In the Render dashboard: **New → Blueprint**, connect the GitHub repo. Render will detect `render.yaml` and create both services.
3. On `anime-maker-server`, set the `OPENAI_API_KEY` and `GOOGLE_API_KEY` env vars (left blank in the blueprint on purpose — fill them in via the dashboard, not in git).
4. Once `anime-maker-server` has deployed, copy its URL (e.g. `https://anime-maker-server.onrender.com`).
5. On `anime-maker-client`, set `VITE_API_BASE_URL` to that URL, then trigger a manual redeploy — Vite bakes env vars in at build time, so this won't take effect until the next build.

The client and server are on different origins in this setup; the server already sends permissive CORS headers (`cors()` with defaults), which is fine since there's no cookie-based auth to protect.

**Persistent disk**: `anime-maker-server` writes saved projects and generated videos to `DATA_DIR` (`server/data` by default) on local disk. Render's web services get an ephemeral filesystem — it survives simple restarts but is wiped on every redeploy. To keep saved episodes across redeploys, add a [Render Disk](https://render.com/docs/disks) to `anime-maker-server` (e.g. mounted at `/data`) and set `DATA_DIR=/data` in its env vars. Without a disk, autosave/resume still works fine between visits until the next redeploy.
