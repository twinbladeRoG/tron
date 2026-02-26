import { Link, useLocation } from 'react-router';
import { Icon, type IconifyIcon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/lib/utils';

interface AppNavLinkProps {
  to: string;
  icon: string | IconifyIcon;
  label: string;
  isCollapsed?: boolean;
  className?: string;
  disabled?: boolean;
}

const AppNavLink: React.FC<AppNavLinkProps> = ({
  to,
  icon,
  label,
  className,
  isCollapsed,
  disabled,
}) => {
  const location = useLocation();

  return (
    <Link
      to={to}
      className={cn(
        className,
        'flex h-12 items-center gap-3 rounded-2xl px-3 py-1',
        'hover:bg-gray-200 dark:hover:bg-gray-800',
        {
          'bg-gray-300 text-blue-400 dark:bg-gray-900': location.pathname.startsWith(to),
        },
        {
          'opacity-40': disabled,
        }
      )}>
      <div className="size-6">
        <Icon icon={icon} className="text-2xl" />
      </div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.p
            className="flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.3 },
            }}>
            {label}
          </motion.p>
        )}
      </AnimatePresence>
    </Link>
  );
};

export default AppNavLink;
