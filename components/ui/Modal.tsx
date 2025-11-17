'use client'

import { ReactNode, MouseEvent, TouchEvent } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  backdropClassName?: string
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className = '',
  backdropClassName = '',
}: ModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleBackdropTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    // Store the touch target to check on touch end
    const target = event.target as HTMLElement
    if (target === event.currentTarget) {
      // Mark that we started touching the backdrop
      target.setAttribute('data-touching-backdrop', 'true')
    }
  }

  const handleBackdropTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const touchingBackdrop = target.getAttribute('data-touching-backdrop')

    if (touchingBackdrop === 'true' && target === event.currentTarget) {
      event.preventDefault()
      onClose()
      target.removeAttribute('data-touching-backdrop')
    }
  }

  return (
    <>
      <div
        className={`animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${backdropClassName}`}
        onClick={handleBackdropClick}
        onTouchStart={handleBackdropTouchStart}
        onTouchEnd={handleBackdropTouchEnd}
        role="presentation"
      >
        <div
          className={`animate-scale-in relative w-[85%] max-w-[90vw] overflow-hidden rounded-2xl border-white/20 bg-white/10 ${className}`}
          onClick={(event) => event.stopPropagation()}
          onTouchStart={(event) => {
            event.stopPropagation()
            // Clear any backdrop touch marker if user touches content
            const backdrop = event.currentTarget.parentElement
            if (backdrop) {
              backdrop.removeAttribute('data-touching-backdrop')
            }
          }}
          onTouchEnd={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
