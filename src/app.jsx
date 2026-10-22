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

const router = createBrowserRouter([  {
    path: '/',
    element: <HomePage />,
  },
   {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
   {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
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