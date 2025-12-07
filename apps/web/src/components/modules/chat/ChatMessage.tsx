import React, { useMemo } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Accordion, ActionIcon, Loader, Popover, Skeleton, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import Markdown from 'marked-react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

import renderer from '../../markdown';

import type { IMessage } from './types';

interface SplitMessage {
  content: string | null;
  thought?: string;
  isThinking?: boolean;
}

const ChatMessage: React.FC<IMessage> = ({
  message,
  reason,
  isError,
  isLoading,
  isStreaming,
  role,
  usage,
}) => {
  const isUser = role === 'user';
  // for reasoning model, we split the message into content and thought
  // TODO: implement this as remark/rehype plugin in the future
  const { content, thought, isThinking }: SplitMessage = useMemo(() => {
    if (message === null || isUser) return { content: message };

    let actualContent = '';
    let thought = '';
    let isThinking = false;

    const hasOpeningThinkTag = message.includes('<think>');
    const hasClosingThinkTag = message.includes('</think>');

    let thinkSplit: string[] = [];

    if (hasOpeningThinkTag && hasClosingThinkTag) {
      thinkSplit = message.split('<think>', 2);
      actualContent += thinkSplit[0];
    } else if (hasClosingThinkTag && !hasOpeningThinkTag) {
      thinkSplit = ['', message];
    } else {
      return { content: message };
    }

    while (thinkSplit[1] !== undefined) {
      // <think> tag found
      thinkSplit = thinkSplit[1].split('</think>', 2);
      thought += thinkSplit[0];
      isThinking = true;
      if (thinkSplit[1] !== undefined) {
        // </think> closing tag found
        isThinking = false;
        thinkSplit = thinkSplit[1].split('<think>', 2);
        actualContent += thinkSplit[0];
      }
    }

    return { content: actualContent, thought, isThinking };
  }, [message, isUser]);

  const clipboard = useClipboard({ timeout: 500 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75 }}
      className={cn('flex max-w-[90%] flex-col', {
        'self-end': isUser,
        'self-start': !isUser,
        'min-w-3/4': isLoading,
      })}>
      <div
        className={cn('mb-2 rounded-lg', {
          'bg-gray-200 p-4 dark:bg-gray-800': isUser,
          'self-start': !isUser,
          'bg-red-950 p-4': isError,
          'min-w-3/4': isLoading,
        })}>
        {isLoading ? <Skeleton height={40} /> : null}

        {!isLoading && !isUser && (reason || thought) ? (
          <Accordion
            defaultValue={null}
            mb="md"
            classNames={{
              label: '!py-2',
            }}>
            <Accordion.Item value="thought">
              <Accordion.Control icon={<Icon icon="mdi:thought-bubble" />}>
                Thought {isThinking ? <Loader /> : null}
              </Accordion.Control>
              <Accordion.Panel className="">
                {reason ? <Markdown renderer={renderer}>{reason}</Markdown> : null}
                {thought ? <Markdown renderer={renderer}>{thought}</Markdown> : null}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        ) : null}

        <Markdown renderer={renderer}>{content}</Markdown>

        {isStreaming && !isUser ? (
          <div className="mt-2">
            <Skeleton height={16} width={100} radius="sm" />
          </div>
        ) : null}
      </div>

      <div
        className={cn('flex w-full items-center gap-3', {
          'justify-end': isUser,
        })}>
        <ActionIcon
          disabled={isLoading || isStreaming}
          className={isUser ? 'self-end' : 'self-start'}
          variant="subtle"
          color={clipboard.copied ? 'teal' : 'blue'}
          onClick={() => clipboard.copy(content)}>
          <Icon icon={clipboard.copied ? 'mdi:check' : 'mdi:content-copy'} />
        </ActionIcon>

        {usage && (
          <Popover width={100} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <ActionIcon variant="subtle">
                <Icon icon="solar:chart-square-bold-duotone" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown style={{ pointerEvents: 'none' }} p="xs">
              <Text size="xs">
                Token: <strong>{usage.input_tokens}</strong>
              </Text>
              <Text size="xs">
                Token: <strong>{usage.output_tokens}</strong>
              </Text>
              <Text size="xs">
                Token: <strong>{usage.total_tokens}</strong>
              </Text>
            </Popover.Dropdown>
          </Popover>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
