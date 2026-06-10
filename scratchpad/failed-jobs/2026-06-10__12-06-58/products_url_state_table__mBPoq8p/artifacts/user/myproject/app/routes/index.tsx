import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div style={{ textAlign: "center", paddingTop: "4rem" }}>
      <h1>Welcome</h1>
      <p style={{ marginTop: "1rem", color: "#555" }}>
        <Link to="/products" style={{ color: "#1a1a2e", fontWeight: 600 }}>
          → Browse Products
        </Link>
      </p>
    </div>
  ),
});
