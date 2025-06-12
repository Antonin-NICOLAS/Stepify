import { useRef, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import './Selector.css'

const Select = ({
  options,
  selected,
  className,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  maxHeight = 300,
  thirdField = null,
  customizeOption = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState('bottom')
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (isOpen && triggerRef.current && dropdownRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      const dropdownHeight = Math.min(
        maxHeight,
        options.length * 40, // Estimation de la hauteur des options
      )

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [isOpen, options.length, maxHeight])

  // Fermeture lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (triggerRef.current && !triggerRef.current.contains(event.target)) {
          setIsOpen(false)
        }
      }
    }

    // Fermeture lors du scroll
    const handleScroll = () => {
      if (!dropdownRef.current) return

      const dropdownRect = dropdownRef.current.getBoundingClientRect()
      const isOutsideViewport = dropdownRect.bottom > window.innerHeight

      if (isOutsideViewport) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      const focusedOption = document.activeElement
      const options = dropdownRef.current?.querySelectorAll('.dropdown-option')

      if (!options || options.length === 0) return

      switch (e.key) {
        case 'Escape':
          setIsOpen(false)
          triggerRef.current?.focus()
          break
        case 'ArrowDown':
          e.preventDefault()
          if (focusedOption && focusedOption.nextElementSibling) {
            focusedOption.nextElementSibling.focus()
          } else {
            options[0].focus()
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (focusedOption && focusedOption.previousElementSibling) {
            focusedOption.previousElementSibling.focus()
          } else {
            options[options.length - 1].focus()
          }
          break
        case 'Enter':
          if (focusedOption?.classList.contains('dropdown-option')) {
            focusedOption.click()
          }
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (value) => {
    setIsOpen(false)
    onChange(value)
  }

  const selectedOption = options.find((option) => option.value === selected)

  return (
    <div
      className={`select-container ${disabled ? 'disabled' : ''} ${className}`}
    >
      <div
        ref={triggerRef}
        className="select-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        <span className="selected-value">
          {thirdField && thirdField(selectedOption?.code)}
          {customizeOption
            ? selected || selectedOption?.label || placeholder
            : selectedOption?.label || placeholder}
        </span>
        {isOpen ? (
          <ChevronUp size={16} className="chevron-icon" />
        ) : (
          <ChevronDown size={16} className="chevron-icon" />
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`select-dropdown ${dropdownPosition}`}
          role="listbox"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {options.map((option) => (
            <div
              key={option.code}
              className={`dropdown-option ${
                option.value === selected ? 'selected' : ''
              }`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={option.value === selected}
              tabIndex={0}
            >
              {thirdField && thirdField(option.code)}
              {option.label}
              {option.value === selected && (
                <Check size={16} className="check-icon" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Select
