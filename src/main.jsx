import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import About from './pages/About.jsx'
import BlogList from './pages/BlogList.jsx'
import BlogPost from './pages/BlogPost.jsx'

function GoatCounterTracker() {
  const location = useLocation()
  useEffect(() => {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: location.pathname + location.search + location.hash })
    }
  }, [location])
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GoatCounterTracker />
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blogs/:slug" element={<BlogPost />} />
        <Route path="/date/:date" element={<App />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
