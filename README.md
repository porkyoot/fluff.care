# Care Fluff (`fluff.care`) 💜✨

A cozy, pastel-neon community hub and server infrastructure for **Care Fluff** — a sanctuary for all who love cute & round things, kindness, and warmth.

## 🐾 Mascot: Ullevi

Generated mascot illustrations live in `public/images/mascot/`:

- `ullevi-hero.jpg` — Main synthwave & Frutiger Aero hero illustration
- `ullevi-cozy-gamer.jpg` — Cozy beanbag Discord & voice hangouts illustration
- `ullevi-map-explorer.jpg` — 3D holographic Minecraft & live map explorer illustration

## 🧱 Architecture (Astro + PandaCSS + Strict Atomic Design + Markdown)

- **Atoms (`src/components/atoms/`)**:
  - `Aurora.astro`, `NeonBadge.astro`, `PillowButton.astro`, `GlowHeading.astro`, `RetroWindowFrame.astro`, `StatusIndicator.astro`
- **Molecules (`src/components/molecules/`)**:
  - `ServerAddressCopy.astro`, `FeatureCard.astro`, `AdminProfileCard.astro`
- **Organisms (`src/components/organisms/`)**:
  - `Navbar.astro`, `HeroSection.astro`, `MascotTributeSection.astro`, `FeaturesGridSection.astro`, `CommunityGuideSection.astro`, `AdminsSection.astro`, `Footer.astro`
- **Templates (`src/components/templates/`)**:
  - `CozyLandingTemplate.astro`
- **Pages (`src/pages/`)**:
  - `index.astro`
- **Markdown Content Collections (`src/content/`)**:
  - `src/content/sections/` (`mascot-story.md`, `cozy-rules.md`)
  - `src/content/features/` (`simple-voice-chat.md`, `bluemap.md`)
  - `src/content/admins/` (`kiro.md`, `etoile.md`, `nate.md`)

## 🎮 Minecraft Server Configuration (`minecraft-config/`)

Synced via SFTP to `Minecraft/` on `109.239.158.180`:

- **Game Server**: TCP `25965` (`server.properties`)
- **Query / RCON**: Default Nitro Games ports `25966` (Query UDP) and `25967` (RCON TCP) in `server.properties`
- **Simple Voice Chat**: UDP `25968` (`config/voicechat/voicechat-server.properties`, using `voicechat-fabric-2.6.27+26.3.jar`)
- **BlueMap Webserver**: TCP `25969` (`config/bluemap/webserver.conf` + `core.conf` with `accept-download: true`)

## ☁️ Cloudflare DNS, Pages & Workers

### 1. DNS Records (`fluff.care` zone)

| Type  | Name                 | Target / Content  | Port / Priority                        | Proxy Status              |
| :---- | :------------------- | :---------------- | :------------------------------------- | :------------------------ |
| `A`   | `mc`                 | `109.239.158.180` | —                                      | **DNS Only (Grey Cloud)** |
| `SRV` | `_minecraft._tcp.mc` | `mc.fluff.care`   | Priority `0`, Weight `5`, Port `25965` | **DNS Only**              |
| `SRV` | `_minecraft._tcp`    | `mc.fluff.care`   | Priority `0`, Weight `5`, Port `25965` | **DNS Only**              |

### 2. Build & Deploy Commands (via `mise` + `task`)

```bash
# Build static website
mise exec -- task local:build

# Deploy Website to Cloudflare Pages (fluff.care)
mise exec -- task local:deploy:pages

# Deploy BlueMap Port-Forwarding Worker (map.fluff.care -> 109.239.158.180:25969)
mise exec -- task local:deploy:map-worker

# Deploy Discord Invite Redirect Worker (dc.fluff.care -> https://discord.gg/dSWArwRJBt)
mise exec -- task local:deploy:dc-worker
```
