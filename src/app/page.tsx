"use client";

import { useState } from "react";
import { buildPrompt } from "@/prompts/base-prompt";
import ResultPanel from "@/components/ResultPanel";
import DraftsPanel from "@/components/DraftsPanel";
import CoverPanel from "@/components/CoverPanel";
import VideoPanel from "@/components/VideoPanel";
import Header from "@/components/Header";
import BranchPanel from "@/components/BranchPanel";
import { useDrafts } from "@/lib/useDrafts";
import { generateTripletsForSubgenre, SUBGENRE_POOL_KEY, Triplet } from "@/lib/triplet-generator";
import subgenrePools from "@/lib/subgenre-pools.json";
import { GENRES } from "@/data/genres";
import type { BranchSelection } from "@/data/genres";

const STYLE_CATEGORIES = [
  {
    id: "roots",
    label: "Roots",
    variant: "teal" as const,
    subs: ["Roots Disco Reggae", "Lovers Disco Reggae", "Dub Disco Reggae"],
  },
  {
    id: "cosmic",
    label: "Cosmic",
    variant: "purple" as const,
    subs: ["Cosmic Disco Reggae", "Synth Disco Reggae", "Sunset Reggae Dance"],
  },
  {
    id: "groove",
    label: "Groove",
    variant: "teal" as const,
    subs: ["Boogie Reggae", "Percussion Disco Reggae", "Dancehall-Disco Crossover"],
  },
  {
    id: "world",
    label: "World",
    variant: "purple" as const,
    subs: ["Yacht Reggae Disco", "Afro-Disco Reggae", "Club Dub Disco"],
  },
];

const INSTRUMENTS = [
  "Reggae Bass",
  "Skank Guitar",
  "Riddim Keys",
  "Drum Kit",
  "Horns",
  "Organ",
  "Synth Pads",
  "Conga",
  "Percussion",
  "Voice",
  "Melodica",
  "Trombone",
  "Strings",
  "Rhodes",
];

const EXOTIC_INSTRUMENTS = [
  "Oud", "Sitar", "Kora", "Bouzouki", "Banjo", "Mandolin", "Ngoni", "Pipa", "Guzheng",
  "Harmonica", "Duduk", "Ney Flute", "Bansuri", "Shakuhachi", "Pan Flute",
  "Djembe", "Tabla", "Darbuka", "Kalimba", "Hang Drum", "Cajon", "Mbira", "Balafon",
  "Accordion", "Harmonium", "Santoor", "Gamelan",
];

const KEYS = [
  "C major", "D minor", "Eb major", "F major",
  "G major", "Ab major", "Bb major", "B minor",
  "E minor", "A minor", "F minor", "C minor",
  "G minor", "D major", "A major", "Open / Modal",
];

const TEMPOS = [
  "One Drop (72–80 BPM)",
  "Steppers (84–92 BPM)",
  "Lovers Rock (88–96 BPM)",
  "Classic Groove (95–105 BPM)",
  "Boogie Roll (108–120 BPM)",
  "Pressure (128–138 BPM)",
];

const MOODS = [
  "Tropical", "Roots", "Romantic", "Cosmic",
  "Dubby", "Heat", "Shoreline", "Dancefloor",
];

const MOOD_PRESETS = [
  { icon: "🌿", label: "Roots",    key: "Bb major",   tempo: "One Drop (72–80 BPM)",       intensity: 2, styles: ["Roots Disco Reggae"] },
  { icon: "💫", label: "Cosmic",   key: "D major",    tempo: "Classic Groove (95–105 BPM)", intensity: 3, styles: ["Cosmic Disco Reggae"] },
  { icon: "🌹", label: "Lovers",   key: "Eb major",   tempo: "Lovers Rock (88–96 BPM)",     intensity: 2, styles: ["Lovers Disco Reggae"] },
  { icon: "🔊", label: "Dub",      key: "F minor",    tempo: "Steppers (84–92 BPM)",        intensity: 3, styles: ["Dub Disco Reggae"] },
  { icon: "🕺", label: "Boogie",   key: "C major",    tempo: "Boogie Roll (108–120 BPM)",   intensity: 4, styles: ["Boogie Reggae"] },
  { icon: "🌍", label: "Afro",     key: "G minor",    tempo: "Classic Groove (95–105 BPM)", intensity: 4, styles: ["Afro-Disco Reggae"] },
];

const INTENSITY_LABELS = ["", "Hushed", "Laid Back", "Grooving", "Burning", "Full Heat"];

type TrackMode = "vocal" | "instrumental" | "both";

const MODES: { id: TrackMode; label: string; icon: string }[] = [
  { id: "vocal",        label: "Vocal",        icon: "🎤" },
  { id: "instrumental", label: "Instrumental", icon: "🎸" },
  { id: "both",         label: "Both",         icon: "🎭" },
];

const VOCAL_RANGES: Record<"male" | "female", string[]> = {
  male:   ["Tenor", "Baritone", "Bass"],
  female: ["Soprano", "Alto"],
};

const VOCAL_TONES = [
  "Warm", "Soulful", "Smooth", "Roots",
  "Raspy", "Sweet", "Deep", "Airy",
];

const LANGUAGES = [
  "English", "Jamaican Patois", "Russian", "Portuguese", "French", "Spanish", "Japanese",
  "German", "Italian", "Arabic", "Hindi", "Chinese", "Turkish", "Hebrew",
  "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech",
  "Hungarian", "Romanian", "Greek", "Ukrainian", "Catalan", "Serbian", "Amharic",
];

type Combo = { icon: string; label: string; styles: string[] };

const s = {
  col: {
    display: "flex" as const,
    flexDirection: "column" as const,
    height: "100%",
    overflow: "hidden" as const,
  },
  sectionLabel: {
    fontSize: "11px",
    letterSpacing: "0.12em",
    color: "var(--gold-dim)",
    textTransform: "uppercase" as const,
    padding: "14px 16px 8px",
    fontWeight: 500,
  },
  paramCard: {
    background: "#0E1610",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "10px 12px",
  },
  paramLabel: {
    fontSize: "10px",
    color: "var(--text-muted)",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    marginBottom: "6px",
    fontWeight: 500,
  },
  select: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "var(--text-primary)",
    fontSize: "13px",
    fontWeight: 500,
    outline: "none",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  tag: (active: boolean) => ({
    fontSize: "12px",
    padding: "5px 12px",
    borderRadius: "20px",
    border: `1px solid ${active ? "#1D9E75" : "var(--border)"}`,
    background: active ? "var(--green-deep)" : "#0E1610",
    color: active ? "var(--green-light)" : "var(--text-muted)",
    cursor: "pointer" as const,
    transition: "all 0.15s",
    fontWeight: active ? 500 : 400,
    fontFamily: "'DM Sans', sans-serif",
  }),
  goldTag: (active: boolean) => ({
    fontSize: "12px",
    padding: "5px 12px",
    borderRadius: "20px",
    border: `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
    background: active ? "#1A1508" : "#0E1610",
    color: active ? "var(--gold)" : "var(--text-muted)",
    cursor: "pointer" as const,
    transition: "all 0.15s",
    fontWeight: active ? 500 : 400,
    fontFamily: "'DM Sans', sans-serif",
  }),
};

function buildVocalString(trackMode: TrackMode, gender: "male" | "female", range: string, tone: string): string {
  if (trackMode === "instrumental") return "";
  return `${tone.toLowerCase()} ${gender} ${range.toLowerCase()} vocal`;
}

export default function Home() {
  const [activeStyles, setActiveStyles] = useState<string[]>(["Disco Roots"]);
  const [branchResetKey, setBranchResetKey] = useState(0);
  const [key, setKey] = useState("Bb major");
  const [tempo, setTempo] = useState("One Drop (72–80 BPM)");
  const [intensity, setIntensity] = useState(3);
  const [mood, setMood] = useState("Roots");
  const [instruments, setInstruments] = useState<string[]>(["Reggae Bass", "Skank Guitar", "Drum Kit"]);
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState("");
  const [trackMode, setTrackMode] = useState<TrackMode>("vocal");
  const [vocalGender, setVocalGender] = useState<"male" | "female">("male");
  const [vocalRange, setVocalRange] = useState("Baritone");
  const [vocalTone, setVocalTone] = useState("Warm");
  const [combos, setCombos] = useState<Combo[]>([]);
  const [combosLoading, setCombosLoading] = useState(false);
  const [combosForStyle, setCombosForStyle] = useState("");
  const [triplets, setTriplets] = useState<Triplet[]>([]);
  const [tripletsForStyle, setTripletsForStyle] = useState("");
  const [importText, setImportText] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [result, setResult] = useState("");
  const [coverResult, setCoverResult] = useState("");
  const [videoResult, setVideoResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inspireLoading, setInspireLoading] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);
  const { drafts, saveDraft, deleteDraft, toggleStar } = useDrafts();

  const compositionTitle = result.split("\n").find(l => /^#?\s*TITLE:/i.test(l))?.replace(/^#?\s*TITLE:/i, "").trim() || "";
  const instrumental = trackMode === "instrumental";
  const vocal = buildVocalString(trackMode, vocalGender, vocalRange, vocalTone);

  function handleBranchChange(sel: BranchSelection) {
    const sub = GENRES[sel.genre].subgenres.find((s) => s.id === sel.subgenre)!;
    setActiveStyles([sub.fullLabel]);
    generateTriplets(sub.fullLabel);
  }

  function generateTriplets(style: string) {
    const poolKey = SUBGENRE_POOL_KEY[style];
    if (!poolKey) return;
    const generated = generateTripletsForSubgenre(poolKey, subgenrePools as Record<string, { groove: string[]; texture: string[]; mood: string[] }>);
    setTriplets(generated);
    setTripletsForStyle(style);
  }

  function clearAll() {
    setResult(""); setCoverResult(""); setVideoResult("");
    setTheme(""); setActiveStyles(["Disco Roots"]);
    setKey("Bb major"); setTempo("One Drop (72–80 BPM)");
    setIntensity(3); setMood("Roots");
    setInstruments(["Reggae Bass", "Skank Guitar", "Drum Kit"]);
    setLanguage("English"); setTrackMode("vocal");
    setVocalGender("male"); setVocalRange("Baritone"); setVocalTone("Warm");
    setCombos([]); setCombosForStyle("");
    setTriplets([]); setTripletsForStyle("");
    setBranchResetKey(k => k + 1); // force BranchPanel remount → resets to defaults
  }

  function randomizeAll() {
    const allSubs = STYLE_CATEGORIES.flatMap(c => c.subs);
    const genders = ["male", "female"] as const;
    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    const randomRange = VOCAL_RANGES[randomGender][Math.floor(Math.random() * VOCAL_RANGES[randomGender].length)];
    const randomTone = VOCAL_TONES[Math.floor(Math.random() * VOCAL_TONES.length)];
    const randomStyle = allSubs[Math.floor(Math.random() * allSubs.length)];

    setActiveStyles([randomStyle]);
    setKey(KEYS[Math.floor(Math.random() * KEYS.length)]);
    setTempo(TEMPOS[Math.floor(Math.random() * TEMPOS.length)]);
    setIntensity(Math.floor(Math.random() * 5) + 1);
    setMood(MOODS[Math.floor(Math.random() * MOODS.length)]);
    setVocalGender(randomGender);
    setVocalRange(randomRange);
    setVocalTone(randomTone);
    setTrackMode("vocal");
    setCombos([]);
    setCombosForStyle("");
    setTriplets([]);
    setTripletsForStyle("");
  }

  async function importPreset() {
    if (!importText.trim()) return;
    setImportLoading(true);
    setImportDone(false);
    try {
      const res = await fetch("/api/import-preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: importText }),
      });
      const data = await res.json();
      if (data.styles?.length) setActiveStyles(data.styles);
      if (data.key) setKey(data.key);
      if (data.tempo) setTempo(data.tempo);
      if (data.intensity) setIntensity(data.intensity);
      if (data.instruments?.length) setInstruments(data.instruments);
      if (data.vocalGender) setVocalGender(data.vocalGender);
      if (data.vocalRange) setVocalRange(data.vocalRange);
      if (data.vocalTone) setVocalTone(data.vocalTone);
      if (data.theme) setTheme(data.theme);
      if (data.vocalGender) setTrackMode("vocal");
      setImportDone(true);
      setImportText("");
      setTimeout(() => setImportDone(false), 2000);
    } catch {
      // silent fail
    } finally {
      setImportLoading(false);
    }
  }

  async function findCombos() {
    const style = activeStyles[0];
    setCombosLoading(true);
    setCombos([]);
    setCombosForStyle(style);
    try {
      const res = await fetch("/api/combos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style }),
      });
      const data = await res.json();
      if (data.combos) setCombos(data.combos);
    } catch {
      setCombos([]);
    } finally {
      setCombosLoading(false);
    }
  }

  async function randomTheme() {
    setRandomLoading(true);
    setTheme("");
    try {
      const res = await fetch("/api/random-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.theme) setTheme(data.theme);
      if (data.style) setActiveStyles([data.style]);
      if (data.key) setKey(data.key);
      if (data.tempo) setTempo(data.tempo);
      if (data.intensity) setIntensity(data.intensity);
    } catch {
      setTheme("A midnight beach gathering, flames low, bass rolling in from the sea...");
    } finally {
      setRandomLoading(false);
    }
  }

  function toggleInstrument(i: string) {
    setInstruments(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  }

  async function inspire() {
    setInspireLoading(true);
    setTheme("");
    try {
      const res = await fetch("/api/inspire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackType: trackMode === "instrumental" ? "instrumental" : "vocal",
          genre: activeStyles.join(" + "),
          mood: INTENSITY_LABELS[intensity],
          tempo,
          instrumental,
        }),
      });
      if (!res.ok || !res.body) { setInspireLoading(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setTheme(acc);
      }
    } catch {
      setTheme("Error generating brief.");
    } finally {
      setInspireLoading(false);
    }
  }

  async function generate() {
    setLoading(true); setIsStreaming(true);
    setResult(""); setCoverResult(""); setVideoResult("");
    try {
      const prompt = buildPrompt({
        styles: activeStyles, key, tempo,
        intensity: INTENSITY_LABELS[intensity],
        mood,
        instruments, language, theme, instrumental, vocal,
      });
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok || !res.body) { setResult("Generation failed"); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setLoading(false);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setResult(acc);
      }
      setTheme("");
    } catch {
      setResult("Error connecting to API");
    } finally {
      setLoading(false); setIsStreaming(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header
        title={compositionTitle}
        composition={result}
        coverResult={coverResult}
        videoResult={videoResult}
        vocal={vocal}
        style={activeStyles.join(" + ")}
        language={language}
        onClear={clearAll}
      />

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 2fr 1fr",
        gridTemplateRows: "1fr",
        flex: 1,
        overflow: "hidden",
      }}>

        <CoverPanel
          title={compositionTitle}
          style={activeStyles.join(" + ")}
          mood={mood}
          theme={theme}
          composition={result}
          compositionLoading={isStreaming}
          onResult={setCoverResult}
        />

        {/* LEFT PANEL */}
        <div style={{ ...s.col, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}>
          <div style={{ padding: "40px 20px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "48px", fontWeight: 700,
              color: "var(--text-primary)", lineHeight: 1.0,
              letterSpacing: "-0.03em",
            }}>
              Forge your next
              <br />
              <span style={{ color: "var(--gold)", fontStyle: "italic" }}>disco reggae anthem</span>
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "12px", lineHeight: 1.4 }}>
              Select branch, set the groove, generate.
            </div>
            <div style={{ display: "flex", gap: "5px", marginTop: "8px", flexWrap: "wrap" }}>
              {MOOD_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setKey(preset.key);
                    setTempo(preset.tempo);
                    setIntensity(preset.intensity);
                    setActiveStyles(preset.styles);
                  }}
                  style={{
                    fontSize: "11px", padding: "4px 10px", borderRadius: "20px",
                    border: "1px solid var(--border)", background: "var(--bg-card)",
                    color: "var(--text-muted)", cursor: "pointer",
                    transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {preset.icon} {preset.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
              <button
                onClick={inspire}
                disabled={inspireLoading}
                style={{
                  flex: 1, padding: "8px 14px",
                  background: inspireLoading ? "var(--bg-card)" : "#1A1508",
                  border: `1px solid ${inspireLoading ? "var(--border)" : "var(--gold)"}`,
                  borderRadius: "8px",
                  color: inspireLoading ? "var(--text-muted)" : "var(--gold)",
                  fontSize: "12px", fontWeight: 500,
                  cursor: inspireLoading ? "not-allowed" : "pointer",
                  letterSpacing: "0.06em", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                }}
              >
                {inspireLoading ? "Generating..." : "✦ Inspire Me"}
              </button>
              <button
                onClick={randomizeAll}
                title="Randomize everything"
                style={{
                  padding: "8px 12px", background: "var(--bg-card)",
                  border: "1px solid var(--border)", borderRadius: "8px",
                  color: "var(--text-muted)", fontSize: "16px",
                  cursor: "pointer", transition: "all 0.2s",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                🎲
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
            <BranchPanel
              key={branchResetKey}
              defaultGenre="hybrid"
              defaultSubgenre="disco-roots"
              onChange={handleBranchChange}
            />
            <div style={{ height: "1px", background: "var(--border)", margin: "0 0 12px" }} />

            {/* TRIPLET GENERATOR */}
            <div style={{ padding: "0 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.12em", color: "var(--gold-dim)", textTransform: "uppercase" as const, fontWeight: 500 }}>
                  Groove Triplets
                </div>
                <button
                  onClick={() => generateTriplets(activeStyles[0])}
                  style={{
                    fontSize: "11px", padding: "4px 10px", borderRadius: "6px",
                    border: "1px solid var(--green)",
                    background: "var(--green-deep)",
                    color: "var(--green-light)",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                  }}
                >
                  ↻ Generate
                </button>
              </div>

              {triplets.length === 0 && (
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" as const, padding: "12px 0" }}>
                  Generate groove / texture / mood triplets for your branch
                </div>
              )}

              {triplets.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {triplets.slice(0, 8).map((triplet, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTheme(triplet.label);
                        setMood(triplet.mood);
                      }}
                      style={{
                        fontSize: "11px", padding: "6px 8px", borderRadius: "6px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-card)",
                        color: "var(--text-secondary)",
                        cursor: "pointer", transition: "all 0.15s",
                        fontFamily: "'DM Mono', monospace",
                        textAlign: "left" as const,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--green)"; e.currentTarget.style.color = "var(--green-light)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                    >
                      {triplet.label}
                    </button>
                  ))}
                  {tripletsForStyle && (
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center" as const, paddingTop: "4px" }}>
                      for {tripletsForStyle}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ height: "1px", background: "var(--border)", margin: "12px 0" }} />

            {/* STYLE COMBOS */}
            <div style={{ padding: "0 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.12em", color: "var(--gold-dim)", textTransform: "uppercase" as const, fontWeight: 500 }}>
                  Branch Combos
                </div>
                <button
                  onClick={findCombos}
                  disabled={combosLoading}
                  style={{
                    fontSize: "11px", padding: "4px 10px", borderRadius: "6px",
                    border: `1px solid ${combosLoading ? "var(--border)" : "var(--gold)"}`,
                    background: combosLoading ? "var(--bg-card)" : "#1A1508",
                    color: combosLoading ? "var(--text-muted)" : "var(--gold)",
                    cursor: combosLoading ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                  }}
                >
                  {combosLoading ? "Finding..." : `✦ Find for ${activeStyles[0]}`}
                </button>
              </div>

              {combos.length === 0 && !combosLoading && (
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" as const, padding: "12px 0" }}>
                  Pick a branch above, then click Find
                </div>
              )}

              {combosLoading && (
                <div style={{ fontSize: "11px", color: "var(--gold-dim)", textAlign: "center" as const, padding: "12px 0" }}>
                  <span style={{ color: "var(--gold)" }}>●</span> Generating combos for {combosForStyle}...
                </div>
              )}

              {combos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                  {combos.map((combo) => {
                    const isActive = combo.styles.every(st => activeStyles.includes(st));
                    return (
                      <button
                        key={combo.label}
                        onClick={() => setActiveStyles(combo.styles)}
                        style={{
                          fontSize: "11px", padding: "7px 8px", borderRadius: "8px",
                          border: `1px solid ${isActive ? "var(--gold)" : "var(--border)"}`,
                          background: isActive ? "#1A1508" : "var(--bg-card)",
                          color: isActive ? "var(--gold)" : "var(--text-muted)",
                          cursor: "pointer", transition: "all 0.15s",
                          fontFamily: "'DM Sans', sans-serif",
                          textAlign: "left" as const,
                        }}
                      >
                        <div style={{ marginBottom: "2px" }}>{combo.icon} {combo.label}</div>
                        <div style={{ fontSize: "10px", opacity: 0.6, lineHeight: 1.3 }}>
                          {combo.styles.join(" · ")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ height: "1px", background: "var(--border)", margin: "12px 0" }} />

            <div style={s.sectionLabel}>History</div>
            <DraftsPanel
              drafts={drafts}
              onLoad={(draft) => {
                setActiveStyles(draft.styles);
                setResult(draft.result);
                if (draft.key) setKey(draft.key);
                if (draft.tempo) setTempo(draft.tempo);
                if (draft.intensity) setIntensity(draft.intensity);
                if (draft.language) setLanguage(draft.language);
                if (draft.trackMode) setTrackMode(draft.trackMode as TrackMode);
                if (draft.instruments) setInstruments(draft.instruments);
              }}
              onDelete={deleteDraft}
              onStar={toggleStar}
            />
          </div>
        </div>

        {/* MAIN / CENTER PANEL */}
        <div style={{ ...s.col, background: "var(--bg-primary)", minHeight: 0 }}>
          {/* Fixed top: key / tempo / intensity */}
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Key</div>
                <select style={s.select} value={key} onChange={e => setKey(e.target.value)}>
                  {KEYS.map(k => (
                    <option key={k} style={{ background: "var(--bg-primary)" }}>{k}</option>
                  ))}
                </select>
              </div>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Tempo</div>
                <select style={s.select} value={tempo} onChange={e => setTempo(e.target.value)}>
                  {TEMPOS.map(t => (
                    <option key={t} style={{ background: "var(--bg-primary)" }}>{t}</option>
                  ))}
                </select>
              </div>
              <div style={s.paramCard}>
                <div style={s.paramLabel}>Intensity</div>
                <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setIntensity(n)} style={{
                      height: "6px", flex: 1, borderRadius: "2px", border: "none",
                      background: n <= intensity ? "var(--gold)" : "var(--border)",
                      cursor: "pointer",
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: "11px", color: "var(--gold-dim)", marginTop: "5px" }}>
                  {INTENSITY_LABELS[intensity]}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable: params + result */}
          <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Mood */}
              <div>
                <div style={s.paramLabel}>Mood</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {MOODS.map(m => (
                    <button key={m} onClick={() => setMood(m)} style={s.tag(mood === m)}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={s.paramLabel}>Groove Brief</div>
                  <button
                    onClick={randomTheme}
                    disabled={randomLoading}
                    title="Random theme"
                    style={{
                      background: "none", border: "1px solid var(--border)", borderRadius: "6px",
                      color: randomLoading ? "var(--text-muted)" : "var(--text-secondary)",
                      fontSize: "14px", cursor: randomLoading ? "not-allowed" : "pointer",
                      padding: "2px 8px", lineHeight: 1, transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (!randomLoading) { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = randomLoading ? "var(--text-muted)" : "var(--text-secondary)"; }}
                  >
                    {randomLoading ? "⟳" : "🎲"}
                  </button>
                </div>
                <textarea
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  placeholder="A midnight beach gathering, flames low, bass rolling in from the sea..."
                  style={{
                    width: "100%", height: "80px", background: "var(--bg-panel)",
                    border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px",
                    color: "var(--text-secondary)", WebkitTextFillColor: "var(--text-secondary)",
                    fontSize: "12px", resize: "none" as const, outline: "none",
                    fontFamily: "'DM Mono', monospace", lineHeight: "1.7",
                    overflow: "auto", boxSizing: "border-box" as const,
                  }}
                />
              </div>

              {/* Import Preset */}
              <div>
                <div style={s.paramLabel}>Import Preset</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <textarea
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    placeholder="Paste any Suno preset, description, or idea..."
                    style={{
                      flex: 1, height: "56px", background: "var(--bg-panel)",
                      border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px",
                      color: "var(--text-secondary)", WebkitTextFillColor: "var(--text-secondary)",
                      fontSize: "12px", resize: "none" as const, outline: "none",
                      fontFamily: "'DM Mono', monospace", lineHeight: "1.5",
                      boxSizing: "border-box" as const,
                    }}
                  />
                  <button
                    onClick={importPreset}
                    disabled={importLoading || !importText.trim()}
                    style={{
                      padding: "0 14px", borderRadius: "8px", border: "none",
                      background: importDone ? "var(--green-deep)" : importLoading || !importText.trim() ? "var(--bg-card)" : "var(--gold)",
                      color: importDone ? "var(--green-light)" : importLoading || !importText.trim() ? "var(--text-muted)" : "#0D0D0F",
                      fontSize: "12px", fontWeight: 600,
                      cursor: importLoading || !importText.trim() ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {importDone ? "Done ✓" : importLoading ? "..." : "Import ↗"}
                  </button>
                </div>
              </div>

              {/* Instrumentation */}
              <div>
                <div style={s.paramLabel}>Instrumentation</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {INSTRUMENTS.map(i => (
                    <button key={i} onClick={() => toggleInstrument(i)} style={s.tag(instruments.includes(i))}>
                      {i}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginTop: "8px", marginBottom: "6px", fontWeight: 500 }}>
                  World & Exotic
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {EXOTIC_INSTRUMENTS.map(i => (
                    <button key={i} onClick={() => toggleInstrument(i)} style={s.tag(instruments.includes(i))}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <div style={s.paramLabel}>Language</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {LANGUAGES.map(l => (
                    <button key={l} onClick={() => setLanguage(l)} style={s.tag(language === l)}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode */}
              <div>
                <div style={s.paramLabel}>Mode</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {MODES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setTrackMode(m.id)}
                      style={{
                        fontSize: "12px", padding: "5px 14px", borderRadius: "20px",
                        border: `1px solid ${trackMode === m.id ? "var(--gold)" : "var(--border)"}`,
                        background: trackMode === m.id ? "#1A1508" : "var(--bg-card)",
                        color: trackMode === m.id ? "var(--gold)" : "var(--text-muted)",
                        cursor: "pointer", transition: "all 0.15s",
                        fontWeight: trackMode === m.id ? 500 : 400,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vocal settings */}
              {trackMode !== "instrumental" && (
                <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ ...s.paramLabel, marginBottom: "8px" }}>Vocal</div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                    {(["male", "female"] as const).map(g => (
                      <button key={g} onClick={() => { setVocalGender(g); setVocalRange(g === "male" ? "Baritone" : "Alto"); }} style={s.goldTag(vocalGender === g)}>
                        {g === "male" ? "♂ Male" : "♀ Female"}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
                    {VOCAL_RANGES[vocalGender].map(r => (
                      <button key={r} onClick={() => setVocalRange(r)} style={s.tag(vocalRange === r)}>{r}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {VOCAL_TONES.map(t => (
                      <button key={t} onClick={() => setVocalTone(t)} style={s.tag(vocalTone === t)}>{t}</button>
                    ))}
                  </div>
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--green-light)", fontStyle: "italic" }}>
                    → {vocal}
                  </div>
                </div>
              )}
            </div>

            <ResultPanel result={result} loading={loading} isStreaming={isStreaming} />
          </div>

          {/* Fixed bottom: Save + Generate */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => {
                if (result) saveDraft({
                  title: compositionTitle || "Untitled",
                  styles: activeStyles, outputType: "full",
                  result, key, tempo, intensity, language, trackMode, instruments,
                });
              }}
              disabled={!result}
              style={{
                padding: "10px 16px", background: "transparent",
                border: "1px solid var(--border)", borderRadius: "6px",
                color: result ? "var(--text-secondary)" : "var(--text-muted)",
                fontSize: "12px", cursor: result ? "pointer" : "not-allowed",
                letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Save Draft
            </button>
            <button
              onClick={generate}
              disabled={loading || isStreaming}
              style={{
                flex: 1, padding: "10px",
                background: (loading || isStreaming) ? "var(--bg-card)" : "var(--gold)",
                border: "none", borderRadius: "6px",
                color: (loading || isStreaming) ? "var(--text-muted)" : "#0D0D0F",
                fontSize: "13px", fontWeight: 600,
                cursor: (loading || isStreaming) ? "not-allowed" : "pointer",
                letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
              }}
            >
              {(loading || isStreaming) ? "Generating..." : "Forge Riddim ↗"}
            </button>
          </div>
        </div>

        <VideoPanel
          title={compositionTitle}
          style={activeStyles.join(" + ")}
          mood={mood}
          theme={theme}
          composition={result}
          compositionLoading={isStreaming}
          onResult={setVideoResult}
        />
      </div>
    </div>
  );
}
