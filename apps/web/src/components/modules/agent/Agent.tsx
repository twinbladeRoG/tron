import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Icon } from '@iconify/react';
import { ActionIcon, Divider, Kbd, ScrollArea, Tabs, Tooltip } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';
import { useQueryClient } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { AnimatePresence, motion } from 'motion/react';
import { v4 as uuid } from 'uuid';

import { getToken } from '@/apis/http';
import { useAgentWorkflow } from '@/apis/queries/agent.queries';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store';
import type { IConversationMessageWithUsageLogs } from '@/types';

import ChatInput from '../chat/ChatInput';
import Conversations from '../conversations/Conversations';
import SelectLlmModel from '../shared/form/SelectLlmModel';

import AgentGraph from './AgentGraph';
import ChatMessage from './ChatMessage';
import useChatMessages from './hook';
import Mermaid from './Mermaid';
import type { IMessage, IUsage } from './types';
import UserModelUsageTrack from './UserModelUsageTrack';

interface AgentProps {
  className?: string;
  previousMessages?: Array<IConversationMessageWithUsageLogs>;
  conversationId?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Agent: React.FC<AgentProps> = ({
  className,
  previousMessages,
  conversationId: existingConversationId,
}) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [tab, setTab] = useState<string | null>('conversations');
  const [showPanel, panelHandler] = useDisclosure(true);
  const [model, setModel] = useState<string | null>(null);
  const workflow = useAgentWorkflow(model);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  useHotkeys([['ctrl + shift + B', panelHandler.toggle]]);

  const handleNewConversation = async () => {
    setMessages([]);
    setConversationId(null);
    await navigate(model ? `/agent?model=${model}` : '/agent', { replace: true });
  };

  useHotkeys([['ctrl + shift + O', () => handleNewConversation()]]);

  useEffect(() => {
    if (model === null && searchParams.get('model') !== null) {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect, react-hooks/set-state-in-effect
      setModel(searchParams.get('model'));
    }
  }, [searchParams, model]);

  const {
    messages,
    setMessages,
    updateMessage,
    conversationId,
    setConversationId,
    visitedNodes,
    appendVisitedNode,
    setVisitedNodes,
  } = useChatMessages();

  useEffect(() => {
    if (existingConversationId) setConversationId(existingConversationId);
  }, [existingConversationId, setConversationId]);

  useEffect(() => {
    if (previousMessages?.length) {
      setMessages(
        previousMessages.map(
          (msg) =>
            ({
              id: msg.id,
              message: msg.content,
              role: msg.type,
              reason: msg.reason,
              tools_calls: msg.tool_calls?.map((call) => ({
                id: call.id,
                name: call.name,
                type: call.type,
                content: call.content,
              })),
              usage: msg.usage_logs.reduce(
                (acc, log) =>
                  ({
                    completion_tokens: acc.completion_tokens + log.completion_tokens,
                    prompt_tokens: acc.prompt_tokens + log.prompt_tokens,
                    prompt_tokens_cached: acc.prompt_tokens_cached + log.prompt_tokens_cached,
                    reasoning_tokens: acc.reasoning_tokens + log.reasoning_tokens,
                    successful_requests: acc.successful_requests + log.successful_requests,
                    time: acc.time + log.time,
                    total_cost: acc.total_cost + log.total_cost,
                    total_tokens: acc.total_tokens + log.total_tokens,
                  }) satisfies IUsage,
                {
                  completion_tokens: 0,
                  prompt_tokens: 0,
                  prompt_tokens_cached: 0,
                  reasoning_tokens: 0,
                  successful_requests: 0,
                  time: 0,
                  total_cost: 0,
                  total_tokens: 0,
                } satisfies IUsage
              ),
            }) satisfies IMessage
        )
      );
    }
  }, [previousMessages, setMessages]);

  const handleSubmit = async (message: string) => {
    if (!model) {
      notifications.show({
        message: 'Please select a model',
        color: 'yellow',
      });
      return;
    }

    const botMessageId = uuid();
    setIsStreaming(true);
    setVisitedNodes([]);

    setMessages((prev) => [
      ...prev,
      {
        id: uuid(),
        role: 'human',
        message,
      } satisfies IMessage,
      {
        id: botMessageId,
        role: 'ai',
        message: '',
        isLoading: true,
      } satisfies IMessage,
    ]);

    const ctrl = new AbortController();

    await fetchEventSource(`${API_URL}/api/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken()}`,
      },
      body: JSON.stringify({
        message: message,
        model: model,
        conversation_id: conversationId,
      }),
      signal: ctrl.signal,
      // eslint-disable-next-line @typescript-eslint/require-await
      async onopen(response) {
        if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
          appendVisitedNode('__start__');
          return;
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          notifications.show({
            color: 'red',
            message: 'Fatal error occurred!',
          });
          setIsStreaming(false);
        } else {
          notifications.show({
            color: 'yellow',
            message: 'Retry again!',
          });
          setIsStreaming(false);
        }
      },
      onerror(err) {
        setMessages((prev) =>
          prev.map((message) => {
            if (message.id !== botMessageId) return message;

            return {
              ...message,
              id: botMessageId,
              message: err as string,
              isLoading: false,
              role: 'ai',
            } satisfies IMessage;
          })
        );
        ctrl.abort();
      },
      onclose() {
        //
      },
      onmessage(ev) {
        updateMessage(ev, botMessageId, {
          onDone: async () => {
            ctrl.abort();
            appendVisitedNode('__end__');
            setIsStreaming(false);
            await queryClient.invalidateQueries({ queryKey: ['token-usage'] });
            await queryClient.invalidateQueries({ queryKey: ['conversations'] });
            setTimeout(() => {
              chatInputRef.current?.focus();
            }, 100);
          },
          onNodeChange: (node: string) => {
            appendVisitedNode(node);
          },
        });
      },
    });
  };

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current?.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <section
      className={cn(
        className,
        'relative grid grid-cols-[1fr_0px] transition-[grid-template-columns] duration-500 lg:gap-4',
        {
          'lg:grid-cols-[1fr_380px]': showPanel,
          'lg:grid-cols-[1fr_0px]': !showPanel,
        }
      )}>
      <div className="flex min-h-full w-full flex-col overflow-y-auto">
        <div className="flex w-full items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-bold">Agent Chat</h1>
          </div>

          <Tooltip
            position="left"
            label={
              <div className="flex">
                <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>O</Kbd>
              </div>
            }>
            <ActionIcon variant="subtle" ml="auto" onClick={handleNewConversation}>
              <Icon icon="mdi:chat-plus" className="text-2xl" />
            </ActionIcon>
          </Tooltip>

          <Tooltip
            position="left"
            label={
              <div className="flex">
                <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>B</Kbd>
              </div>
            }>
            <ActionIcon variant="subtle" onClick={panelHandler.toggle}>
              <Icon icon="solar:siderbar-bold-duotone" className="text-2xl" />
            </ActionIcon>
          </Tooltip>
        </div>

        <Divider className="my-3" />

        {messages.length > 0 && (
          <ScrollArea.Autosize offsetScrollbars viewportRef={scrollRef} className="mb-4">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-y-3">
              {messages.map((message) => (
                <ChatMessage key={message.id} {...message} />
              ))}
            </div>
          </ScrollArea.Autosize>
        )}

        {!messages.length && (
          <h1 className="mt-[20dvh] mb-6 text-center">
            {user ? <span className="text-4xl">Hi {user?.first_name}, welcome to </span> : null}
            <span className="pointer-events-none z-10 bg-linear-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-center text-5xl leading-none font-bold tracking-tighter whitespace-pre-wrap text-transparent">
              {import.meta.env.VITE_APP_NAME}
            </span>
          </h1>
        )}

        <ChatInput
          ref={chatInputRef}
          className={cn('mx-auto w-full max-w-2xl', {
            'mt-auto': messages.length,
            'mt-10': !messages.length,
          })}
          onSubmit={handleSubmit}
          disabled={isStreaming}
          isStreaming={isStreaming || !messages.length}
          placeholder="Ask anything">
          <SelectLlmModel
            size="xs"
            variant="unstyled"
            value={model}
            onChange={(value) => {
              setModel(value);
              if (value)
                setSearchParams(
                  (params) => {
                    params.set('model', value);
                    return params;
                  },
                  { replace: true }
                );
            }}
            w={140}
            allowDeselect={false}
            autoSelectFirstValue
          />

          <UserModelUsageTrack modelSlug={model} className="min-w-56" />
        </ChatInput>
      </div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="flex"
            transition={{ ease: 'easeInOut', duration: 0.3 }}
            initial={{ opacity: 0, translateX: 280 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: 280 }}>
            <Tabs
              value={tab}
              onChange={setTab}
              keepMounted={false}
              classNames={{
                root: cn(
                  '!flex !flex-col !min-h-0',
                  '!absolute !top-0 !bottom-0 !right-0 bg-white dark:bg-gray-950 w-[280px]',
                  'lg:!static lg:w-full',
                  {
                    'w-0': !showPanel,
                  }
                ),
                panel: '!grow h-full flex flex-col overflow-auto',
              }}>
              <Tabs.List>
                <Tabs.Tab value="conversations">Conversations</Tabs.Tab>
                <Tabs.Tab value="graph">Graph</Tabs.Tab>
                <Tabs.Tab value="mermaid">Mermaid</Tabs.Tab>
                <ActionIcon
                  className="ml-auto self-center"
                  variant="subtle"
                  color="red"
                  onClick={panelHandler.toggle}>
                  <Icon icon="solar:close-square-bold-duotone" />
                </ActionIcon>
              </Tabs.List>

              <Tabs.Panel value="graph">
                {workflow.data?.state ? (
                  <ReactFlowProvider>
                    <AgentGraph
                      className="h-full w-full"
                      graph={workflow.data.state}
                      visitedNodes={visitedNodes}
                    />
                  </ReactFlowProvider>
                ) : null}
              </Tabs.Panel>

              <Tabs.Panel value="mermaid">
                <div className="rounded py-7">
                  {workflow.data?.mermaid ? <Mermaid>{workflow.data.mermaid}</Mermaid> : null}
                </div>
              </Tabs.Panel>

              <Tabs.Panel value="conversations">
                <Conversations />
              </Tabs.Panel>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Agent;
