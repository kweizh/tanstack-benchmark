import { chat, toServerSentEventsResponse, toolDefinition } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'
import { insertNote } from '../../server/db'
import { createFileRoute } from '@tanstack/react-router'

const createNoteDef = toolDefinition({
  name: 'createNote',
  description:
    'Create a new note in the local database. Use this when the user asks to save or write down something as a note.',
  inputSchema: z.object({
    title: z.string().describe('The title of the note'),
    content: z.string().describe('The content/body of the note'),
  }),
  outputSchema: z.object({
    id: z.number(),
    title: z.string(),
    content: z.string(),
    created_at: z.string(),
  }),
  needsApproval: true,
})

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const messages = body.messages || []

          const createNoteServer = createNoteDef.server(
            async ({ title, content }) => {
              const note = insertNote(title, content)
              return {
                id: note.id,
                title: note.title,
                content: note.content,
                created_at: note.created_at,
              }
            }
          )

          const stream = chat({
            adapter: openaiText('gpt-4.1-mini'),
            messages,
            tools: [createNoteServer],
            system:
              'You are a helpful AI assistant with the ability to create notes. ' +
              'When a user asks you to save or write down something, use the createNote tool. ' +
              'The tool requires user approval before executing, so inform the user that you will ' +
              'request their permission before creating the note.',
          })

          return toServerSentEventsResponse(stream)
        } catch (error) {
          console.error('Chat error:', error)
          return new Response(
            JSON.stringify({
              error:
                error instanceof Error ? error.message : 'An error occurred',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },
    },
  },
})
