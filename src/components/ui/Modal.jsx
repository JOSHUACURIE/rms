// src/components/ui/Modal.jsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

/**
 * Modal Component
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Called when modal is closed
 * @param {string} title - Modal title (optional)
 * @param {React.ReactNode} children - Modal content
 * @param {React.ReactNode} footer - Optional footer (e.g., action buttons)
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @param {string} variant - 'default' | 'danger' | 'success' | 'warning' (default: 'default')
 * @param {boolean} closeOnOverlayClick - Close when clicking outside content (default: true)
 * @param {boolean} showCloseButton - Show close button (default: true)
 * @param {boolean} loading - Show loading state
 * @param {string} className - Additional custom classes
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  showCloseButton = true,
  loading = false,
  className = ''
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
      setIsExiting(false);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 200);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      handleClose();
    }
  };

  if (!isOpen && !isExiting) return null;

  const variantClass = variant !== 'default' ? `modal-content--${variant}` : '';
  const exitingClass = isExiting ? 'modal-exiting' : '';

  return ReactDOM.createPortal(
    <div 
      className={`modal-overlay ${exitingClass}`} 
      onClick={handleOverlayClick} 
      role="dialog" 
      aria-modal="true"
    >
      <div className={`modal-content modal-content--${size} ${variantClass} ${className} ${exitingClass}`}>
        {(title || (showCloseButton && onClose)) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && onClose && (
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleClose}
                aria-label="Close modal"
                disabled={loading}
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <div className="modal-loading-spinner"></div>
              <div className="modal-loading-text">Loading...</div>
            </div>
          ) : (
            children
          )}
        </div>
        
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;