import { Navigate, Outlet, useNavigate } from 'react-router';
import { Icon } from '@iconify/react';
import { ActionIcon, Avatar, Menu, Skeleton, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';

import { useActiveUser } from '@/apis/queries/auth.queries';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { cn } from '@/lib/utils';

import AppNavLink from './AppNavLink';

const RootLayout = () => {
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const user = useActiveUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    modals.openConfirmModal({
      title: 'Are you sure you want to logout?',
      children: (
        <Text size="sm">
          This action will log you out of your account and you will need to log in again to access
          the application.
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onConfirm: async () => {
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('REFRESH_TOKEN');
        queryClient.clear();
        await navigate('/');
      },
    });
  };

  return (
    <main
      className={cn(
        'grid h-dvh grid-rows-[40px_auto_32px] bg-gray-100 dark:bg-gray-950',
        'transition-[grid-template-columns] duration-500',
        {
          'grid-cols-[280px_1fr]': desktopOpened,
          'grid-cols-[66px_1fr] sm:grid-cols-[80px_1fr]': !desktopOpened,
        }
      )}>
      <header className="col-span-2 col-start-1 row-start-1 flex items-center gap-2 px-4">
        <ActionIcon variant="subtle" color="dark" onClick={toggleDesktop}>
          <Icon
            icon="solar:sidebar-minimalistic-bold-duotone"
            className={cn('transition-transform duration-500', {
              'rotate-180': desktopOpened,
            })}
          />
        </ActionIcon>

        <h1
          className={cn(
            'pointer-events-none z-10 bg-linear-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text tracking-tighter whitespace-pre-wrap text-transparent',
            'm-0 text-center text-2xl leading-none font-bold'
          )}>
          {import.meta.env.VITE_APP_NAME}
        </h1>

        <AnimatedThemeToggler className="ml-auto" />
      </header>

      <nav className="flex flex-col px-2 sm:px-4">
        <AppNavLink
          to="/chat"
          label="Chat"
          icon="solar:chat-square-bold-duotone"
          isCollapsed={!desktopOpened}
        />
        <AppNavLink to="/models" label="Models" icon="si:ai-duotone" isCollapsed={!desktopOpened} />
        <AppNavLink
          to="/agent"
          label="Agent"
          icon="ph:robot-duotone"
          isCollapsed={!desktopOpened}
        />
        <AppNavLink
          to="/scrapper"
          label="Scrapper"
          icon="solar:shield-network-bold-duotone"
          isCollapsed={!desktopOpened}
        />

        {user.isLoading ? (
          <Skeleton h={100} mt="sm" animate={false} />
        ) : (
          <div className="mt-auto flex h-10 items-center gap-4">
            <Avatar size={40}>
              {user.data?.first_name?.charAt(0)}
              {user.data?.last_name?.charAt(0)}
            </Avatar>

            <AnimatePresence>
              {desktopOpened && (
                <motion.div
                  className="flex flex-1 items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.3 } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                  <div className="">
                    <Text size="xs" fw="bold">
                      {user.data?.first_name} {user.data?.last_name}
                    </Text>
                    <Text size="xs" opacity={0.7}>
                      @{user.data?.username}
                    </Text>
                  </div>

                  <Menu>
                    <Menu.Target>
                      <ActionIcon variant="subtle" ml="auto">
                        <Icon icon="mdi:dots-vertical" className="text-2xl" />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<Icon icon="mdi:logout" />}
                        color="red"
                        onClick={handleLogout}>
                        Logout
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      <section className="mr-4 overflow-auto rounded-2xl bg-gray-50 p-4 shadow-xl dark:bg-gray-900">
        {user.isError ? <Navigate to="/login" /> : <Outlet />}
      </section>

      <footer className="col-start-2 row-start-3 flex w-full items-center justify-center">
        <p className="text-xs"> {import.meta.env.VITE_APP_NAME}</p>
      </footer>
    </main>
  );
};

export default RootLayout;
