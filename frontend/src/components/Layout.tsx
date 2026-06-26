import { Outlet } from 'react-router-dom';
//import Header from './Header';
import SiteHeader from "./SiteHeader";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
