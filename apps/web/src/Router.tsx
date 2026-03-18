import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import Policies from './components/modules/acesss-control/Policies';
import Divisions from './components/modules/divisions/Divisions';
import Features from './components/modules/features/Features';
import Organizations from './components/modules/organizations/Organizations';
import RootLayout from './components/modules/shared/RootLayout';
import Teams from './components/modules/teams/Teams';
import Users from './components/modules/users/Users';
import NotFound from './components/NotFound';
import { authGuard, featureGuard } from './lib/loaders';
import AdminPage from './pages/admin';
import AgentPage from './pages/agent';
import AgentChatPage from './pages/agent-chat';
import AgentsPage from './pages/agents';
import ChatPage from './pages/chat';
import FilesPage from './pages/files';
import KnowledgeBasePage from './pages/knowledge-base';
import KnowledgeBasesPage from './pages/knowledge-bases';
import LlmModelsPage from './pages/llm-models';
import LoginPage from './pages/login';
import ModelPage from './pages/model';
import RagAgentPage from './pages/rag-agent';
import RagAgentChatPage from './pages/rag-agent-chat';
import ScrapperPage from './pages/scrapper';
import UnauthorizedPage from './pages/unauthorized';
import UsageLogPage from './pages/usage-logs';
import Home from './pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    loader: authGuard({ optional: true }),
  },
  {
    path: '/',
    element: <RootLayout />,
    loader: authGuard(),
    errorElement: <div>Not Found</div>,
    children: [
      { path: '/chat', element: <ChatPage />, loader: featureGuard('chat') },
      { path: '/agent', element: <AgentPage />, loader: featureGuard('chat') },
      {
        path: '/agent/chat/:conversationId',
        element: <AgentChatPage />,
        loader: featureGuard('chat'),
      },
      { path: '/rag-agent', element: <RagAgentPage />, loader: featureGuard('rag') },
      {
        path: '/rag-agent/chat/:conversationId',
        element: <RagAgentChatPage />,
        loader: featureGuard('rag'),
      },
      { path: '/agents', element: <AgentsPage /> },
      { path: '/files', element: <FilesPage />, loader: featureGuard('files') },
      {
        path: '/knowledge-bases',
        element: <KnowledgeBasesPage />,
        loader: featureGuard('knowledge-base'),
      },
      {
        path: '/knowledge-bases/:slug',
        element: <KnowledgeBasePage />,
        loader: featureGuard('knowledge-base'),
      },
      {
        path: '/admin',
        element: <AdminPage />,
        children: [
          { index: true, element: <Navigate to="policies" replace /> },
          { path: 'policies', element: <Policies /> },
          { path: 'organizations', element: <Organizations /> },
          { path: 'divisions', element: <Divisions /> },
          { path: 'teams', element: <Teams /> },
          { path: 'users', element: <Users /> },
          {
            path: 'features',
            element: <Features />,
          },
          { path: 'models', element: <LlmModelsPage />, loader: featureGuard('models') },
          { path: 'models/:id', element: <ModelPage />, loader: featureGuard('models') },
          {
            path: 'model-usage',
            element: <UsageLogPage />,
            loader: featureGuard('model-usage'),
          },
        ],
      },
      { path: '/scrapper', element: <ScrapperPage />, loader: featureGuard('scrapper') },
      { path: '/unauthorized', Component: UnauthorizedPage },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
    loader: authGuard({ optional: true, redirectIfAuthenticated: '/chat' }),
  },
  { path: '*', element: <NotFound /> },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
