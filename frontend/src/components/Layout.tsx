import { Outlet } from 'react-router-dom'
import SiteHeader from './SiteHeader'

const Layout = () => {
  return (
    <div>
      {/* <SiteHeader /> */} {/* home/main 테스트 잠시 주석처리 */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout