// In-memory comment store - persists for the lifetime of the server process

export interface Comment {
  id: string
  parentId: string | null
  body: string
  createdAt: number
}

const comments: Comment[] = []
let nextId = 1

export function getComments(): Comment[] {
  return comments
}

export function createComment(parentId: string | null, body: string): Comment {
  const comment: Comment = {
    id: String(nextId++),
    parentId,
    body,
    createdAt: Date.now(),
  }
  comments.push(comment)
  return comment
}