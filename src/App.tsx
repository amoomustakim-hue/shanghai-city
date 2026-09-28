import { useCallback, useEffect, useRef, useState } from 'react'
import { ArchitectureSection } from './components/ArchitectureSection'
import { ArchiveSection } from './components/ArchiveSection'
import { CustomCursor } from './components/CustomCursor'
import { Hero } from './components/Hero'
import { IntroSection } from './components/IntroSection'
import { Navigation } from './components/Navigation'
import { OutroSection } from './components/OutroSection'
import { Preloader } from './components/Preloader'
import { RiverSection } from './components/RiverSection'
import { TimeSection } from './components/TimeSection'
import { Grain } from './components/ui/Grain'
import { useScrollLock } from './hooks/useLenis'
import { ScrollTrigger } from './utils/gsap'

export default function App() {
  const heroVideo = useRef<HTMLVideoElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)

  useScrollLock(loading)

  useEffect(() => {
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  // Fonts are in by now; measure every pin against the final layout.
  useEffect(() => {
    if (revealed) ScrollTrigger.refresh()
  }, [revealed])

  const onReveal = useCallback(() => setRevealed(true), [])
  const onDone = useCallback(() => setLoading(false), [])

  return (
    <>
      {loading && <Preloader video={heroVideo} onReveal={onReveal} onDone={onDone} />}
      <CustomCursor />
      <Navigation ready={revealed} />

      <main>
        <Hero ready={revealed} video={heroVideo} />
        <IntroSection />
        <RiverSection />
        <ArchitectureSection />
        <TimeSection />
        <ArchiveSection />
        <OutroSection />
      </main>

      <Grain />
    </>
  )
}
