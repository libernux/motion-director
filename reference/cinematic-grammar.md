# Cinematic grammar (the cinematic tier)

What turns a correct motion video into one that reads as cut by a senior editor and lit by a cinematographer.
It applies on top of [quality-bar.md](quality-bar.md) whenever the brief says `tier: cinematic` (the Studio
default) and is checked by the critic rubric at the end of this file. Every rule is concrete and checkable;
none of it overrides content truth, brand truth or determinism.

## 1. Think in shots, not slides

- **Every scene is a shot with a size and a camera:** extreme wide (context, scale), wide, medium, close
  (detail, emotion), insert (one UI element, one number). Write the shot size and camera move per beat in
  `STORYBOARD.md`. A sequence of five mediums is a slideshow; vary size on every cut (never cut between two
  shots of the same size and angle: a jump cut, unless it is the stylistic point).
- **Camera language is motivated.** Push in = attention or revelation; pull back = context or payoff; lateral
  track = journey or comparison; orbit = hero object; rack focus = shift of subject; handheld micro-shake =
  urgency or human presence (2-4 px, low frequency, seeded). One dominant move per shot. Moves start already
  moving (ease-in only on the first shot), keep velocity across a cut, and settle with a soft overshoot.
- **Depth in every frame:** foreground, subject, background as separate layers with parallax (background 0.3x,
  foreground 1.4x of the camera move), atmospheric falloff (contrast and saturation drop with distance), and a
  shallow-focus look on close shots (blur behind the subject, never on text the viewer must read).
- **Composition:** rule of thirds or strong centre symmetry, decided per shot; lead room in the direction of
  motion; headroom on titles; nothing important within 5 % of the frame edge (title safe 90 %, action safe 95 %).

## 2. Editing rhythm

- **Cut on action and on the beat.** Cuts land on the spine's beat grid; a cut inside a movement (match on
  action, the outgoing motion continuing into the incoming) beats a cut between static frames.
- **Vary shot length.** A cinematic cut breathes: a held establishing shot (2-3 s), then accelerating
  inserts (0.5-0.8 s) into the hit, then a long hold on the payoff. Plot shot lengths in `STORYBOARD.md`; a flat
  list of equal durations fails the rubric.
- **Transitions have meaning.** Default to the cut. Use a designed transition only when it carries
  information: match cut (shape or motion continuity), whip pan (energy, time skip), light/flash cut (impact),
  iris or mask through an object (entering a world), dissolve (time passing, calm). At most two transition
  families per film. Cast them from the registry (`## Transitions`, `## Camera, depth and space`).
- **Speed ramps** (fast into the moment, slow-mo on it, fast out) sell impact; drive them from the spine so the
  score hit is on the slow frame.
- **J and L cuts** for sound: the next scene's sound starts 4-8 frames before its picture (J) or the previous
  scene's tail carries over the cut (L). This single habit makes cuts feel edited, not concatenated.

## 3. Light, colour and texture

- **Grade the whole film as one.** Pick a look (contrast curve, black level, highlight roll-off, a split-tone:
  shadows cool / highlights warm, or the brand's own pair) and apply it to every scene. Validate candidates with
  `hyperframes grade-compare` and apply on media through `/media-use` treatments (never improvised CSS filters).
- **Light has a source.** Key light direction is consistent across shots; glows, flares, rim lights and
  specular sweeps come from it. Use registry light items (`light-sweep-pass`, flares, light leaks) sparingly:
  one signature light event per film beats ten.
- **Texture:** a fine film grain (static per-frame noise, seeded, 2-4 % opacity), a gentle vignette (5-10 %),
  and optional halation on highlights give footage-like richness. Deterministic only (seeded noise, no
  `Math.random`).
- **Motion blur** on fast movement (registry `motion-blur` items or GSAP directional blur), never on text at
  rest. A whip without blur reads as a glitch.
- **Aspect and frame rate are look decisions:** 24 fps for film-like cadence on narrative or brand pieces,
  30 fps for UI and product demos; optional 2.39:1 letterbox bars for trailer-style openers (content stays
  inside the bars; bars are part of the design, not added in post).

## 4. Typography as cinema

- Titles are designed, not typed: a display face with character, tight tracking at large sizes, optical
  kerning, and a typographic hierarchy of at most three sizes per frame.
- Text arrives with intent (mask reveal, per-word stagger on the beat, scramble that locks, write-on), holds
  long enough to read (quality-bar rule 7), and exits with motion, not a cut to nothing.
- Cast title treatments from `## Titles and kinetic type` and `## Openers, stings and end cards`; a
  hand-built title must be better than the registry option it replaces, and the report says why.

## 5. Sound design (the half of cinema people feel)

- Three layers, always: **music** (the procedural score or a MusicGen bed via `/media-use`), **sound design**
  (whooshes on camera moves, risers into hits, impacts on locks, UI ticks on state changes, room tone or an
  air bed so silence is never digital zero), and **voice** when requested.
- Every visual event that moves fast has a sound; nothing has a sound that does not move. Pan sounds with
  their source; small sounds are quiet.
- Mix with `/hyperframes-audio`: duck music 6-9 dB under voice (sidechain-style envelopes), a short reverb
  tail to glue SFX into the space, a limiter on the master; loudness per [audio-scoring.md](audio-scoring.md).
- Run `hyperframes beats` on any supplied or generated track and put cuts on its detected beats.

## 6. Voice-over

See [narration.md](narration.md): natural, native-sounding voice, written for the ear, timed on the spine,
music ducked under it. A robotic or accented voice is worse than none; if no natural voice is available,
deliver without narration and say so.

## Casting

Before building, cast every storyboard beat. In `STORYBOARD.md`, each beat gets a `cast:` line:

```
cast: registry `cut-the-curve` (transition in) + `light-sweep-pass` (accent) | hand-built: wordmark trace
```

1. Grep [registry-index.md](registry-index.md) by role and tags; open the 2-4 best candidates
   (`hyperframes catalog <name> --json`, the catalog page preview) and pick one per need.
2. Install with `hyperframes add <name>`, set its variables from DESIGN.md tokens (colours, fonts, copy),
   and wire it on the spine. Re-skin it to the film's grade and type; never ship a registry item in its
   demo styling.
3. Hand-build only what no item covers, or where the registry item would break the concept, and record the
   reason in the report (`Registry searched: <terms>; not used because ...`).
4. A cinematic film normally uses several registry items (transitions, a light or texture pass, title or
   caption treatments, overlays). Zero registry items in a cinematic film needs a written justification.

## Critic rubric (cinematic gate)

A separate reviewer scores the rendered MP4 1-10 on each line. The film passes at an average of 8 with no line
below 6. Stills hide motion, so the reviewer looks at three things:

- **Stills:** first and last frame and every shot midpoint.
- **Motion strips:** 1 s around every cut, transition, camera move, the climax and the last second, at 12 fps,
  tiled (`ffmpeg -ss T-0.5 -t 1 -i out.mp4 -vf "fps=12,scale=320:-1,tile=6x2" -frames:v 1 strip.jpg`).
  A charge, a flash or a transition that is invisible frame to frame does not exist.
- **The sound curve:** short-term RMS every 0.1 s, checked against the picture's hits, risers and holds.

1. **Concept clarity:** the one message is unmistakable by the end.
2. **Shot design:** varied sizes, motivated camera, depth layers, clean composition and safe areas.
3. **Editing rhythm:** cuts on action and beat, varied shot lengths, transitions that carry meaning.
4. **Light and grade:** one coherent look, a light source, texture without mud, no flat or washed frames.
5. **Typography:** designed hierarchy, readable holds, intentional entrances and exits.
6. **Motion craft:** eased, physical, continuous; no dead stops, no pops, motion blur where fast.
7. **Sound:** layered, cut to picture, mixed (from REPORT/loudness data and the score's event list).
8. **Polish:** no artefacts, no clipped or overlapping text, no blank frames, a designed final frame.

The critic returns a ranked fix list (each fix: timecode, what is wrong, the specific change, the skill or
registry item to use) and marks a fix `repeat` when the previous round already asked for it. The director
applies the fixes, re-renders and re-verifies; at most three critic rounds, then one final score-only look.
A repeated fix means the last approach failed: change the technique, structure or registry item, not just the
numbers, and show the before/after strip in the report.
