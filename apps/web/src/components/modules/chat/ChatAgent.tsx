import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
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
import { AnimatePresence, motion } from 'motion/react';
import { v4 as uuid } from 'uuid';

import { getToken } from '@/apis/http';
import { useLlmModels } from '@/apis/queries/llm-models.queries';
import { cn, getLlmProviderIcon } from '@/lib/utils';
import type { LlmProvider } from '@/types';

import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import useChatMessages from './hook';
import type { IMessage } from './types';

interface ChatAgentProps {
  className?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const ChatAgent: React.FC<ChatAgentProps> = ({ className }) => {
  const models = useLlmModels();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [tab, setTab] = useState<string | null>('graph');
  const [showPanel, panelHandler] = useDisclosure();
  const [searchParams, setSearchParams] = useSearchParams();

  const [model, setModel] = useState<string | null>(null);

  useEffect(() => {
    if (model === null && searchParams.get('model') !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
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
    appendVisitedNode,
    setVisitedNodes,
  } = useChatMessages();

  const handleSubmit = async (message: string, hasInterrupt: boolean = false) => {
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
        role: 'user',
        message,
      } satisfies IMessage,
      {
        id: botMessageId,
        role: 'bot',
        message: '',
        isLoading: true,
      } satisfies IMessage,
    ]);

    const ctrl = new AbortController();

    const messageToSent = hasInterrupt
      ? (messages.find((m) => m.role === 'user')?.message ?? 'Hi')
      : message;

    await fetchEventSource(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken()}`,
      },
      body: JSON.stringify({
        message: messageToSent,
        model: model,
        conversation_id: conversationId,
        interrupt_response: hasInterrupt ? { message: message } : undefined,
      }),
      signal: ctrl.signal,

      async onopen(response) {
        if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
          appendVisitedNode('__start__');
          return;
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          let err_message: string | undefined = undefined;
          let error: string | undefined = undefined;

          if (response.headers.get('content-type') === 'application/json') {
            const result = (await response.json()) as {
              details: string[];
              error: string;
              type: string;
            };
            error = result?.error ?? 'An error has occurred';

            if (result?.type === 'RequestValidationError') {
              err_message = result?.details?.join('.');
            } else {
              err_message = result?.error;
            }
          }

          notifications.show({
            color: 'red',
            message: err_message,
            title: error,
          });

          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== botMessageId) return message;

              return {
                ...message,
                id: botMessageId,
                message: err_message ?? 'An error has occurred',
                role: 'bot',
                isLoading: false,
                isError: true,
              } satisfies IMessage;
            })
          );
          ctrl.abort();
          setIsStreaming(false);
        } else {
          notifications.show({
            color: 'yellow',
            message: 'Retry again!',
          });
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
              isError: true,
              role: 'bot',
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

  const handleClearConversation = () => {
    setMessages([]);
    setConversationId(null);
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
            <h1 className="font-bold">Chat</h1>
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
            defaultValue={models?.data?.[0].name}
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
                <Tabs.Tab value="mermaid">Mermaid</Tabs.Tab>
                <ActionIcon
                  className="ml-auto self-center"
                  variant="subtle"
                  color="red"
                  onClick={panelHandler.toggle}>
                  <Icon icon="solar:close-square-bold-duotone" />
                </ActionIcon>
              </Tabs.List>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ChatAgent;
