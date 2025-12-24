// src/components/ui/Select.jsx
import React from 'react';
import './Select.css';

/**
 * Select Component
 * @param {string} label - Label text for the select input
 * @param {string} name - Input name and id
 * @param {string|number} value - Current value
 * @param {function} onChange - Change event handler
 * @param {string} error - Error message to display
 * @param {boolean} required - Marks field as required
 * @param {boolean} disabled - Disables the select
 * @param {string} placeholder - Placeholder text for empty value
 * @param {string} size - 'sm' | 'md' | 'lg' (default: 'md')
 * @param {string} variant - 'default' | 'success' | 'warning' | 'error' (default: 'default')
 * @param {string} icon - Optional icon (emoji or character)
 * @param {boolean} clearable - Show clear button
 * @param {function} onClear - Called when clear button is clicked
 * @param {React.ReactNode} children - Option elements
 */
const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required, 
  disabled = false,
  placeholder = 'Select an option',
  size = 'md',
  variant = 'default',
  icon,
  clearable = false,
  onClear,
  children 
}) => {
  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { name, value: '' } });
    }
  };

  const getVariantClass = () => {
    if (error) return 'form-group--error';
    if (variant !== 'default') return `form-group--${variant}`;
    return '';
  };

  const getSizeClass = () => {
    if (size !== 'md') return `select-${size}`;
    return '';
  };

  const hasIcon = icon ? 'select-with-icon' : '';

  return (
    <div className={`form-group ${getVariantClass()} ${getSizeClass()} ${hasIcon}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}

      <div className="select-wrapper">
        {icon && <span className="select-icon">{icon}</span>}
        
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`form-select ${error ? 'input-error' : ''}`}
          required={required}
          disabled={disabled}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children}
        </select>

        {clearable && value && !disabled && (
          <button
            type="button"
            className="select-clear"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default Select;