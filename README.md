# everyhexcode

Check the colors in your code the way people will see them. `everyhexcode` reads your CSS, SCSS, Less, Tailwind config or design tokens, works out which colors are text and which are backgrounds, and checks every pair that meets against WCAG 2, in light and dark mode. It flags status and chart colors that look alike with color blindness, and gives you the nearest passing colors as a diff of your own files.

It runs on your machine and in your own CI. Nothing is uploaded. The engine is the same one behind the [color checker on everyhexcode.com](https://everyhexcode.com/color-checker).

```
$ npx everyhexcode check src/styles
src/styles/globals.css (css, 39 colors, light and dark)
  ✗ --muted-foreground on --muted [light]: 2.7:1, needs 4.5:1 (text)  src/styles/globals.css:11
      fix: --muted-foreground → #6f6f77
  ✗ --muted-foreground on --background [light]: 2.97:1, needs 4.5:1 (text)  src/styles/globals.css:11
      fix: --muted-foreground → #6f6f77
  …
  24 pass, 12 fail against WCAG 2 AA
```

## What it reads

| Input | How pairs are found |
|---|---|
| CSS custom properties, including shadcn/ui's bare `hsl` numbers, `var()` chains, `.dark`, `[data-theme=dark]` and `prefers-color-scheme` blocks | By name: `--primary-foreground` on `--primary`, `--foreground` on `--background`, `--input` and `--ring` as input borders (3:1) |
| CSS rules | A rule that sets `color` and `background` is checked as written; `color` alone is checked on the page background; `border-color` on inputs and buttons needs 3:1 |
| SCSS `$vars`, Less `@vars` | By name, like custom properties |
| `tailwind.config.js` / `.ts`, Tailwind v4 `@theme` | The colors under `colors`, by name |
| Design tokens: W3C DTCG (`$value`, `{aliases}`), Style Dictionary, Figma variables exports | By name, aliases resolved, a `light` or `dark` level in the path read as the mode |
| A rendered page (`scan`) | Every visible text and the color actually behind it, in your own headless Chrome |

Stylesheets given together are read as one cascade, so a variable set in `tokens.css` resolves where `button.css` uses it.

## Commands

```
everyhexcode check [files or folders...]   # default: the current folder
everyhexcode fix [files...] --write        # write the nearest passing colors back, in the same format (hex stays hex, hsl stays hsl)
everyhexcode scan http://localhost:3000    # load the page in headless Chrome, light and dark, and check what it draws
```

Options: `--target AA|AAA`, `--format text|json|sarif|markdown|github`, `--out <file>`, `--sarif <file>`, `--lock <names>` (colors the fix must not change, such as your brand color), `--fail-on fail|warn|none`, `--config <file>`, `--verbose`, `--chrome <path>`, `--width <px>`.

Exit codes: `0` all pass, `1` a pair fails, `2` a usage or read error.

### How fixes are chosen

Each fix keeps the color's hue and chroma and moves only its lightness, in OKLCH. The checker picks the one color whose move fixes the most failing pairs with the smallest visible change (ΔE in OKLab), repeats until everything passes, and never breaks a pair that already passes. Text colors move before backgrounds, brand and accent colors last. `--lock` keeps any color where it is.

### The rendered scan

`scan` starts your installed Chrome, Chromium or Edge headless, with a temporary profile it deletes afterwards. For every visible text it takes the backgrounds under the text's own spot, composites translucent layers, and where an image or gradient is behind the text, it hides the text, photographs the box and takes the worst tenth of what is behind it. Set `CHROME_PATH` or `--chrome` if Chrome is somewhere unusual. It needs Node 22 or newer (Node 20 with `--experimental-websocket`).

## Settings: `colorcheck.json`

```json
{
  "files": ["src/styles", "tokens/*.json"],
  "target": "AA",
  "lock": ["--brand"],
  "roles": { "--muted": "bg", "--highlight": "text" },
  "pairs": [["--link", "--card", "text"]],
  "ignore": ["--decorative-gradient-stop"],
  "failOn": "fail"
}
```

Roles are `bg`, `text`, `accent`, `border` (decoration, no minimum), `control` (input borders and focus rings, 3:1), `chart` (3:1) and `ignore`.

## GitHub Action

```yaml
name: Colors
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write   # only for the SARIF upload
    steps:
      - uses: actions/checkout@v4
      - uses: Benjaminsen/everyhexcode-cli@v0
        with:
          files: src/styles tokens
          sarif: colors.sarif
      - if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: colors.sarif
```

Failing pairs show as annotations on the lines that set the color, and a summary table with the fixes lands on the job page. To check a running preview as drawn, pass `url:`. The job runs on your own runners; nothing is sent to a server.

## What it does not do

- APCA is not included in this package. Its licence covers web content under the W3C's agreement; the [APCA contrast checker](https://everyhexcode.com/apca-contrast-checker) on the site shows it as an advisory value.
- It checks colors only, not other accessibility criteria such as alt text or keyboard use.
- A static check cannot see colors set by scripts or text over images; use `scan` for those.

## Licence

[Functional Source License 1.1, ALv2 future licence](LICENSE.md) (FSL-1.1-ALv2): free to use, change and run for your own projects and your company's, including in CI. What it does not allow is offering it as a competing product or service. Each version becomes Apache 2.0 two years after its release. Copyright 2026 Moltke Benjaminsen ApS.
