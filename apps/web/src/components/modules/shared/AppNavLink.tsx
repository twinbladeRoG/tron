import { Link, useMatch } from 'react-router';
import { Icon, type IconifyIcon } from '@iconify/react';
import { Menu, NavLink, type NavLinkProps } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/lib/utils';

export type NavItem =
  | {
      to: string;
      label: string;
      icon: IconifyIcon | string;
      featureSlug?: string;
    }
  | {
      to: string;
      label: string;
      icon: IconifyIcon | string;
      featureSlug?: string;
      subMenu: Array<{
        to: string;
        label: string;
        icon: IconifyIcon | string;
        featureSlug?: string;
      }>;
    };

interface AppNavLinkProps extends NavLinkProps {
  isCollapsed?: boolean;
  className?: string;
  disabled?: boolean;
  item: NavItem;
}

const AppNavLink: React.FC<AppNavLinkProps> = ({ className, isCollapsed, disabled, item }) => {
  const match = useMatch({ path: item.to, end: false });

  if ('subMenu' in item)
    return (
      <Menu position="right-start" trigger="hover">
        <Menu.Target>
          <NavLink
            leftSection={<Icon icon={item.icon} className="text-2xl" />}
            active={!!match}
            className={cn('rounded-lg', className)}
            disabled={disabled}
            rightSection={isCollapsed ? null : undefined}
            classNames={{
              children: 'pt-2',
            }}
            label={
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.p
                    className="flex-1 whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.3 },
                    }}>
                    {item.label}
                  </motion.p>
                )}
              </AnimatePresence>
            }>
            <AnimatePresence>
              {!isCollapsed &&
                item.subMenu?.map((menu) => (
                  <AppNavLink
                    key={menu.label}
                    isCollapsed={isCollapsed}
                    disabled={disabled}
                    item={menu}
                  />
                ))}
            </AnimatePresence>
          </NavLink>
        </Menu.Target>

        {isCollapsed && (
          <Menu.Dropdown>
            {item.subMenu?.map((menu) => (
              <Menu.Item
                leftSection={<Icon icon={menu.icon} />}
                component={Link}
                to={menu.to}
                key={menu.label}
                disabled={disabled}>
                {menu.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        )}
      </Menu>
    );

  if ('to' in item)
    return (
      <NavLink
        component={Link}
        to={item.to}
        leftSection={<Icon icon={item.icon} className="text-2xl" />}
        active={!!match}
        className={cn('rounded-lg', className)}
        disabled={disabled}
        label={
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                className="flex-1 whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.3 },
                }}>
                {item.label}
              </motion.p>
            )}
          </AnimatePresence>
        }
      />
    );

  return null;
};

export default AppNavLink;
