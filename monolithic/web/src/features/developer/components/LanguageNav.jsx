import { NavLink } from 'react-router-dom'

const languages = [
  ['node', 'Node.js'],
  ['java', 'Java'],
  ['go', 'Go'],
  ['python', 'Python'],
  ['rust', 'Rust'],
  ['curl', 'cURL'],
]

function LanguageNav() {
  return (
    <nav className="language-nav" aria-label="REST language examples">
      {languages.map(([value, label]) => (
        <NavLink key={value} to={`/developer/examples/${value}`}>{label}</NavLink>
      ))}
    </nav>
  )
}

export default LanguageNav
