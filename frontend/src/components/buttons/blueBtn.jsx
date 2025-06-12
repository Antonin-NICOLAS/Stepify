import './blueBtn.css'

const BlueBtn = ({
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
    className="button blue-btn"
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

export default BlueBtn
