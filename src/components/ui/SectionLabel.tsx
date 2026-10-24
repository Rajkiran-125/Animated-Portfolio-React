interface Props {
  index: string;
  title: string;
  className?: string;
}

/** "(02) ——— ABOUT" style kicker used at the top of each section. */
export function SectionLabel({ index, title, className = '' }: Props) {
  return (
    <div className={`label flex items-center gap-4 ${className}`} data-reveal="up">
      <span>({index})</span>
      <span className="h-px w-12 bg-current opacity-60" />
      <span>{title}</span>
    </div>
  );
}
