import { useNavigate } from 'react-router';
import { Icon } from '@iconify/react';
import { Button, Text, Title } from '@mantine/core';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full items-center justify-center px-4">
      <div className="w-full max-w-lg p-12 text-center backdrop-blur-sm">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-red-100 p-5 dark:bg-red-900/30">
            <Icon
              icon="solar:lock-keyhole-bold"
              className="text-red-600 dark:text-red-400"
              width="48"
            />
          </div>
        </div>

        {/* Title */}
        <Title order={2} className="mb-3 tracking-tight">
          Access Restricted
        </Title>

        {/* Description */}
        <Text size="sm" c="dimmed" className="mb-6 leading-relaxed" mb="lg">
          You don’t have permission to access this page.
        </Text>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            radius="md"
            fullWidth
            leftSection={<Icon icon="solar:home-2-bold" width="18" />}
            onClick={() => navigate('/')}>
            Go to Home
          </Button>

          <Button
            radius="md"
            variant="light"
            fullWidth
            leftSection={<Icon icon="solar:arrow-left-outline" width="18" />}
            onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
