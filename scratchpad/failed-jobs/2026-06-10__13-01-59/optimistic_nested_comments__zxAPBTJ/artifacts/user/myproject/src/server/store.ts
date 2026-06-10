import type { Comment } from '../types'

// In-memory comment store (survives between HTTP requests for lifetime of server process)
const comments: Comment[] = []
let nextId = 1

export function getAllComments(): Comment[] {
  return [...comments]
}

export function createComment(body: string, parentId: string | null): Comment {
  const comment: Comment = {
    id: String(nextId++),
    parentId,
    body,
    createdAt: Date.now(),
  }
  comments.push(comment)
  return comment
}
