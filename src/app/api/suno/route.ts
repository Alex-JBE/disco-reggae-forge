import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LENGTH_INSTRUCTIONS: Record<string, string> = {
  short: `Track length: SHORT (2-3 minutes).
Structure: [Intro groove] + [Verse 1] + [Chorus] + [Outro fade].
Keep each section brief. Minimal dub directions.`,
  medium: `Track length: MEDIUM (4-5 minutes).
Structure: [Intro groove] + [Verse 1] + [Chorus] + [Verse 2] + [Chorus] + [Dub break] + [Outro].
Include some instrumental directions in brackets like [Bass and drum - 8 bars].`,
  long: `Track length: LONG (6-8 minutes).
Structure: [Intro groove] + [Verse 1] + [Chorus] + [Verse 2] + [Chorus] + [Dub breakdown] + [Riddim section - 32 bars] + [Chorus] + [Outro - echo fade].
Include detailed dub space directions. Add breakdown and echo passages.`,
};

export async function POST(req: NextRequest) {
  try {
    const { composition, title, trackLength = "medium", vocal = "" } = await req.json();
    const lengthInstruction = LENGTH_INSTRUCTIONS[trackLength] || LENGTH_INSTRUCTIONS.medium;
    const vocalSuffix = vocal ? `, ${vocal}` : "";
    const vocalNote = vocal
      ? `IMPORTANT: The style_of_music string MUST end with exactly this vocal tag: "${vocal}". Keep the rest under ${900 - vocal.length} characters so it fits within 950.`
      : `This is an instrumental track. Do not include any vocal descriptor.`;

    const prompt = `You are a Suno AI prompt engineer specializing in disco-reggae. Convert the composition below into two precise Suno blocks.

COMPOSITION:
${composition}

${lengthInstruction}

BUILD the STYLE_OF_MUSIC using GMIV structure (in this order):
G — Genre: disco-reggae branch and hybrid character
M — Mood: BPM range, groove feel, emotional tone, dub space level
I — Instrumentation: key instruments (bass, skank, keys, percussion, dub elements), production texture
V — Vocals: ${vocal ? `"${vocal}" — place this EXACTLY at the very end` : "omit (instrumental)"}

${vocalNote}

CRITICAL RULES for STYLE_OF_MUSIC:
- One dense paragraph, NO line breaks
- Total length MUST be under 950 characters including the vocal tag
- No generic filler phrases
- Be specific: real instruments, BPM, groove type, analog/digital texture
- End the string with${vocalSuffix ? `: "${vocalSuffix.trim()}"` : " a production/texture tag (e.g. analog warmth, dub echo)"}

Return ONLY this exact format, nothing else:

STYLE_OF_MUSIC:
[GMIV style string ending with vocal tag, under 950 chars total]

LYRICS:
[Formatted lyrics with Suno section tags. Keep original language. Include dub directions in square brackets like [Dub break - bass only]. If instrumental, write [Instrumental] and describe key musical moments.]`;

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Suno error:", error);
    return new Response(JSON.stringify({ error: "Suno export failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
