import { createFileRoute } from '@tanstack/react-router'
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: ChatPage,
})

function ChatPage() {
  const { messages, sendMessage, isLoading, addToolApprovalResponse, error } =
    useChat({
      connection: fetchServerSentEvents('/api/chat'),
    })

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>TanStack AI Chat</h1>
        <p style={styles.subtitle}>
          Ask me to create a note and I'll request your approval.
        </p>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((message) => (
          <div key={message.id}>
            {message.parts.map((part, idx) => {
              // Render text content
              if (part.type === 'text') {
                return (
                  <div
                    key={`${message.id}-text-${idx}`}
                    style={{
                      ...styles.message,
                      ...(message.role === 'user'
                        ? styles.userMessage
                        : styles.assistantMessage),
                    }}
                  >
                    <div style={styles.messageRole}>
                      {message.role === 'user' ? 'You' : 'AI'}
                    </div>
                    <div style={styles.messageContent}>{part.text}</div>
                  </div>
                )
              }

              // Render tool approval request
              if (
                part.type === 'tool-call' &&
                part.state === 'approval-requested' &&
                part.approval
              ) {
                return (
                  <div
                    key={`${message.id}-approval-${idx}`}
                    style={styles.approvalCard}
                  >
                    <div style={styles.approvalHeader}>
                      ⚠️ Tool Approval Required
                    </div>
                    <div style={styles.approvalToolName}>
                      <strong>Tool:</strong> {part.name}
                    </div>
                    {part.input && (
                      <div style={styles.approvalInput}>
                        <strong>Arguments:</strong>
                        <pre style={styles.approvalPre}>
                          {JSON.stringify(part.input, null, 2)}
                        </pre>
                      </div>
                    )}
                    <div style={styles.approvalButtons}>
                      <button
                        style={styles.approveButton}
                        onClick={() =>
                          addToolApprovalResponse({
                            id: part.approval!.id,
                            approved: true,
                          })
                        }
                      >
                        ✅ Approve
                      </button>
                      <button
                        style={styles.denyButton}
                        onClick={() =>
                          addToolApprovalResponse({
                            id: part.approval!.id,
                            approved: false,
                          })
                        }
                      >
                        ❌ Deny
                      </button>
                    </div>
                  </div>
                )
              }

              // Render tool result
              if (part.type === 'tool-result') {
                return (
                  <div
                    key={`${message.id}-tool-result-${idx}`}
                    style={styles.toolResult}
                  >
                    <div style={styles.toolResultHeader}>
                      🔧 Tool Result: {part.toolName}
                    </div>
                    <pre style={styles.toolResultPre}>
                      {JSON.stringify(part.result, null, 2)}
                    </pre>
                  </div>
                )
              }

              return null
            })}
          </div>
        ))}

        {isLoading && (
          <div style={styles.typingIndicator}>
            <div style={styles.typingDot} />
            <div style={{ ...styles.typingDot, animationDelay: '0.2s' }} />
            <div style={{ ...styles.typingDot, animationDelay: '0.4s' }} />
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            Error: {error.message || 'Something went wrong'}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message... (e.g., 'Create a note about my meeting')"
          style={styles.input}
          disabled={isLoading}
        />
        <button
          type="submit"
          style={{
            ...styles.sendButton,
            ...(isLoading ? styles.sendButtonDisabled : {}),
          }}
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 16px',
  },
  header: {
    padding: '20px 0 10px',
    borderBottom: '1px solid #e0e0e0',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#1a1a2e',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  message: {
    padding: '10px 14px',
    borderRadius: '12px',
    maxWidth: '80%',
    lineHeight: 1.5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0070f3',
    color: '#fff',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    color: '#1a1a2e',
  },
  messageRole: {
    fontSize: '11px',
    fontWeight: 600,
    marginBottom: '4px',
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  messageContent: {
    fontSize: '15px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  approvalCard: {
    alignSelf: 'center',
    backgroundColor: '#fff8e1',
    border: '2px solid #ffc107',
    borderRadius: '12px',
    padding: '16px',
    maxWidth: '90%',
    width: '100%',
    boxSizing: 'border-box',
  },
  approvalHeader: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#e65100',
    marginBottom: '8px',
  },
  approvalToolName: {
    fontSize: '14px',
    marginBottom: '8px',
  },
  approvalInput: {
    fontSize: '13px',
    marginBottom: '12px',
  },
  approvalPre: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '12px',
    overflowX: 'auto',
    margin: '4px 0 0',
  },
  approvalButtons: {
    display: 'flex',
    gap: '8px',
  },
  approveButton: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  denyButton: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  toolResult: {
    alignSelf: 'center',
    backgroundColor: '#e8f5e9',
    border: '1px solid #4caf50',
    borderRadius: '8px',
    padding: '10px 14px',
    maxWidth: '90%',
    width: '100%',
    boxSizing: 'border-box',
  },
  toolResultHeader: {
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '4px',
    color: '#2e7d32',
  },
  toolResultPre: {
    fontSize: '12px',
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    display: 'flex',
    gap: '4px',
    padding: '10px 14px',
    backgroundColor: '#f0f0f0',
    borderRadius: '12px',
  },
  typingDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#999',
    borderRadius: '50%',
    animation: 'pulse 1.4s infinite',
  },
  errorMessage: {
    alignSelf: 'center',
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    padding: '12px 0',
    borderTop: '1px solid #e0e0e0',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    outline: 'none',
  },
  sendButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 600,
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}
