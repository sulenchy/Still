import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router';

import {
  HomePage,
  LoginPage,
  SignupPage
} from './pages'

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
  return <RouterProvider router={router} />;
}

export default App;