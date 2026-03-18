import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import { ActionIcon, Button, Textarea } from '@mantine/core';
import * as yup from 'yup';

import Navbar from '@/components/modules/shared/Navbar';
import { BackgroundLines } from '@/components/ui/background-lines';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store';

const schema = yup.object({
  message: yup.string().required('Required'),
});

const Home = () => {
  const user = useUserStore((state) => state.user);
  const form = useForm({ resolver: yupResolver(schema), defaultValues: { message: '' } });
  const navigate = useNavigate();

  const handleSubmit = form.handleSubmit(async (data) => {
    await navigate(`/agent?q=${data.message}`);
  });

  return (
    <main className="flow-root">
      <Navbar className="fixed top-0 z-10 w-full p-4" />
      <section className="relative h-dvh w-full">
        <BackgroundLines className="flex w-full flex-col items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
          <div className="absolute top-1/2 left-1/2 flex -translate-1/2 flex-col items-center">
            <h1 className="mb-6 text-center">
              {user ? (
                <span className="text-6xl">
                  Hi {user?.first_name}, welcome to <br />
                </span>
              ) : null}
              <span className="pointer-events-none z-10 bg-linear-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-center text-7xl leading-none font-bold tracking-tighter whitespace-pre-wrap text-transparent">
                {import.meta.env.VITE_APP_NAME}
              </span>
            </h1>
            <h2 className="mb-6">AI Agentic Orchestration</h2>

            <form
              onSubmit={handleSubmit}
              className={cn(
                'mx-auto mb-10 flex w-full max-w-3xl items-center gap-2 rounded-4xl transition-shadow duration-500',
                'bg-white/70 p-4 shadow-lg shadow-blue-200 focus-within:shadow-xl focus-within:shadow-blue-400 dark:bg-neutral-900/70'
              )}>
              <Textarea
                {...form.register('message')}
                className="flex-1"
                classNames={{
                  input: 'border-0! bg-transparent!',
                }}
                autosize
                radius="xl"
                maxRows={6}
                placeholder="Ask Anything"
                required
              />

              <ActionIcon radius="xl" size="xl" type="submit">
                <Icon icon="solar:round-arrow-right-bold" className="text-2xl" />
              </ActionIcon>
            </form>

            <div className="flex gap-4">
              {user ? (
                <Button
                  component={Link}
                  to="/agent"
                  variant="gradient"
                  gradient={{ from: 'red', to: 'indigo', deg: 127 }}>
                  Chat
                </Button>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="gradient"
                  gradient={{ from: 'red', to: 'indigo', deg: 127 }}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </BackgroundLines>
      </section>
    </main>
  );
};

export default Home;
