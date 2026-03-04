import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import Popup from './Popup.jsx'

function closePopupSafely() {
  try {
    window.close()
  } catch {
    // noop
  }
  setTimeout(() => {
    try {
      window.close()
    } catch {
      // noop
    }
  }, 50)
}

function shouldAbortPopupRender() {
  if (window.location.protocol !== 'chrome-extension:') return false
  try {
    return !(typeof chrome !== 'undefined' && chrome.runtime?.id)
  } catch {
    return true
  }
}

if (shouldAbortPopupRender()) {
  closePopupSafely()
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Popup />
    </StrictMode>,
  )
}
