import { Outlet } from 'react-router-dom'
import SiteHeader from './SiteHeader'

const Layout = () => {
  return (
    <div>
      <SiteHeader />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout