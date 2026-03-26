import { useState } from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon, Divider, Kbd, ScrollArea, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useChatWithBrowserAgent } from '@/apis/queries/agent.queries';
import { cn } from '@/lib/utils';
import type { IBrowserAgentResult } from '@/types';

import ChatInput from '../../chat/ChatInput';

interface BrowserAgentProps {
  className?: string;
}

const BrowserAgent: React.FC<BrowserAgentProps> = ({ className }) => {
  const [showPanel, panelHandler] = useDisclosure(false);
  const [result, setResult] = useState<IBrowserAgentResult | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const chat = useChatWithBrowserAgent();

  const handleSubmit = (message: string) => {
    setIsStreaming(true);
    chat.mutate(message, {
      onSuccess: (res) => {
        setResult(res);
      },
      onSettled: () => {
        setIsStreaming(false);
      },
    });
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
      <div className="flex min-h-full w-full flex-col overflow-y-auto">
        <div className="flex w-full items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-bold">Agent Chat</h1>
          </div>

          <Tooltip
            position="left"
            label={
              <div className="flex">
                <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>B</Kbd>
              </div>
            }>
            <ActionIcon ml="auto" variant="subtle" onClick={panelHandler.toggle}>
              <Icon icon="solar:siderbar-bold-duotone" className="text-2xl" />
            </ActionIcon>
          </Tooltip>
        </div>

        <Divider className="my-3" />

        {!result && (
          <h1 className="mt-[20dvh] mb-6 text-center">
            <span className="pointer-events-none z-10 bg-linear-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-center text-5xl leading-none font-bold tracking-tighter whitespace-pre-wrap text-transparent">
              {import.meta.env.VITE_APP_NAME}
            </span>
          </h1>
        )}

        {result && (
          <ScrollArea.Autosize offsetScrollbars className="mb-4">
            <div className="my-auto flex-1">
              <Text>{result.result}</Text>
            </div>
          </ScrollArea.Autosize>
        )}

        <ChatInput
          className={cn('mx-auto w-full max-w-2xl', {
            'mt-auto': !!result,
            'mt-10': !result,
          })}
          onSubmit={handleSubmit}
          disabled={isStreaming}
          isStreaming={isStreaming || !result}
          placeholder="Ask anything"
        />
      </div>
    </section>
  );
};

export default BrowserAgent;
