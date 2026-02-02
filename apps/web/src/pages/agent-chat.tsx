import { useParams } from 'react-router';

import { useConversationMessages } from '@/apis/queries/conversation.queries';
import Agent from '@/components/modules/agent/Agent';

const AgentChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const conversationMessages = useConversationMessages(conversationId!);

  return (
    <main className="flex h-full w-full overflow-hidden">
      <Agent
        className="w-full"
        conversationId={conversationId}
        previousMessages={conversationMessages.data}
      />
    </main>
  );
};

export default AgentChatPage;
