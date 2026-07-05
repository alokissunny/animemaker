# Anime Maker Application

_Started 2026-07-05 18:20 UTC_

---

## User

Create a modern MVP design for an **Anime Maker Application**.

The application helps users create short anime episodes using AI. The flow should feel simple, creative, and beginner-friendly, while still looking premium and production-ready.

## Product Goal

Build an MVP where users can:

1. Create anime characters.
2. Finalize selected characters.
3. Choose an episode theme and duration.
4. Generate a story based on the selected theme.
5. Approve or regenerate the story.
6. View a detailed scene-by-scene breakdown with captions.
7. Approve each scene.
8. Generate AI images for approved scenes.
9. Approve or regenerate images.
10. Generate final scene videos using another AI video model.
11. Preview the complete anime episode.

## Target Users

The app is for creators, kids-content makers, anime fans, storytellers, YouTubers, and social media creators who want to create anime-style videos without animation skills.

## Design Style

Use a clean SaaS-style interface with an anime-inspired visual language.

Design direction:

* Modern, minimal, and creative
* Soft gradients
* Dark/light mode friendly
* Anime-style accent colors such as violet, pink, blue, and neon highlights
* Rounded cards
* Large visual previews
* Smooth step-by-step workflow
* Clear approval buttons
* Premium creator-tool feel

## Main MVP Flow

### 1. Dashboard

Create a dashboard where users can:

* Start a new anime episode
* View previous projects
* See project status: Draft, Story Approved, Images Generated, Video Ready
* Open recent projects

Include a primary CTA: **Create New Anime Episode**

---

### 2. Character Creation Screen

Users should first create characters before creating the story.

Fields and options:

* Character name
* Age group
* Gender
* Personality
* Anime style
* Hair style
* Hair color
* Eye color
* Outfit style
* Role in story: Hero, Friend, Villain, Mentor, Side Character
* Character description prompt box

Include:

* AI character preview card
* Generate Character button
* Regenerate button
* Save Character button
* Character gallery showing all finalized characters

User should be able to create multiple characters.

Once characters are finalized, show a button: **Continue to Episode Setup**

---

### 3. Episode Setup Screen

After characters are finalized, allow users to choose:

* Episode theme
* Episode duration
* Target audience
* Story mood
* Visual style
* Language
* Number of scenes

Theme examples:

* Adventure
* Friendship
* Fantasy
* School life
* Mystery
* Comedy
* Superhero
* Emotional drama
* Sci-fi
* Magical world

Duration options:

* 30 seconds
* 1 minute
* 2 minutes
* 3 minutes
* 5 minutes

Add a text box:
**Describe your episode idea**

CTA: **Generate Story**

---

### 4. AI Story Generation Screen

Generate a complete story based on:

* Finalized characters
* Selected theme
* Episode duration
* Mood
* Target audience

Show:

* Episode title
* Short synopsis
* Full story
* Character roles
* Beginning, middle, and ending structure

Actions:

* Approve Story
* Regenerate Story
* Edit Story Manually

Once approved, move to scene breakdown.

---

### 5. Scene-by-Scene Breakdown Screen

After story approval, show a detailed scene breakdown.

Each scene card should include:

* Scene number
* Scene title
* Scene description
* Characters involved
* Background/location
* Camera angle
* Mood
* Action happening in the scene
* Caption/dialogue
* Image generation prompt
* Video generation prompt

Each scene should have:

* Approve Scene
* Edit Scene
* Regenerate Scene

Once all scenes are approved, show CTA: **Generate Scene Images**

---

### 6. AI Scene Image Generation Screen

For each approved scene, use AI to generate scene images.

Show:

* Scene image preview
* Prompt used
* Characters used
* Status: Generating, Ready, Approved, Needs Regeneration

Actions:

* Approve Image
* Regenerate Image
* Edit Prompt
* Compare variations

Each scene can have 2–4 generated image options.

Once images are approved, show CTA: **Generate Scene Videos**

---

### 7. AI Scene Video Generation Screen

After image approval, use another AI model to generate videos for each scene.

Show:

* Approved scene image
* Scene video preview
* Scene duration
* Caption/dialogue
* Motion prompt
* Status: Queued, Generating, Ready, Approved

Actions:

* Approve Video
* Regenerate Video
* Edit Motion Prompt
* Preview Scene

Once all scene videos are approved, show CTA: **Create Final Episode**

---

### 8. Final Episode Preview Screen

Show the final anime episode assembled from all generated scene videos.

Include:

* Full video player
* Scene timeline
* Captions toggle
* Background music option
* Export button
* Download button
* Share button

Export formats:

* YouTube Shorts
* Instagram Reels
* TikTok
* Landscape video
* Square video

---

## Required MVP Pages

Design the following screens:

1. Landing page
2. Login/signup page
3. Dashboard
4. Create character screen
5. Character gallery/finalized characters screen
6. Episode setup screen
7. Story generation and approval screen
8. Scene breakdown screen
9. Scene image generation screen
10. Scene video generation screen
11. Final episode preview/export screen
12. Project detail/status screen

## Important UX Requirements

The app must follow an approval-based workflow:

Character Approval → Story Approval → Scene Approval → Image Approval → Video Approval → Final Episode

Users should always know:

* What step they are on
* What is already approved
* What still needs work
* What AI is currently generating
* What can be edited or regenerated

Add a progress stepper at the top:

1. Characters
2. Episode Setup
3. Story
4. Scenes
5. Images
6. Videos
7. Export

## AI Workflow Logic

Design the system as if the backend has these AI modules:

* Character generation model
* Story generation model
* Scene breakdown model
* Image generation model
* Video generation model
* Caption/dialogue generator

The MVP should clearly show where each AI model is used.

## Components to Design

Create reusable UI components:

* Project card
* Character card
* Scene card
* AI generation status badge
* Approval button
* Regenerate button
* Prompt editor
* Video preview card
* Image variation selector
* Timeline view
* Step progress bar
* Export settings panel

## Tone and Copy

Use clear creator-friendly copy.

Examples:

* “Create your anime cast”
* “Bring your characters to life”
* “Choose your episode theme”
* “Generate story”
* “Approve this scene”
* “Create scene images”
* “Turn images into anime video”
* “Your episode is ready”

## Final Output Expected

Create a complete MVP product design with:

* Clean page layouts
* User flow
* Component structure
* Sample UI copy
* Empty states
* Loading states
* Approval states
* Regeneration states
* Final export screen

Make the application feel like a professional AI-powered anime studio for creators.

## Assistant

_[tool: list_files]_

_[tool: questions_v2]_

## User

Questions answered:
- fidelity: Clickable prototype — click through the full approval flow with real state changes
- theme_mode: Dark mode (premium studio feel)
- scope_priority: Focus on the core creative loop (character → story → scenes → images → video → final preview) and stub landing/login/dashboard lightly
- sample_project: peppa pig stories
- nav_model: Single continuous flow, stepper always visible at top, forward-only until approved

## Assistant

_[tool: update_todos]_

_[tool: dc_write]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: show_html]_

Landing page looks good. Continuing to build out the character creation, episode setup, story, scenes, images, videos, and final screens.

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

Now the handlers and computed values for the character screen:

_[tool: dc_js_str_replace]_

Now add the computed values in renderVals (options lists, preview state, etc.):

_[tool: dc_js_str_replace]_

_[tool: show_html]_

Let me click through to the character screen to verify it renders correctly.

_[tool: multi_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

Dashboard renders correctly. Continuing to the character screen now.

_[tool: eval_js]_

Character screen renders with stepper working. Let's screenshot it visually.

_[tool: screenshot]_

_[tool: str_replace_edit]_

Now let's add Episode Setup, Story, Scenes, Images, Videos, and Final screens. First Episode Setup:

_[tool: dc_html_str_replace]_

Now the logic for episode setup + story generation:

_[tool: dc_js_str_replace]_

Now add episodeConfig/story initial state and computed renderVals:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

Good, no errors, still on character screen from before. Let me continue building the remaining screens (Scenes, Images, Videos, Final) before doing a full click-through test.

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

Now add initial state fields and computed renderVals for scenes/images/videos/final:

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now let's do a full click-through test to verify state and rendering across all screens.

_[tool: get_webview_logs]_

_[tool: show_html]_

Header fixed. Now let's drive through the full flow programmatically and screenshot each step.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

Character preview works with header/stepper compact and clean. Let's continue: save character, go to gallery, continue to episode setup, and screenshot the rest of the flow.

_[tool: eval_js]_

Saved, now on gallery tab with 1 character. Let's continue to episode setup.

_[tool: save_screenshot]_

Excellent. Continuing through the rest of the flow now.

_[tool: eval_js]_

_[tool: save_screenshot]_

Episode setup looking great. Continue to generate story.

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: save_screenshot]_

Scene breakdown looks excellent. Let's approve all 5 scenes and continue through images/videos/final.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

Image variation selector works well with 4 variants + selection state. Approving all and continuing to videos.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: str_replace_edit]_

Now approve all videos and check final export screen.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

Full flow works end-to-end. Let me verify the export panel further down and check for console errors.

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

Everything renders cleanly — timeline, captions toggle, music selector, and export panel all working. Now let's add a project detail screen check and the dashboard "resume" wiring, plus verify landing/login/dashboard once more, then hand off to verification.

_[tool: update_todos]_

_[tool: eval_js]_

_[tool: eval_js]_

Still on final screen since logo click didn't fire (not a button). Fine — the flow already works. Let's check the project detail screen from a fresh dashboard state.

_[tool: show_html]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

Now clicking a project card to check the project detail screen:

_[tool: eval_js]_

_[tool: eval_js]_

Project detail screen works correctly too. Everything checks out across the full flow.

_[tool: update_todos]_

_[tool: ready_for_verification]_

Built the full clickable MVP prototype: landing, login, dashboard, project detail, and the complete 7-step approval flow (characters → episode setup → story → scenes → images → videos → export), all in dark mode with the violet/pink/blue anime-inspired palette. Sample content uses an original family-friendly rainy-day story (avoiding any copyrighted Peppa Pig IP). Verified end-to-end by clicking through every step.

