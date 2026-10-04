# HyperFrames gotchas (silent failures)

Each of these cost real debugging. Most never show in `lint`; several only show in the rendered MP4.

## Timeline and seeking

1. **Zero-duration sets at t = 0 revert.** The runtime seeks `t + 0.001` then `t`, so `tl.set(el, ..., 0)`
   rolls back. Put baselines in build-time `gsap.set`.
2. **Delayed `fromTo` leaks at t = 0.** `immediateRender` applies the FROM state on build; a delayed
   `fromTo` whose FROM is visible shows on the first frame. Use `immediateRender: false` on every delayed
   `fromTo`.
3. **Renderers freeze past the last tween.** A per-frame renderer reads `tl.time()`, which clamps at the
   timeline's end; if the timeline is shorter than its slot, the last seconds freeze. Extend every
   timeline to its slot (`tl.to({}, { duration: 0.01 }, DUR - 0.01)`) or give the hold a real tween.
4. **Stale proxies in per-frame drivers.** An `onUpdate` on a clock tween reads proxy objects tweened by
   tweens added after it one render late on a seek. Use one timeline-level dispatcher
   (`hwOnUpdate`, runs after children) and compute values as pure functions of `tl.time()`.
5. **A `tl.set` registered before its target exists** only logs "target not found" and the element never
   shows. Create DOM first, then register tweens.
6. **Duplicate keys in the spine win silently** (see [timing-architecture.md](timing-architecture.md)).

## Visibility and layering

7. **Never set `style.visibility = "visible"`** from scene code: an explicit visible child shows even when
   the framework hides its clip. Use `""` (inherit) for shown; `autoAlpha` is safe (it writes `inherit`).
8. **Parked elements leak.** Elements parked off-frame still paint their shadows (a hard `0 18px 0` shadow
   showed as two bars on the top edge). Park beyond the shadow's extent or hide them (`autoAlpha 0`).
9. **An overlay that replaces text** must hide the replaced text with a zero-duration
   `visibility: hidden` at the same time, or the audit reports an overlap.
10. **Motion-blur copies snapshot computed styles** (registry motion-blur): a copy attached while its clip
    was inactive stays hidden forever; patch it to skip `visibility`; blurred elements must move by
    property tweens (sub-frame seeks suppress `onUpdate`).

## The audit (`hyperframes check`)

11. **It reads clipped content.** Ticker rows parked outside an `overflow: hidden` window, swiped-away
    panels and scrolled-out chat bubbles are measured as if visible: set `visibility: hidden` on what left
    and `inherit` on what arrives.
12. **Contrast samples rendered pixels.** Clipped text over a different background reports 1:1; a dimmed
    background layer reports low contrast even through an overlay. Hide, or accept and justify.
13. **`data-layout-allow-overlap` is not inherited.** Mark every text-bearing element in intentional stacks
    (a helper walks a root and marks elements with direct text nodes); text filled later needs the
    attribute in its template.
14. **Content-area overlaps.** Big display type with a tight line height (condensed display faces have a
    1.4-1.5 em content box) flags overlaps that are not visible: verify on a snapshot, then mark.
15. **Rotated elements and SVG groups:** rotated text grows its bounding box (false overlaps); SVG `<g>`
    rotations need `transformOrigin: "50% 50%"` or the audit flags pivot drift.
16. **`letterSpacing` tweens are a lint error** (non-transform motion); tween `scaleX` instead.

## Rendering and look

17. **Animated film grain explodes bitrate** (15 MB -> 183 MB for 15 s). Hold one static grain tile.
18. **Fine grids at wide zoom shimmer into moiré** and bloat the encode; fade grids with camera scale.
19. **In-plane yaw over a long board swings the far end through the lens.** Keep the product head-on; if
    something rotates, cull by projected Z.
20. **Canvas masks from web fonts** must be rasterized lazily once `document.fonts.check(font)` is true
    (setup runs before fonts load); keep a DOM element using the face so it loads. Static image masks:
    sample offline to base64 (no async load, no taint).
21. **SVG mask reveals with `stroke-linecap: round`** draw a cap disc at the start of a zero-length dash;
    use `butt`.
22. **Pixel colour doubts:** sample the PNG (`crop=1:1,format=rgba` then `od`) before blaming the asset;
    ffmpeg preview overlays mislead.

## Tooling

23. **Studio preview rewrites composition files** (stamps ids, re-serializes attributes). Re-read files
    before editing after a preview, and stop it (`preview --stop`).
24. **`"type": "module"` packages:** `require()` of a browser UMD lib returns an ESM namespace; read
    `globalThis.X` after the require.
25. **No system ffmpeg:** use `ffmpeg-static` and `@ffprobe-installer/ffprobe` as devDependencies (not
    `ffprobe-static`, 335 MB), symlinked into `.bin/` by the CLI wrapper.
26. **Locale:** a comma-decimal shell locale breaks ffmpeg arguments built with `printf`/`awk`;
    `export LC_ALL=C` in every script.
27. **`hyperframes beats` finds nothing in quiet passages.** Build an onset function from ffmpeg band
    envelopes (`astats` RMS every 10 ms over full, low-pass and band-pass) and track beats yourself.
28. **The animation map script needs the producer packages;** install them temporarily with `bun add -d`.
29. **Heavy all-frames analysis** (extracting every frame to images) eats disk and memory on long renders;
    verify with a handful of extracted frames and delete dumps right away.

## Craft traps

30. **Stop-and-go rides smear** (every leg at rest at both ends): use spline keys for rides
    ([stage-3d.md](stage-3d.md)).
31. **A container scaling in shrinks its children**: keep a handed-off element outside the scaling
    container, or delay the handoff until the container is at rest.
32. **A light bubble on a light background vanishes** without its shadow; keep the shadow until the
    receiver's container is in place.
33. **An iris that starts at the frame centre** shows a stray dot for a few frames; start it behind a
    character or an object, or open it while the title lines dive past the viewer (it emerges behind them).
34. **An ask grid that is not a whole number of beats** drifts off the music within two asks.
35. **Text measured with font metrics offline:** static display faces measure fine with a font library;
    variable fonts may crash `getVariation`; estimate heavier weights from the regular advances or
    measure in a snapshot.
36. **`composition_file_too_large`:** lint warns above 300 structural lines per composition (styles do not
    count). Split by layer, not by time: e.g. the 3D world and its screen overlays as sibling compositions
    on the same window; move pure helpers (geometry, formatters) into `assets/lib/`.
37. **Hidden rows still take space:** `autoAlpha: 0` leaves a list's rows in the layout, so a panel that
    should grow with its rows shows up tall and empty. Animate each row's height from 0 (with
    `overflow: hidden`) as it arrives.
38. **An iris tweened as a clip-path string can land off-centre:** `circle(0% at x% y%)` -> `circle(120% at
    x% y%)` drew its centre at the wrong x in a real project. Draw irises per frame in px from the spine
    (`circle(Rpx at Xpx Ypx)` through a cached style writer) and check the centre on a snapshot.
39. **`bun install` fails on the ffmpeg-static download** (HTTP 5xx from its release host): transient. Re-run
    `setup.sh`; it keeps every file it already added and repeats the install.
40. **A scene's static layers show at its window start:** grid lines or axes of the next scene appear over
    the previous one while their windows overlap. Draw them in on the scene's own cue, after the handoff.
41. **A camera push breaks a pixel-identical handoff:** a scene with a slow push scales the rects it hands
    over, so the receiving scene's copy shows doubled edges and labels. Keep handed-over elements out of
    the pushed group, or push both scenes identically.
42. **`loudnorm` falls back to dynamic mode when the peak-to-loudness ratio is too high** (a sting whose
    one low hit is ~14 dB over a quiet bed): linear mode needs `TP_target - I_target` (14.5 dB at -16/-1.5)
    ≥ measured `input_tp - input_i`, otherwise the second pass silently goes dynamic and `aresample` fails
    ("Cannot select channel layout"). Measure the raw mix first; lift the mid/high bed (K-weighting barely
    counts sub energy) or trim the hit until the ratio fits.
43. **opentype.js cannot shape some modern fonts** (`substitutionType ... lookupType: 6 - substFormat: 2 is
    not yet supported` from `ccmp`), so `font.getPath`/`forEachGlyph` throw. For plain Latin wordmarks, lay
    out by hand: `charToGlyph` per character, `advanceWidth + getKerningValue`, `glyph.getPath(x, y, size)`.
44. **Font outlines overlap.** Many fonts (variable-font instances especially) build letters from overlapping
    contours: filled they look right, but a stroke traced along the outlines shows inner lines (a "+" in "t",
    a double stem on "D"). Unite each glyph's contours before tracing (fontTools `removeOverlaps` with
    skia-pathops) and fill from the same merged outlines so the handoff to the solid mark still lines up.
45. **A luminance-only dither does not stop 4:2:0 chroma banding.** On a coloured dark gradient (a warm
    haze) H.264 still quantizes chroma into flat blobs. Dither every channel independently (seeded RGB noise
    at ~2 % alpha, re-offset per frame), keep it off the mark, and encode with `-tune grain` and `aq-mode=3`
    from a near-lossless intermediate. Expect a much larger file.
46. **Traced outlines are closed loops:** after a contour the head is back at its start, so the travel line to
    the next letter often leaves from the wrong side and cuts through the letter just drawn (or through a
    counter, like the inside of an "o"). Never draw travel inside a letter, and mask travel between letters
    (and any trailing flare arm) with the letters' padded bounding boxes; a silhouette-only mask still lets
    lines cross open counters.
47. **Mounted registry items all ship as `<div id="root">`** and read `document.getElementById("root")` and
    `root.dataset.duration`. Mount two of them (or one in an index whose root is `#root`) and they all bind to the
    first `#root` in the assembled page: wrong element, wrong duration, wrong envelope. In the installed copy, rename
    the root id (`#scr-root`, `#tmx-root`), rename its `#root` CSS selectors, set its `data-duration` (root and inner
    `.clip`) to the slot length, and delete the CDN `<script src=".../gsap.min.js">` (the index vendors GSAP).
48. **TTS WAVs can be mono with an unknown channel layout** (`channel_layout=unknown`): `aformat=channel_layouts=
    stereo` then fails with "Cannot select channel layout". Upmix with `pan=stereo|c0=c0|c1=c0` before resampling.
49. **A transparent text colour is an audit error** (`text_not_painted`), even when an overlay covers it (a selected
    chip drawn as a filled layer over its label). Hide the covered label with `visibility: hidden` instead.
50. **Registry variables are exposed as CSS custom properties on the mounted root**: passing `accent: "blue"` to a
    mounted item sets `--accent: blue` inside it, which shadows the film's own `--accent` token, so `var(--accent)`
    resolves to the keyword `blue` (#0000FF). Leave such variables unset (the item falls back to `--brand`) or give
    them values that are valid as the token too.
51. **Raising hits can silently break `loudnorm` linear mode**: when the raw mix's true peak minus the needed gain stays
    above the TP target, loudnorm falls back to dynamic mode and its resample step fails ("Cannot select channel
    layout"). Put a bus limiter (`alimiter=limit=0.79:level=0`) before the two-pass loudnorm.

52. **The mount strips `data-duration` from a mounted root** (as it strips `data-composition-id`), so a registry item
    that reads `root.dataset.duration || "3.5"` silently runs on its default: a rail meant for 80 s plays all its
    states in 3.5 s and fades out. In the installed copy, read the window from the spine
    (`LAYOUT.T.win.<slot>[1] - [0]`) and keep the dataset read only as the fallback. The item's inner `.clip`
    keeps its own `data-duration`, which still decides when the runtime hides it: retime the slot and that attribute
    together, or the item vanishes before its slot ends.
53. **Composition scripts see a scoped `document`; a shared global lib does not.** A helper in `assets/lib/*.js` that
    calls `document.getElementById("<comp>-root")` while the composition script runs gets `null` (the template is not
    attached to the global document yet), while the same call inside the composition works. Pass the root element
    from the composition script into the kit (`Kit.scene(document.getElementById("x-root"))`), and give the templated
    root static children rather than building everything into an empty root.
54. **Per-frame DOM audits need the assembled page, not `index.html`.** The background preview serves it at
    `<serverUrl>/api/projects/<id>/preview` (`hyperframes preview --status --json` gives the URL); drive it with
    `puppeteer-core` and the cached headless shell, wait for `window.__playerReady`, and seek with
    `window.__player.renderSeek(t)`. Each element's `getBoundingClientRect()` is then the true on-screen rect
    (camera transforms included), and an ancestor walk over computed `opacity`/`filter` tells sharp text from
    text that is soft or invisible.
