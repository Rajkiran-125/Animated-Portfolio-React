# Rajkiran Jaiswar — Portfolio v2

Animated portfolio built with React, TypeScript, Vite, Tailwind, React Three Fiber, GSAP and Framer Motion.
Content comes from the previous Angular portfolio and the current résumé. Nothing in it is invented.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build on http://localhost:4173
```

Requires Node 18+. `dist/` is a static site that can be deployed to Firebase Hosting, Netlify, Vercel or any other static host. No backend is needed.

## Where things live

| Path | What |
|---|---|
| `src/data/profile.ts` | **All content**: bio, skills, projects, timeline, links. Edit this to update the site. |
| `src/types.ts` | Content types |
| `src/styles/index.css` | Design tokens (`:root` colours), grain, grid paper, shared component classes |
| `tailwind.config.ts` | Maps the CSS tokens to Tailwind colours and fonts |
| `src/sections/*` | Hero, About, Skills, Projects, Experience, Contact |
| `src/components/layout/*` | Navbar, Footer, Preloader, Cursor, floating WhatsApp button |
| `src/components/ui/*` | MagneticButton, TiltFrame, SplitWords, Marquee, TornEdge, Crest, icons |
| `src/three/*` | Hero 3D scene (lazy-loaded), canvas code textures, SVG fallback |
| `src/animations/*` | `useGsap` (scoped GSAP context with automatic cleanup) and declarative scroll reveals |
| `public/images`, `public/files` | Optimised WebP images and the résumé PDF |

## Animation responsibilities

Each element is animated by one library only:

- **GSAP + ScrollTrigger**: preloader, hero intro, scroll reveals (`data-reveal`, `data-split`), pinned horizontal project gallery, timeline spine, parallax, custom cursor.
- **Framer Motion**: UI state. That covers the nav active pill and mobile menu, magnetic buttons, tilt cards, skill tabs/chips and form feedback.
- **React Three Fiber**: the hero workspace, which runs its own render loop.

## Performance & accessibility notes

- The 3D chunk (~225 KB gzip) is fetched during the preloader and kept out of the initial bundle (~165 KB gzip JS).
- Render tiers (`src/lib/device.ts`):
  - **full**: ink outlines, three code windows, more particles.
  - **lite**: used on phones and low-power devices; drops the outlines, uses fewer particles and a lower DPR.
  - **none**: no WebGL; shows a static SVG illustration instead.
- The scene stops rendering when the hero is off screen. Code screens re-upload their textures at ~15 fps while typing and about twice a second when idle.
- `prefers-reduced-motion` gets a static scene, no scrubbing or pinning (projects stack vertically), instant reveals and no custom cursor.
- Touch devices get no custom cursor and no pointer parallax; the 3D camera drifts slowly on its own instead.
- Semantic landmarks, skip link, visible focus rings on every background, keyboard-operable tabs, ESC to close the mobile menu, labelled form with inline errors.

## Contact form

The form validates input, then posts the name, email and message to [FormSubmit](https://formsubmit.co), which emails them to `profile.email` (`src/data/profile.ts`). No account or API key is needed, but the very first submission triggers an "Activate Form" email that must be confirmed before messages are delivered. A hidden `_honey` field filters out basic spam bots.

## WhatsApp

A floating WhatsApp button sits in the bottom-right corner on every section and steps aside while the footer is on screen, since the footer has its own WhatsApp icon. All WhatsApp links (floating button, contact card, footer icon, mobile menu) open `https://wa.me/<number>?text=<message>`, which starts a chat with the message already typed in: in the app on phones, or WhatsApp Web / Desktop on a computer. Change the number (`whatsapp`, digits only with country code) and the text (`whatsappMessage`) in `src/data/profile.ts`.
