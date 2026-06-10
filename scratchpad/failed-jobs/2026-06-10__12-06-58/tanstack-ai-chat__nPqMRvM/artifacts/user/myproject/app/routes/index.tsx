import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: ChatPage,
});

function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, addToolResult, status } =
    useChat({
      api: "/api/chat",
      maxSteps: 5,
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerDot} />
        <span style={styles.headerTitle}>AI Chat</span>
        <span style={styles.headerBadge}>createNote tool</span>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>💬</div>
            <p style={styles.emptyText}>Start a conversation</p>
            <p style={styles.emptyHint}>
              Try: <em>"Create a note saying hello world"</em>
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            {/* Regular text content */}
            {message.content && (
              <div
                style={{
                  ...styles.bubble,
                  ...(message.role === "user"
                    ? styles.bubbleUser
                    : styles.bubbleAssistant),
                }}
              >
                <span style={styles.roleLabel}>
                  {message.role === "user" ? "You" : "AI"}
                </span>
                <p style={styles.messageText}>{message.content}</p>
              </div>
            )}

            {/* Tool invocations */}
            {message.toolInvocations?.map((toolInvocation) => {
              if (toolInvocation.toolName !== "createNote") return null;

              if (toolInvocation.state === "call") {
                // Waiting for approval
                return (
                  <div key={toolInvocation.toolCallId} style={styles.approvalCard}>
                    <div style={styles.approvalHeader}>
                      <span style={styles.approvalIcon}>🔒</span>
                      <span style={styles.approvalTitle}>Tool Approval Required</span>
                    </div>
                    <div style={styles.approvalBody}>
                      <p style={styles.approvalDesc}>
                        The AI wants to create a note:
                      </p>
                      <div style={styles.approvalPayload}>
                        <span style={styles.payloadLabel}>Title:</span>{" "}
                        <span style={styles.payloadValue}>
                          {(toolInvocation.args as { title: string; content: string }).title}
                        </span>
                        <br />
                        <span style={styles.payloadLabel}>Content:</span>{" "}
                        <span style={styles.payloadValue}>
                          {(toolInvocation.args as { title: string; content: string }).content}
                        </span>
                      </div>
                    </div>
                    <div style={styles.approvalActions}>
                      <button
                        style={styles.btnApprove}
                        onClick={() =>
                          addToolResult({
                            toolCallId: toolInvocation.toolCallId,
                            result: { approved: true },
                          })
                        }
                      >
                        ✅ Approve
                      </button>
                      <button
                        style={styles.btnDeny}
                        onClick={() =>
                          addToolResult({
                            toolCallId: toolInvocation.toolCallId,
                            result: { approved: false },
                          })
                        }
                      >
                        ❌ Deny
                      </button>
                    </div>
                  </div>
                );
              }

              if (toolInvocation.state === "result") {
                const result = toolInvocation.result as {
                  approved: boolean;
                  noteId?: number;
                  error?: string;
                };
                return (
                  <div key={toolInvocation.toolCallId} style={styles.toolResult}>
                    {result.approved ? (
                      <span>
                        ✅ Note saved{result.noteId ? ` (id: ${result.noteId})` : ""}
                      </span>
                    ) : (
                      <span>❌ Note creation denied</span>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}

        {isLoading && (
          <div style={{ ...styles.bubble, ...styles.bubbleAssistant }}>
            <span style={styles.roleLabel}>AI</span>
            <span style={styles.typing}>
              <span />
              <span />
              <span />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={styles.inputRow}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Send a message…"
          style={styles.input}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} style={styles.sendBtn}>
          Send
        </button>
      </form>

      <style>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
        .typing-dots span {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #888;
          margin: 0 2px;
          animation: blink 1.4s infinite both;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}

/* ── inline styles ─────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
    maxWidth: 760,
    margin: "0 auto",
    width: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 20px",
    borderBottom: "1px solid #222",
    background: "#141414",
    flexShrink: 0,
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
  },
  headerTitle: { fontWeight: 700, fontSize: 16 },
  headerBadge: {
    marginLeft: "auto",
    fontSize: 11,
    background: "#1e3a5f",
    color: "#60a5fa",
    padding: "2px 8px",
    borderRadius: 999,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: 0.5,
    marginTop: "20vh",
  },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 18, fontWeight: 600 },
  emptyHint: { fontSize: 13, color: "#aaa" },
  bubble: {
    maxWidth: "78%",
    padding: "10px 14px",
    borderRadius: 14,
    lineHeight: 1.55,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    background: "#1d4ed8",
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    alignSelf: "flex-start",
    background: "#1e1e1e",
    border: "1px solid #2d2d2d",
    borderBottomLeftRadius: 4,
  },
  roleLabel: {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: 4,
  },
  messageText: { fontSize: 14, whiteSpace: "pre-wrap" },
  approvalCard: {
    alignSelf: "flex-start",
    width: "min(420px, 100%)",
    background: "#1a1a2e",
    border: "1px solid #3b3b7a",
    borderRadius: 14,
    overflow: "hidden",
  },
  approvalHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    background: "#16213e",
    borderBottom: "1px solid #3b3b7a",
  },
  approvalIcon: { fontSize: 16 },
  approvalTitle: { fontWeight: 700, fontSize: 13, color: "#a5b4fc" },
  approvalBody: { padding: "12px 14px" },
  approvalDesc: { fontSize: 12, color: "#9ca3af", marginBottom: 8 },
  approvalPayload: {
    background: "#0f0f1a",
    border: "1px solid #2d2d5a",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    lineHeight: 1.7,
  },
  payloadLabel: { color: "#818cf8", fontWeight: 600 },
  payloadValue: { color: "#e2e8f0" },
  approvalActions: {
    display: "flex",
    gap: 8,
    padding: "10px 14px",
    borderTop: "1px solid #3b3b7a",
  },
  btnApprove: {
    flex: 1,
    padding: "8px 0",
    background: "#14532d",
    color: "#86efac",
    border: "1px solid #166534",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },
  btnDeny: {
    flex: 1,
    padding: "8px 0",
    background: "#450a0a",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },
  toolResult: {
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#9ca3af",
    padding: "6px 12px",
    background: "#1a1a1a",
    borderRadius: 8,
    border: "1px solid #2d2d2d",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "12px 16px",
    borderTop: "1px solid #222",
    background: "#141414",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "#1e1e1e",
    border: "1px solid #333",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#e8e8e8",
    fontSize: 14,
    outline: "none",
  },
  sendBtn: {
    padding: "10px 20px",
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  typing: {},
};

// Attach classname for typing animation
Object.assign(styles.typing, { className: "typing-dots" });
