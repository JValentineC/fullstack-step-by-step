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
  return (
    <div role="status" aria-live="polite" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
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
