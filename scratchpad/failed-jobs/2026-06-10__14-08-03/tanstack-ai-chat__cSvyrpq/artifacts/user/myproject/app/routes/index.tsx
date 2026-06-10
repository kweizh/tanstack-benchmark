import { createFileRoute } from '@tanstack/react-router'
import { useChat } from 'ai/react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } = useChat({
    api: '/api/chat',
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>AI Chat</h1>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '400px', overflowY: 'scroll', marginBottom: '10px' }}>
        {messages.map(m => (
          <div key={m.id} style={{ marginBottom: '10px' }}>
            <strong>{m.role === 'user' ? 'User' : 'AI'}:</strong>
            <p>{m.content}</p>
            {m.toolInvocations?.map(toolInvocation => {
              const toolCallId = toolInvocation.toolCallId;
              
              if (toolInvocation.toolName === 'createNote') {
                if ('result' in toolInvocation) {
                  return (
                    <div key={toolCallId} style={{ color: 'green' }}>
                      Note created!
                    </div>
                  );
                } else {
                  return (
                    <div key={toolCallId} style={{ border: '1px solid orange', padding: '10px' }}>
                      <p>AI wants to create a note with content: {JSON.stringify(toolInvocation.args.content)}</p>
                      <button onClick={() => addToolResult({ toolCallId, result: 'Approved' })}>
                        Approve
                      </button>
                      <button onClick={() => addToolResult({ toolCallId, result: 'Denied' })}>
                        Deny
                      </button>
                    </div>
                  );
                }
              }
              return null;
            })}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Say something..."
          style={{ width: '80%', padding: '10px' }}
        />
        <button type="submit" style={{ width: '18%', padding: '10px' }}>Send</button>
      </form>
    </div>
  )
}
