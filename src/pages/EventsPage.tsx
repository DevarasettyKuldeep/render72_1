import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import EventCard from '../components/EventCard'
import { getSavedEventIds } from '../utils'

const STATUS_FILTERS = ['All', 'ACTIVE', 'COMPLETED', 'CLOSED'] as const
const MODE_FILTERS   = ['All', 'ONLINE', 'OFFLINE'] as const
const TYPE_FILTERS   = ['All', 'EVENT', 'WORKSHOP'] as const
type PriceFilter     = 'All' | 'FREE' | 'PAID'
type SortOption      = 'date' | 'seats' | 'price-asc' | 'price-desc' | 'name'

export default function EventsPage() {
  const { events, loading, error, reload } = useEvents()
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery]         = useState(() => searchParams.get('q') || searchParams.get('search') || '')
  const [status, setStatus]       = useState<string>('All')
  const [mode, setMode]           = useState<string>('All')
  const [type, setType]           = useState<string>('All')
  const [cat, setCat]             = useState<string>(() => searchParams.get('cat') || 'All')
  const [priceFilter, setPrice]   = useState<PriceFilter>('All')
  const [techOnly, setTechOnly]   = useState(false)
  const [savedOnly, setSavedOnly] = useState(() => searchParams.get('filter') === 'saved' || searchParams.get('saved') === 'true')
  const [sort, setSort]           = useState<SortOption>('date')
  const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid')
  const [savedIds, setSavedIds]   = useState<string[]>(() => getSavedEventIds())

  /* Listen to saved changes */
  useEffect(() => {
    const handleSavedChange = () => setSavedIds(getSavedEventIds())
    window.addEventListener('gather:saved_changed', handleSavedChange)
    return () => window.removeEventListener('gather:saved_changed', handleSavedChange)
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(events.map(e => e.category)))],
    [events]
  )

  const filtered = useMemo(() => {
    return events.filter(e => {
      const q = query.trim().toLowerCase()
      const matchQ = !q || `${e.name} ${e.blurb} ${e.category} ${e.tags.join(' ')}`.toLowerCase().includes(q)
      const matchS = status === 'All' || e.event_status === status
      const matchM = mode   === 'All' || e.event_mode   === mode
      const matchT = type   === 'All' || e.event_type   === type
      const matchC = cat    === 'All' || e.category     === cat
      const matchP = priceFilter === 'All' || (priceFilter === 'FREE' ? e.price === 0 : e.price > 0)
      const matchTech = !techOnly || e.is_technical
      const matchSaved = !savedOnly || savedIds.includes(e.id)

      return matchQ && matchS && matchM && matchT && matchC && matchP && matchTech && matchSaved
    })
  }, [events, query, status, mode, type, cat, priceFilter, techOnly, savedOnly, savedIds])

  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sort) {
      case 'date':
        return list.sort((a, b) => new Date(a.schedule_summary.start_date).getTime() - new Date(b.schedule_summary.start_date).getTime())
      case 'seats':
        return list.sort((a, b) => (b.total_seats - b.seats_filled) - (a.total_seats - a.seats_filled))
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price)
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return list
    }
  }, [filtered, sort])

  const clearFilters = () => {
    setQuery('')
    setStatus('All')
    setMode('All')
    setType('All')
    setCat('All')
    setPrice('All')
    setTechOnly(false)
    setSavedOnly(false)
    setSearchParams({}, { replace: true })
  }

  const hasFilters = query || status !== 'All' || mode !== 'All' || type !== 'All' || cat !== 'All' || priceFilter !== 'All' || techOnly || savedOnly

  return (
    <main className="events-page page-enter">
      <title>Events · gather</title>

      {/* ── Page header ── */}
      <header className="events-page-header">
        <div className="events-page-bg" aria-hidden="true" />
        <div className="events-page-grid" aria-hidden="true" />
        <div className="shell events-page-header-inner">
          <div className="section-eyebrow">Campus Discoveries</div>
          <h1 className="events-hero-title">
            Everything<br />
            <em className="shiny-text">happening.</em>
          </h1>
          <p className="events-hero-sub">Browse, filter, and discover {events.length} campus events across tech, culture, and arts.</p>
        </div>
      </header>

      <div className="shell" style={{ paddingBottom: 100 }}>

        {/* ── Search Bar & Main Controls ── */}
        <div className="events-controls">
          <label className="search-wrap" htmlFor="events-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              id="events-search"
              type="search"
              className="search-input"
              placeholder="Search by event title, category, tags, keywords…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search events"
            />
            {query && (
              <button
                className="search-clear-btn"
                onClick={() => setQuery('')}
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`view-mode-btn${viewMode === 'grid' ? ' active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              title="Grid view"
            >
              ⊞
            </button>
            <button
              className={`view-mode-btn${viewMode === 'list' ? ' active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="Compact list view"
              title="Compact list view"
            >
              ☰
            </button>
            <button
              className="reload-btn"
              onClick={reload}
              disabled={loading}
              aria-label="Reload events from API"
              id="reload-events-btn"
              title="Reload events from API"
            >
              ↻
            </button>
          </div>
        </div>

        {/* ── Filter Sections ── */}
        <div className="filters-container">

          {/* Category Chips Scroll */}
          <div className="filters-wrap" role="group" aria-label="Filter by category">
            {categories.map(c => (
              <button
                key={c}
                className={`filter-chip${cat === c ? ' active' : ''}`}
                onClick={() => setCat(c)}
                id={`filter-cat-${c.replace(/[\s&/]+/g, '-').toLowerCase()}`}
                aria-pressed={cat === c}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Secondary Filter Row: Status, Mode, Type, Price, Tech, Bookmarks, and Sort */}
          <div className="secondary-filters-bar">
            {/* Status */}
            <div className="filter-group">
              <span className="filter-group-label">Status</span>
              <div className="filters-wrap" role="group">
                {STATUS_FILTERS.map(s => (
                  <button
                    key={s}
                    className={`filter-chip filter-chip-sm${status === s ? ' active' : ''}`}
                    onClick={() => setStatus(s)}
                    aria-pressed={status === s}
                  >
                    {s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div className="filter-group">
              <span className="filter-group-label">Mode</span>
              <div className="filters-wrap" role="group">
                {MODE_FILTERS.map(m => (
                  <button
                    key={m}
                    className={`filter-chip filter-chip-sm${mode === m ? ' active' : ''}`}
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                  >
                    {m === 'All' ? 'All' : m.charAt(0) + m.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="filter-group">
              <span className="filter-group-label">Type</span>
              <div className="filters-wrap" role="group">
                {TYPE_FILTERS.map(t => (
                  <button
                    key={t}
                    className={`filter-chip filter-chip-sm${type === t ? ' active' : ''}`}
                    onClick={() => setType(t)}
                    aria-pressed={type === t}
                  >
                    {t === 'All' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-group">
              <span className="filter-group-label">Fee</span>
              <div className="filters-wrap" role="group">
                {(['All', 'FREE', 'PAID'] as PriceFilter[]).map(p => (
                  <button
                    key={p}
                    className={`filter-chip filter-chip-sm${priceFilter === p ? ' active' : ''}`}
                    onClick={() => setPrice(p)}
                    aria-pressed={priceFilter === p}
                  >
                    {p === 'All' ? 'All' : p === 'FREE' ? 'Free' : 'Paid'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick toggles */}
            <div className="filter-group" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className={`filter-chip filter-chip-sm${techOnly ? ' active' : ''}`}
                onClick={() => setTechOnly(!techOnly)}
                aria-pressed={techOnly}
              >
                ⚡ Technical Only
              </button>

              <button
                className={`filter-chip filter-chip-sm${savedOnly ? ' active' : ''}`}
                onClick={() => setSavedOnly(!savedOnly)}
                aria-pressed={savedOnly}
              >
                ♥ Saved ({savedIds.length})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="filter-group sort-group">
              <label htmlFor="sort-select" className="filter-group-label">Sort by</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
              >
                <option value="date">Date: Upcoming first</option>
                <option value="seats">Seats: Most remaining</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Results count & Clear All ── */}
        {!loading && !error && (
          <div className="results-count-bar">
            <div>
              Showing <strong>{sorted.length}</strong> of <strong>{events.length}</strong> events
              {savedOnly && <span> · Filtered by bookmarked</span>}
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="clear-all-btn"
                id="clear-filters-btn"
              >
                Reset all filters ×
              </button>
            )}
          </div>
        )}

        {/* ── Events Grid / List View ── */}
        {error ? (
          <div className="state-box">
            <div className="state-icon">⚠️</div>
            <div className="state-title">Couldn't reach event service</div>
            <p className="state-msg">{error}</p>
            <p className="state-sub">Check your connection or click retry to reload the data.</p>
            <button className="state-btn" onClick={reload}>Try again</button>
          </div>
        ) : loading ? (
          <div className={viewMode === 'list' ? 'events-list-wrap' : 'events-grid'}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
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
        ) : sorted.length === 0 ? (
          <div className="state-box">
            <div className="state-icon">🔍</div>
            <div className="state-title">No matching events found</div>
            <p className="state-msg">
              {savedOnly
                ? "You haven't bookmarked any events yet. Click the heart icon on any card to save it!"
                : "No events match your current combination of filters and search term."}
            </p>
            <button className="state-btn" onClick={clearFilters}>Clear all filters</button>
          </div>
        ) : (
          <div
            className={viewMode === 'list' ? 'events-list-wrap' : 'events-grid'}
            aria-label="Events list"
          >
            {sorted.map(e => (
              <EventCard key={e.id} event={e} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
