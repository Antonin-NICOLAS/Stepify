import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import './Modal.css'

const Modal = ({ isOpen, Close, children, title }) => {
  const ModalRef = useRef(null)

  // Gestion du focus pour l'accessibilité
  useEffect(() => {
    const modalElement = ModalRef.current
    if (modalElement) {
      const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (firstElement) firstElement.focus()

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }

      modalElement.addEventListener('keydown', handleTabKey)
      return () => modalElement.removeEventListener('keydown', handleTabKey)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') Close()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // Empêche le défilement de la page
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [Close, isOpen])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) Close()
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      ref={ModalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title}
      data-state={isOpen ? 'open' : 'closed'}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="close-button"
            onClick={() => Close()}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}

export default Modal
