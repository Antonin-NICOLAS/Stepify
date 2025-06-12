import './primaryBtn.css'

const PrimaryButton = ({
  onClick,
  disabled,
  type,
  ariaLabel,
  title,
  style,
  icon: Icon,
  children,
}) => (
  <button
    className="auth-button auth-button-primary"
    onClick={onClick}
    disabled={disabled}
    type={type}
    aria-label={ariaLabel}
    title={title}
    style={style}
  >
    {Icon && <Icon size={16} />}
    {children}
  </button>
)

export default PrimaryButton
