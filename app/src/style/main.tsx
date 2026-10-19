import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { StylePage } from './StylePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StylePage />
  </StrictMode>,
)
