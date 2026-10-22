import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router';

import {
  HomePage,
  LoginPage,
  SignupPage
} from './pages'

import { AuthProvider } from './auth/auth-provider';

const router = createBrowserRouter([
  {
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
]);

function App() {
  return (<AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>)
}

export default App;
