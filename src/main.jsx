import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Index2 from './pages/Index2.jsx'
import { VideoProvider } from './contexts/VideoContext'

// 🔥 BUILD VERIFICATION - If you see this, the new build is deployed
console.log('🔥🔥🔥 BUILD v2026-01-24-16:00 🔥🔥🔥')
console.log('🔥 Environment:', import.meta.env.MODE)
console.log('🔥 Production:', import.meta.env.PROD)
console.log('🔥 VITE_GOOGLE_SHEETS_API_KEY:', import.meta.env.VITE_GOOGLE_SHEETS_API_KEY ? 'PRESENT' : 'MISSING')
console.log('🔥 VITE_GOOGLE_SHEETS_SHEET_ID:', import.meta.env.VITE_GOOGLE_SHEETS_SHEET_ID ? 'PRESENT' : 'MISSING')

// Check URL parameter to determine which version to show
const urlParams = new URLSearchParams(window.location.search)
const version = urlParams.get('v')

// Set data attribute on body for CSS targeting
document.body.setAttribute('data-version', version || '1')

const Component = version === '2' ? Index2 : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VideoProvider>
      <Component />
    </VideoProvider>
  </StrictMode>,
)
