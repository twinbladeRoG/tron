import React from 'react';
import { Link } from 'react-router';
import { Icon } from '@iconify/react';
import { ActionIcon, Button } from '@mantine/core';

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store';

interface NavbarProps {
  className?: string;
  backTo?: string;
  canBack?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ className, backTo = '..', canBack = true }) => {
  const user = useUserStore((state) => state.user);

  return (
    <header className={className}>
      <nav
        className={cn(
          'isolate rounded bg-white/20 shadow-lg ring-1 ring-black/5',
          'flex items-center justify-between px-4 py-2'
        )}>
        {canBack ? (
          <ActionIcon variant="subtle" size="md" mr="md" component={Link} to={backTo}>
            <Icon icon="mdi:arrow-back" />
          </ActionIcon>
        ) : null}

        <Link to="/">
          <span
            className={cn(
              'pointer-events-none z-10 bg-linear-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text tracking-tighter whitespace-pre-wrap text-transparent',
              'text-center text-2xl leading-none font-bold'
            )}>
            {import.meta.env.VITE_APP_NAME}
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-x-4">
          {user ? (
            <Button
              variant="gradient"
              gradient={{ from: 'red', to: 'indigo', deg: 127 }}
              size="compact-sm"
              component={Link}
              to="/agent">
              Chat
            </Button>
          ) : (
            <Button
              variant="gradient"
              gradient={{ from: 'red', to: 'indigo', deg: 127 }}
              size="compact-sm"
              component={Link}
              to="/login">
              Login
            </Button>
          )}
          <AnimatedThemeToggler />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
