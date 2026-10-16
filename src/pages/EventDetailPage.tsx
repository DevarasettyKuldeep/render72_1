import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchEventById } from '../hooks/useEvents'
import type { EventItem } from '../types'
import {
  fmtDate,
  money,
  seatsLeft,
  isEventSaved,
  toggleSaveEvent,
  getRegistrationForEvent,
  downloadCalendarInvite
} from '../utils'
import type { RegistrationData } from '../utils'
import RegistrationModal from '../components/RegistrationModal'

function fmtDeadline(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function InfoCell({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="info-cell">
      <div className="info-label">{label}</div>
      <div className={`info-val${cls ? ' ' + cls : ''}`}>{value}</div>
    </div>
  )
}

function FAQAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <div className="faq-item" key={i}>
          <button
            className="faq-q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            id={`faq-${i}`}
          >
            {item.question}
            <svg
              className={`faq-chevron${open === i ? ' open' : ''}`}
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          {open === i && <div className="faq-a">{item.answer}</div>}
        </div>
      ))}
    </div>
  )
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(() => (id ? isEventSaved(id) : false))
  const [regData, setRegData] = useState<RegistrationData | undefined>(() => (id ? getRegistrationForEvent(id) : undefined))
  const [modalOpen, setModalOpen] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)
  const [copiedToast, setCopiedToast] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true
    fetchEventById(id)
      .then(d => {
        if (!active) return
        setEvent(d)
        setSaved(isEventSaved(d.id))
        setRegData(getRegistrationForEvent(d.id))
      })
      .catch(e => {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Failed to load event.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const handleSavedChange = () => {
      if (id) setSaved(isEventSaved(id))
    }
    const handleRegistered = () => {
      if (id) setRegData(getRegistrationForEvent(id))
    }

    window.addEventListener('gather:saved_changed', handleSavedChange)
    window.addEventListener('gather:registered', handleRegistered)
    return () => {
      active = false
      window.removeEventListener('gather:saved_changed', handleSavedChange)
      window.removeEventListener('gather:registered', handleRegistered)
    }
  }, [id])

  if (loading) {
    return (
      <div className="detail-page">
        <div className="loader">
          <div className="spinner" role="status" aria-label="Loading event details" />
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading event details…</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="detail-page">
        <div style={{ padding: '100px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 42, marginBottom: 16 }}>😕</div>
          <h1 style={{ fontFamily: 'Fraunces,Georgia,serif', color: 'var(--white)', marginBottom: 12 }}>Event not found</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>{error || 'We could not find this event.'}</p>
          <Link to="/events" className="btn-primary">← Back to events</Link>
        </div>
      </div>
    )
  }

  const pct = event.total_seats > 0 ? (event.seats_filled / event.total_seats) * 100 : 0
  const left = seatsLeft(event)
  const isRegistered = !!regData
  const isRegOpen = event.registration_status === 'OPEN' && event.event_status === 'ACTIVE'

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: event.name, text: event.blurb, url })
        return
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url)
    setCopiedToast(true)
    setTimeout(() => setCopiedToast(false), 2400)
  }

  const handleSaveToggle = () => {
    const newState = toggleSaveEvent(event.id)
    setSaved(newState)
  }

  return (
    <main className="detail-page page-enter">
      <title>{event.name} · gather</title>

      {/* ── Toast notification ── */}
      {copiedToast && (
        <div className="toast-notification" role="status" aria-live="polite">
          ✓ Link copied to clipboard!
        </div>
      )}

      {/* ── Hero Image & Floating Controls ── */}
      <div className="detail-hero">
        <img
          src={event.banner_image_url || event.cover_image_url}
          alt={event.banner_image_alt || event.cover_image_alt}
          className="detail-hero-img"
          decoding="async"
          width="1200"
          height="520"
        />
        <div className="detail-hero-overlay" aria-hidden="true" />

        <div className="detail-hero-controls">
          <button
            className="detail-back"
            onClick={() => nav(-1)}
            id="back-btn"
            aria-label="Go back to events list"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className={`detail-action-btn${saved ? ' active' : ''}`}
              onClick={handleSaveToggle}
              aria-label={saved ? 'Remove from saved' : 'Save event'}
              id="detail-save-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'var(--pink)' : 'none'} stroke={saved ? 'var(--pink)' : 'currentColor'} strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              className="detail-action-btn"
              onClick={handleShare}
              aria-label="Share event"
              id="detail-share-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">

        {/* Organizers */}
        {event.organizers && event.organizers.length > 0 && (
          <div className="detail-organizer-chip" aria-label="Organized by">
            <span className="doc-icon">🏛️</span>
            <span>Organized by <strong>{event.organizers[0].name}</strong></span>
            {event.organizers[0].org_type && (
              <span className="org-type-badge">{event.organizers[0].org_type}</span>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="detail-badges">
          <span className={`badge badge-mode-${event.event_mode.toLowerCase()}`}>
            {event.event_mode === 'ONLINE' ? '⬤ Online' : '⬤ Offline'}
          </span>
          <span className="badge badge-type">{event.event_type}</span>
          <span className="badge badge-cat">{event.category}</span>
          {event.is_technical && <span className="badge badge-tech">Technical</span>}
          {event.event_status === 'ACTIVE' && <span className="badge badge-status-active">Active</span>}
          {event.event_status === 'COMPLETED' && <span className="badge badge-status-completed">Completed</span>}
          {event.event_status === 'CLOSED' && <span className="badge badge-status-closed">Closed</span>}
          {event.registration_status === 'SOLD_OUT' && <span className="badge badge-sold-out">Sold Out</span>}
          {event.is_featured && <span className="badge badge-featured">★ Featured</span>}
          {isRegistered && <span className="badge badge-registered">✓ Registered</span>}
        </div>

        {/* Title + Blurb */}
        <h1 className="detail-title">{event.name}</h1>
        <p className="detail-blurb">{event.blurb}</p>

        {/* ── PRIMARY ACTION & TICKET BAR ── */}
        <div className="action-bar-card">
          <div className="abc-left">
            <div className="abc-price">
              <span className="abc-amount">{money(event.price)}</span>
              {event.is_per_head && event.price > 0 && <span className="abc-unit">/ person</span>}
              {!event.is_per_head && event.price > 0 && <span className="abc-unit">/ team</span>}
            </div>
            <div className="abc-deadline">
              {event.registration_deadline ? (
                <>Deadline: <strong>{fmtDeadline(event.registration_deadline)}</strong></>
              ) : (
                <>Seats: <strong>{left} remaining</strong> of {event.total_seats}</>
              )}
            </div>
          </div>

          <div className="abc-actions">
            <button
              className="btn-outline"
              onClick={() => downloadCalendarInvite(event)}
              id="detail-cal-btn"
              title="Add event to your calendar (.ics)"
            >
              📅 Add to Calendar
            </button>

            {isRegistered ? (
              <button
                className="btn-primary"
                onClick={() => setModalOpen(true)}
                id="view-pass-btn"
                style={{ background: 'linear-gradient(135deg, var(--green), #2db560)', borderColor: 'transparent', color: '#05180c' }}
              >
                ✓ View Your Pass
              </button>
            ) : isRegOpen ? (
              <button
                className="btn-primary"
                onClick={() => setModalOpen(true)}
                id="register-btn"
              >
                Register Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>
              </button>
            ) : event.registration_status === 'SOLD_OUT' ? (
              <button className="btn-disabled" disabled>
                Sold Out
              </button>
            ) : (
              <button className="btn-disabled" disabled>
                Registration Closed
              </button>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="info-grid" aria-label="Event key details">
          <InfoCell label="Date & Time" value={`${fmtDate(event.schedule_summary.start_date)} · ${event.schedule_summary.start_time}`} />
          <InfoCell
            label="Entry Fee"
            value={`${money(event.price)}${event.is_per_head && event.price > 0 ? ' / person' : event.price > 0 ? ' / team' : ''}`}
            cls={event.price === 0 ? 'green' : ''}
          />
          <InfoCell
            label="Team Setup"
            value={event.min_teamsize === 1 && event.max_teamsize === 1 ? 'Solo entry' : `${event.min_teamsize}–${event.max_teamsize} members`}
          />
          <InfoCell
            label="Registration Status"
            value={event.registration_status === 'SOLD_OUT' ? 'Sold Out' : event.registration_status.charAt(0) + event.registration_status.slice(1).toLowerCase()}
            cls={event.registration_status === 'SOLD_OUT' ? 'red' : event.registration_status === 'OPEN' ? 'green' : ''}
          />
        </div>

        {/* Seats progress bar */}
        <div className="seats-bar-wrap" aria-label="Seat availability">
          <div className="seats-bar-header">
            <span>{event.seats_filled} / {event.total_seats} seats filled</span>
            <span style={{ fontWeight: 600, color: left <= 10 ? 'var(--amber)' : 'var(--text)' }}>
              {left} seats remaining
            </span>
          </div>
          <div className="seats-bar">
            <div
              className={`seats-bar-fill${pct >= 85 ? ' danger' : ''}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        {/* ── Photo Gallery / Visual Strip ── */}
        {event.gallery_images && event.gallery_images.length > 0 && (
          <div className="detail-section">
            <h2 className="detail-section-title">Event Gallery</h2>
            <div className="detail-gallery-grid">
              {event.gallery_images.map((imgUrl, i) => (
                <div
                  key={i}
                  className="gallery-item"
                  onClick={() => setLightboxImg(imgUrl)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setLightboxImg(imgUrl)}
                  aria-label={`View photo ${i + 1} full size`}
                >
                  <img src={imgUrl} alt={`${event.name} photo ${i + 1}`} loading="lazy" />
                  <div className="gallery-item-overlay">
                    <span>🔍 View</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {(event.description || event.blurb) && (
          <div className="detail-section">
            <h2 className="detail-section-title">About this event</h2>
            <p className="detail-description">{event.description || event.blurb}</p>
          </div>
        )}

        {/* Highlights */}
        {event.highlights && event.highlights.length > 0 && (
          <div className="detail-section">
            <h2 className="detail-section-title">Why attend</h2>
            <ul className="highlights-list">
              {event.highlights.map((h, i) => (
                <li key={i}>
                  <span className="hl-bullet">✦</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What to expect */}
        {event.what_to_expect && event.what_to_expect.length > 0 && (
          <div className="detail-section">
            <h2 className="detail-section-title">What to expect</h2>
            <ul className="highlights-list">
              {event.what_to_expect.map((w, i) => (
                <li key={i}>
                  <span className="hl-bullet">▹</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Eligibility & Prerequisites */}
        {((event.eligibility && event.eligibility.length > 0) || (event.prerequisites && event.prerequisites.length > 0)) && (
          <div className="detail-two-col">
            {event.eligibility && event.eligibility.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">Eligibility</h2>
                <ul className="highlights-list">
                  {event.eligibility.map((el, i) => (
                    <li key={i}>
                      <span className="hl-bullet" style={{ color: 'var(--cyan)' }}>✓</span>
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {event.prerequisites && event.prerequisites.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">Prerequisites</h2>
                <ul className="highlights-list">
                  {event.prerequisites.map((p, i) => (
                    <li key={i}>
                      <span className="hl-bullet" style={{ color: 'var(--amber)' }}>⚙</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Rules */}
        {event.rules && event.rules.length > 0 && (
          <div className="detail-section">
            <h2 className="detail-section-title">Rules &amp; Guidelines</h2>
            <ol className="rules-list">
              {event.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          </div>
        )}

        {/* Prizes */}
        {event.prizes && event.prizes.length > 0 && (
          <div className="detail-section">
            <h2 className="detail-section-title">Prizes &amp; Awards</h2>
            <div className="prizes-grid">
              {event.prizes.map((p, i) => {
                const rankNum = Number(p.rank)
                const medal = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : '🎖️'
                const displayTitle = p.title || p.label || `Rank ${p.rank}`
                const displayVal = p.amount ? `₹${p.amount.toLocaleString('en-IN')}` : p.value || ''

                return (
                  <div className="prize-card" key={i}>
                    <div className="prize-rank-row">
                      <span className="prize-medal">{medal}</span>
                      <span className="prize-rank">Rank {p.rank}</span>
                    </div>
                    <div className="prize-label">{displayTitle}</div>
                    {displayVal && <div className="prize-value">{displayVal}</div>}
                    {p.description && <div className="prize-desc">{p.description}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Schedule / Timeline */}
        {event.schedules && event.schedules.length > 0 && (
          <div className="detail-section" id="timeline">
            <h2 className="detail-section-title">Event Schedule</h2>
            <div className="timeline">
              {event.schedules.map((s, i) => {
                const schedDate = s.event_date || s.date || event.schedule_summary.start_date
                const schedTitle = s.title || (s.venue ? `Session at ${s.venue}` : `Session ${i + 1}`)

                return (
                  <div className="timeline-item" key={s.id || i}>
                    <div className="timeline-left">
                      <div className="timeline-time">{s.start_time}</div>
                      <div className="timeline-dot" />
                      {i < (event.schedules!.length - 1) && <div className="timeline-connector" />}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">{schedTitle}</div>
                      <div className="timeline-meta-row">
                        <span>🗓 {fmtDate(schedDate)}</span>
                        <span>⏱ {s.start_time} – {s.end_time}</span>
                      </div>
                      {s.description && <div className="timeline-desc">{s.description}</div>}
                      {s.venue && <div className="timeline-venue">📍 {s.venue}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="detail-section">
            <h2 className="detail-section-title">Related Topics</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {event.tags.map(t => (
                <Link
                  key={t}
                  to={`/events?q=${encodeURIComponent(t)}`}
                  className="tag"
                  style={{ fontSize: 13, padding: '7px 14px' }}
                  title={`Search for events with tag: ${t}`}
                >
                  #{t}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Coordinators */}
        {event.coordinators && event.coordinators.length > 0 && (
          <div className="detail-section">
            <h2 className="detail-section-title">Event Coordinators</h2>
            <div className="coords-grid">
              {event.coordinators.map(c => {
                const contactStr = c.contact || c.email || c.phone || ''
                const isEmail = contactStr.includes('@')

                return (
                  <div className="coord-card" key={c.id}>
                    <div>
                      <div className="coord-name">{c.name}</div>
                      <div className="coord-role">{c.role}</div>
                    </div>
                    <div className="coord-contacts">
                      {contactStr && (
                        isEmail ? (
                          <a href={`mailto:${contactStr}`} className="coord-link">
                            ✉ {contactStr}
                          </a>
                        ) : (
                          <a href={`tel:${contactStr}`} className="coord-link">
                            📞 {contactStr}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FAQs */}
        {event.faqs && event.faqs.length > 0 && (
          <div className="detail-section">
            <h2 className="detail-section-title">Frequently Asked Questions</h2>
            <FAQAccordion items={event.faqs} />
          </div>
        )}

        {/* Back CTA */}
        <div style={{ textAlign: 'center', marginTop: 60, paddingBottom: 40 }}>
          <Link to="/events" className="btn-outline" id="back-to-events-btn">
            ← Browse all events
          </Link>
        </div>
      </div>

      {/* ── Registration & Pass Modal ── */}
      <RegistrationModal
        event={event}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        existingReg={regData}
      />

      {/* ── Photo Lightbox ── */}
      {lightboxImg && (
        <div
          className="lightbox-backdrop"
          onClick={() => setLightboxImg(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Full size photo preview"
        >
          <div className="lightbox-content">
            <button
              className="lightbox-close"
              onClick={() => setLightboxImg(null)}
              aria-label="Close photo preview"
            >
              ✕
            </button>
            <img src={lightboxImg} alt="Full view" className="lightbox-img" />
          </div>
        </div>
      )}
    </main>
  )
}
