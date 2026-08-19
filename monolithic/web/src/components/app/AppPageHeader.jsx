function AppPageHeader({ eyebrow, title, copy, action }) {
  return (
    <div className="app-page-header">
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        {copy && <span>{copy}</span>}
      </div>
      {action}
    </div>
  )
}

export default AppPageHeader
