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

function getAccentColor(accentColor: string): string {
  return accentColor === 'gradient-hybrid' ? '#4ADE80' : accentColor
}

function getActiveBg(accentColor: string): string {
  const c = accentColor
  if (c === 'gradient-hybrid' || c === '#4ADE80') return '#0D2218'
  if (c === '#FBBF24') return '#1A1508'
  if (c === '#F97316') return '#1A1208'
  if (c === '#EC4899') return '#1A0812'
  if (c === '#A78BFA') return '#110F1A'
  return '#0E1610'
}

export default function BranchPanel(props: BranchPanelProps) {
  const { disabled = false } = props
  const [state, setState] = useState<BranchState>(() => initStateFromProps(props))
  const { activeGenre, activeSubgenre } = state
  const [openDropdown, setOpenDropdown] = useState<GenreId | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('drf.branch')
      if (!raw) return
      const parsed = JSON.parse(raw) as { genre: unknown; subgenre: unknown }
      const genreValid = GENRE_ORDER.includes(parsed.genre as GenreId)
      const subgenreValid =
        genreValid && GENRES[parsed.genre as GenreId].subgenres.some((s) => s.id === parsed.subgenre)
      if (!genreValid || !subgenreValid) { localStorage.removeItem('drf.branch'); return }
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectGenre(genreId: GenreId): void {
    if (disabled) return
    setOpenDropdown(null)
    if (genreId === activeGenre) return
    const newSubgenre = GENRES[genreId].subgenres[0].id
    const next: BranchState = { activeGenre: genreId, activeSubgenre: newSubgenre }
    setState(next)
    persist(next)
    props.onChange({ genre: genreId, subgenre: newSubgenre })
  }

  function selectSubgenre(genreId: GenreId, subgenreId: SubgenreId): void {
    if (disabled) return
    setOpenDropdown(null)
    const next: BranchState = { activeGenre: genreId, activeSubgenre: subgenreId }
    setState(next)
    persist(next)
    props.onChange({ genre: genreId, subgenre: subgenreId })
  }

  const activeGenreData = GENRES[activeGenre]
  const activeSubgenreData = activeGenreData.subgenres.find((s) => s.id === activeSubgenre)!
  const accentActive = getAccentColor(activeGenreData.accentColor)
  const bgActive = getActiveBg(activeGenreData.accentColor)

  return (
    <section ref={containerRef} style={{ padding: '12px 14px 4px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{
          fontSize: '10px', letterSpacing: '0.12em', color: 'var(--gold-dim)',
          textTransform: 'uppercase' as const, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
        }}>
          BRANCH
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
          Your musical DNA
        </span>
      </div>

      {/* 2-column genre grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
        {GENRE_ORDER.map((genreId) => {
          const genre = GENRES[genreId]
          const isSelected = genreId === activeGenre
          const isOpen = openDropdown === genreId
          const accent = getAccentColor(genre.accentColor)
          const bg = getActiveBg(genre.accentColor)

          return (
            <div key={genreId} style={{ position: 'relative' }}>
              {/* Pill */}
              <div style={{
                display: 'flex',
                borderRadius: '20px',
                border: `1px solid ${isSelected ? accent : 'var(--border)'}`,
                background: isSelected ? bg : 'var(--bg-card)',
                overflow: 'hidden',
                transition: 'border-color 0.15s, background 0.15s',
              }}>
                {/* Genre body button */}
                <button
                  onClick={() => selectGenre(genreId)}
                  style={{
                    flex: 1, minWidth: 0,
                    padding: isSelected ? '6px 4px 6px 11px' : '8px 4px 8px 11px',
                    background: 'transparent', border: 'none',
                    color: isSelected ? accent : 'var(--text-muted)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    textAlign: 'left' as const,
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'color 0.15s',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: isSelected ? 500 : 400, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {genre.label}
                  </div>
                  {isSelected && (
                    <div style={{
                      fontSize: '10px', opacity: 0.75, marginTop: '1px',
                      whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {activeSubgenreData.label}
                    </div>
                  )}
                </button>

                {/* Dropdown arrow */}
                <button
                  onClick={() => !disabled && setOpenDropdown(isOpen ? null : genreId)}
                  style={{
                    width: '26px', flexShrink: 0,
                    background: 'transparent', border: 'none',
                    borderLeft: `1px solid ${isSelected ? `${accent}33` : 'var(--border)'}`,
                    color: isSelected ? accent : 'var(--text-muted)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontSize: '9px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.15s',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                  }}
                >
                  ▾
                </button>
              </div>

              {/* Subgenre dropdown */}
              {isOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  zIndex: 100,
                  overflow: 'hidden',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                }}>
                  {genre.subgenres.map((sub, idx) => {
                    const subActive = sub.id === activeSubgenre && genreId === activeGenre
                    return (
                      <button
                        key={sub.id}
                        onClick={() => selectSubgenre(genreId, sub.id)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left' as const,
                          padding: '8px 13px',
                          background: subActive ? bg : 'transparent',
                          border: 'none',
                          borderBottom: idx < genre.subgenres.length - 1 ? '1px solid var(--border)' : 'none',
                          color: subActive ? accent : 'var(--text-muted)',
                          fontSize: '12px', cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: subActive ? 500 : 400,
                          transition: 'background 0.1s, color 0.1s',
                        }}
                        onMouseEnter={e => {
                          if (!subActive) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                            e.currentTarget.style.color = 'var(--text-primary)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!subActive) {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--text-muted)'
                          }
                        }}
                      >
                        {sub.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected tag */}
      <div style={{ padding: '8px 0 6px', display: 'flex', gap: '5px', flexWrap: 'wrap' as const }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          fontSize: '12px', padding: '4px 10px 4px 12px',
          borderRadius: '20px',
          border: `1px solid ${accentActive}`,
          background: bgActive,
          color: accentActive,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
        }}>
          <span>{activeSubgenreData.fullLabel}</span>
          <span style={{ opacity: 0.45, fontSize: '14px', lineHeight: '1', userSelect: 'none' as const }}>×</span>
        </div>
      </div>
    </section>
  )
}
