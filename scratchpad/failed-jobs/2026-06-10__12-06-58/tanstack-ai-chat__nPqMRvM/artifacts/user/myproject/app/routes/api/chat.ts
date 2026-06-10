import { createAPIFileRoute } from "@tanstack/start/api";
import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { insertNote } from "~/lib/db";

export const APIRoute = createAPIFileRoute("/api/chat")({
  POST: async ({ request }) => {
    const { messages } = await request.json();

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a helpful assistant. When the user asks you to create or save a note, " +
        "use the createNote tool. Always confirm after notes are saved.",
      messages,
      tools: {
        createNote: tool({
          description:
            "Creates and saves a note to the database. Requires user approval before executing.",
          parameters: z.object({
            title: z.string().describe("The title of the note"),
            content: z.string().describe("The body content of the note"),
          }),
          // No `execute` function → becomes a human-in-the-loop tool call.
          // The client must call addToolResult({ toolCallId, result }) to proceed.
        }),
      },
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  },
});
