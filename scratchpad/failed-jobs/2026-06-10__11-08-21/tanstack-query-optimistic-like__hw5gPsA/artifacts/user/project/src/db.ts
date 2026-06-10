export interface Post {
  id: string
  title: string
  likes: number
}

export const posts: Post[] = [
  { id: '1', title: 'Test Post', likes: 0 }
]
