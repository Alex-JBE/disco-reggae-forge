'use client'

import { useState, useEffect, useRef } from 'react'
import { GENRES, GENRE_ORDER } from '@/data/genres'
import type { BranchPanelProps, BranchSelection, GenreId, SubgenreId } from '@/data/genres'

const MAX_SELECTIONS = 3

function getDefaultSelections(props: BranchPanelProps): BranchSelection[] {
  const genre: GenreId =
    props.defaultGenre !== undefined && GENRE_ORDER.includes(props.defaultGenre)
      ? props.defaultGenre
      : 'hybrid'
  const subgenre: SubgenreId =
    props.defaultSubgenre !== undefined &&
    GENRES[genre].subgenres.some((s) => s.id === props.defaultSubgenre)
      ? props.defaultSubgenre
      : GENRES[genre].subgenres[0].id
  return [{ genre, subgenre }]
}

function persist(selections: BranchSelection[]): void {
  try {
    localStorage.setItem('drf.branch', JSON.stringify(selections))
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
  const [selections, setSelections] = useState<BranchSelection[]>(() => getDefaultSelections(props))
  const [openDropdown, setOpenDropdown] = useState<GenreId | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('drf.branch')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return
      const valid = parsed.filter((item: unknown) => {
        if (typeof item !== 'object' || item === null) return false
        const { genre, subgenre } = item as { genre: unknown; subgenre: unknown }
        const genreValid = GENRE_ORDER.includes(genre as GenreId)
        return genreValid && GENRES[genre as GenreId].subgenres.some((s) => s.id === subgenre)
      }) as BranchSelection[]
      if (valid.length === 0) { localStorage.removeItem('drf.branch'); return }
      setSelections(valid)
      props.onChange(valid)
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

  function isGenreSelected(genreId: GenreId): boolean {
    return selections.some((s) => s.genre === genreId)
  }

  function getSubgenreForGenre(genreId: GenreId): SubgenreId {
    return selections.find((s) => s.genre === genreId)?.subgenre ?? GENRES[genreId].subgenres[0].id
  }

  function toggleGenre(genreId: GenreId): void {
    if (disabled) return
    setOpenDropdown(null)
    let next: BranchSelection[]
    if (isGenreSelected(genreId)) {
      // deselect — keep at least one
      if (selections.length === 1) return
      next = selections.filter((s) => s.genre !== genreId)
    } else {
      // select — up to MAX_SELECTIONS
      if (selections.length >= MAX_SELECTIONS) return
      next = [...selections, { genre: genreId, subgenre: GENRES[genreId].subgenres[0].id }]
    }
    setSelections(next)
    persist(next)
    props.onChange(next)
  }

  function selectSubgenre(genreId: GenreId, subgenreId: SubgenreId): void {
    if (disabled) return
    setOpenDropdown(null)
    let next: BranchSelection[]
    if (isGenreSelected(genreId)) {
      // update existing
      next = selections.map((s) => s.genre === genreId ? { genre: genreId, subgenre: subgenreId } : s)
    } else {
      // add new (if room)
      if (selections.length >= MAX_SELECTIONS) return
      next = [...selections, { genre: genreId, subgenre: subgenreId }]
    }
    setSelections(next)
    persist(next)
    props.onChange(next)
  }

  function removeSelection(genreId: GenreId): void {
    if (disabled || selections.length === 1) return
    const next = selections.filter((s) => s.genre !== genreId)
    setSelections(next)
    persist(next)
    props.onChange(next)
  }

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
          {selections.length > 1 ? `Blend mode — ${selections.length} active` : 'Your musical DNA'}
        </span>
      </div>

      {/* 2-column genre grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
        {GENRE_ORDER.map((genreId) => {
          const genre = GENRES[genreId]
          const isSelected = isGenreSelected(genreId)
          const isOpen = openDropdown === genreId
          const currentSubgenreId = getSubgenreForGenre(genreId)
          const currentSubgenre = genre.subgenres.find((s) => s.id === currentSubgenreId)!
          const accent = getAccentColor(genre.accentColor)
          const bg = getActiveBg(genre.accentColor)
          const canSelect = isSelected || selections.length < MAX_SELECTIONS

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
                opacity: (!canSelect && !isSelected) ? 0.4 : 1,
              }}>
                {/* Genre body button */}
                <button
                  onClick={() => toggleGenre(genreId)}
                  disabled={!canSelect && !isSelected}
                  style={{
                    flex: 1, minWidth: 0,
                    padding: isSelected ? '6px 4px 6px 11px' : '8px 4px 8px 11px',
                    background: 'transparent', border: 'none',
                    color: isSelected ? accent : 'var(--text-muted)',
                    cursor: (disabled || (!canSelect && !isSelected)) ? 'not-allowed' : 'pointer',
                    textAlign: 'left' as const,
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'color 0.15s',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: isSelected ? 500 : 400, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {genre.label}
                  </div>
                  {isSelected && (
                    <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '1px', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentSubgenre.label}
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
                    const subActive = isSelected && sub.id === currentSubgenreId
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

      {/* Selected tags */}
      <div style={{ padding: '8px 0 6px', display: 'flex', gap: '5px', flexWrap: 'wrap' as const }}>
        {selections.map((sel) => {
          const genreData = GENRES[sel.genre]
          const subData = genreData.subgenres.find((s) => s.id === sel.subgenre)!
          const accent = getAccentColor(genreData.accentColor)
          const bg = getActiveBg(genreData.accentColor)
          return (
            <div
              key={sel.genre}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '12px', padding: '4px 8px 4px 12px',
                borderRadius: '20px',
                border: `1px solid ${accent}`,
                background: bg,
                color: accent,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}
            >
              <span>{subData.fullLabel}</span>
              <button
                onClick={() => removeSelection(sel.genre)}
                style={{
                  background: 'none', border: 'none', color: 'inherit',
                  cursor: selections.length === 1 ? 'default' : 'pointer',
                  padding: '0 2px', fontSize: '14px', lineHeight: '1',
                  opacity: selections.length === 1 ? 0.3 : 0.6,
                  fontFamily: 'inherit',
                }}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
