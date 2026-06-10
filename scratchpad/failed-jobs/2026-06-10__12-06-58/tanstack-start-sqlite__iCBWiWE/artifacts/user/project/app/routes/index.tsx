import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { getCount, incrementCount } from "../functions/counter";

export const Route = createFileRoute("/")({
  loader: async () => {
    const count = await getCount();
    return { count };
  },
  component: CounterPage,
});

function CounterPage() {
  const { count: initialCount } = Route.useLoaderData();
  const [count, setCount] = useState(initialCount);
  const router = useRouter();

  const handleIncrement = async () => {
    const newCount = await incrementCount();
    setCount(newCount);
    router.invalidate();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        gap: "1.5rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", margin: 0 }}>TanStack Start Counter</h1>
      <p style={{ fontSize: "1.25rem", margin: 0 }}>
        Count:{" "}
        <strong data-testid="count" style={{ fontSize: "2rem" }}>
          {count}
        </strong>
      </p>
      <button
        data-testid="increment"
        onClick={handleIncrement}
        style={{
          padding: "0.75rem 2rem",
          fontSize: "1rem",
          cursor: "pointer",
          borderRadius: "0.5rem",
          border: "none",
          background: "#3b82f6",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        Increment
      </button>
    </div>
  );
}
