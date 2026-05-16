import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Generate a vivid scene for a disco-reggae composition and matching musical settings.

Return ONLY this exact JSON format, nothing else:
{
  "theme": "2-4 sentence scene with specific time, place and emotional detail",
  "style": "one of: Roots Disco Reggae, Lovers Disco Reggae, Dub Disco Reggae, Cosmic Disco Reggae, Synth Disco Reggae, Sunset Reggae Dance, Boogie Reggae, Percussion Disco Reggae, Dancehall-Disco Crossover, Yacht Reggae Disco, Afro-Disco Reggae, Club Dub Disco",
  "key": "one of: C major, D minor, Eb major, F major, G major, Ab major, Bb major, B minor, E minor, A minor, F minor, C minor, G minor",
  "tempo": "one of: One Drop (72-80 BPM), Steppers (84-92 BPM), Lovers Rock (88-96 BPM), Classic Groove (95-105 BPM), Boogie Roll (108-120 BPM), Pressure (128-138 BPM)",
  "intensity": 3
}`
      }],
    });

    const text = (message.content as Array<{ type: string; text?: string }>)
      .filter(b => b.type === "text")
      .map(b => b.text ?? "")
      .join("").trim();

    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Random theme error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate theme" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
