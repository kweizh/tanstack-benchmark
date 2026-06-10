import { createAPIFileRoute } from "@tanstack/start/api";
import { getComments, createComment } from "../../store";

export const APIRoute = createAPIFileRoute("/api/comments")({
  GET: async () => {
    const comments = getComments();
    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },

  POST: async ({ request }) => {
    const url = new URL(request.url);
    const shouldFail = url.searchParams.get("fail") === "1";

    // Parse request body
    let body: { parentId: string | null; body: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!body.body || typeof body.body !== "string") {
      return new Response(JSON.stringify({ error: "body is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Artificial delay of at least 300ms so optimistic update is observable
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (shouldFail) {
      return new Response(
        JSON.stringify({ error: "Forced server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const comment = createComment(body.parentId ?? null, body.body);
    return new Response(JSON.stringify(comment), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});
