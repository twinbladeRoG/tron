import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import RootLayout from './components/modules/shared/RootLayout';
import NotFound from './components/NotFound';
import AgentPage from './pages/agent';
import LlmModelsPage from './pages/llm-models';
import LoginPage from './pages/login';
import ScrapperPage from './pages/scrapper';
import Home from './pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <div>Not Found</div>,
    children: [
      { path: '/agent', element: <AgentPage /> },
      { path: '/models', element: <LlmModelsPage /> },
      { path: '/scrapper', element: <ScrapperPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  { path: '*', element: <NotFound /> },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
