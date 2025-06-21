import './DefaultHeader.css'
function DefaultHeader({ title, icon, description }) {
  return (
    <div className="default-header">
      <h1>{title}</h1>
      <p>
        {icon && icon}
        {icon && ' '}
        {description}
      </p>
    </div>
  )
}

export default DefaultHeader
