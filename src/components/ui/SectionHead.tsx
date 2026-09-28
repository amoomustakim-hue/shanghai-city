type Props = { index: string; title: string; aside?: string; className?: string }

/** The recurring archival header: (index) — TITLE ——— aside. */
export function SectionHead({ index, title, aside, className = '' }: Props) {
  return (
    <header className={`section-head ${className}`}>
      <span className="meta section-head__index">({index})</span>
      <span className="meta section-head__title">{title}</span>
      <span className="section-head__rule" aria-hidden="true" />
      {aside && <span className="meta section-head__aside">{aside}</span>}
    </header>
  )
}
