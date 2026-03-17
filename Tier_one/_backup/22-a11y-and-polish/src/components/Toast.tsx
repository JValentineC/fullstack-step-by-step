import { useEffect } from 'react'

export interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error'
}

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: number) => void
}

function Toast({ toasts, onDismiss }: ToastProps) {
  const successToasts = toasts.filter((t) => t.type === 'success')
  const errorToasts = toasts.filter((t) => t.type === 'error')

  return (
    <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
      {/* Success toasts: polite — announced after current speech */}
      <div role="status" aria-live="polite">
        {successToasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
      {/* Error toasts: assertive — interrupt current speech */}
      <div role="alert" aria-live="assertive">
        {errorToasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        borderRadius: '4px',
        background: toast.type === 'success' ? '#2e7d32' : '#c62828',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        minWidth: '250px',
      }}
    >
      <span>{toast.text}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

export default Toast
