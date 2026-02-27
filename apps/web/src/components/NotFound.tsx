import { useNavigate } from 'react-router';
import { Icon } from '@iconify/react';
import { Button, Card, Text, Title } from '@mantine/core';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-950">
      <Card
        shadow="xl"
        radius="2xl"
        className="w-full max-w-lg border border-gray-200 bg-white/80 p-12 text-center backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900/80">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-blue-100 p-5 dark:bg-blue-900/30">
            <Icon
              icon="solar:danger-triangle-bold"
              className="text-blue-600 dark:text-blue-400"
              width="48"
            />
          </div>
        </div>

        {/* Big 404 */}
        <Title order={1} className="mb-2 text-5xl font-bold tracking-tight">
          404
        </Title>

        {/* Title */}
        <Title order={3} className="mb-3">
          Page Not Found
        </Title>

        {/* Description */}
        <Text size="sm" c="dimmed" className="mb-6 leading-relaxed">
          The page you’re looking for doesn’t exist or may have been moved. Please check the URL or
          navigate back to a safe place.
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
      </Card>
    </div>
  );
}
