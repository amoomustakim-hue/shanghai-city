import type { ElementType, ReactNode } from 'react'

type Props = {
  lines: ReactNode[]
  as?: ElementType
  className?: string
  lineClassName?: string
}

/**
 * Lines wrapped in overflow masks. Scenes animate `.mask__inner`
 * (yPercent 110 → 0) for the clipped editorial reveal.
 */
export function Mask({ lines, as: Tag = 'span', className, lineClassName }: Props) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span className={`mask ${lineClassName ?? ''}`} key={i}>
          <span className="mask__inner">{line}</span>
        </span>
      ))}
    </Tag>
  )
}

/** Splits text into individually masked characters (`.char`). Spaces stay breakable. */
export function SplitChars({ text, className, breakAfter }: { text: string; className?: string; breakAfter?: number }) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {Array.from(text).map((ch, i) => (
        <span key={i} style={{ display: 'contents' }} aria-hidden="true">
          {ch === ' ' ? (
            ' '
          ) : (
            <span className="mask mask--char">
              <span className="mask__inner char">{ch}</span>
            </span>
          )}
          {breakAfter === i + 1 && <br className="br-mobile" />}
        </span>
      ))}
    </span>
  )
}
