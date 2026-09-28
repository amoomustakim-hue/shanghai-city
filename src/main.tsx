import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted type: no third-party request can stall the preloader.
import '@fontsource/inter-tight/latin-300.css'
import '@fontsource/inter-tight/latin-400.css'
import '@fontsource/inter-tight/latin-500.css'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import 'lenis/dist/lenis.css'
import './styles/index.css'
import App from './App'
import { LenisProvider } from './hooks/useLenis'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LenisProvider>
      <App />
    </LenisProvider>
  </StrictMode>,
)
