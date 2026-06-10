export interface Comment {
  id: string;
  parentId: string | null;
  body: string;
  createdAt: number;
}

// In-memory store — persists for the lifetime of the server process
const comments: Comment[] = [
  {
    id: "1",
    parentId: null,
    body: "Welcome to the comment thread!",
    createdAt: Date.now() - 10000,
  },
  {
    id: "2",
    parentId: "1",
    body: "Thanks! Happy to be here.",
    createdAt: Date.now() - 8000,
  },
  {
    id: "3",
    parentId: "2",
    body: "Same here — love the nested replies.",
    createdAt: Date.now() - 6000,
  },
];

let nextId = 4;

export function getComments(): Comment[] {
  return comments;
}

export function createComment(
  parentId: string | null,
  body: string
): Comment {
  const comment: Comment = {
    id: String(nextId++),
    parentId,
    body,
    createdAt: Date.now(),
  };
  comments.push(comment);
  return comment;
}
