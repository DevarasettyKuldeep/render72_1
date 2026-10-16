// Utility helpers shared across components
import type { EventItem } from './types'

export function fmtDate(iso: string) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(
    new Date(`${iso}T12:00:00`)
  )
}

export function fmtFullDate(iso: string) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${iso}T12:00:00`)
  )
}

export function fmtDay(iso: string) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric' }).format(new Date(`${iso}T12:00:00`))
}

export function fmtMon(iso: string) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(`${iso}T12:00:00`))
}

export function money(n: number) {
  return n === 0 ? 'Free' : `₹${n.toLocaleString('en-IN')}`
}

export function seatsLeft(e: EventItem) {
  return Math.max(e.total_seats - e.seats_filled, 0)
}

/* LocalStorage Saved/Bookmarked Events */
const SAVED_KEY = 'gather_saved_events'

export function getSavedEventIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function isEventSaved(id: string): boolean {
  return getSavedEventIds().includes(id)
}

export function toggleSaveEvent(id: string): boolean {
  try {
    const ids = getSavedEventIds()
    let updated: string[]
    let nowSaved = false
    if (ids.includes(id)) {
      updated = ids.filter(x => x !== id)
      nowSaved = false
    } else {
      updated = [...ids, id]
      nowSaved = true
    }
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('gather:saved_changed', { detail: { ids: updated } }))
    return nowSaved
  } catch {
    return false
  }
}

/* LocalStorage Registrations */
export interface RegistrationData {
  eventId: string
  eventName: string
  attendeeName: string
  email: string
  rollNumber?: string
  teamName?: string
  ticketCode: string
  registeredAt: string
}

const REG_KEY = 'gather_registrations'

export function getRegistrations(): RegistrationData[] {
  try {
    const raw = localStorage.getItem(REG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getRegistrationForEvent(eventId: string): RegistrationData | undefined {
  return getRegistrations().find(r => r.eventId === eventId)
}

export function saveRegistration(reg: RegistrationData) {
  try {
    const list = getRegistrations().filter(r => r.eventId !== reg.eventId)
    list.push(reg)
    localStorage.setItem(REG_KEY, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('gather:registered', { detail: reg }))
  } catch (err) {
    console.error('Failed to save registration:', err)
  }
}

/* Add to Calendar (.ics file generation) */
export function downloadCalendarInvite(event: EventItem) {
  const startDateStr = (event.schedule_summary?.start_date || '').replace(/-/g, '')
  const startTimeStr = (event.schedule_summary?.start_time || '09:00').replace(/:/g, '') + '00'
  const endDateStr = (event.schedule_summary?.end_date || event.schedule_summary?.start_date || '').replace(/-/g, '')
  const endTimeStr = (event.schedule_summary?.end_time || event.schedule_summary?.start_time || '17:00').replace(/:/g, '') + '00'

  const venue = event.schedules?.[0]?.venue || (event.event_mode === 'ONLINE' ? 'Online / Virtual' : 'Campus Venue')

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//gather//Campus Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@gather.campus`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startDateStr}T${startTimeStr}`,
    `DTEND:${endDateStr}T${endTimeStr}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${(event.blurb || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${venue}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
