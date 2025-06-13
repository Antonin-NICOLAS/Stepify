import './SendBtn.css'

const SendBtn = ({
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
    className="button send-btn"
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

export default SendBtn
