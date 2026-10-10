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
- API keys are only read on the server. Missing keys, bad keys and rate limits come back as plain messages in the UI.

## Setup

Requires Node 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local   # then add your keys
pnpm dev
```

Open http://localhost:3000 and click **Use example** to try a sample listing.

| Variable | Required | Default |
| --- | --- | --- |
| `OPENAI_API_KEY` | yes | |
| `ELEVENLABS_API_KEY` | yes | |
| `OPENAI_MODEL` | no | `gpt-5.4-mini` |
| `ELEVENLABS_MODEL_ID` | no | `eleven_multilingual_v2` |

## Languages

English, French and Chinese, all supported by `eleven_multilingual_v2`.

Hausa is supported by `eleven_v3` but not by `multilingual_v2`. Yoruba and Igbo aren't listed for either model yet, so they're left out for now.

## Project layout

```
app/page.tsx              page shell
components/ad-studio.tsx  form, script editor, voice picker, player
app/api/*/route.ts        voices, script and speech endpoints
lib/                      API clients, zod schemas, prompt, languages, error mapping
```

## Next

- Background music under the voiceover (ElevenLabs music)
- Edit by instruction: "make it shorter", "sound more excited", without writing prompts
- Hausa via `eleven_v3`
