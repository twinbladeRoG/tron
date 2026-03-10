import { useParams } from 'react-router';

import { useConversation, useConversationMessages } from '@/apis/queries/conversation.queries';
import RagAgent from '@/components/modules/agent/RagAgent';

const RagAgentChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const conversation = useConversation(conversationId!);
  const conversationMessages = useConversationMessages(conversationId!);

  return (
    <main className="flex h-full w-full overflow-hidden">
      <RagAgent
        className="w-full"
        conversation={conversation.data}
        previousMessages={conversationMessages.data}
      />
    </main>
  );
};

export default RagAgentChatPage;
