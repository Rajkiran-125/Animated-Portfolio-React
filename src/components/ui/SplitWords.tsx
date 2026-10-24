import { Fragment } from 'react';

interface Props {
  text: string;
  /** Words to tint in the accent colour (matched case-insensitively, punctuation ignored) */
  accent?: string[];
  wordClassName?: string;
}

/**
 * Renders text as individually masked words so GSAP can animate `.word`
 * without a runtime DOM splitter. Screen readers get the plain sentence.
 */
export function SplitWords({ text, accent = [], wordClassName = '' }: Props) {
  const accentSet = new Set(accent.map((w) => w.toLowerCase()));
  const words = text.split(' ');
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => {
          const isAccent = accentSet.has(word.replace(/[^\w.+-]/g, '').toLowerCase());
          return (
            <Fragment key={i}>
              <span className="line-mask inline-block align-top">
                <span className={`word ${isAccent ? 'text-accent' : ''} ${wordClassName}`}>{word}</span>
              </span>
              {i < words.length - 1 && ' '}
            </Fragment>
          );
        })}
      </span>
    </>
  );
}
