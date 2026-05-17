import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ALL_SUBS = [
  "Roots Disco Reggae", "Lovers Disco Reggae", "Dub Disco Reggae",
  "Cosmic Disco Reggae", "Synth Disco Reggae", "Sunset Reggae Dance",
  "Boogie Reggae", "Percussion Disco Reggae", "Dancehall-Disco Crossover",
  "Yacht Reggae Disco", "Afro-Disco Reggae", "Club Dub Disco",
];

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const prompt = `Parse this text and extract musical parameters for a disco-reggae tool.

TEXT: "${text}"

Pick styles ONLY from: ${ALL_SUBS.join(", ")}

Return ONLY valid JSON:
{
  "styles": ["up to 3 matching styles"],
  "key": "one of: C major, D minor, Eb major, F major, G major, Ab major, Bb major, B minor, E minor, A minor, F minor, C minor, G minor — or null",
  "tempo": "one of: One Drop (72-80 BPM), Steppers (84-92 BPM), Lovers Rock (88-96 BPM), Classic Groove (95-105 BPM), Boogie Roll (108-120 BPM), Pressure (128-138 BPM) — or null",
  "intensity": null,
  "instruments": [],
  "vocalGender": null,
  "vocalRange": null,
  "vocalTone": null,
  "theme": "1-2 sentence mood summary"
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content as Array<{ type: string; text?: string }>)
      .filter(b => b.type === "text")
      .map(b => b.text ?? "")
      .join("").trim();

    const data = JSON.parse(raw.replace(/```json|```/g, "").trim());
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
