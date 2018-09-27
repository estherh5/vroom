import React, { Component } from 'react';
import './SiteMenu.css';


// Page header with Crystal Prism site navigation menu
class SiteMenu extends Component {
  constructor(props) {
    super(props);

    /* Starting state that stores if site menu is open and has projects for
    site menu */
    this.state = {
      siteMenuOpen: false
    };

    this.projects = [
      {link: 'https://crystalprism.io/', title: 'Home',
        favicon: 'https://crystalprism.io/favicon.ico'},
      {link: 'https://crystalprism.io/timespace/', title: 'Timespace',
        favicon: 'https://crystalprism.io/timespace/favicon.ico'},
      {link: 'https://crystalprism.io/shapes-in-rain/',
        title: 'Shapes in Rain',
        favicon: 'https://crystalprism.io/shapes-in-rain/favicon.ico'},
      {link: 'https://crystalprism.io/rhythm-of-life/',
        title: 'Rhythm of Life',
        favicon: 'https://crystalprism.io/rhythm-of-life/favicon.ico'},
      {link: 'https://crystalprism.io/canvashare/', title: 'CanvaShare',
        favicon: 'https://crystalprism.io/canvashare/favicon.ico'},
      {link: 'https://crystalprism.io/thought-writer/',
        title: 'Thought Writer',
        favicon: 'https://crystalprism.io/thought-writer/favicon.ico'},
      {link: 'https://crystalprism.io/vicarious/', title: 'Vicarious',
        favicon: 'https://crystalprism.io/vicarious/favicon.ico'},
      {link: 'https://hn-stats.crystalprism.io/', title: 'Hacker News Stats',
        favicon: 'https://hn-stats.crystalprism.io/favicon.ico'},
      {link: 'https://pause.crystalprism.io/', title: 'Pause',
        favicon: 'https://pause.crystalprism.io/favicon.ico'},
      {link: 'https://marian.crystalprism.io/', title: 'Marian',
        favicon: 'https://marian.crystalprism.io/favicon.ico'},
        {link: 'https://vroom.crystalprism.io/', title: 'Vroom',
          favicon: 'https://vroom.crystalprism.io/favicon.ico'},
      {link: 'https://crystalprism.io/user/sign-in/', title: 'Account',
        favicon: 'https://crystalprism.io/favicon.ico'}
    ]

    this.toggleSiteMenu = this.toggleSiteMenu.bind(this);
    this.togglePage = this.togglePage.bind(this);
  }

  // Open/close site menu
  toggleSiteMenu(e) {
    // Do nothing if user clicks in site menu
    if (this.node.contains(e.target)) {
      return;
    }

    // Close menu if it is open
    if (this.state.siteMenuOpen) {
      /* Remove event listener that detects clicks outside of site menu to
      close it */
      document.removeEventListener('mousedown', this.toggleSiteMenu, false);

      return this.setState({siteMenuOpen: false});
    }

    // Add event listener that detects clicks outside of site menu to close it
    document.addEventListener('mousedown', this.toggleSiteMenu, false);

    return this.setState({siteMenuOpen: true});
  }

  togglePage(e) {
    return window.location = e.target.dataset.link;
  }

  render() {
    const closedSrc = 'https://crystalprism.io/images/site-menu-icon-shadow' +
      '.svg';
    const openedSrc = 'https://crystalprism.io/images/site-menu-icon.svg';

    return (
      <div className="site-menu-container">

        <div className="site-menu-inner-container">

          <div className="site-menu-icon-container">
            <img className="site-menu-icon"
              title="Toggle site menu"
              alt="Site menu icon"
              src={this.state.siteMenuOpen ? openedSrc : closedSrc}
              onMouseDown={this.toggleSiteMenu}
              />
          </div>

          <table
            className={'site-menu ' + (this.state.siteMenuOpen ? 'opened' :
              'closed')}
            ref={node => { this.node = node; }}>

            <tbody>
              <tr className="site-menu-spacer-row"></tr>

              {this.projects.map(project =>
                <tr key={project.title} className="site-menu-row"
                  data-link={project.link}
                  onClick={this.togglePage}>

                    <td className="site-menu-image-cell"
                      data-link={project.link}>

                        <img className="site-menu-image"
                          alt={project.title + ' icon'}
                          title={project.title}
                          data-link={project.link}
                          src={project.favicon} />
                    </td>

                    <td className="site-menu-text-cell"
                      data-link={project.link}>

                        <div className="site-menu-text" title={project.title}
                          data-link={project.link}>{project.title}</div>
                    </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>
    );
  }
}

export default SiteMenu;
