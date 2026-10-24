import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Download, FileText, Send } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { useGsap } from '@/animations/useGsap';
import { registerReveals } from '@/animations/reveals';
import { GithubIcon, LinkedinIcon, WhatsappIcon } from '@/components/ui/Icons';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { SplitWords } from '@/components/ui/SplitWords';
import { Crest } from '@/components/ui/Crest';
import { profile, socials } from '@/data/profile';
import { gsap } from '@/lib/gsap';
import { openResume } from '@/lib/resume';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;
type Status = 'idle' | 'sending' | 'sent' | 'error';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// FormSubmit relays the JSON to this inbox, so no backend or API key is needed
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${profile.email}`;

function validate(data: FormData): Errors {
  const e: Errors = {};
  if (String(data.get('name') ?? '').trim().length < 2) e.name = 'Please tell me your name.';
  if (!EMAIL_RE.test(String(data.get('email') ?? '').trim())) e.email = 'That email doesn’t look right.';
  if (String(data.get('message') ?? '').trim().length < 10) e.message = 'A few more words, please (10+ characters).';
  return e;
}

function Field({ id, label, error, textarea, type = 'text', autoComplete }: { id: 'name' | 'email' | 'message'; label: string; error?: string; textarea?: boolean; type?: string; autoComplete?: string }) {
  const cls =
    'peer w-full border-b-2 border-paper/25 bg-transparent pb-3 pt-7 text-lg text-paper outline-none transition-colors placeholder:text-transparent focus:border-accent';
  return (
    <div className="relative">
      {textarea ? (
        <textarea id={id} name={id} rows={4} placeholder={label} className={`${cls} resize-none`} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      ) : (
        <input id={id} name={id} type={type} autoComplete={autoComplete} placeholder={label} className={cls} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      )}
      <label
        htmlFor={id}
        className="label pointer-events-none absolute left-0 top-1 text-paper/60 transition-all peer-placeholder-shown:top-8 peer-placeholder-shown:text-base peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-1 peer-focus:text-[0.7rem] peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-accent"
      >
        {label}
      </label>
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-err`}
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm text-accent"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef<number>();

  const scope = useGsap<HTMLElement>(({ reduce, scope }) => {
    registerReveals(scope, reduce);
    if (reduce) return;
    gsap.fromTo(
      '.contact-glow',
      { scale: 0.6, opacity: 0.3 },
      { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: scope, start: 'top bottom', end: 'center center', scrub: true } },
    );
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    const form = e.currentTarget; // currentTarget is null after the await
    const data = new FormData(form);
    const errs = validate(data);
    setErrors(errs);
    const firstInvalid = Object.keys(errs)[0];
    if (firstInvalid) {
      // aria-invalid isn't rendered yet, so focus by id (validate() keeps field order)
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    const name = String(data.get('name')).trim();
    setStatus('sending');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email: String(data.get('email')).trim(),
          message: String(data.get('message')).trim(),
          _subject: `Portfolio enquiry from ${name}`,
          _template: 'table',
          _honey: String(data.get('_honey') ?? ''),
        }),
      });
      // FormSubmit answers { success: "true" | "false", message }
      const json = (await res.json().catch(() => ({}))) as { success?: string | boolean };
      if (!res.ok || String(json.success) !== 'true') throw new Error('Send failed');
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const linkedin = socials.find((s) => s.label === 'LinkedIn')!;
  const github = socials.find((s) => s.label === 'GitHub')!;
  const whatsapp = socials.find((s) => s.label === 'WhatsApp')!;

  return (
    <section id="contact" ref={scope} data-surface="ink" className="relative overflow-hidden bg-ink pb-24 pt-24 text-paper outline-none md:pb-32 md:pt-36" aria-labelledby="contact-title">
      {/* cinematic accent floor glow */}
      <div
        className="contact-glow pointer-events-none absolute -bottom-1/3 left-1/2 h-[80vh] w-[140vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--accent)/0.55),rgb(var(--accent-deep)/0.25)_55%,transparent)]"
        aria-hidden="true"
      />

      <div className="frame relative">
        <Crest size={190} className="absolute right-[var(--gutter)] top-0 hidden lg:block" ring="SAY HELLO • OPEN TO WORK • SAY HELLO • OPEN TO WORK • " />
        <SectionLabel index="05" title="Contact" className="text-accent" />
        <h2 id="contact-title" className="display mt-8 text-[clamp(3.8rem,12vw,12rem)]" data-split>
          <SplitWords text="Let's build something" accent={['something']} />
        </h2>

        <div className="mt-14 grid gap-16 lg:mt-20 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-lg text-paper/75" data-reveal="up">
              {profile.availability}. The fastest way to reach me is email or WhatsApp.
            </p>

            <div className="mt-10" data-reveal="up">
              <p className="label text-paper/50">Email</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <a href={`mailto:${profile.email}`} className="group relative break-all text-[clamp(1.25rem,2.4vw,1.9rem)] font-semibold">
                  {profile.email}
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-right scale-x-0 bg-accent transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
                </a>
                <button
                  type="button"
                  onClick={copy}
                  className="relative grid h-11 w-11 place-items-center rounded-full border border-paper/25 transition-colors hover:border-accent hover:bg-accent"
                  aria-label={copied ? 'Email copied' : 'Copy email address'}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={copied ? 'ok' : 'copy'} initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </motion.span>
                  </AnimatePresence>
                </button>
                <span className="sr-only" aria-live="polite">
                  {copied ? 'Email address copied to clipboard' : ''}
                </span>
              </div>
            </div>

            <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {[
                { href: whatsapp.href, label: 'WhatsApp', sub: whatsapp.handle, Icon: WhatsappIcon },
                { href: linkedin.href, label: 'LinkedIn', sub: linkedin.handle, Icon: LinkedinIcon },
                { href: github.href, label: 'GitHub', sub: github.handle, Icon: GithubIcon },
              ].map(({ href, label, sub, Icon }) => (
                <li key={label} data-reveal="up">
                  <motion.a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -4 }}
                    className="group flex h-full flex-col gap-6 rounded-sm border border-paper/15 bg-ink-2/60 p-5 transition-colors hover:border-accent hover:bg-accent"
                  >
                    <Icon size={22} />
                    <span>
                      <span className="block font-display text-2xl uppercase">{label}</span>
                      <span className="label block truncate text-paper/60 group-hover:text-paper">{sub}</span>
                    </span>
                  </motion.a>
                </li>
              ))}
              {/* Résumé card opens the preview; its corner button downloads straight away */}
              <li data-reveal="up">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group relative h-full rounded-sm border border-paper/15 bg-ink-2/60 transition-colors hover:border-accent hover:bg-accent"
                >
                  <button type="button" onClick={openResume} className="flex h-full w-full flex-col gap-6 p-5 text-left">
                    <FileText size={22} />
                    <span>
                      <span className="block font-display text-2xl uppercase">Résumé</span>
                      <span className="label block truncate text-paper/60 group-hover:text-paper">View · PDF</span>
                    </span>
                  </button>
                  <a
                    href={profile.resumeUrl}
                    download
                    aria-label="Download résumé (PDF)"
                    title="Download résumé"
                    className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-paper/25 transition-colors hover:border-paper hover:bg-paper hover:text-ink"
                  >
                    <Download size={18} />
                  </a>
                </motion.div>
              </li>
            </ul>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-8 lg:col-span-6 lg:col-start-7" data-reveal="up" aria-describedby="form-note">
            <div className="grid gap-8 sm:grid-cols-2">
              <Field id="name" label="Your name" autoComplete="name" error={errors.name} />
              <Field id="email" label="Your email" type="email" autoComplete="email" error={errors.email} />
            </div>
            <Field id="message" label="What are we building?" textarea error={errors.message} />
            {/* honeypot: hidden from people, bots fill it and FormSubmit drops the message */}
            <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-5">
              <MagneticButton type="submit" icon={<Send size={17} />} disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </MagneticButton>
              <p id="form-note" className="max-w-xs text-sm text-paper/55">
                Goes straight to my inbox. I’ll reply to the email you give.
              </p>
            </div>
            <AnimatePresence mode="wait">
              {status === 'sent' && (
                <motion.p key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-paper/80" role="status">
                  Thanks! Your message is on its way. I’ll get back to you soon.
                </motion.p>
              )}
              {status === 'error' && (
                <motion.p key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-accent" role="alert">
                  Something went wrong sending that. Please email me directly at{' '}
                  <a className="underline underline-offset-4" href={`mailto:${profile.email}`}>
                    {profile.email}
                  </a>
                  .
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </section>
  );
}
