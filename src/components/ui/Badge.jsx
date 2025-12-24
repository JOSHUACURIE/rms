// src/components/ui/Badge.jsx
import React from 'react';
import './Badge.css';

/**
 * Badge Component
 * @param {string} children - Text to display inside the badge
 * @param {string} variant - One of: 'primary', 'success', 'warning', 'error', 'info',
 *                           'principal', 'teacher', 'dos', 'neutral'
 * @param {string} size - 'sm' | 'md' | 'lg' (default: 'md')
 * @param {string} className - Additional custom classes
 * @param {boolean} pill - Make badge pill-shaped
 * @param {boolean} outline - Outline style badge
 * @param {boolean} dot - Show dot before text
 * @param {boolean} clickable - Make badge clickable
 * @param {function} onClick - Click handler
 * @param {string} icon - Optional icon (emoji or character)
 * @param {boolean} closeable - Show close button
 * @param {function} onClose - Close handler
 * @param {boolean} loading - Show loading state
 * @param {string} tooltip - Tooltip text
 * @param {string} count - Display as count badge (overrides children)
 */
const Badge = ({ 
  children, 
  variant = 'neutral', 
  size = 'md', 
  className = '',
  pill = false,
  outline = false,
  dot = false,
  clickable = false,
  onClick,
  icon,
  closeable = false,
  onClose,
  loading = false,
  tooltip,
  count
}) => {
  const baseClass = 'badge';
  const variantClass = `badge--${variant}`;
  const sizeClass = `badge--${size}`;
  
  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    pill && 'badge-pill',
    outline && 'badge-outline',
    dot && 'badge-dot',
    clickable && 'badge-clickable',
    icon && 'badge-with-icon',
    closeable && 'badge-closeable',
    loading && 'badge-loading',
    count && 'badge-count',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (clickable && onClick) {
      onClick(e);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (onClose) {
      onClose(e);
    }
  };

  const content = count ? count : children;

  return (
    <span 
      className={classes}
      onClick={handleClick}
      data-tooltip={tooltip}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {loading && <span className="badge-loading"></span>}
      {!loading && (
        <>
          {icon && <span className="badge-icon">{icon}</span>}
          {content}
          {closeable && (
            <button 
              className="badge-close"
              onClick={handleClose}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
          )}
        </>
      )}
    </span>
  );
};

export default Badge;