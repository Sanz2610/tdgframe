# TDGFrame

Compact, mobile-first avatar frame editor for TDG's **50 ngày thần tốc** campaign.

## Develop

Requires Node.js 22.12+ (or 24 LTS).

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## Features

- Choose a photo, drag to reposition, pinch or use the flat slider to zoom **100–1000%**.
- Local JPG/PNG/WebP/AVIF decoding; lazy HEIC/HEIF conversion for browsers without native support.
- Original campaign artwork optimized into a transparent 2048px WebP; export a **2048 × 2048 PNG**.
- Download result, share the prepared PNG on supported phones, or long-press the result image to save.
- Zalo-specific saving guidance and external-browser fallback.
- No backend, analytics, photo uploads, or persistent photo storage. Fonts are self-hosted.
- Keyboard controls, native accessible dialogs, reduced motion, and safe area spacing.

## Deploy

Import this GitHub repository into Vercel. The Vite preset and output `dist` are configured automatically. No environment variables are needed. Pushes to `main` deploy automatically when the repository is connected.

Replace `public/frame.webp` to change the frame (square transparent image). The photo is drawn below this artwork. Export size and pan/zoom geometry are in `src/image.ts`.

## Mobile saving

The image is encoded before the save dialog opens. The share button calls `navigator.share` directly from a new tap, preserving transient user activation. File sharing uses capability detection, with direct PNG download and a normal image element as fallbacks. A completed share call is not treated as proof that the user saved the file.

iOS may save a download to **Files → Downloads**. The share sheet can offer **Save Image**. Zalo varies by OS and app version; use long press or open in Safari/Chrome and select the photo again if its webview blocks saving.

## Verification

- Unit tests cover cover-fit geometry, pan bounds through 1000%, and pinch anchoring.
- Browser QA covers desktop, Android-sized Chromium, iPhone-sized WebKit, Zalo user-agent variants, 320px layout, reduced motion, HEIC conversion, corrupt/replacement uploads, PNG download, share cancellation/unsupported branches, transient activation and accessibility.
- Mobile browsers and Web Share API branches were tested through desktop automation/emulation. Native photo-picker behavior, actual device share sheets, Photos writes and Zalo's own webview require a physical phone check.

The artwork was supplied by the project owner. It is used as the fixed overlay; users' photos never leave their browser.
