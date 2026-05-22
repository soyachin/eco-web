import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface NavLink {
  label: string
  href: string
}

interface Options {
  links: NavLink[]
}

const defaultOptions: Options = {
  links: [],
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const NavLinks: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    if (opts.links.length === 0) {
      return null
    }

    return (
      <nav class={displayClass}>
        <ul class="nav-links">
          {opts.links.map((link) => (
            <li>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  NavLinks.css = `
    .nav-links {
      display: flex;
      gap: 1.5rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-links a {
      text-decoration: none;
      color: var(--secondary);
      font-weight: 500;
    }

    .nav-links a:hover {
      color: var(--tertiary);
      text-decoration: underline;
    }
  `

  return NavLinks
}) satisfies QuartzComponentConstructor
