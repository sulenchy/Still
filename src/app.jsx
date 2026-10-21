import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router';

import HomePage from './pages/homepage.jsx';
import LoginPage from './pages/login.jsx';
import SignupPage from './pages/sign-up.jsx';

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