# RevLoop AI — LiveKit Hinglish Voice Agent

## Overview
Full-duplex in-browser WebRTC voice agent using LiveKit Open-Source + Gemini Live Audio / Kokoro-82M.
This agent handles B2B invoice recovery calls with natural Hinglish conversation.

## Architecture
- **Runtime:** Python 3.12 + LiveKit Agents SDK
- **Voice AI:** Gemini 2.5 Flash Live Audio API (Google AI Studio Free Tier)
- **TTS Fallback:** Kokoro-82M (Apache 2.0) / Piper TTS (MIT)
- **WebRTC:** LiveKit Open-Source Server (Docker)

## Setup
```bash
cd apps/voice-agent
pip install -r requirements.txt
python agent.py
```

## Voice Persona: "Aarav"
- Empathetic, professional Finance Executive
- Fluent Indian business Hinglish
- Non-confrontational, solution-oriented
- Never intimidates or threatens

## Deterministic Tools
1. `record_promise_to_pay(timestamp, amount, method)` — Lock PTP commitment
2. `send_whatsapp_payment_link(method)` — Dispatch recovery link
3. `apply_instant_waiver(percent)` — Capped to merchant margin floor
4. `escalate_dispute(reason)` — Route to Human Console
5. `terminate_call_with_opt_out()` — Honor DND/STOP request

## Note
For the hackathon build, voice interactions run over LiveKit WebRTC in-browser (zero PSTN cost). SIP trunking is a documented but unbuilt production path.
