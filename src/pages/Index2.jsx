import { NavLink, Outlet, RouterProvider, createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import Edits from './Edits'
import Directed from './Directed'
import Contact from './Contact'

function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">joan colomer</div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

function Work() {
  const location = useLocation()
  const { pathname, search } = location
  const showFilter = pathname === '/work/edits'
  const currentFilter = new URLSearchParams(search).get('f') || 'all'
  
  const getFilterClass = (filter) => {
    return `tab ${showFilter && currentFilter === filter ? 'active' : ''}`
  }
  
  return (
    <div>
      {/* Original topbar for desktop, custom for mobile */}
      <div className="topbar">
        <div className="links">
          <NavLink to="/work" className={({ isActive }) => isActive ? 'active' : undefined}>work</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : undefined}>contact</NavLink>
        </div>
        {showFilter && (
          <div className="links filter-links">
            <a href="edits?f=all" className={getFilterClass('all')}>all</a>
            <a href="edits?f=commercial" className={getFilterClass('commercial')}>commercial</a>
            <a href="edits?f=music" className={getFilterClass('music')}>music video</a>
          </div>
        )}
        <div className="links links-right">
          <NavLink to="edits" end className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>edits</NavLink>
          <NavLink to="directed" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>directed</NavLink>
        </div>
      </div>
      {/* Custom mobile topbar */}
      <div className="topbar index2-topbar">
        <div className="links">
          <NavLink to="/work" className={({ isActive }) => isActive ? 'active' : undefined}>work</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : undefined}>contact</NavLink>
        </div>
        <div className="links links-right">
          <NavLink to="edits" end className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>edits</NavLink>
          <NavLink to="directed" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>directed</NavLink>
        </div>
      </div>
      {showFilter && (
        <div className="mobile-filter-bar">
          <a href="edits?f=all" className={`mobile-filter-left ${getFilterClass('all')}`}>all</a>
          <a href="edits?f=commercial" className={`mobile-filter-center ${getFilterClass('commercial')}`}>commercial</a>
          <a href="edits?f=music" className={`mobile-filter-right ${getFilterClass('music')}`}>music video</a>
        </div>
      )}
      <Outlet />
    </div>
  )
}

const basename = import.meta.env.PROD ? '/joancolomer' : undefined

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="work" replace /> },
      {
        path: 'work',
        element: <Work />,
        children: [
          { index: true, element: <Navigate to="edits" replace /> },
          { path: 'edits', element: <Edits /> },
          { path: 'directed', element: <Directed /> },
        ],
      },
      {
        path: 'contact',
        element: (
          <div>
            <div className="topbar center-viewport topbar-grid">
              <div className="links">
                <NavLink to="/work" className={({ isActive }) => isActive ? 'active' : undefined}>work</NavLink>
                <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : undefined}>contact</NavLink>
              </div>
            </div>
            <div className="center-viewport contact-content">
              <div />
              <div className="contact-block">
                <Contact />
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
], { basename })

export default function Index2() {
  return <RouterProvider router={router} />
}