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
    <div className="toast toast-end toast-top z-50">
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
    <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg mb-2`}>
      <span>{toast.text}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="btn btn-ghost btn-xs"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

export default Toast
