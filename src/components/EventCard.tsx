import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { EventItem } from '../types'
import { fmtDate, money, seatsLeft, isEventSaved, toggleSaveEvent, getRegistrationForEvent } from '../utils'

interface Props {
  event: EventItem
  viewMode?: 'grid' | 'list'
}

export default function EventCard({ event, viewMode = 'grid' }: Props) {
  const nav = useNavigate()
  const [saved, setSaved] = useState(() => isEventSaved(event.id))
  const [isRegistered, setIsRegistered] = useState(() => !!getRegistrationForEvent(event.id))

  useEffect(() => {
    const handleSavedChange = () => setSaved(isEventSaved(event.id))
    const handleRegChange = () => setIsRegistered(!!getRegistrationForEvent(event.id))

    window.addEventListener('gather:saved_changed', handleSavedChange)
    window.addEventListener('gather:registered', handleRegChange)
    return () => {
      window.removeEventListener('gather:saved_changed', handleSavedChange)
      window.removeEventListener('gather:registered', handleRegChange)
    }
  }, [event.id])

  const pct = event.total_seats > 0 ? (event.seats_filled / event.total_seats) * 100 : 0

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nowSaved = toggleSaveEvent(event.id)
    setSaved(nowSaved)
  }

  return (
    <article
      className={`ev-card ${viewMode === 'list' ? 'ev-card-list' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${event.name}`}
      onClick={() => nav(`/events/${event.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && nav(`/events/${event.id}`)}
      id={`event-card-${event.id}`}
    >
      <div className="ev-card-img">
        <img
          src={event.cover_image_url}
          alt={event.cover_image_alt}
          loading="lazy"
          decoding="async"
          width="400"
          height="225"
        />
        <div className="ev-card-badges">
          {event.event_mode === 'ONLINE'
            ? <span className="badge badge-mode-online">⬤ Online</span>
            : <span className="badge badge-mode-offline">⬤ Offline</span>}
          {event.event_status === 'ACTIVE' && <span className="badge badge-status-active">Active</span>}
          {event.event_status === 'COMPLETED' && <span className="badge badge-status-completed">Completed</span>}
          {event.event_status === 'CLOSED' && <span className="badge badge-status-closed">Closed</span>}
          {event.registration_status === 'SOLD_OUT' && <span className="badge badge-sold-out">Sold Out</span>}
          {event.is_featured && <span className="badge badge-featured">★ Featured</span>}
          {isRegistered && <span className="badge badge-registered">✓ Registered</span>}
        </div>

        <button
          className={`card-save-btn${saved ? ' active' : ''}`}
          onClick={handleSaveClick}
          aria-label={saved ? 'Remove bookmark' : 'Bookmark event'}
          title={saved ? 'Remove bookmark' : 'Bookmark event'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'var(--pink)' : 'none'} stroke={saved ? 'var(--pink)' : 'currentColor'} strokeWidth="2.2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      <div className="ev-card-body">
        <div className="ev-card-header-row">
          <span className="ev-card-cat">{event.category} · {event.event_type}</span>
          <span className="ev-card-date-pill">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {fmtDate(event.schedule_summary.start_date)}
          </span>
        </div>

        <div className="ev-card-name">{event.name}</div>
        <div className="ev-card-blurb">{event.blurb}</div>

        <div className="ev-card-tags">
          {event.tags.slice(0, 3).map(t => <span key={t} className="tag">#{t}</span>)}
        </div>

        <div className="ev-card-footer">
          <div className={`ev-card-price${event.price === 0 ? ' free' : ''}`}>
            {money(event.price)}{event.is_per_head && event.price > 0 ? ' / person' : ''}
          </div>
          <div className="ev-card-seats">
            {event.registration_status === 'SOLD_OUT'
              ? <span style={{ color: 'var(--red)', fontWeight: 600 }}>Sold out</span>
              : `${seatsLeft(event)} seats left`}
          </div>
        </div>

        <div className="seats-bar" style={{ marginTop: 10 }}>
          <div
            className={`seats-bar-fill${pct >= 85 ? ' danger' : ''}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </article>
  )
}
