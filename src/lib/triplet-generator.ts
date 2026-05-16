export type Triplet = { groove: string; texture: string; mood: string; label: string }
type Pool = { groove: string[]; texture: string[]; mood: string[]; preferredPairings?: string[][]; forbiddenPairings?: string[][] }
type SubgenrePools = Record<string, Pool>

function shuffle<T>(array: T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickWeighted(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

function pairExists(a: string, b: string, pairings: string[][] = []): boolean {
  return pairings.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
}

function isCompatible({ groove, texture, mood }: { groove: string; texture: string; mood: string }, pools: Pool): boolean {
  const forbidden = pools.forbiddenPairings || []
  if (pairExists(groove, texture, forbidden)) return false
  if (pairExists(groove, mood, forbidden)) return false
  if (pairExists(texture, mood, forbidden)) return false
  return true
}

function scoreTriplet({ groove, texture, mood }: { groove: string; texture: string; mood: string }, pools: Pool): number {
  let score = 1
  const preferred = pools.preferredPairings || []
  if (pairExists(groove, texture, preferred)) score += 3
  if (pairExists(groove, mood, preferred)) score += 2
  if (pairExists(texture, mood, preferred)) score += 2
  return score
}

const recentMemoryMap = new Map<string, string[]>()

export function generateTripletsForSubgenre(subgenreKey: string, subgenrePools: SubgenrePools, count = 10): Triplet[] {
  const pools = subgenrePools[subgenreKey]
  if (!pools) return []
  const recent = recentMemoryMap.get(subgenreKey) || []
  const recentSet = new Set(recent)
  const batch: (Triplet & { score: number })[] = []
  const batchSet = new Set<string>()
  let attempts = 0
  const maxAttempts = 700

  while (batch.length < count && attempts < maxAttempts) {
    attempts++
    const groove = pickWeighted(pools.groove)
    const texture = pickWeighted(pools.texture)
    const mood = pickWeighted(pools.mood)
    const label = `${groove} / ${texture} / ${mood}`
    if (batchSet.has(label) || recentSet.has(label)) continue
    if (!isCompatible({ groove, texture, mood }, pools)) continue
    const score = scoreTriplet({ groove, texture, mood }, pools)
    batch.push({ groove, texture, mood, label, score })
    batchSet.add(label)
  }

  // fallback — ignore recent
  while (batch.length < count && attempts < maxAttempts * 2) {
    attempts++
    const groove = pickWeighted(pools.groove)
    const texture = pickWeighted(pools.texture)
    const mood = pickWeighted(pools.mood)
    const label = `${groove} / ${texture} / ${mood}`
    if (batchSet.has(label) || !isCompatible({ groove, texture, mood }, pools)) continue
    const score = scoreTriplet({ groove, texture, mood }, pools)
    batch.push({ groove, texture, mood, label, score })
    batchSet.add(label)
  }

  const sorted = [...batch].sort((a, b) => b.score - a.score)
  const visible = shuffle(sorted).slice(0, count)
  recentMemoryMap.set(subgenreKey, [...recent, ...visible.map(t => t.label)].slice(-20))
  return visible.map(({ groove, texture, mood, label }) => ({ groove, texture, mood, label }))
}

// Mapping from display name → pool key
export const SUBGENRE_POOL_KEY: Record<string, string> = {
  "Roots Disco Reggae":        "rootsDiscoReggae",
  "Lovers Disco Reggae":       "loversDiscoReggae",
  "Dub Disco Reggae":          "dubDiscoReggae",
  "Cosmic Disco Reggae":       "cosmicDiscoReggae",
  "Boogie Reggae":             "boogieReggae",
  "Synth Disco Reggae":        "synthDiscoReggae",
  "Sunset Reggae Dance":       "sunsetReggaeDance",
  "Percussion Disco Reggae":   "percussionDiscoReggae",
  "Dancehall-Disco Crossover": "dancehallDiscoCrossover",
  "Yacht Reggae Disco":        "yachtReggaeDisco",
  "Afro-Disco Reggae":         "afroDiscoReggae",
  "Club Dub Disco":            "clubDubDisco",
}
