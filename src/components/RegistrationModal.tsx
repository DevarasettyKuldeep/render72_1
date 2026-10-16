import { useState } from 'react'
import type { EventItem } from '../types'
import { saveRegistration, money, downloadCalendarInvite } from '../utils'
import type { RegistrationData } from '../utils'

interface Props {
  event: EventItem
  isOpen: boolean
  onClose: () => void
  existingReg?: RegistrationData
}

export default function RegistrationModal({ event, isOpen, onClose, existingReg }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roll, setRoll] = useState('')
  const [teamName, setTeamName] = useState('')
  const [confirmedPass, setConfirmedPass] = useState<RegistrationData | null>(existingReg || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const isTeam = event.max_teamsize > 1

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setIsSubmitting(true)

    setTimeout(() => {
      const code = 'GTR-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      const reg: RegistrationData = {
        eventId: event.id,
        eventName: event.name,
        attendeeName: name.trim(),
        email: email.trim(),
        rollNumber: roll.trim(),
        teamName: isTeam ? teamName.trim() : undefined,
        ticketCode: code,
        registeredAt: new Date().toISOString()
      }
      saveRegistration(reg)
      setConfirmedPass(reg)
      setIsSubmitting(false)
    }, 600)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close registration dialog">
          ✕
        </button>

        {confirmedPass ? (
          /* ── PASS CONFIRMATION VIEW ── */
          <div className="pass-view">
            <div className="pass-status-badge">✓ Registration Confirmed</div>
            <h2 id="modal-title" className="pass-event-title">{event.name}</h2>
            <p className="pass-event-sub">Your pass has been generated and saved locally.</p>

            <div className="digital-ticket">
              <div className="ticket-header">
                <div>
                  <span className="ticket-brand">gather · pass</span>
                  <div className="ticket-id">{confirmedPass.ticketCode}</div>
                </div>
                <div className="ticket-badge">{event.event_mode}</div>
              </div>

              <div className="ticket-body">
                <div className="ticket-field">
                  <span className="tf-label">Attendee</span>
                  <span className="tf-value">{confirmedPass.attendeeName}</span>
                </div>
                {confirmedPass.teamName && (
                  <div className="ticket-field">
                    <span className="tf-label">Team</span>
                    <span className="tf-value">{confirmedPass.teamName}</span>
                  </div>
                )}
                <div className="ticket-field">
                  <span className="tf-label">Date & Time</span>
                  <span className="tf-value">
                    {event.schedule_summary.start_date} · {event.schedule_summary.start_time}
                  </span>
                </div>
                <div className="ticket-field">
                  <span className="tf-label">Entry</span>
                  <span className="tf-value">{money(event.price)}</span>
                </div>
              </div>

              <div className="ticket-footer">
                <div className="ticket-qr" aria-label="Ticket QR code">
                  <svg viewBox="0 0 100 100" width="70" height="70" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" rx="4" />
                    <rect x="5" y="5" width="20" height="20" fill="var(--surface)" />
                    <rect x="9" y="9" width="12" height="12" />
                    <rect x="70" y="0" width="30" height="30" rx="4" />
                    <rect x="75" y="5" width="20" height="20" fill="var(--surface)" />
                    <rect x="79" y="9" width="12" height="12" />
                    <rect x="0" y="70" width="30" height="30" rx="4" />
                    <rect x="5" y="75" width="20" height="20" fill="var(--surface)" />
                    <rect x="9" y="79" width="12" height="12" />
                    <rect x="40" y="10" width="10" height="20" />
                    <rect x="40" y="40" width="20" height="20" />
                    <rect x="70" y="40" width="20" height="10" />
                    <rect x="10" y="40" width="20" height="10" />
                    <rect x="40" y="70" width="15" height="20" />
                    <rect x="65" y="70" width="25" height="10" />
                    <rect x="80" y="85" width="10" height="10" />
                  </svg>
                </div>
                <div className="ticket-venue-info">
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>VENUE</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {event.schedules?.[0]?.venue || (event.event_mode === 'ONLINE' ? 'Virtual Contest Arena' : 'Campus Venue')}
                  </div>
                </div>
              </div>
            </div>

            <div className="pass-actions">
              <button
                className="btn-primary"
                onClick={() => downloadCalendarInvite(event)}
                id="btn-add-cal"
              >
                📅 Add to Calendar (.ics)
              </button>
              <button
                className="btn-outline"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── REGISTRATION FORM VIEW ── */
          <form className="reg-form" onSubmit={handleSubmit}>
            <div className="reg-eyebrow">Event Registration</div>
            <h2 id="modal-title" className="reg-title">{event.name}</h2>
            <p className="reg-sub">
              {money(event.price)} {event.is_per_head && event.price > 0 ? '/ person' : ''} · {event.min_teamsize === 1 && event.max_teamsize === 1 ? 'Solo entry' : `Team of ${event.min_teamsize}–${event.max_teamsize}`}
            </p>

            <div className="form-group">
              <label htmlFor="reg-name">Full Name *</label>
              <input
                id="reg-name"
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">College Email ID *</label>
              <input
                id="reg-email"
                type="email"
                required
                placeholder="jane.doe@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-roll">Roll Number / Student ID (Optional)</label>
              <input
                id="reg-roll"
                type="text"
                placeholder="2024CS0142"
                value={roll}
                onChange={e => setRoll(e.target.value)}
              />
            </div>

            {isTeam && (
              <div className="form-group">
                <label htmlFor="reg-team">Team Name *</label>
                <input
                  id="reg-team"
                  type="text"
                  required
                  placeholder="The Algorithmics"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                />
              </div>
            )}

            <div className="reg-note">
              🔒 Instant local pass issuance. No spam, spam-folder OTPs, or rate limits.
            </div>

            <div className="modal-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                id="btn-confirm-reg"
                style={{ width: '100%' }}
              >
                {isSubmitting ? 'Confirming seat…' : `Confirm Registration · ${money(event.price)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
