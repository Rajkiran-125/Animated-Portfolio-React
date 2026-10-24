import { AnimatePresence, motion } from 'framer-motion';
import { Download, ExternalLink, FileText, X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { profile } from '@/data/profile';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { closeResume, useResumeOpen } from '@/lib/resume';

const ease = [0.16, 1, 0.3, 1] as const;
// Android Chrome has no built-in PDF viewer, so an inline preview would stay blank there
const canPreview = navigator.pdfViewerEnabled !== false;

const iconBtn =
  'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/15 transition-colors hover:border-ink hover:bg-ink hover:text-paper';

/**
 * Résumé preview: the PDF in the browser's own viewer, with download and
 * open-in-new-tab actions. Opened from anywhere with openResume().
 * Framer Motion owns its enter/exit. z-[120]: above the navbar (100), below the cursor (150).
 */
export function ResumeDialog() {
  const open = useResumeOpen();
  const reduce = usePrefersReducedMotion();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Modal: page behind is inert and can't scroll, ESC closes, focus goes in and back out.
  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const app = document.getElementById('root');
    const { body } = document;
    // Keep the page from jumping sideways when its scrollbar disappears
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    app?.setAttribute('inert', '');
    body.style.overflow = 'hidden';
    if (scrollbar) body.style.paddingRight = `${scrollbar}px`;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeResume();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      app?.removeAttribute('inert');
      body.style.overflow = '';
      body.style.paddingRight = '';
      returnTo?.focus();
    };
  }, [open]);

  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="resume"
          data-surface="ink"
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          {/* no backdrop-blur: it would re-blur the live 3D hero behind it every frame */}
          <div className="absolute inset-0 bg-ink/80" onClick={closeResume} aria-hidden="true" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-surface="paper"
            className="relative flex h-full max-h-[56rem] w-full max-w-5xl flex-col overflow-hidden rounded-[1.4rem] bg-paper text-ink shadow-[0_40px_120px_-40px_rgb(0_0_0/0.8)]"
            initial={hidden}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={hidden}
            transition={{ duration: 0.5, ease }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 py-3 pl-5 pr-3 sm:pl-6">
              <div className="min-w-0">
                <p className="label text-ash">Résumé · PDF</p>
                <h2 id={titleId} className="truncate font-display text-xl uppercase sm:text-2xl">
                  {profile.fullName}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={profile.resumeUrl}
                  download
                  aria-label="Download résumé (PDF)"
                  className="on-accent flex h-10 w-10 items-center justify-center gap-2 rounded-full bg-accent text-[0.8rem] font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-ink sm:w-auto sm:px-4"
                >
                  <Download size={15} />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open résumé in a new tab"
                  className={iconBtn}
                >
                  <ExternalLink size={16} />
                </a>
                <button ref={closeBtn} type="button" onClick={closeResume} aria-label="Close résumé" className={iconBtn}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-paper-2">
              {canPreview ? (
                <>
                  <p className="label absolute inset-0 grid place-items-center text-ash" aria-hidden="true">
                    Loading résumé…
                  </p>
                  {/* fit to width, thumbnail sidebar closed */}
                  <iframe src={`${profile.resumeUrl}#view=FitH&navpanes=0`} title={`${profile.fullName} — résumé`} className="relative h-full w-full" />
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
                  <FileText size={44} strokeWidth={1.5} className="text-accent" aria-hidden="true" />
                  <p className="max-w-xs text-lg text-ink/80">
                    This browser can’t show PDFs inside the page. Open it full screen or download a copy.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <MagneticButton href={profile.resumeUrl} external variant="ink" icon={<ExternalLink size={17} />}>
                      Open
                    </MagneticButton>
                    <MagneticButton href={profile.resumeUrl} download icon={<Download size={17} />}>
                      Download
                    </MagneticButton>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
