import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import Policies from './components/modules/acesss-control/Policies';
import Divisions from './components/modules/divisions/Divisions';
import Features from './components/modules/features/Features';
import Organizations from './components/modules/organizations/Organizations';
import RootLayout from './components/modules/shared/RootLayout';
import Teams from './components/modules/teams/Teams';
import Users from './components/modules/users/Users';
import NotFound from './components/NotFound';
import { protectedLoader } from './lib/loaders';
import AdminPage from './pages/admin';
import AgentPage from './pages/agent';
import AgentChatPage from './pages/agent-chat';
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
  },
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <div>Not Found</div>,
    children: [
      { path: '/chat', element: <ChatPage />, loader: protectedLoader('chat') },
      { path: '/agent', element: <AgentPage />, loader: protectedLoader('chat') },
      {
        path: '/agent/chat/:conversationId',
        element: <AgentChatPage />,
        loader: protectedLoader('chat'),
      },
      { path: '/rag-agent', element: <RagAgentPage />, loader: protectedLoader('rag') },
      {
        path: '/rag-agent/chat/:conversationId',
        element: <RagAgentChatPage />,
        loader: protectedLoader('rag'),
      },
      { path: '/files', element: <FilesPage />, loader: protectedLoader('files') },
      {
        path: '/knowledge-bases',
        element: <KnowledgeBasesPage />,
        loader: protectedLoader('knowledge-base'),
      },
      { path: '/knowledge-bases/:slug', element: <KnowledgeBasePage /> },
      {
        path: '/admin',
        element: <AdminPage />,
        children: [
          { path: 'policies', element: <Policies /> },
          { path: 'organizations', element: <Organizations /> },
          { path: 'divisions', element: <Divisions /> },
          { path: 'teams', element: <Teams /> },
          { path: 'users', element: <Users /> },
          {
            path: 'features',
            element: <Features />,
          },
          { path: 'models', element: <LlmModelsPage />, loader: protectedLoader('models') },
          { path: 'models/:id', element: <ModelPage />, loader: protectedLoader('models') },
          {
            path: 'model-usage',
            element: <UsageLogPage />,
            loader: protectedLoader('model-usage'),
          },
        ],
      },
      { path: '/scrapper', element: <ScrapperPage />, loader: protectedLoader('scrapper') },
      { path: '/unauthorized', Component: UnauthorizedPage },
      { path: '*', element: <NotFound /> },
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
