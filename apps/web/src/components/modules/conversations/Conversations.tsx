import { useNavigate, useParams } from 'react-router';
import { Icon } from '@iconify/react';
import { ActionIcon } from '@mantine/core';
import dayjs from 'dayjs';
import { motion } from 'motion/react';

import { useConversations, useDeleteConversation } from '@/apis/queries/conversation.queries';
import { cn } from '@/lib/utils';

interface ConversationsProps {
  className?: string;
}

const Conversations: React.FC<ConversationsProps> = ({ className }) => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const conversations = useConversations({
    from_date: dayjs().startOf('month').toDate(),
  });
  const navigate = useNavigate();
  const deleteConversation = useDeleteConversation();

  const handleClick = async (id: string) => {
    await navigate(`/agent/chat/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteConversation.mutate(id, {
      onSuccess: async () => {
        if (id === conversationId) {
          await navigate(`/agent`);
        }
      },
    });
  };

  return (
    <div className={cn(className, 'flex flex-col gap-y-2 p-2')}>
      {conversations.data?.map((conversation) => (
        <motion.div
          key={conversation.id}
          className={cn(
            'flex items-center rounded px-4 py-2',
            'transition-colors hover:bg-blue-50 focus:bg-blue-50 hover:dark:bg-blue-950 focus:dark:bg-blue-950'
          )}>
          <button
            type="button"
            className={cn('block w-full cursor-pointer text-left')}
            disabled={deleteConversation.isPending}
            onClick={() => handleClick(conversation.id)}>
            {conversation.title}
          </button>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDelete(conversation.id)}
            disabled={deleteConversation.isPending}>
            <Icon icon="solar:trash-bin-2-bold-duotone" />
          </ActionIcon>
        </motion.div>
      ))}
    </div>
  );
};

export default Conversations;
