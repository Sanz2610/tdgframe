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
- Photo fits a centered square measuring **78.5%** of the full frame, clipped to that area at every zoom level.
- Desktop/Android download PNG immediately without an app popup. iPhone/iPad open the native iOS share sheet so users can choose **Save Image** into Photos.
- Zalo-specific saving guidance and external-browser fallback.
- No backend, analytics, photo uploads, or persistent photo storage. Fonts are self-hosted.
- Keyboard controls, native accessible dialogs, reduced motion, and safe area spacing.

## Deploy

Import this GitHub repository into Vercel. The Vite preset and output `dist` are configured automatically. No environment variables are needed. Pushes to `main` deploy automatically when the repository is connected.

Replace `public/frame.webp` to change the frame (square transparent image). The photo is drawn below this artwork. Export size and pan/zoom geometry are in `src/image.ts`.

## Mobile saving

On iPhone/iPad, PNG generation runs after photo adjustments settle. Download calls `navigator.share` directly from the user tap with the prepared PNG, preserving transient user activation even if encoding took several seconds. Choose **Save Image** in the native sheet to save into Photos. iPad desktop user agents are detected using MacIntel plus touch support.

If sharing is unavailable or blocked, the inline result opens for long press → **Save Image**. Cancelling the share sheet does not trigger a file download. An explicitly labelled **Tải file PNG vào Tệp** link remains available for users who want a file. iOS cannot be instructed by a website to silently write into Photos; the user completes the native save action.

Desktop/Android keep direct PNG downloads. On phones, an inline **Cách lưu khác** section offers additional saving methods. Editing or replacing a photo discards the previous export and cancels obsolete preparation. A completed share call is not treated as proof that the user saved the file. Zalo varies by OS and app version; use long press or open in Safari/Chrome and select the photo again if its webview blocks saving.

## Verification

- Unit tests cover cover-fit geometry, pan bounds through 1000%, and pinch anchoring.
- Browser QA covers desktop, Android-sized Chromium, iPhone-sized WebKit, Zalo user-agent variants, 320px layout, reduced motion, HEIC conversion, corrupt/replacement uploads, PNG download, share cancellation/unsupported branches, transient activation and accessibility.
- Mobile browsers and Web Share API branches were tested through desktop automation/emulation. Native photo-picker behavior, actual device share sheets, Photos writes and Zalo's own webview require a physical phone check.

The artwork was supplied by the project owner. It is used as the fixed overlay; users' photos never leave their browser.
