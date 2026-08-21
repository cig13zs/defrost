# Defrost

Unbreak hostile websites. Restore text selection, copying, right-click, and
unfrozen scroll in one click.

[![Ko-fi](https://img.shields.io/badge/Ko--fi-buy_me_a_coffee-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/jju1s)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

Web app / Test page: **[cig13zs.github.io/defrost](https://cig13zs.github.io/defrost/)**

Many websites break native browser features to force newsletter signups or stop
you copying a recipe or code snippet. They disable right-click, block Ctrl+C,
freeze the scrollbar with overflow: hidden, and blur text under modal backdrops.

Defrost undoes those traps on demand. It runs only when you click it.

## What it unbreaks

| Hostile Pattern | How sites do it | What Defrost does |
|---|---|---|
| Disabled Text Selection | user-select: none !important | Injects universal user-select: auto !important |
| Blocked Right-Click | oncontextmenu = () => false | Nullifies inline handlers and halts hostile capture |
| Blocked Copy / Cut | oncopy = () => false / preventDefault() | Removes copy traps so native clipboard copy works |
| Frozen Scrollbar | ody { overflow: hidden !important } | Forces overflow: auto !important on html & body |
| Blurry Text Filters | ilter: blur(5px) | Strips blur and backdrop filters across content nodes |
| Giant Modal Backdrops | ixed div with z-index: 9999 | Hides modal overlays covering >70% of viewport |

## Install

Load unpacked in Chrome, Edge, Brave, or Opera:

1. Download the latest zip from [Releases](https://github.com/cig13zs/defrost/releases) and unzip it.
2. Open chrome://extensions and turn on **Developer mode**.
3. Click **Load unpacked** and select the extension folder.
4. Click the Defrost icon on any restricted page to unbreak it.

## How it works

Defrost uses ctiveTab and scripting. It declares **zero host permissions**
and has no background network access. It never runs automatically in the
background; it executes once when you press the button.

`ash
# Run test suite
node engine.test.js
node boot.test.js
`

## Limits

Defrost removes DOM, CSS, and event listener restrictions. It cannot bypass
server-side paywalls where the server never delivered the article text in the
HTML payload.

## Privacy

Runs entirely on your machine. Zero accounts, zero servers, zero analytics.
See [docs/privacy.md](docs/privacy.md).

## License

MIT licensed. If it saved you some time, the tip jar is at
[ko-fi.com/jju1s](https://ko-fi.com/jju1s).
