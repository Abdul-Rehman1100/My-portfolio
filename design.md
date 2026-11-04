# Website Design Guide

## Project overview

- Responsive personal portfolio site built with plain HTML, CSS, and JavaScript.
- Current page includes a full-screen video hero, glass navigation, a first-visit loading intro, a cream project section, and an About section with expandable details.
- Keep the video inside its hero section. Do not use it as a body background.
- Hero greeting: “Hey! I’m Abdulrehman.” with the subheading “When the why is clear, the how is easy.” and Work/Contact calls to action beneath it. Keep the copy left aligned and clear of the character’s face; hide the quote on phone-width screens while keeping both buttons visible, compact, and no wider than the copy column. Use gold and charcoal button styling with lift and arrow hover motion.

## Color palette

Use this palette throughout the website. Warm red and charcoal are the main structural colors, cream is the primary light foreground, and golden yellow and mustard gold provide emphasis.

| Color | Hex | Role |
| --- | --- | --- |
| Warm red | `#C52228` | Brand color, loader background, strong accents |
| Golden yellow | `#F4C542` | Active links, hover/focus highlights, key accents |
| Warm cream | `#FFF6E5` | Main text and light foregrounds |
| Charcoal | `#262323` | Dark surfaces, page background, dropdown surface |
| Mustard gold | `#E7AD32` | Secondary and deeper gold accent |
| Soft beige | `#F1DFBD` | Subtle borders and quiet light surfaces |

For translucent surfaces, use alpha variants of these colors. Maintain readable contrast over the video and glass surfaces.

## Typography and visual direction

- Use Playfair Display for all headings (`h1`–`h6`), with Georgia/Times as local fallbacks. The font is loaded from Google Fonts.
- Keep body copy and navigation on the current system sans-serif stack.
- Keep the design warm, creative, polished, and minimal.
- Use rounded corners, restrained glass effects, soft borders, and smooth transitions.
- The hero greeting uses cream text with a golden italic name accent. It overlays the left-center of the video on portrait screens and scales down with the compact hero.

## Hero video

- Video asset: `assets/video/hero.mp4`.
- The hero is viewport-height on landscape screens, with `100vh`, `100svh`, and `100dvh` sizing fallbacks. On portrait screens, it follows the landscape video's 16:9 frame ratio.
- The video fills the hero using centered `object-fit: cover` on landscape screens. On portrait screens, use `object-fit: contain` with a warm-red hero fill so the whole frame remains visible without black bars or stretching.
- Playback is muted, autoplaying, looping, and inline on mobile.

## Navigation

- Navigation overlays the hero transparently at the top edge so it does not blur or cover the portrait, then becomes a centered floating glass bar after scrolling.
- Logo: `assets/images/ar_logo.webp`. Reuse it for the navbar and favicon.
- Desktop navigation uses right-aligned links. At `640px` and below, show a compact, viewport-scaled hamburger bar and glass dropdown.
- Link text uses warm cream. Hover, focus, and active states use golden yellow, an animated underline, and a subtle lift.
- Keep visible keyboard focus. Escape and link selection close the mobile menu.
- Keep the floating bar broad on desktop and maintain comfortable spacing on mobile.

## Loader and animation

- GSAP 3.15.0 is stored locally at `js/vendor/gsap.min.js` and loaded before `js/script.js`. A local ScrollTrigger build is also available in `js/vendor/ScrollTrigger.min.js` for future use.
- The intro runs once per browser tab session and is skipped when reduced motion is preferred.
- Loader background uses warm red, with a circular progress ring around the AR logo and animated wave bars.
- Once loading finishes, the logo enters from the left and navigation links enter from the right toward the center.
- Keep animations brief and smooth. Respect `prefers-reduced-motion` for all new motion.

## Files and assets

- `index.html` — page structure, favicon, hero, navigation, project section, and script loading.
- `css/style.css` — layout, palette, responsive navigation, loader, and motion preferences.
- `js/script.js` — muted autoplay, scroll state, mobile menu, and GSAP intro.
- `js/vendor/gsap.min.js` — local GSAP 3.15.0 browser build.
- `assets/video/hero.mp4` — hero video.
- `assets/images/ar_logo.webp` — navbar logo and favicon.

## Responsive behavior

- On landscape screens, the hero video fills the viewport. In portrait layouts, the hero keeps the 16:9 video ratio so the video does not become an overly tall crop.
- In portrait layouts, the greeting stays over the video at the left and vertically centered, with its width and font size reduced for narrow screens.
- Navbar changes to the hamburger layout at `640px`.
- On narrow screens, reduce the navbar height, padding, logo, and hamburger control together while keeping the controls touch-friendly.
- Prevent horizontal overflow on narrow screens and keep the logo and menu control visible.
- The project section below the hero uses a cream background, an editorial two-column header, and a one-project-at-a-time preview carousel.
- The heading uses Playfair Display, with a charcoal first line and warm-red italic second line, aligned to the upper left.
- The carousel includes live previews and external links for WebLaunch, CVSPAV1, and Aero Throne. Scrolling through the tall project track scrubs the visible cards horizontally through GSAP, then continues to the next section; scrolling upward reverses the sequence. Previous/next controls and left/right keys navigate to the corresponding scroll position.
- The project heading and carousel animate into view once as the section scrolls into view.
- The About section follows the projects with a soft-beige background, a two-style heading, and five independently expandable card panels. Use rounded cream surfaces, subtle lift/shadow hover motion, animated plus/minus controls, and reduced-motion support. Keep summaries keyboard accessible and use warm red for their labels and controls.

## Accessibility and interaction

- Use semantic, labeled navigation.
- The menu button exposes `aria-expanded` and `aria-controls`.
- Treat the video and loader artwork as decorative for assistive technology.
- Keep visible focus styles and honor reduced-motion preferences.
- Do not add audio or cursor/arrow video scrubbing unless requested.
