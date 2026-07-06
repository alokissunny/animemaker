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

## Known MVP boundaries

- **Final export**: scene videos are generated and individually approved/downloadable, but stitching all approved clips into one exported file (with music/captions burned in) is not implemented — that's a separate video-processing pipeline (e.g. ffmpeg) beyond this MVP's scope. The Final screen lets you play/download each scene's clip and switch the active clip via the timeline strip.
- **Auth**: Login/signup screens are stubbed (no real accounts) per the original design brief's scope decision.
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
