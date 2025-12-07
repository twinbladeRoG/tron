import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import { ActionIcon, Textarea } from '@mantine/core';
import * as yup from 'yup';

import { cn } from '@/lib/utils';

import { ShineBorder } from '../../ui/shine-border';

interface ChatInputProps {
  className?: string;
  onSubmit?: (message: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}

const schema = yup.object({
  message: yup.string().required('Required'),
});

const ChatInput: React.FC<ChatInputProps> = ({
  className,
  onSubmit,
  disabled,
  isStreaming,
  placeholder,
  children,
}) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      message: '',
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    form.reset();
    onSubmit?.(data.message);
  });

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit();
    }
  };

  return (
    <form
      className={cn(
        className,
        'relative flex flex-col items-start gap-x-3 rounded-lg border bg-white p-2 dark:bg-slate-950'
      )}
      onSubmit={handleSubmit}>
      {isStreaming && (
        <ShineBorder borderWidth={2} shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />
      )}

      <Controller
        control={form.control}
        name="message"
        render={({ field, fieldState }) => (
          <Textarea
            className="w-full"
            error={!!fieldState.error?.message}
            autosize
            minRows={2}
            maxRows={6}
            {...field}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            classNames={{
              input: '!bg-transparent !border-0 !p-0',
            }}
          />
        )}
      />

      <div className="flex w-full items-center gap-2">
        {children}

        <ActionIcon size="md" type="submit" ml="auto" disabled={disabled}>
          <Icon icon="solar:map-arrow-up-bold-duotone" className="text-xl" />
        </ActionIcon>
      </div>
    </form>
  );
};

export default ChatInput;
