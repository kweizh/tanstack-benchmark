import { createAPIFileRoute } from '@tanstack/start/api'
import { streamText, convertToCoreMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import Database from 'better-sqlite3'

export const APIRoute = createAPIFileRoute('/api/chat')({
  POST: async ({ request }) => {
    const { messages } = await request.json()
    const coreMessages = convertToCoreMessages(messages)

    // Check if the last message is a tool result for createNote
    const lastMessage = coreMessages[coreMessages.length - 1]
    if (lastMessage && lastMessage.role === 'tool') {
      const prevMessage = coreMessages[coreMessages.length - 2]
      if (prevMessage && prevMessage.role === 'assistant' && typeof prevMessage.content !== 'string') {
        for (const toolResult of lastMessage.content) {
          if (toolResult.type === 'tool-result' && toolResult.toolName === 'createNote' && toolResult.result === 'Approved') {
            const toolCall = prevMessage.content.find((c: any) => c.type === 'tool-call' && c.toolCallId === toolResult.toolCallId)
            if (toolCall && toolCall.type === 'tool-call') {
              const args = toolCall.args as any;
              
              // Execute DB write
              const db = new Database('notes.db')
              db.exec('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT)')
              const stmt = db.prepare('INSERT INTO notes (content) VALUES (?)')
              stmt.run(args.content)
              db.close()
              
              // Update the result so the LLM knows it succeeded
              toolResult.result = 'Note successfully inserted into database.'
            }
          }
        }
      }
    }

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: coreMessages,
      tools: {
        createNote: {
          description: 'Create a new note in the database',
          parameters: z.object({
            content: z.string().describe('The content of the note'),
          }),
        },
      },
    })

    return result.toDataStreamResponse()
  },
})
