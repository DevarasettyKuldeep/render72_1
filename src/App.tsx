import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'

// Code-split secondary routes and heavy interactive components to minimize initial TBT & LCP
const EventsPage = lazy(() => import('./pages/EventsPage'))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'))
const EasterEggModal = lazy(() => import('./components/EasterEggModal'))

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Suspense
        fallback={
          <div
            className="loader"
            style={{
              minHeight: '60vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="spinner" role="status" aria-label="Loading page content" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
        </Routes>
      </Suspense>
      <Footer />
      <Suspense fallback={null}>
        <EasterEggModal />
      </Suspense>
    </>
  )
}
