import { useNavigate, useParams } from 'react-router';
import { Icon } from '@iconify/react';
import { ActionIcon } from '@mantine/core';
import dayjs from 'dayjs';
import { motion } from 'motion/react';

import { useConversations, useDeleteConversation } from '@/apis/queries/conversation.queries';
import { cn } from '@/lib/utils';
import type { IConversation } from '@/types';

import { getPathFromConversationFeature } from '../agent/utils';

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

  const handleClick = async (conversation: IConversation) => {
    await navigate(
      `${getPathFromConversationFeature(conversation.feature)}/chat/${conversation.id}`
    );
  };

  const handleDelete = (conversation: IConversation) => {
    deleteConversation.mutate(conversation.id, {
      onSuccess: async () => {
        if (conversation.id === conversationId) {
          await navigate(getPathFromConversationFeature(conversation.feature));
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
            onClick={() => handleClick(conversation)}>
            {conversation.title}
          </button>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDelete(conversation)}
            disabled={deleteConversation.isPending}>
            <Icon icon="solar:trash-bin-2-bold-duotone" />
          </ActionIcon>
        </motion.div>
      ))}
    </div>
  );
};

export default Conversations;
