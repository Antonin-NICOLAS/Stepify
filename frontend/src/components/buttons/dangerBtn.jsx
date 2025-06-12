import './dangerBtn.css'

const DangerBtn = ({
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
    className="auth-button danger-btn"
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

export default DangerBtn
