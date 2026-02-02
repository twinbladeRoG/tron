import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Icon } from '@iconify/react';
import {
  ActionIcon,
  Divider,
  Group,
  ScrollArea,
  Select,
  type SelectProps,
  Tabs,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';
import { ReactFlowProvider } from '@xyflow/react';
import { AnimatePresence, motion } from 'motion/react';
import { v4 as uuid } from 'uuid';

import { getToken } from '@/apis/http';
import { useAgentWorkflow } from '@/apis/queries/agent.queries';
import { useLlmModels } from '@/apis/queries/llm-models.queries';
import { cn, getLlmProviderIcon } from '@/lib/utils';
import type { IConversationMessage, LlmProvider } from '@/types';

import ChatInput from '../chat/ChatInput';
import Conversations from '../conversations/Conversations';

import AgentGraph from './AgentGraph';
import ChatMessage from './ChatMessage';
import useChatMessages from './hook';
import Mermaid from './Mermaid';
import type { IMessage } from './types';

interface AgentProps {
  className?: string;
  previousMessages?: Array<IConversationMessage>;
  conversationId?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Agent: React.FC<AgentProps> = ({
  className,
  previousMessages,
  conversationId: existingConversationId,
}) => {
  const models = useLlmModels();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [tab, setTab] = useState<string | null>('graph');
  const [showPanel, panelHandler] = useDisclosure(true);
  const [model, setModel] = useState<string | null>(null);
  const workflow = useAgentWorkflow(model);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (model === null && searchParams.get('model') !== null) {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect, react-hooks/set-state-in-effect
      setModel(searchParams.get('model'));
    } else if (model === null && models.data && models.data.length > 0) {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setModel(models.data[0].name);
    }
  }, [searchParams, model, models.data]);

  const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
    <Group flex="1" gap="xs">
      <Icon
        icon={getLlmProviderIcon(
          (models.data ?? []).find((m) => m.name === option.value)?.provider as LlmProvider
        )}
      />
      <div className="whitespace-nowrap">{option.label}</div>
      {checked && <Icon icon="solar:check-circle-bold-duotone" className="ml-auto" />}
    </Group>
  );

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
              })),
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
          onDone: () => {
            ctrl.abort();
            appendVisitedNode('__end__');
            setIsStreaming(false);
          },
          onNodeChange: (node: string) => {
            appendVisitedNode(node);
          },
        });
      },
    });
  };

  useLayoutEffect(() => {
    scrollRef.current!.scrollTo({
      top: scrollRef.current!.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleClearConversation = async () => {
    setMessages([]);
    setConversationId(null);
    await navigate(model ? `/agent?model=${model}` : '/agent');
  };

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
      <div className="flex w-full flex-col overflow-y-auto">
        <div className="flex w-full items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-bold">Agent Chat</h1>
          </div>

          <Tooltip label="New Conversation">
            <ActionIcon variant="subtle" ml="auto" onClick={handleClearConversation}>
              <Icon icon="mdi:chat-plus" className="text-2xl" />
            </ActionIcon>
          </Tooltip>

          <ActionIcon variant="subtle" onClick={panelHandler.toggle}>
            <Icon icon="solar:siderbar-bold-duotone" className="text-2xl" />
          </ActionIcon>
        </div>

        <Divider className="my-3" />

        <ScrollArea.Autosize offsetScrollbars viewportRef={scrollRef} className="mb-4">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-y-3">
            {messages.map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))}
          </div>
        </ScrollArea.Autosize>

        <ChatInput
          className="mx-auto mt-auto w-full max-w-2xl"
          onSubmit={handleSubmit}
          disabled={isStreaming}
          isStreaming={isStreaming}
          placeholder="Ask anything">
          <Select
            size="xs"
            variant="unstyled"
            disabled={models.isFetching}
            data={(models.data ?? []).map((model) => ({
              value: model.name,
              label: model.display_name,
            }))}
            renderOption={renderSelectOption}
            value={model}
            onChange={(value) => {
              setModel(value);
              if (value) setSearchParams({ model: value });
            }}
            leftSection={
              <Icon
                icon={getLlmProviderIcon(
                  (models.data ?? []).find((m) => m.name === model)?.provider as LlmProvider
                )}
              />
            }
            w={140}
            allowDeselect={false}
          />
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
                <Tabs.Tab value="graph">Graph</Tabs.Tab>
                <Tabs.Tab value="mermaid">Mermaid</Tabs.Tab>
                <Tabs.Tab value="conversations">Conversations</Tabs.Tab>
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
