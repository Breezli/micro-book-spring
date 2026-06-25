export interface Book {
  id: number
  title: string
  author: string
  isbn?: string
  description?: string
  price?: number
  createdAt?: string
}

export interface LoginResponse {
  token: string
  userId: number
  username: string
  role: string
}

export interface BookListResponse {
  books: Book[]
  total: number
}
