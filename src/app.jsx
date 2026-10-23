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

import { ProtectedRoute } from './components';
import { AuthProvider } from './auth/auth-provider';
import { dashboardPath, loginPath, signupPath } from './constants/routes.js';

const router = createBrowserRouter([  {
    path: '/',
    element: <HomePage />,
  },
   {
    path: loginPath,
    element: <LoginPage />,
  },
  {
    path: signupPath,
    element: <SignupPage />,
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