import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { INSPIRE_ME_SYSTEM, buildInspirePrompt } from "@/prompts/inspire-me";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { trackType, genre, mood, tempo, instrumental } = await req.json();

    const userPrompt = buildInspirePrompt({
      trackType: instrumental ? "instrumental" : trackType || "vocal",
      genre: genre || "Roots Disco Reggae",
      mood: mood || "Grooving",
      tempo: tempo || "One Drop (72–80 BPM)",
      instrumental: instrumental || false,
    });

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: INSPIRE_ME_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
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
    console.error("Inspire error:", error);
    return new Response(JSON.stringify({ error: "Inspire generation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
