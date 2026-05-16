import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ALL_SUBS = [
  "Roots Disco Reggae",
  "Lovers Disco Reggae",
  "Dub Disco Reggae",
  "Cosmic Disco Reggae",
  "Synth Disco Reggae",
  "Sunset Reggae Dance",
  "Boogie Reggae",
  "Percussion Disco Reggae",
  "Dancehall-Disco Crossover",
  "Yacht Reggae Disco",
  "Afro-Disco Reggae",
  "Club Dub Disco",
];

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    const prompt = `You are a music analyst. Parse the following text and extract musical parameters for a disco-reggae composition tool.

TEXT TO PARSE:
"${text}"

Extract as much as you can. For styles, pick ONLY from this exact list:
${ALL_SUBS.join(", ")}

Return ONLY valid JSON, no markdown, no explanation:
{
  "styles": ["up to 3 styles from the list above that best match the text"],
  "key": "one of: C major, D minor, Eb major, F major, G major, Ab major, Bb major, B minor, E minor, A minor, F minor, C minor, G minor — or null if unclear",
  "tempo": "one of: One Drop (72–80 BPM), Steppers (84–92 BPM), Lovers Rock (88–96 BPM), Classic Groove (95–105 BPM), Boogie Roll (108–120 BPM), Pressure (128–138 BPM) — or null if unclear",
  "intensity": 1-5 or null,
  "instruments": ["instruments mentioned — only from: Reggae Bass, Skank Guitar, Riddim Keys, Drum Kit, Horns, Organ, Synth Pads, Conga, Percussion, Voice, Melodica, Trombone, Strings, Rhodes"],
  "vocalGender": "male or female or null",
  "vocalRange": "Tenor, Baritone, Bass, Soprano, or Alto — or null",
  "vocalTone": "one of: Warm, Soulful, Smooth, Roots, Raspy, Sweet, Deep, Airy — or null",
  "theme": "1-2 sentence summary of the mood/scene described, in English, to use as composition theme"
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text2 = message.content
      .filter(b => b.type === "text")
      .map(b => b.type === "text" ? b.text : "")
      .join("").trim();

    const clean = text2.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Import preset error:", error);
    return new Response(JSON.stringify({ error: "Import failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
