import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ALL_STYLES = [
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
    const { style } = await req.json();

    const prompt = `You are a disco-reggae music expert. Given the branch "${style}", suggest exactly 6 creative branch combinations (2-3 branches blended) that would work well together.

Rules:
- Each combo must include "${style}" as one of the branches
- The other branches must be chosen ONLY from this list: ${ALL_STYLES.join(", ")}
- Each combo should have a different sonic character
- Give each combo a short evocative label (2-3 words max) and a relevant emoji

Respond with ONLY valid JSON, no markdown, no explanation:
{
  "combos": [
    { "icon": "🌿", "label": "Roots Heat", "styles": ["${style}", "Style2"] },
    { "icon": "💫", "label": "Space Dub", "styles": ["${style}", "Style2", "Style3"] },
    { "icon": "🔊", "label": "Bass Pressure", "styles": ["${style}", "Style2"] },
    { "icon": "🕺", "label": "Floor Ready", "styles": ["${style}", "Style2"] },
    { "icon": "🌊", "label": "Deep Wave", "styles": ["${style}", "Style2", "Style3"] },
    { "icon": "🌍", "label": "World Groove", "styles": ["${style}", "Style2"] }
  ]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Combos error:", error);
    return new Response(JSON.stringify({ error: "Combos generation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
