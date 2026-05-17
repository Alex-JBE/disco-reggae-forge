'use client'

import { useState, useEffect, useRef } from 'react'
import { GENRES, GENRE_ORDER } from '@/data/genres'
import type { BranchPanelProps, BranchState, GenreId, SubgenreId } from '@/data/genres'

function initStateFromProps(props: BranchPanelProps): BranchState {
  const genre: GenreId =
    props.defaultGenre !== undefined && GENRE_ORDER.includes(props.defaultGenre)
      ? props.defaultGenre
      : 'hybrid'
  const subgenre: SubgenreId =
    props.defaultSubgenre !== undefined &&
    GENRES[genre].subgenres.some((s) => s.id === props.defaultSubgenre)
      ? props.defaultSubgenre
      : GENRES[genre].subgenres[0].id
  return { activeGenre: genre, activeSubgenre: subgenre }
}

function persist(s: BranchState): void {
  try {
    localStorage.setItem('drf.branch', JSON.stringify({ genre: s.activeGenre, subgenre: s.activeSubgenre }))
  } catch {}
}

export default function BranchPanel(props: BranchPanelProps) {
  const { disabled = false } = props
  const [state, setState] = useState<BranchState>(() => initStateFromProps(props))
  const { activeGenre, activeSubgenre } = state
  const [hoveredGenre, setHoveredGenre] = useState<GenreId | null>(null)
  const [hoveredSubgenre, setHoveredSubgenre] = useState<SubgenreId | null>(null)
  const genreRefs = useRef<Array<HTMLButtonElement | null>>([])
  const subgenreRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('drf.branch')
      if (!raw) return
      const parsed = JSON.parse(raw) as { genre: unknown; subgenre: unknown }
      const genreValid = GENRE_ORDER.includes(parsed.genre as GenreId)
      const subgenreValid =
        genreValid && GENRES[parsed.genre as GenreId].subgenres.some((s) => s.id === parsed.subgenre)
      if (!genreValid || !subgenreValid) {
        localStorage.removeItem('drf.branch')
        return
      }
      const storedGenre = parsed.genre as GenreId
      const storedSubgenre = parsed.subgenre as SubgenreId
      if (storedGenre !== state.activeGenre || storedSubgenre !== state.activeSubgenre) {
        const next: BranchState = { activeGenre: storedGenre, activeSubgenre: storedSubgenre }
        setState(next)
        props.onChange({ genre: storedGenre, subgenre: storedSubgenre })
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleGenreClick(genreId: GenreId): void {
    if (disabled || genreId === activeGenre) return
    const newSubgenre = GENRES[genreId].subgenres[0].id
    const next: BranchState = { activeGenre: genreId, activeSubgenre: newSubgenre }
    setState(next)
    persist(next)
    props.onChange({ genre: genreId, subgenre: newSubgenre })
  }

  function handleSubgenreClick(subgenreId: SubgenreId): void {
    if (disabled || subgenreId === activeSubgenre) return
    const next: BranchState = { activeGenre, activeSubgenre: subgenreId }
    setState(next)
    persist(next)
    props.onChange({ genre: activeGenre, subgenre: subgenreId })
  }

  function navigateGenre(currentIndex: number, delta: number): void {
    if (disabled) return
    const next = (currentIndex + delta + GENRE_ORDER.length) % GENRE_ORDER.length
    handleGenreClick(GENRE_ORDER[next])
    genreRefs.current[next]?.focus()
  }

  function navigateSubgenre(currentIndex: number, delta: number): void {
    if (disabled) return
    const subs = GENRES[activeGenre].subgenres
    const next = (currentIndex + delta + subs.length) % subs.length
    handleSubgenreClick(subs[next].id)
    subgenreRefs.current[next]?.focus()
  }

  const activeGenreData = GENRES[activeGenre]

  return (
    <section aria-label="Branch" style={{ padding: '12px 14px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '10px', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>BRANCH</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>Your musical DNA</span>
      </div>

      {/* Genre row */}
      <div role="radiogroup" aria-label="Genre" style={{ display: 'flex', gap: '4px', height: '36px' }}>
        {GENRE_ORDER.map((genreId, i) => {
          const genre = GENRES[genreId]
          const isSelected = genreId === activeGenre
          const accentBg =
            genre.accentColor === 'gradient-hybrid'
              ? 'linear-gradient(90deg, #4ADE80 0%, #FBBF24 100%)'
              : genre.accentColor
          return (
            <button
              key={genreId}
              ref={(el) => { genreRefs.current[i] = el }}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${genre.label} genre`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleGenreClick(genreId)}
              onMouseEnter={() => !disabled && setHoveredGenre(genreId)}
              onMouseLeave={() => setHoveredGenre(null)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); navigateGenre(i, +1) }
                else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); navigateGenre(i, -1) }
              }}
              style={{
                position: 'relative', flex: '1 1 0', minWidth: '44px', height: '36px',
                fontSize: '12px', fontWeight: 500, letterSpacing: '0.02em',
                borderRadius: '4px', padding: '0 8px', border: 'none',
                background: isSelected
                  ? 'rgba(255,255,255,0.10)'
                  : hoveredGenre === genreId
                  ? 'rgba(255,255,255,0.05)'
                  : 'transparent',
                color: isSelected || hoveredGenre === genreId ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'background-color 100ms ease, color 100ms ease',
                overflow: 'hidden',
              }}
            >
              {genre.label}
              {isSelected && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '2px', background: accentBg, borderRadius: '0 0 2px 2px',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Subgenre row */}
      <div role="radiogroup" aria-label="Subgenre" aria-live="polite" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
        {activeGenreData.subgenres.map((sub, i) => {
          const isSelected = sub.id === activeSubgenre
          return (
            <div key={sub.id} style={{ position: 'relative' }}>
              <button
                ref={(el) => { subgenreRefs.current[i] = el }}
                role="radio"
                aria-checked={isSelected}
                aria-describedby={`${sub.id}-tip`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleSubgenreClick(sub.id)}
                onMouseEnter={() => !disabled && setHoveredSubgenre(sub.id)}
                onMouseLeave={() => setHoveredSubgenre(null)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); navigateSubgenre(i, +1) }
                  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); navigateSubgenre(i, -1) }
                }}
                style={{
                  height: '28px', padding: '4px 10px', fontSize: '11px', fontWeight: 400,
                  borderRadius: '4px',
                  border: isSelected ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: 'nowrap',
                  transition: 'background-color 100ms ease, color 100ms ease, border-color 100ms ease',
                }}
              >
                {sub.label}
              </button>
              <span
                id={`${sub.id}-tip`}
                role="tooltip"
                style={{
                  display: hoveredSubgenre === sub.id ? 'block' : 'none',
                  position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
                  transform: 'translateX(-50%)', width: 'max-content', maxWidth: '220px',
                  fontSize: '11px', lineHeight: 1.4, color: '#D1D5DB', background: '#1F2937',
                  border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px',
                  padding: '6px 10px', whiteSpace: 'normal', zIndex: 100, pointerEvents: 'none',
                }}
              >
                {sub.tooltip}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
