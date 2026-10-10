# Product Voice Ads

Paste a product listing, get a short spoken ad script, and turn it into a voiceover with ElevenLabs.

Built for marketplace sellers who don't have time to make their own promo content: the app writes a ~30 second script from the product details, lets you edit it, then generates an MP3 in the voice and language you pick.

## How it works

```
Product form ──► POST /api/script ──► OpenAI (structured output) ──► editable script
                                                                          │
Voice picker ◄── GET /api/voices ◄── ElevenLabs voices                    ▼
                                         POST /api/speech ──► ElevenLabs TTS ──► MP3 player + download
```

- `app/api/script` asks OpenAI for a script that is written for the ear (no emojis, URLs or stage directions, prices said the way a person would say them) and only uses facts from the listing. The result is parsed with a zod schema and checked against a length target per language (55-90 words, or 100-170 characters for Chinese). If it misses, the model gets one retry with feedback.
- `app/api/voices` lists the voices on your ElevenLabs account.
- `app/api/speech` sends the (possibly edited) script to ElevenLabs text-to-speech and streams back `audio/mpeg`.
- `app/api/script/edit` rewrites the current script from an instruction ("make it shorter") with the user's OpenAI key.
- `app/api/music` composes an instrumental bed with ElevenLabs Music.
- Missing keys, bad keys, empty credit balances and rate limits come back as plain messages in the UI.

## Delivery, edits and music

- **Delivery** (Calmer / Natural / More excited, Slower / Normal / Faster) changes how the voice reads the script, using ElevenLabs voice settings (`stability`, `style`, `speed`) in `lib/delivery.ts`. No OpenAI key needed.
- **Quick edits** (Shorter, Punchier, More urgent, Simpler words, or your own instruction) change the words. They keep the language, the facts and the call to action, and need the user's OpenAI key. **Undo edit** brings back the previous version.
- **Background music** appears after a voiceover is generated. Pick a style (Afrobeats, Acoustic, Lo-fi, Bright pop, Elegant; the default follows the product's tone), and the app composes a track a few seconds longer than the voice, then mixes it in the browser with the Web Audio API (`lib/audio-mix.ts`): a short intro, music ducked under the voice, then a fade out. The volume slider re-mixes instantly without generating again, and the result downloads as WAV.

The Music API needs a **paid ElevenLabs plan** (Starter or above) and the **Music Generation** permission on the API key. If the server's key is on the free plan, users can bring their own ElevenLabs key for music:

- The music panel shows "Have a paid ElevenLabs plan? Use your own key", and if music is blocked it shows why with an **Add your ElevenLabs key** button. Both open the same key dialog as the OpenAI key.
- The key is sent only with music requests, in an `x-elevenlabs-api-key` header, and is used for that request only. The server never stores or logs it. Voiceovers keep using the server's key.
- **Check key** (`POST /api/elevenlabs/verify`) reads the key's plan and warns if it's on the free tier. Restricted keys without "User: Read" can't read the plan, so the check falls back to confirming the key is real.

## Examples with ready-made scripts

Six example products (electronics, fashion, beauty, kitchen, phones, groceries) each ship with a hand-written script in English, French and Chinese, sized for about 30 seconds (`lib/examples.ts`). Picking an example loads its script, and switching language swaps in the matching version until you edit it. Trying the voiceover only uses ElevenLabs, no OpenAI key needed. You can also type any script straight into the editor.

## Optional: AI scripts with your own OpenAI key

The app doesn't pay for OpenAI. Writing a script for your own product lives under **Use your own product**, and needs the user's own API key:

- The key is sent with each script request in an `x-openai-api-key` header and passed straight to OpenAI. The server never stores or logs it.
- **Check key** (`POST /api/openai/verify`) makes a tiny real request, so it catches wrong keys, restricted keys missing the "Model capabilities" permission, and accounts with no API credits.
- **Remember on this device** keeps the key in the browser's localStorage. Leave it off on shared computers. **Forget** removes it.

Voiceovers use the server's `ELEVENLABS_API_KEY` (music can optionally use the user's own ElevenLabs key, see above).

## Setup

Requires Node 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local   # then add your ElevenLabs key
pnpm dev
```

Open http://localhost:3000, pick an example product, choose a voice and click **Generate voiceover**.

| Variable | Required | Default |
| --- | --- | --- |
| `ELEVENLABS_API_KEY` | yes | |
| `OPENAI_MODEL` | no | `gpt-5.4-mini` |
| `ELEVENLABS_MODEL_ID` | no | `eleven_multilingual_v2` |

## Languages

English, French and Chinese, all supported by `eleven_multilingual_v2`.

Hausa is supported by `eleven_v3` but not by `multilingual_v2`. Yoruba and Igbo aren't listed for either model yet, so they're left out for now.

## Project layout

```
app/page.tsx                    page shell
components/ad-studio.tsx        examples, form, script editor, voice picker, player
components/script-edits.tsx     AI quick edits and undo
components/delivery-controls.tsx energy and pace buttons
components/music-panel.tsx      music style picker, mix player and WAV download
components/openai-key-panel.tsx key dialog for the optional OpenAI and ElevenLabs keys (input, check, remember)
app/api/*/route.ts              voices, script, script edit, speech, music and key check endpoints
lib/                            API clients, zod schemas, prompts, examples, languages, delivery, music, audio mixing, error mapping
```

## Next

- Hausa via `eleven_v3`
- MP3 export for the music mix
