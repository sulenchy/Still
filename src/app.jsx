import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router';

import {
  HomePage,
  LoginPage,
  SignupPage,
  DashboardPage
} from './pages'

import { GuestRoute, ProtectedRoute } from './components';
import ArchiveListener from './features/archive/ArchiveListener.jsx';
import AuthListener from './features/auth/AuthListener.jsx';
import { dashboardPath, loginPath, signupPath } from './constants/routes.js';

const router = createBrowserRouter([  {
    path: '/',
    element: <HomePage />,
  },
  {
    element: <GuestRoute />,
    children: [
      {
        path: loginPath,
        element: <LoginPage />,
      },
      {
        path: signupPath,
        element: <SignupPage />,
      }
    ],
  },
   {
    element: <ProtectedRoute />,
    children: [
      {
        path: dashboardPath,
        element: <DashboardPage />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <AuthListener />
      <ArchiveListener />
      <RouterProvider router={router} />
    </>
  );
}

export default App;