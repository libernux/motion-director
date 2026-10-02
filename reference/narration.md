# Narration (voice-over)

Narration is optional and only when the request asks for it. When it is there, it must sound like a
professional native speaker of the on-screen language, recorded for this film. Anything else (a robotic
voice, a foreign accent, mispronounced names, a voice racing the picture) breaks the film; in that case
deliver without narration and say so in the report.

## Voice

- **Native voice for the language and region** (Brazilian Portuguese needs a Brazilian voice, not a European
  Portuguese or Spanish voice reading Portuguese phonemes). Pick the voice in the provider's catalogue by
  language and accent; record the provider, voice id and model in the report.
- **Provider order:** a premium multilingual TTS with a native voice (for example ElevenLabs with a voice
  whose accent matches); then the OS's native voice for that locale; a local model only when it has a native
  voice for the language. Never ship a voice whose language does not match the copy.
- **Delivery settings for natural speech:** moderate stability (expressive, not monotone), high similarity,
  a little style, normal speed. Generate each line separately so it can be timed and retaken.

## Writing for the ear

- Short sentences, one idea each; spoken word order, not slide copy. Read every line aloud at time of
  writing; if it needs a breath in the middle, split it.
- Numbers, dates, units, acronyms and symbols written the way they are spoken, in the language
  ("R$ 1.200" → "mil e duzentos reais"; "24/7" → "vinte e quatro horas por dia"; "IA" stays "IA" if that is
  how people say it).
- Product and brand names: give the TTS a phonetic spelling when it mispronounces them, and check the result
  by transcribing the take (`hyperframes transcribe`) and comparing it to the script.
- Punctuation is direction: commas for short pauses, a full stop for a breath, an ellipsis for suspense. Do
  not rely on SSML unless the provider supports it.
- Pace: about 2.3-2.6 words per second for clear, unhurried speech; the script must fit its shots at that
  rate, otherwise cut words, not speed up the voice.

## Timing and mix

- Place each line on the spine: lines start on a beat or just after a cut (J cut), never under a title the
  viewer must read at the same time, and end with at least 0.3 s of air before the next line.
- On-screen text and voice say complementary things; never read the screen aloud word for word.
- Duck music 6-9 dB under the voice with short attack and a slower release; keep the voice around -16 LUFS
  integrated in the final mix and true peak at or below -1.5 dBTP.
- Verify: transcribe the rendered MP4's audio and check every line is intelligible and matches the script.

## Intelligibility is measured, not assumed

- Transcribe the final mix and the voice-only track with the same model and compare their word error against the
  script. A gap between the two is masking, not diction. Here, a lighter female voice read 0 % alone and 10 % in the mix.
- The usual culprits are sounds placed *on* the words by design: a hit on the first syllable of a brand name, per-word
  title blips, a match-cut whoosh on the question's last word, typing under a spoken line. Start a line 0.2–0.3 s after
  a hit, and duck the sound-design and transition stems under the voice (6–9 dB and 4–5 dB) as well as the music.
  Lighter or higher voices need a deeper music duck and a presence dip where they sit (about 2.5–3 kHz).
- A different voice for a variant: when the narration tool is pinned to one voice, generate through the same provider
  account and model, keep the voice's stored settings, and steer pace with the provider's speed setting, never by
  time-stretching. Re-time the picture to the new words through the spine (word anchors between the two voices), not
  by hand.
