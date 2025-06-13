import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import './InputField.css'

const InputField = ({
  id,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  tabIndex,
  autoFocus = false,
  icon: Icon,
  disabled = false,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
  const { t } = useTranslation()

  return (
    <div className={`input-field-wrapper ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {Icon && <Icon size={16} />}
          <span>{label}</span>
        </label>
      )}

      <div
        className={`input-container ${error ? 'has-error' : ''} ${
          disabled ? 'disabled' : ''
        }`}
      >
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          tabIndex={tabIndex}
          autoFocus={autoFocus}
          disabled={disabled}
          className="input-field"
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            disabled={disabled}
            aria-label={
              showPassword
                ? t('auth.resetpassword.form.hidepassword')
                : t('auth.resetpassword.form.showpassword')
            }
            title={
              showPassword
                ? t('auth.resetpassword.form.hidepassword')
                : t('auth.resetpassword.form.showpassword')
            }
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <div className="input-error">{error}</div>}

      {helperText && !error && <div className="input-helper">{helperText}</div>}
    </div>
  )
}

export default InputField
