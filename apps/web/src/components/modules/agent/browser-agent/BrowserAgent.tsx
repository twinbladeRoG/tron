import { useEffect } from 'react';
import { Link } from 'react-router';
import { Icon } from '@iconify/react';
import {
  ActionIcon,
  Divider,
  Kbd,
  Menu,
  ScrollArea,
  Slider,
  Spoiler,
  Tooltip,
} from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { FootprintsIcon, SearchIcon } from 'lucide-react';

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought';
import { cn } from '@/lib/utils';

import ChatInput from '../../chat/ChatInput';
import ImageSlider from '../../shared/ImageSlider';
import ChatMessage from '../ChatMessage';

import { useBrowserAgent } from './hook';

interface BrowserAgentProps {
  className?: string;
}

const BrowserAgent: React.FC<BrowserAgentProps> = ({ className }) => {
  const [showPanel, panelHandler] = useDisclosure(false);
  const {
    run,
    steps,
    finalResult,
    plans,
    isStreaming,
    isDone,
    query,
    options,
    updateOption,
    usage,
    reset,
    screenshots,
  } = useBrowserAgent();
  const [openPlans, planHandler] = useDisclosure(true);
  const [openSteps, stepHandler] = useDisclosure(true);

  useHotkeys([['ctrl + shift + O', () => handleNewConversation()]]);
  useHotkeys([['ctrl + shift + B', panelHandler.toggle]]);

  const handleSubmit = async (message: string) => {
    planHandler.open();
    stepHandler.open();
    await run(message);
  };

  useEffect(() => {
    if (isDone) {
      planHandler.close();
      stepHandler.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  const handleNewConversation = () => {
    reset();
    planHandler.close();
    stepHandler.close();
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
            <h1 className="font-bold">Browser Chat</h1>
          </div>

          <Tooltip
            position="left"
            label={
              <div className="flex">
                <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>O</Kbd>
              </div>
            }>
            <ActionIcon ml="auto" variant="subtle" onClick={handleNewConversation}>
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

        {!isStreaming && !isDone && (
          <h1 className="mt-[20dvh] mb-6 text-center text-5xl">
            Browse the&nbsp;
            <span className="pointer-events-none z-10 bg-linear-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text leading-none font-bold tracking-tighter whitespace-pre-wrap text-transparent">
              Web, Hands-Free
            </span>
          </h1>
        )}

        <ScrollArea.Autosize offsetScrollbars className="mb-4">
          {(isStreaming || isDone) && (
            <div className="mx-auto flex w-full max-w-2xl flex-col">
              {/* eslint-disable-next-line jsx-a11y/aria-role */}
              {query && <ChatMessage role="human" id="human-message" message={query} />}

              <ChainOfThought
                defaultOpen
                open={openPlans}
                onOpenChange={planHandler.toggle}
                className="mb-4">
                <ChainOfThoughtHeader>Plan</ChainOfThoughtHeader>
                <ChainOfThoughtContent>
                  {plans?.reverse()?.map((plan, index) => (
                    <ChainOfThoughtStep
                      // eslint-disable-next-line @eslint-react/no-array-index-key, react-x/no-array-index-key
                      key={index}
                      icon={SearchIcon}
                      label={plan.text}
                      status="active"
                    />
                  ))}
                </ChainOfThoughtContent>
              </ChainOfThought>

              <ChainOfThought
                defaultOpen
                open={openSteps}
                onOpenChange={stepHandler.toggle}
                className="mb-4">
                <ChainOfThoughtHeader>Steps</ChainOfThoughtHeader>
                <ChainOfThoughtContent>
                  {steps.map((step, index) => (
                    <ChainOfThoughtStep
                      key={step.number}
                      icon={FootprintsIcon}
                      label={
                        <Spoiler
                          classNames={{
                            control: 'text-xs!',
                          }}
                          maxHeight={20}
                          showLabel="Show more"
                          hideLabel="Hide">
                          {step.extracted_content}
                        </Spoiler>
                      }
                      description={
                        <Spoiler
                          classNames={{
                            control: 'text-xs!',
                          }}
                          maxHeight={110}
                          showLabel="Show more"
                          hideLabel="Hide">
                          {step.thought}
                        </Spoiler>
                      }
                      status={
                        isDone ? 'complete' : index === steps.length - 1 ? 'active' : 'complete'
                      }>
                      <ChainOfThoughtSearchResults>
                        {(step.urls ?? [])
                          .filter((url) => url !== 'about:blank')
                          .map((website) => (
                            <ChainOfThoughtSearchResult
                              as={Link}
                              to={website}
                              target="_blank"
                              key={website}>
                              {new URL(website).hostname}
                            </ChainOfThoughtSearchResult>
                          ))}
                      </ChainOfThoughtSearchResults>
                    </ChainOfThoughtStep>
                  ))}
                </ChainOfThoughtContent>
              </ChainOfThought>

              <ImageSlider mb="lg" sources={screenshots?.filter((s) => !!s)} />

              {finalResult && (
                // eslint-disable-next-line jsx-a11y/aria-role
                <ChatMessage role="ai" id="ai-message" message={finalResult} usage={usage} />
              )}
            </div>
          )}
        </ScrollArea.Autosize>

        <ChatInput
          className={cn('mx-auto mt-10 w-full max-w-2xl', {
            'mt-auto': isStreaming || isDone,
          })}
          onSubmit={handleSubmit}
          disabled={isStreaming}
          isStreaming={isStreaming || !finalResult}
          placeholder="Ask anything">
          <Menu width={200} position="bottom-start">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <Icon icon="solar:settings-bold-duotone" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Number of Steps: {options.max_steps}</Menu.Label>
              <Menu.Item>
                <Slider
                  value={options.max_steps}
                  onChange={(value) => updateOption({ max_steps: value })}
                  color="blue"
                  defaultValue={7}
                  min={1}
                  max={50}
                  mb="sm"
                />
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </ChatInput>
      </div>
    </section>
  );
};

export default BrowserAgent;
