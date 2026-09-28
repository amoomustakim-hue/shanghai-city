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

/**
 * Splits text into individually masked characters (`.char`). Characters are
 * grouped per word in a no-wrap span — inline-blocks otherwise allow a line
 * break between any two letters ("GOLDEN H / OUR").
 */
export function SplitChars({ text, className, breakAfter }: { text: string; className?: string; breakAfter?: number }) {
  let index = 0
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {text.split(' ').map((word, w) => {
        const start = index
        index += word.length + 1
        return (
          <span key={w} style={{ display: 'contents' }} aria-hidden="true">
            {w > 0 && ' '}
            <span className="word">
              {Array.from(word).map((ch, c) => (
                <span key={c} style={{ display: 'contents' }}>
                  <span className="mask mask--char">
                    <span className="mask__inner char">{ch}</span>
                  </span>
                  {breakAfter === start + c + 1 && <br className="br-mobile" />}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}
