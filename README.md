# Sivaroshan & Kirushika — Wedding Invitation

A recreation of the wedding e-invitation website [sivaroshan-weds-kirushika-e-invitat.vercel.app](https://sivaroshan-weds-kirushika-e-invitat.vercel.app/).

## Features
- **Door Opening Transition**: Animated dual-panel door opening with traditional rice and vignette effects.
- **Bilingual Support**: Instant toggle between English and Tamil (தமிழ்).
- **Interactive Scratch-off Card**: Scratch-to-reveal wedding date and auspicious time.
- **Live Countdown Timer**: Real-time days/hours/minutes/seconds countdown.
- **Audio Experience**: Background wedding nadaswaram/shehnai music loop with toggle control.
- **Petal Animation**: Gentle falling jasmine flower petals effect.
- **Venue & Calendar**: Direct Google Maps venue navigation and one-click calendar event (.ics) generator.
- **RSVP Form**: Interactive RSVP submission directly integrated with Google Apps Script backend.
- **Private Family Access**: Protected admin portal (`admin.html`) with password authentication.

## Running Locally

You can preview the website locally using any of the following methods:

### Method 1: Using Python
```bash
python3 -m http.server 3000
```
Then visit [http://localhost:3000](http://localhost:3000).

### Method 2: Using Node / npx
```bash
npx serve . -l 3000
```
or
```bash
npm start
```

---

## Reverse API Engineer Setup

`reverse-api-engineer` is installed locally on your machine:
- CLI command: `reverse-api-engineer` (located at `~/.local/bin/reverse-api-engineer`)
- Agent Skill: Installed in `.agents/skills/reverse-api-engineer`

### Usage
```bash
# Check CLI version
reverse-api-engineer --version

# Launch interactive CLI
reverse-api-engineer

# Run autonomous agent browser session
reverse-api-engineer agent "<prompt>"
```
