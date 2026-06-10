import { createAPIFileRoute } from "@tanstack/start/api";
import { productSearchSchema } from "~/lib/schema";
import { queryProducts } from "~/lib/products";

export const APIRoute = createAPIFileRoute("/api/products")({
  GET: ({ request }) => {
    const url = new URL(request.url);
    const raw: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      raw[key] = value;
    });

    const parsed = productSearchSchema.safeParse(raw);
    if (!parsed.success) {
      const message = parsed.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = queryProducts(parsed.data);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});
