import { useEffect, useRef, useState } from "react";
import "./SiteMenu.css";

interface Project {
  link: string;
  title: string;
  favicon: string;
}

const PROJECTS: Project[] = [
  { link: "https://crystalprism.io/", title: "Home", favicon: "https://crystalprism.io/favicon.ico" },
  { link: "https://crystalprism.io/timespace/", title: "Timespace", favicon: "https://crystalprism.io/timespace/favicon.ico" },
  { link: "https://crystalprism.io/shapes-in-rain/", title: "Shapes in Rain", favicon: "https://crystalprism.io/shapes-in-rain/favicon.ico" },
  { link: "https://crystalprism.io/rhythm-of-life/", title: "Rhythm of Life", favicon: "https://crystalprism.io/rhythm-of-life/favicon.ico" },
  { link: "https://crystalprism.io/canvashare/", title: "CanvaShare", favicon: "https://crystalprism.io/canvashare/favicon.ico" },
  { link: "https://crystalprism.io/thought-writer/", title: "Thought Writer", favicon: "https://crystalprism.io/thought-writer/favicon.ico" },
  { link: "https://crystalprism.io/vicarious/", title: "Vicarious", favicon: "https://crystalprism.io/vicarious/favicon.ico" },
  { link: "https://hn-stats.crystalprism.io/", title: "Hacker News Stats", favicon: "https://hn-stats.crystalprism.io/favicon.ico" },
  { link: "https://pause.crystalprism.io/", title: "Pause", favicon: "https://pause.crystalprism.io/favicon.ico" },
  { link: "https://marian.crystalprism.io/", title: "Marian", favicon: "https://marian.crystalprism.io/favicon.ico" },
  { link: "https://vroom.crystalprism.io/", title: "Vroom", favicon: "https://vroom.crystalprism.io/favicon.ico" },
  { link: "https://crystalprism.io/user/sign-in/", title: "Account", favicon: "https://crystalprism.io/favicon.ico" },
];

const CLOSED_ICON = "https://crystalprism.io/images/site-menu-icon-shadow.svg";
const OPENED_ICON = "https://crystalprism.io/images/site-menu-icon.svg";

// Page header with the Crystal Prism site navigation menu.
export default function SiteMenu() {
  const [open, setOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // While open, close the menu when the user clicks outside of it.
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (nodeRef.current?.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClick, false);
    return () => document.removeEventListener("mousedown", handleClick, false);
  }, [open]);

  return (
    <div className="site-menu-container" ref={nodeRef}>
      <div className="site-menu-inner-container">
        <div className="site-menu-icon-container">
          <button
            className="site-menu-toggle"
            title="Toggle site menu"
            aria-label={open ? "Close site menu" : "Open site menu"}
            aria-expanded={open}
            type="button"
            onClick={() => setOpen((isOpen) => !isOpen)}
          >
            <img
              className="site-menu-icon"
              alt=""
              src={open ? OPENED_ICON : CLOSED_ICON}
            />
          </button>
        </div>

        <table
          className={"site-menu " + (open ? "opened" : "closed")}
        >
          <tbody>
            <tr className="site-menu-spacer-row"></tr>

            {PROJECTS.map((project) => (
              <tr
                key={project.title}
                className="site-menu-row"
                onClick={() => {
                  window.location.href = project.link;
                }}
              >
                <td className="site-menu-image-cell">
                  <img
                    className="site-menu-image"
                    alt={project.title + " icon"}
                    title={project.title}
                    src={project.favicon}
                  />
                </td>

                <td className="site-menu-text-cell">
                  <div className="site-menu-text" title={project.title}>
                    {project.title}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
