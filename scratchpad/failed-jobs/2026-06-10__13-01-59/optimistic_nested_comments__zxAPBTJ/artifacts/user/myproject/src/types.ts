export interface Comment {
  id: string;
  parentId: string | null;
  body: string;
  createdAt: number;
}

export interface CreateCommentRequest {
  parentId: string | null;
  body: string;
}
