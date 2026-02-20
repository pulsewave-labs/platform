# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

### Railway (Signal Engine)

- Project: `grand-caring` (ID: `2637377e-9acc-4b4f-bfac-ad839d5e2446`)
- Service: `worker` (ID: `2b5edf27-424f-427d-be09-27e72028cb62`)
- Environment ID: `3db0b94a-f0a6-478b-b1a3-7e71d809a54d`
- Health URL: `https://worker-production-3d70.up.railway.app/`
- Logs URL: `https://worker-production-3d70.up.railway.app/logs`
- Manual scan: `https://worker-production-3d70.up.railway.app/scan`
- Project Token: `3caae00e-81fd-4a8a-aab2-a07567effcf9` (read-only, use `Project-Access-Token` header)
- Workspace Token: `1848debe-c0fb-413b-8f6b-d8a49e02ea42` (mutations, use `Authorization: Bearer` header)
- Engine repo: `pulsewave-labs/pulsewave-engine` (submodule at `products/pulsewave-platform/engine/live/`)

---

Add whatever helps you do your job. This is your cheat sheet.
