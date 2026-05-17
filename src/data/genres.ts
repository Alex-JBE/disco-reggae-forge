export type GenreId = "reggae" | "disco" | "hybrid" | "funk" | "soul" | "pop"

export type SubgenreId =
  | "roots" | "lovers" | "dub" | "rockers" | "steppers"
  | "classic" | "italo" | "boogie" | "hi-nrg" | "cosmic"
  | "disco-roots" | "disco-dub" | "lovers-glow" | "steppers-funk" | "sunset-pop"
  | "p-funk" | "disco-funk" | "jazz-funk" | "synth-funk" | "modern-funk"
  | "philly" | "northern" | "modern-soul" | "quiet-storm" | "blue-eyed"
  | "dance-pop" | "synth-pop" | "yacht-pop" | "sunshine-pop" | "art-pop"

export interface SubgenreDefinition {
  id: SubgenreId
  label: string
  fullLabel: string
  tooltip: string
}

export interface GenreDefinition {
  id: GenreId
  label: string
  accentColor: string
  subgenres: [SubgenreDefinition, SubgenreDefinition, SubgenreDefinition, SubgenreDefinition, SubgenreDefinition]
}

export interface BranchSelection {
  genre: GenreId
  subgenre: SubgenreId
}

export interface BranchState {
  activeGenre: GenreId
  activeSubgenre: SubgenreId
}

export interface BranchPanelProps {
  defaultGenre?: GenreId
  defaultSubgenre?: SubgenreId
  onChange: (selections: BranchSelection[]) => void
  disabled?: boolean
}

export const GENRES: Record<GenreId, GenreDefinition> = {
  reggae: {
    id: "reggae",
    label: "Reggae",
    accentColor: "#4ADE80",
    subgenres: [
      { id: "roots",   label: "Roots",   fullLabel: "Roots Reggae",   tooltip: "Heavy one-drop, spiritual themes, minor tonality" },
      { id: "lovers",  label: "Lovers",  fullLabel: "Lovers Rock",    tooltip: "Romantic swing, lush harmonies, UK origins" },
      { id: "dub",     label: "Dub",     fullLabel: "Dub",            tooltip: "Space, echo, bass pressure, deconstructed riddim" },
      { id: "rockers", label: "Rockers", fullLabel: "Rockers Reggae", tooltip: "Militant steppers, roots-era urgency" },
      { id: "steppers", label: "Steppers", fullLabel: "Steppers",     tooltip: "Four-on-the-floor kick, relentless forward motion" },
    ],
  },
  disco: {
    id: "disco",
    label: "Disco",
    accentColor: "#FBBF24",
    subgenres: [
      { id: "classic",  label: "Classic",  fullLabel: "Classic Disco",  tooltip: "Philly strings, four-on-the-floor, uptown glamour" },
      { id: "italo",    label: "Italo",    fullLabel: "Italo Disco",    tooltip: "Synth-driven, minor key, European melancholy" },
      { id: "boogie",   label: "Boogie",   fullLabel: "Boogie",         tooltip: "Syncopated bass, live drums, transitional 80s feel" },
      { id: "hi-nrg",   label: "Hi-NRG",  fullLabel: "Hi-NRG",         tooltip: "Fast, driving, electronic pulse" },
      { id: "cosmic",   label: "Cosmic",   fullLabel: "Cosmic Disco",   tooltip: "Krautrock influence, hypnotic repetition, space" },
    ],
  },
  hybrid: {
    id: "hybrid",
    label: "Hybrid",
    accentColor: "gradient-hybrid",
    subgenres: [
      { id: "disco-roots",    label: "Disco Roots",    fullLabel: "Disco Roots",    tooltip: "Roots-reggae one-drop with disco propulsion and Philly strings" },
      { id: "disco-dub",      label: "Disco Dub",      fullLabel: "Disco Dub",      tooltip: "Dub space and echo woven into a disco groove framework" },
      { id: "lovers-glow",    label: "Lovers Glow",    fullLabel: "Lovers Glow",    tooltip: "Lovers rock sweetness with shimmering disco production" },
      { id: "steppers-funk",  label: "Steppers Funk",  fullLabel: "Steppers Funk",  tooltip: "Steppers urgency fused with funky bass and horn stabs" },
      { id: "sunset-pop",     label: "Sunset Pop",     fullLabel: "Sunset Pop",     tooltip: "Mellow reggae pocket with pop hooks and warm synth textures" },
    ],
  },
  funk: {
    id: "funk",
    label: "Funk",
    accentColor: "#F97316",
    subgenres: [
      { id: "p-funk",      label: "P-Funk",      fullLabel: "P-Funk",       tooltip: "Parliament-Funkadelic cosmic groove, thick bass, call-and-response" },
      { id: "disco-funk",  label: "Disco Funk",  fullLabel: "Disco Funk",   tooltip: "High-gloss funk with disco tempo and string arrangements" },
      { id: "jazz-funk",   label: "Jazz Funk",   fullLabel: "Jazz Funk",    tooltip: "Extended harmony, sophisticated chord movement, live improvisation" },
      { id: "synth-funk",  label: "Synth Funk",  fullLabel: "Synth Funk",   tooltip: "Electro-tinged funk, sequenced bass, 80s production sheen" },
      { id: "modern-funk", label: "Modern",      fullLabel: "Modern Funk",  tooltip: "Neo-soul influenced, live instrumentation, contemporary pocket" },
    ],
  },
  soul: {
    id: "soul",
    label: "Soul",
    accentColor: "#EC4899",
    subgenres: [
      { id: "philly",       label: "Philly",       fullLabel: "Philly Soul",    tooltip: "Lush orchestration, sophisticated chord changes, TSOP groove" },
      { id: "northern",     label: "Northern",     fullLabel: "Northern Soul",  tooltip: "Fast tempo, driving beat, emotional intensity, stomping feel" },
      { id: "modern-soul",  label: "Modern",       fullLabel: "Modern Soul",    tooltip: "Neo-soul sensibility, organic texture, introspective themes" },
      { id: "quiet-storm",  label: "Quiet Storm",  fullLabel: "Quiet Storm",    tooltip: "Slow tempo, adult contemporary feel, smooth production" },
      { id: "blue-eyed",    label: "Blue-Eyed",    fullLabel: "Blue-Eyed Soul", tooltip: "White artists in Black soul tradition, earnest delivery" },
    ],
  },
  pop: {
    id: "pop",
    label: "Pop",
    accentColor: "#A78BFA",
    subgenres: [
      { id: "dance-pop",    label: "Dance Pop",    fullLabel: "Dance Pop",      tooltip: "Hook-forward, uptempo, radio-ready production" },
      { id: "synth-pop",    label: "Synth Pop",    fullLabel: "Synth Pop",      tooltip: "Electronic textures, melodic leads, cold warmth" },
      { id: "yacht-pop",    label: "Yacht Pop",    fullLabel: "Yacht Pop",      tooltip: "Smooth production, sophisticated songwriting, soft focus" },
      { id: "sunshine-pop", label: "Sunshine",     fullLabel: "Sunshine Pop",   tooltip: "Lush vocals, major key brightness, summery optimism" },
      { id: "art-pop",      label: "Art Pop",      fullLabel: "Art Pop",        tooltip: "Experimental instincts within pop framework, conceptual edge" },
    ],
  },
}

export const GENRE_ORDER: GenreId[] = ["reggae", "disco", "hybrid", "funk", "soul", "pop"]
