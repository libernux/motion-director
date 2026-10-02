# Audio: procedural score cut to picture

A bespoke, dependency-free score synthesized from the spine, plus a few bundled SFX on physical moments.
Engine: [../scripts/score/score-engine.mjs](../scripts/score/score-engine.mjs); arrangement templates:
[../scripts/score/arrangement.example.mjs](../scripts/score/arrangement.example.mjs) (agent promo, bright major) and
[../scripts/score/arrangement.stage.example.mjs](../scripts/score/arrangement.stage.example.mjs) (flow showcase,
calm minor: a hit per ghost, card, run step, signal and ring); normalization:
[../scripts/project/build-score.sh](../scripts/project/build-score.sh).

## Why procedural

- Every mark lands on its frame because the arrangement imports the same spine as the compositions.
- Deterministic (seeded noise), license-free, re-renders in seconds (`bun` runs 40 s of stereo 48 kHz in
  ~3 s), and re-times itself when the spine changes.

## The engine (voices and buses)

- Drums: `kick`, `clap`, `hat` (closed/open), `tick`, `woodClick`, `thock` (a landing thump), `key` (a
  keyboard key).
- Tonal: `sub` (bass), `pluck` (detuned saws through a filter envelope), `bell` (FM), `marimba`, `pad`
  (detuned saws, LFO filter, wide).
- FX: `blip` (pitched UI blip), `easeGlide` (a sine glide whose pitch follows an easing: you hear the ease),
  `riser`, `whoosh` (panned air), `reverseSwell` (the suck into a hit), `impact`, `whir` (thinking).
- Buses: drums, bass, music, FX, reverb send (Freeverb), delay send (ping-pong 3/16 at 120 BPM); a kick
  sidechain ducks bass and (lighter) music; master high-pass 30 Hz, soft saturation, peak normalize, a
  4 ms fade-in and a 0.45 s fade-out.

## Arrangement recipe

1. **Key and register:** major and bright (I-V-vi-IV) for friendly products; minor (i-VI-III-VII) for
   serious/technical ones; a warm pentatonic mallet palette for hand-made registers. 120 BPM.
2. **Energy map:** light groove (kick on 1 and 3, soft hats) while the agent introduces itself and the first
   ask types; normal groove (claps on 2 and 4, arpeggio) after the first success; full groove (four on the
   floor, walking sub) for the busiest stretch; drums out for the dive; a big chord for the mark.
3. **A signature motif** for the character: two bells a 5th apart (e.g. D5 -> A5), on its hello, every
   answer and the close.
4. **Marks keyed to the spine:**
   - a key tick per typed character (replicate the composer's exact schedule);
   - send = short whoosh + rising blip; dots = three soft blips; thinking = a whir over the think window;
   - builds = a thock; assembly = a fast run of ticks with rising pitch; success = a bright bell chord
     (plus a high ping for money in); counters = a tick run; clicks = key + tick; approvals = a click then
     ascending bells per row paid; flows = two glides diverging;
   - hook: pops per chip with rising pitch, slams = kick + thock + bell, implode = reverse swell + whoosh;
   - transitions: a riser into the light, a whoosh on the cut; finale: word slams, a build (claps in 16ths
     rising), a riser into the dive, an impact + a wide chord on the mark, plinks on the recap.
5. **Pan with the picture:** chat on the left pans left, the stage right, flights follow the motion.

## Camera-driven sound design

Hand-placed whooshes drift from the picture as soon as a camera key moves. Derive them from the spine cameras instead:
sample each camera's screen speed (pan + zoom, px per frame), treat every segment above ~9 px/frame as a move, and give
it a whoosh of its own length, panned with the content's direction, gain from its peak speed, pitch lower for bigger
moves; add a rising air swell under pull-backs, a short suck into push-ins, and a soft continuous air under slow rides.
Hard cuts (one-frame jumps) are not moves.

Put these camera sounds and the designed handoffs (risers into hits, cut accents) on their **own transitions stem**,
mixed at its own level and never ducked. Peak normalization of a shared SFX stem otherwise lets one big impact push
every whoosh down. Then close the loop: measure the final mix's 0.1 s RMS at every transition frame listed from the
spine and fail anything under about -24 dB; tune the stem until the check passes.

## Loudness and QA

- Two-pass `loudnorm` to -16 LUFS / -1.5 dBTP with `LRA=20` and `linear=true` (ffmpeg silently falls back
  to dynamic mode when the target LRA is below the measured one, and the resample step then fails).
- Measure per-second RMS (`bash scripts/qa/loudness.sh`): the intro and every hand-off must not sag below about -25 dB
  unless a silence is intended; fill a sag with a bed pad, a soft pulse or a pickup fill.
- Orchestral recordings instead of synthesis: linear loudnorm cannot reach -16 LUFS without clipping
  tutti peaks; use gain + `alimiter` in two passes.
- Report numbers (integrated LUFS, LRA, peak). Never claim to have listened.
- A narrated film sits near LRA 2 because the voice fills every 3 s window. Shape the mix by act to reach LRA ≥ 4:
  quieter bed (and a slightly closer, softer voice) for intimate beats, +3-6 dB bed for the payoff and the closing hold.

## SFX

- Bundled HyperFrames SFX (pop, whoosh, whoosh-short, whoosh-cinematic, click, click-soft, notification,
  ping, chime, sparkle, impact-bass, riser) placed as `<audio>` elements with `data-start`,
  `data-duration`, `data-volume` 0.1-0.3, only on physical moments: the character pop, the light cut, a
  payment notification, real clicks, the mark impact, the character's final sparkle.
- Keep the licence note (`assets/sfx/CREDITS.md`) in the project.
- Long SFX (a 10 s riser) never; the synth riser is cut to length.
