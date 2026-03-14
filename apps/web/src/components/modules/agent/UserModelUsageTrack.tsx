import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import {
  ActionIcon,
  Divider,
  type MantineColor,
  Popover,
  Progress,
  RingProgress,
  Skeleton,
  Text,
} from '@mantine/core';

import { useTokenUsageForModel } from '@/apis/queries/token-bucket.queries';
import { cn, compactNumberFormatter } from '@/lib/utils';
import type { IDivision, IOrganization, ITeam, ITokenUsageForModelBucket, IUser } from '@/types';

interface UserModelUsageTrackProps {
  modelSlug?: string | null;
  className?: string;
}

const UserModelUsageTrack: React.FC<UserModelUsageTrackProps> = ({ modelSlug, className }) => {
  const usage = useTokenUsageForModel(modelSlug!);

  const percentage = useMemo(
    () => ((usage.data?.total_used ?? 1) / (usage.data?.total_limit ?? 1)) * 100,
    [usage.data]
  );

  const getStatusColor = (value: number): MantineColor => {
    if (value > 90) return 'red';
    if (value > 75) return 'orange';
    if (value > 50) return 'yellow';
    if (value > 25) return 'teal';

    return 'green';
  };

  const getSubjectColor = (subject: string): MantineColor => {
    switch (subject) {
      case 'user':
        return 'teal';
      case 'team':
        return 'lime';
      case 'division':
        return 'yellow';
      case 'organization':
        return 'orange';
      default:
        return 'dark';
    }
  };

  const renderSubjectTag = (bucket: ITokenUsageForModelBucket) => {
    switch (bucket.subject_type) {
      case 'user':
        return (
          <Text className="text-xs!">
            User Bucket:{' '}
            <Text size="sm" component="strong" fw="bold" c={getSubjectColor(bucket.subject_type)}>
              {(bucket.subject as IUser)?.username}
            </Text>
          </Text>
        );
      case 'team':
        return (
          <Text className="text-xs!">
            Team Bucket:{' '}
            <Text
              size="sm"
              className="uppercase"
              component="strong"
              fw="bold"
              c={getSubjectColor(bucket.subject_type)}>
              {(bucket.subject as ITeam)?.slug}
            </Text>
          </Text>
        );
      case 'organization':
        return (
          <Text className="text-xs!">
            Organization Bucket:{' '}
            <Text
              size="sm"
              className="uppercase"
              component="strong"
              fw="bold"
              c={getSubjectColor(bucket.subject_type)}>
              {(bucket.subject as IOrganization)?.slug}
            </Text>
          </Text>
        );
      case 'division':
        return (
          <Text className="text-xs!">
            Division Bucket:{' '}
            <Text
              size="sm"
              className="uppercase"
              component="strong"
              fw="bold"
              c={getSubjectColor(bucket.subject_type)}>
              {(bucket.subject as IDivision)?.slug}
            </Text>
          </Text>
        );
      default:
        return undefined;
    }
  };

  if (usage.isError)
    return (
      <Popover width={220} position="top" withArrow shadow="md">
        <Popover.Target>
          <ActionIcon radius="xl" variant="subtle" color="yellow">
            <Icon icon="solar:shield-warning-bold-duotone" className="text-2xl" />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <div className="text-yellow-600">You don't have tokens allocated for this model!</div>
        </Popover.Dropdown>
      </Popover>
    );

  if (!usage.data) return <Skeleton h={24} w={120} />;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Progress.Root size="xl" className="flex-1">
        <Progress.Section value={percentage} color={getStatusColor(percentage)} striped>
          <Progress.Label>{usage.data?.total_used}</Progress.Label>
        </Progress.Section>
        <Progress.Section value={100 - percentage} color="gray">
          <Progress.Label>{usage.data?.total_remaining}</Progress.Label>
        </Progress.Section>
      </Progress.Root>
      <p className="font-bold">
        <span className="text-xs">
          {compactNumberFormatter.format(usage.data?.total_used ?? 0)}
        </span>
        <span className="text-xs">{` / `}</span>
        <span className="text-xs">
          {compactNumberFormatter.format(usage.data?.total_limit ?? 0)}
        </span>
      </p>

      <Popover width={320} position="top" withArrow shadow="md">
        <Popover.Target>
          <ActionIcon radius="xl" variant="subtle">
            <Icon icon="solar:chart-bold-duotone" />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
          <div className="flex flex-col gap-2">
            {usage.data.buckets.map((bucket) => {
              const percentage = (bucket.used / bucket.limit) * 100;
              const color = getStatusColor(percentage);
              return (
                <div
                  className="flex items-center gap-2"
                  key={bucket.subject_id + bucket.subject_type}>
                  <RingProgress
                    size={60}
                    thickness={6}
                    roundCaps
                    sections={[{ value: percentage, color: color }]}
                    label={
                      <Text size="12" ta="center" fw="bold">
                        {percentage.toFixed(0)}%
                      </Text>
                    }
                  />
                  <div className="flex-1">
                    <div>{renderSubjectTag(bucket)}</div>
                    <div className="grid grid-cols-[1fr_60px] items-center gap-2">
                      <Progress.Root size="xl" className="">
                        <Progress.Section value={percentage} color={color} striped>
                          <Progress.Label>{bucket.used}</Progress.Label>
                        </Progress.Section>
                        <Progress.Section
                          value={(bucket.remaining / bucket.limit) * 100}
                          color="gray">
                          <Progress.Label>{bucket.remaining}</Progress.Label>
                        </Progress.Section>
                      </Progress.Root>

                      <div className="text-right font-bold">
                        <span className="text-xs">
                          {compactNumberFormatter.format(bucket.used)}
                        </span>
                        <span className="text-xs">{` / `}</span>
                        <span className="text-xs">
                          {compactNumberFormatter.format(bucket.limit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Divider />

            <div className="flex gap-2">
              <RingProgress
                size={80}
                thickness={10}
                roundCaps
                sections={
                  usage.data?.buckets.map((bucket) => ({
                    value: (bucket.used / usage.data.total_limit) * 100,
                    color: getSubjectColor(bucket.subject_type),
                  })) ?? []
                }
                label={
                  <Text size="12" ta="center" fw="bold">
                    {percentage.toFixed(0)}%
                  </Text>
                }
              />

              <div className="flex-1">
                <p className="mb-1 text-right text-xl font-bold">
                  <span className="">
                    {compactNumberFormatter.format(usage.data?.total_used ?? 0)}
                  </span>
                  <span className="">{` / `}</span>
                  <span className="">
                    {compactNumberFormatter.format(usage.data?.total_limit ?? 0)}
                  </span>
                </p>
                <Progress.Root size="xl" className="f">
                  {usage.data.buckets.map((bucket) => (
                    <Progress.Section
                      key={bucket.subject_type + bucket.subject_id}
                      value={(bucket.used / usage.data.total_limit) * 100}
                      color={getSubjectColor(bucket.subject_type)}
                      striped>
                      <Progress.Label>{bucket.used}</Progress.Label>
                    </Progress.Section>
                  ))}
                  <Progress.Section
                    value={(usage.data.total_remaining / usage.data.total_limit) * 100}
                    color="gray">
                    <Progress.Label>{usage.data.total_remaining}</Progress.Label>
                  </Progress.Section>
                </Progress.Root>
              </div>
            </div>
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};

export default UserModelUsageTrack;
