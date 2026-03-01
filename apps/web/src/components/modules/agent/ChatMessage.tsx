import React, { useMemo } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import {
  ActionIcon,
  Anchor,
  Button,
  Card,
  Collapse,
  Popover,
  ScrollArea,
  Skeleton,
  Text,
} from '@mantine/core';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import Markdown from 'marked-react';
import { motion } from 'motion/react';

import { TextAnimate } from '@/components/ui/text-animate';
import { cn, formatDuration } from '@/lib/utils';

import renderer from '../../markdown';

import type { IMessage, IWebSearchToolResult } from './types';

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
  isThinking: isReasoning,
  role,
  usage,
  tools_calls,
}) => {
  const isUser = role === 'human';

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  }, []);

  // for reasoning model, we split the message into content and thought
  // TODO: implement this as remark/rehype plugin in the future
  const { content, thought, isThinking }: SplitMessage = useMemo(() => {
    // handle null / user message early and return all fields
    if (message === null || isUser) {
      return { content: message ?? '', thought: '', isThinking: false };
    }

    let isThinking = false;
    const thoughts: string[] = [];

    // 1) Extract all complete <think>...</think> blocks (non-greedy) and remove them from content
    // ([\s\S]*?) matches across lines
    const cleaned = message.replace(/<think>([\s\S]*?)<\/think>/g, (_match, inner) => {
      thoughts.push(inner as string);
      return ''; // remove the matched block from content
    });

    let finalContent = cleaned;

    // 2) If there's an opening <think> with no corresponding </think>, treat the trailing part as "in-progress thought"
    if (message.includes('<think>') && !message.includes('</think>')) {
      isThinking = true;
      const lastOpenIdx = message.lastIndexOf('<think>');
      const trailingThought = message.slice(lastOpenIdx + '<think>'.length);
      thoughts.push(trailingThought);
      // content should exclude the trailing open-think and whatever follows it
      finalContent = message.slice(0, lastOpenIdx).replace(/<think>([\s\S]*?)<\/think>/g, ''); // also ensure any closed ones already removed
    }

    return {
      content: finalContent,
      thought: thoughts.join(''), // join if you want a single string; or change to thoughts if you want array
      isThinking,
    };
  }, [message, isUser]);

  const clipboard = useClipboard({ timeout: 500 });
  const [opened, handler] = useDisclosure(false);
  const [openTools, toolsHandler] = useDisclosure(false);

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

        {!isUser && (reason || thought) ? (
          <div className="">
            <Button
              size="compact-xs"
              variant="subtle"
              color="blue"
              leftSection={
                isThinking || isReasoning ? (
                  <Icon icon="svg-spinners:270-ring-with-bg" />
                ) : undefined
              }
              rightSection={<Icon icon="solar:alt-arrow-down-bold-duotone" />}
              onClick={handler.toggle}>
              {isThinking || isReasoning ? 'Thinking' : 'Thought'}
            </Button>
            <Collapse
              in={opened || isThinking || !!isReasoning}
              className="mt-1 mb-2 rounded-2xl bg-purple-700/20 p-4">
              {reason ? <Markdown renderer={renderer}>{reason}</Markdown> : null}
              {thought ? <Markdown renderer={renderer}>{thought}</Markdown> : null}
            </Collapse>
          </div>
        ) : null}

        {tools_calls && tools_calls.length > 0 && (
          <div className="mb-2">
            <Button
              size="compact-xs"
              variant="subtle"
              color="blue"
              rightSection={<Icon icon="solar:alt-arrow-down-bold-duotone" />}
              onClick={toolsHandler.toggle}>
              Tools
            </Button>
            <Collapse
              in={openTools || !!isStreaming}
              className="mt-1 mb-2 rounded-2xl bg-amber-400/20 p-4">
              {tools_calls.map((tool_call) => (
                <TextAnimate
                  key={tool_call.id}
                  className="text-xs"
                  animation="blurInUp"
                  by="character"
                  once>
                  {`Calling tool: ${tool_call.name}`}
                </TextAnimate>
              ))}
            </Collapse>
          </div>
        )}

        <Markdown renderer={renderer}>{content}</Markdown>

        {isStreaming && !isUser ? (
          <div className="mt-2">
            <Skeleton height={16} width={100} radius="sm" />
          </div>
        ) : null}
      </div>

      {tools_calls &&
        tools_calls.length > 0 &&
        tools_calls.map((tool_call) => {
          switch (tool_call.name) {
            case 'search_web': {
              const results = tool_call.content as Array<IWebSearchToolResult>;

              return (
                <ScrollArea key={tool_call.id} offsetScrollbars overscrollBehavior="contain">
                  <div className="flex gap-2">
                    {results?.map((item, i) => (
                      // eslint-disable-next-line @eslint-react/no-array-index-key, react-x/no-array-index-key
                      <Card key={i} className="w-[380px]" shadow="sm">
                        <Anchor lineClamp={2} href={item.link} target="_blank" size="sm" mb="sm">
                          {item.title}
                        </Anchor>
                        <Text size="xs" lineClamp={2}>
                          {item.snippet}
                        </Text>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              );
            }
          }
        })}

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
          <Icon
            icon={clipboard.copied ? 'solar:check-read-line-duotone' : 'solar:copy-bold-duotone'}
          />
        </ActionIcon>

        {usage && (
          <Popover width={180} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <ActionIcon variant="subtle">
                <Icon icon="solar:chart-square-bold-duotone" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown style={{ pointerEvents: 'none' }} p="xs">
              <Text size="xs">
                Prompt Token: <strong>{usage.prompt_tokens}</strong>
              </Text>
              <Text size="xs">
                Completion Token: <strong>{usage.completion_tokens}</strong>
              </Text>
              <Text size="xs">
                Reasoning Token: <strong>{usage.reasoning_tokens}</strong>
              </Text>
              <Text size="xs">
                Total Token: <strong>{usage.total_tokens}</strong>
              </Text>
              <Text size="xs">
                Total Cost: <strong>{currencyFormatter.format(usage.total_cost)}</strong>
              </Text>
              <Text size="xs">
                Total Time: <strong>{formatDuration(usage.time)}</strong>
              </Text>
            </Popover.Dropdown>
          </Popover>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
