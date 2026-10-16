import { useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import EventCard from '../components/EventCard'
import { fmtDate, money } from '../utils'

const MARQUEE_ITEMS = [
  'Workshops', 'Hackathons', 'Competitions', 'Music', 'Dance',
  'Design', 'Robotics', 'AI & ML', 'Photography', 'Theatre',
  'Gaming', 'Astronomy', 'Film', 'Poetry', 'Engineering',
]

const WHY = [
  ['01', 'Discover', 'Browse every campus event in one clean place — no group-chat scrolling, no missed posts.'],
  ['02', 'Decide', 'Rich event details, real seat counts and clear pricing. Everything you need at a glance.'],
  ['03', 'Show up', 'Make room for an experience worth having. Secure your spot in seconds.'],
]

export default function HomePage() {
  const { events, loading, error, reload } = useEvents()
  const nav = useNavigate()
  const observerRef = useRef<IntersectionObserver | null>(null)

  /* scroll fade-in animation */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observerRef.current?.unobserve(e.target)
          }
        })
      },
      { rootMargin: '150px', threshold: 0.01 }
    )
    document.querySelectorAll('.fade-up').forEach(el => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [events])

  const featured = useMemo(() => events.find(e => e.is_featured) ?? events[0], [events])
  const activeEvents = useMemo(() => events.filter(e => e.event_status === 'ACTIVE').slice(0, 6), [events])
  const categories = useMemo(() => Array.from(new Set(events.map(e => e.category))), [events])

  const marqueeItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <main className="page-enter" id="top">
      {/* ── META ── */}
      <title>gather · Campus Events Curated</title>

      {/* ═══ HERO ═══ */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-badge" aria-label="Platform tagline">
          <span className="hero-badge-dot" aria-hidden="true" />
          Campus · Curated · Real-time
        </div>

        <h1 className="hero-title" id="hero-title">
          Where campus<br />
          <em className="shiny-text">comes alive.</em>
        </h1>

        <p className="hero-sub">
          From 72-hour hackathons to tech workshops — explore verified schedules,
          real-time seats, and instant event passes.
        </p>

        <div className="hero-actions">
          <Link to="/events" className="btn-primary" id="hero-cta">
            Browse events
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>
          </Link>
          <a href="#discover" className="btn-outline">
            Learn more ↓
          </a>
        </div>

        <div className="hero-stats" aria-label="Platform statistics">
          <div className="hero-stat">
            <div className="hero-stat-num">{events.length || '30'}+</div>
            <div className="hero-stat-label">Events</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">{categories.length || '18'}+</div>
            <div className="hero-stat-label">Categories</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">72h</div>
            <div className="hero-stat-label">Deadline</div>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div className="marquee-wrap" aria-hidden="true">
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <span key={i} className="marquee-item">
              {item}
              <span className="marquee-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ═══ FEATURED EVENT ═══ */}
      {!loading && !error && featured && (
        <section className="featured-section shell" id="discover" aria-labelledby="featured-label">
          <div className="fade-up">
            <div className="section-eyebrow">Editor's Pick</div>
            <h2 className="section-title">Don't miss<br /><em>this one.</em></h2>
          </div>

          <div style={{ marginTop: 36 }}>
            <button
              className="featured-card fade-up"
              onClick={() => nav(`/events/${featured.id}`)}
              aria-label={`View details for featured event: ${featured.name}`}
              id="featured-event-btn"
              style={{ width: '100%' }}
            >
              <img
                className="featured-bg"
                src={featured.cover_image_url}
                alt={featured.cover_image_alt}
                loading="lazy"
                decoding="async"
                width="800"
                height="450"
              />
              <div className="featured-overlay" aria-hidden="true" />
              <div className="featured-content">
                <div>
                  <div className="featured-label" id="featured-label">★ Featured Event</div>
                  <div className="featured-name">{featured.name}</div>
                  <div className="featured-blurb">{featured.blurb}</div>
                  <div className="featured-cta">
                    View details
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>
                  </div>
                </div>
                <div className="featured-meta">
                  <div className="featured-date">{fmtDate(featured.schedule_summary.start_date)}</div>
                  <div className="featured-time">{featured.schedule_summary.start_time}</div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
                    {money(featured.price)}{featured.is_per_head ? ' / person' : ' / team'}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* ═══ UPCOMING EVENTS ═══ */}
      <section className="events-section shell" aria-labelledby="upcoming-title">
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <div className="section-eyebrow">What's Happening</div>
          <h2 className="section-title" id="upcoming-title">Upcoming<br /><em>events.</em></h2>
        </div>

        {error ? (
          <div className="events-grid">
            <div className="state-box">
              <div className="state-icon">⚠️</div>
              <div className="state-title">Couldn't load events</div>
              <p className="state-msg">{error}</p>
              <button className="state-btn" onClick={reload}>Try again</button>
            </div>
          </div>
        ) : loading ? (
          <div className="events-grid">
            {[1,2,3,4,5,6].map(n => (
              <div className="skeleton-card" key={n}>
                <div className="skeleton-img" />
                <div className="skeleton-body">
                  <div className="skeleton-line w40" />
                  <div className="skeleton-line h20 w80" />
                  <div className="skeleton-line w60" />
                  <div className="skeleton-line w80" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="events-grid">
              {activeEvents.map(e => (
                <div className="fade-up" key={e.id}>
                  <EventCard event={e} />
                </div>
              ))}
            </div>
            {events.length > 6 && (
              <div style={{ textAlign: 'center', marginTop: 48 }} className="fade-up">
                <Link to="/events" className="btn-outline" id="see-all-events-btn">
                  See all {events.length} events
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* ═══ WHY SECTION ═══ */}
      <section className="why-section shell" aria-labelledby="why-title">
        <div className="fade-up">
          <div className="section-eyebrow">Why gather</div>
          <h2 className="section-title" id="why-title">Less searching.<br /><em>More showing up.</em></h2>
        </div>
        <div className="why-grid" role="list">
          {WHY.map(([num, title, desc]) => (
            <div className="why-card fade-up" key={num} role="listitem">
              <div className="why-num" aria-hidden="true">{num}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      {categories.length > 0 && (
        <section className="cats-section shell" aria-labelledby="cats-title">
          <div className="fade-up">
            <div className="section-eyebrow">Browse by Category</div>
            <h2 className="section-title" id="cats-title">Find your<br /><em>scene.</em></h2>
          </div>
          <div className="cats-grid fade-up" role="list">
            {categories.map(cat => (
              <Link
                key={cat}
                to={`/events?cat=${encodeURIComponent(cat)}`}
                className="cat-pill"
                role="listitem"
                id={`cat-pill-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
