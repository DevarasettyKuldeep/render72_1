import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <Link to="/" className="footer-brand">gather</Link>
        <p className="footer-copy">© 2026 gather · Curated campus events</p>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/events">All Events</Link>
        </div>
      </div>
    </footer>
  )
}
