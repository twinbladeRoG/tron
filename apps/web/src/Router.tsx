import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import RootLayout from './components/modules/shared/RootLayout';
import NotFound from './components/NotFound';
import { protectedLoader } from './lib/loaders';
import AdminPage from './pages/admin';
import AgentPage from './pages/agent';
import AgentChatPage from './pages/agent-chat';
import ChatPage from './pages/chat';
import LlmModelsPage from './pages/llm-models';
import LoginPage from './pages/login';
import ScrapperPage from './pages/scrapper';
import UnauthorizedPage from './pages/unauthorized';
import UsageLogPage from './pages/usage-logs';
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
      { path: '/chat', element: <ChatPage />, loader: protectedLoader('chat') },
      { path: '/models', element: <LlmModelsPage />, loader: protectedLoader('models') },
      { path: '/scrapper', element: <ScrapperPage />, loader: protectedLoader('scrapper') },
      { path: '/agent', element: <AgentPage />, loader: protectedLoader('chat') },
      {
        path: '/agent/chat/:conversationId',
        element: <AgentChatPage />,
        loader: protectedLoader('chat'),
      },
      { path: '/usage-logs', element: <UsageLogPage /> },
      {
        path: '/admin',
        element: <AdminPage />,
        children: [
          {
            path: ':tabValue',
            element: <AdminPage />,
          },
        ],
      },
      { path: '/unauthorized', Component: UnauthorizedPage },
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
