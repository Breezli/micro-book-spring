import type { Book } from '../types'

interface Props {
  book: Book
  onDelete: (id: number) => void
}

export default function BookCard({ book, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5
      hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-lg mb-2">{book.title}</h4>
      <p className="text-sm text-gray-500">作者：{book.author}</p>
      <p className="text-sm text-gray-500">ISBN：{book.isbn || '-'}</p>
      <p className="text-sm text-gray-500 mb-2">
        价格：¥{book.price ? Number(book.price).toFixed(2) : '0.00'}
      </p>
      {book.description && (
        <p className="text-sm text-gray-600 mb-4">{book.description}</p>
      )}
      <button onClick={() => onDelete(book.id)}
        className="text-sm text-red-500 hover:text-red-700">
        删除
      </button>
    </div>
  )
}
