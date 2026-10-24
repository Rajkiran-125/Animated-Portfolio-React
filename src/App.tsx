import { useCallback, useEffect, useState } from 'react';
import { Cursor } from '@/components/layout/Cursor';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Preloader } from '@/components/layout/Preloader';
import { WhatsappButton } from '@/components/layout/WhatsappButton';
import { About } from '@/sections/About';
import { Contact } from '@/sections/Contact';
import { Experience } from '@/sections/Experience';
import { Hero } from '@/sections/Hero';
import { Projects } from '@/sections/Projects';
import { Skills } from '@/sections/Skills';
import { ScrollTrigger, scrollToSection } from '@/lib/gsap';

/**
 * Animation responsibilities:
 *  - GSAP + ScrollTrigger: preloader, hero intro, every scroll-linked reveal/pin/scrub, cursor.
 *  - Framer Motion: UI state — nav indicator & menu, magnetic/tilt hovers, tabs, form feedback.
 *  - React Three Fiber: the hero scene (its own render loop).
 * No element is animated by more than one of them.
 */
export default function App() {
  const [ready, setReady] = useState(false);
  const onLoaded = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (!ready) return;
    // Fonts and images shift layout after first measure — recalc pins & triggers
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    // Honour deep links like /#projects
    const hash = window.location.hash.slice(1);
    if (hash && hash !== 'home') setTimeout(() => scrollToSection(hash), 150);
    return () => window.removeEventListener('load', refresh);
  }, [ready]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {!ready && <Preloader onDone={onLoaded} />}
      <Cursor />
      <Navbar ready={ready} />
      <main id="main">
        <Hero ready={ready} />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <WhatsappButton ready={ready} />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
