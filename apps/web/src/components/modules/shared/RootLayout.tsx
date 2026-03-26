import { useMemo } from 'react';
import { Link, Navigate, Outlet, useNavigate } from 'react-router';
import { Icon } from '@iconify/react';
import { ActionIcon, Avatar, Menu, Skeleton, Text } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';

import { useActiveUser } from '@/apis/queries/auth.queries';
import { useUserFeatures } from '@/apis/queries/policy.queries';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store';

import AppNavLink, { type NavItem } from './AppNavLink';

const RootLayout = () => {
  const features = useUserFeatures();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const user = useActiveUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useHotkeys([['ctrl + B', () => toggleDesktop()]]);
  const removeUser = useUserStore((state) => state.removeUser);

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
        removeUser();
        await navigate('/');
      },
    });
  };

  const checkForAccess = (featureFlag: string) => {
    const feature = features.data?.find((f) => f.slug === featureFlag);

    if (!feature) return false;

    if (!feature.is_active) return false;

    if (!feature.is_allowed) return false;

    return true;
  };

  const navItems = useMemo(
    () =>
      [
        {
          to: '/agent',
          label: 'Chat',
          icon: 'solar:chat-square-bold-duotone',
          featureSlug: 'chat',
        },
        {
          to: '/agents',
          label: 'Agent Foundry',
          icon: 'solar:black-hole-bold-duotone',
        },
        {
          to: '/files',
          label: 'Files',
          icon: 'solar:file-bold-duotone',
          featureSlug: 'files',
        },
        {
          to: '/knowledge-bases',
          label: 'Knowledge Base',
          icon: 'solar:book-bookmark-minimalistic-bold-duotone',
          featureSlug: 'knowledge-base',
        },
        {
          to: '/scrapper',
          label: 'Scrapper',
          icon: 'solar:shield-network-bold-duotone',
          featureSlug: 'scrapper',
        },
        {
          to: '/admin',
          label: 'Admin',
          icon: 'solar:folder-security-bold-duotone',
          featureSlug: 'admin-panel',
          subMenu: [
            {
              to: '/admin/policies',
              label: 'Policies',
              icon: 'solar:folder-security-bold-duotone',
              featureSlug: 'admin-panel',
            },
            {
              to: '/admin/organizations',
              label: 'Organizations',
              icon: 'solar:buildings-3-bold-duotone',
              featureSlug: 'admin-panel',
            },
            {
              to: '/admin/divisions',
              label: 'Divisions',
              icon: 'solar:buildings-bold-duotone',
              featureSlug: 'admin-panel',
            },
            {
              to: '/admin/teams',
              label: 'Teams',
              icon: 'solar:users-group-two-rounded-bold-duotone',
              featureSlug: 'admin-panel',
            },
            {
              to: '/admin/users',
              label: 'Users',
              icon: 'solar:users-group-rounded-bold-duotone',
              featureSlug: 'admin-panel',
            },
            {
              to: '/admin/features',
              label: 'Features',
              icon: 'solar:crown-minimalistic-bold-duotone',
              featureSlug: 'admin-panel',
            },
            {
              to: '/admin/models',
              label: 'LLM Models',
              icon: 'si:ai-duotone',
              featureSlug: 'admin-panel',
            },
            {
              to: '/admin/model-usage',
              label: 'Model Usage',
              icon: 'solar:graph-bold-duotone',
              featureSlug: 'admin-panel',
            },
          ],
        },
      ] satisfies Array<NavItem>,
    []
  );

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

        <Link to="/">
          <h1
            className={cn(
              'pointer-events-none z-10 bg-linear-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text tracking-tighter whitespace-pre-wrap text-transparent',
              'm-0 text-center text-2xl leading-none font-bold'
            )}>
            {import.meta.env.VITE_APP_NAME}
          </h1>
        </Link>

        <AnimatedThemeToggler className="ml-auto" />
      </header>

      <nav className="flex flex-col px-2 sm:px-4">
        {navItems.map((item) => (
          <AppNavLink
            key={item.label}
            isCollapsed={!desktopOpened}
            disabled={item.featureSlug ? !checkForAccess(item.featureSlug) : false}
            item={item}
          />
        ))}

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
