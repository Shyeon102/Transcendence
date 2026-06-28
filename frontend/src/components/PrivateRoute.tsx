import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

// export default function PrivateRoute({ children }: { children: ReactNode }) {
//   const { isAuthenticated, user, accessToken } = useSelector(
//     (state: RootState) => state.auth
//   );

//   if (!isAuthenticated || !user || !accessToken) {
//     return <Navigate to="/" replace />;
//   }

//   return <>{children}</>;
// }

export default function PrivateRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated, user, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthenticated || !user || !accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}