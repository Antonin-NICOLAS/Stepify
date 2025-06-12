import './secondaryBtn.css'

const SecondaryBtn = ({
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
    className="auth-button auth-button-secondary"
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

export default SecondaryBtn
