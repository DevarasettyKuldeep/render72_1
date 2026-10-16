/** Shared hook – fetch all events once and cache in module scope */
import { useState, useEffect } from 'react'
import { API_BASE } from '../constants'
import type {
  EventItem,
  ScheduleSummary,
  Schedule,
  Coordinator,
  Organizer,
  Prize,
  FAQ
} from '../types'

export type {
  EventItem,
  ScheduleSummary,
  Schedule,
  Coordinator,
  Organizer,
  Prize,
  FAQ
}

let _cache: EventItem[] | null = null
let _promise: Promise<EventItem[]> | null = null

async function fetchAllEvents(): Promise<EventItem[]> {
  if (_cache) return _cache
  if (!_promise) {
    _promise = fetch(API_BASE)
      .then(r => {
        if (!r.ok) throw new Error('Could not reach the event service.')
        return r.json()
      })
      .then(d => {
        if (!Array.isArray(d.events)) throw new Error('Unexpected API format.')
        _cache = d.events as EventItem[]
        return _cache
      })
      .catch(e => { _promise = null; throw e })
  }
  return _promise
}

export function useEvents() {
  const [events, setEvents] = useState<EventItem[]>(_cache ?? [])
  const [loading, setLoading] = useState(!_cache)
  const [error, setError] = useState('')

  const reload = async () => {
    setLoading(true)
    setError('')
    _cache = null
    _promise = null
    try {
      const data = await fetchAllEvents()
      setEvents(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (_cache) return
    fetchAllEvents()
      .then(d => { setEvents(d); setLoading(false) })
      .catch(e => { setError(e instanceof Error ? e.message : 'Failed to load events.'); setLoading(false) })
  }, [])

  return { events, loading, error, reload }
}

export async function fetchEventById(id: string): Promise<EventItem> {
  const r = await fetch(`${API_BASE}/${id}`)
  if (!r.ok) throw new Error('Event not found.')
  const d = await r.json()
  if (!d.event) throw new Error('Unexpected API format.')
  return d.event as EventItem
}
