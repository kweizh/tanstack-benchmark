import { useState } from 'react'

interface CommentFormProps {
  onSubmit: (body: string) => Promise<void>
  placeholder: string
  label: string
}

export function CommentForm({
  onSubmit,
  placeholder,
  label,
}: CommentFormProps) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return

    setSubmitting(true)
    try {
      await onSubmit(trimmed)
      setBody('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={2}
        style={{
          padding: '0.5rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '0.9rem',
          fontFamily: 'sans-serif',
          resize: 'vertical',
        }}
      />
      <button
        type="submit"
        disabled={submitting || !body.trim()}
        style={{
          alignSelf: 'flex-start',
          padding: '0.4rem 1rem',
          background: submitting || !body.trim() ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: submitting || !body.trim() ? 'not-allowed' : 'pointer',
          fontSize: '0.85rem',
        }}
      >
        {submitting ? 'Posting...' : label}
      </button>
    </form>
  )
}
