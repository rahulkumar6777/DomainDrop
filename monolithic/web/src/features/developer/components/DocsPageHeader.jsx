function DocsPageHeader({ eyebrow, title, copy }) {
  return (
    <header className="docs-page-header">
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <span>{copy}</span>
    </header>
  )
}

export default DocsPageHeader
