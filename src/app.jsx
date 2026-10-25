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
import { AuthProvider } from './auth/auth-provider';
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

function App() {  return (<AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>)
}

export default App;