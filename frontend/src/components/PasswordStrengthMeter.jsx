import { useState, useEffect } from 'react'
import { Shield, Check, X, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './PasswordStrengthMeter.css'

const PasswordStrengthMeter = ({
  password,
  onStrengthChange,
  showRequirements = true,
  showScore = true,
  className = '',
  ...props
}) => {
  const { t } = useTranslation()
  const [strength, setStrength] = useState({
    score: 0,
    level: 'very-weak',
    requirements: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
      sequential: true, // true means no sequential characters
    },
  })

  const halfFillRanges = [
    { min: 5, max: 15, segment: 1 },
    { min: 25, max: 35, segment: 2 },
    { min: 45, max: 55, segment: 3 },
    { min: 65, max: 75, segment: 4 },
    { min: 85, max: 95, segment: 5 },
  ]

  const isHalfFilled = (segment, score) => {
    const range = halfFillRanges.find((r) => r.segment === segment)
    return range && score >= range.min && score <= range.max
  }

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) {
      return {
        score: 0,
        level: 'very-weak',
        requirements: {
          length: false,
          lowercase: false,
          uppercase: false,
          number: false,
          special: false,
          sequential: true,
        },
      }
    }

    const requirements = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^a-zA-Z0-9]/.test(pwd),
      sequential:
        !/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
          pwd,
        ),
    }

    let score = 0
    let bonusPoints = 0

    // Base requirements (15 points each)
    if (requirements.length) score += 15
    if (requirements.lowercase) score += 15
    if (requirements.uppercase) score += 15
    if (requirements.number) score += 15
    if (requirements.special) score += 15

    // Bonus points for additional security
    if (pwd.length >= 12) bonusPoints += 10
    if (pwd.length >= 16) bonusPoints += 5
    if (requirements.sequential) bonusPoints += 5
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) bonusPoints += 5

    // Penalty for common patterns
    if (/(password|123456|qwerty|abc123|admin|user)/i.test(pwd)) {
      score -= 20
    }

    score = Math.min(score + bonusPoints, 100)
    score = Math.max(score, 0)

    let level = 'very-weak'
    if (score >= 85) level = 'very-strong'
    else if (score >= 70) level = 'strong'
    else if (score >= 50) level = 'medium'
    else if (score >= 25) level = 'weak'

    return {
      score,
      level,
      requirements,
    }
  }

  useEffect(() => {
    const newStrength = calculatePasswordStrength(password)
    setStrength(newStrength)
    if (onStrengthChange) {
      onStrengthChange(newStrength)
    }
  }, [password, onStrengthChange])

  const getStrengthConfig = () => {
    const configs = {
      'very-weak': {
        color: '#ef4444',
        text: t('account.password.very-low'),
        icon: X,
        gradient: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
      },
      weak: {
        color: '#f97316',
        text: t('account.password.low'),
        icon: AlertCircle,
        gradient: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
      },
      medium: {
        color: '#eab308',
        text: t('account.password.medium'),
        icon: Shield,
        gradient: 'linear-gradient(90deg, #eab308 0%, #fbbf24)',
      },
      strong: {
        color: '#22c55e',
        text: t('account.password.strong'),
        icon: Shield,
        gradient: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)',
      },
      'very-strong': {
        color: '#10b981',
        text: t('account.password.very-strong'),
        icon: Check,
        gradient: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
      },
    }
    return configs[strength.level]
  }

  const config = getStrengthConfig()
  const IconComponent = config.icon

  if (!password) return null

  return (
    <div className={`password-strength-meter ${className}`} {...props}>
      {/* Main strength indicator */}
      <div className="strength-header">
        <div className="strength-info">
          <IconComponent size={16} style={{ color: config.color }} />
          <span className="strength-text" style={{ color: config.color }}>
            {config.text}
          </span>
          {showScore && (
            <span className="strength-score" style={{ color: config.color }}>
              {strength.score}%
            </span>
          )}
        </div>
      </div>

      {/* Visual strength bars */}
      <div className="strength-bars">
        {[1, 2, 3, 4, 5].map((segment) => {
          const isFull = strength.score >= segment * 20
          const isHalf = isHalfFilled(segment, strength.score)

          return (
            <div
              key={segment}
              className={`strength-segment ${
                isFull ? 'full' : isHalf ? 'half' : ''
              }`}
              style={{
                background: isHalf
                  ? `linear-gradient(to right, ${config.color} 50%, #e5e7eb 50%)`
                  : isFull
                    ? config.gradient
                    : '#e5e7eb',
              }}
            />
          )
        })}
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="requirements-list">
          <div
            className={`requirement ${
              strength.requirements.length ? 'met' : ''
            }`}
          >
            {strength.requirements.length ? (
              <Check size={14} />
            ) : (
              <X size={14} />
            )}
            <span>{t('account.password.criterias.len')}</span>
          </div>

          <div
            className={`requirement ${
              strength.requirements.lowercase ? 'met' : ''
            }`}
          >
            {strength.requirements.lowercase ? (
              <Check size={14} />
            ) : (
              <X size={14} />
            )}
            <span>{t('account.password.criterias.lowercase')}</span>
          </div>

          <div
            className={`requirement ${
              strength.requirements.uppercase ? 'met' : ''
            }`}
          >
            {strength.requirements.uppercase ? (
              <Check size={14} />
            ) : (
              <X size={14} />
            )}
            <span>{t('account.password.criterias.uppercase')}</span>
          </div>

          <div
            className={`requirement ${
              strength.requirements.number ? 'met' : ''
            }`}
          >
            {strength.requirements.number ? (
              <Check size={14} />
            ) : (
              <X size={14} />
            )}
            <span>{t('account.password.criterias.number')}</span>
          </div>

          <div
            className={`requirement ${
              strength.requirements.special ? 'met' : ''
            }`}
          >
            {strength.requirements.special ? (
              <Check size={14} />
            ) : (
              <X size={14} />
            )}
            <span>{t('account.password.criterias.special')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PasswordStrengthMeter
