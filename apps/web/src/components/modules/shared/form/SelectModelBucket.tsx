import React, { useMemo } from 'react';
import { Combobox, Loader, Text, TextInput, type TextInputProps, useCombobox } from '@mantine/core';

import { useModelBucketsQuery } from '@/apis/queries/token-bucket.queries';
import { compactNumberFormatter } from '@/lib/utils';
import type { IDivision, IOrganization, ITeam, IUser } from '@/types';

import ModelSubject from '../../llm-models/ModelSubject';

interface SelectModelBucketProps extends Omit<TextInputProps, 'value' | 'onChange'> {
  value?: string | null;
  onChange?: (value: string) => void;
  error?: string;
  modelId: string;
}

const SelectModelBucket: React.FC<SelectModelBucketProps> = ({
  value,
  onChange,
  error,
  modelId,
  ...props
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useModelBucketsQuery(modelId);

  const options = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const handleScroll = async (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;

    if (
      target.scrollTop + target.clientHeight >= target.scrollHeight - 10 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      await fetchNextPage();
    }
  };

  const currentValue = useMemo(() => {
    const option = options.find((o) => o.id === value);

    if (!option) return '';

    let slug: string;

    switch (option.subject_type) {
      case 'organization': {
        const subject = option.subject as IOrganization;
        slug = subject.slug;
        break;
      }

      case 'division': {
        const subject = option.subject as IDivision;
        slug = subject.slug;
        break;
      }

      case 'team': {
        const subject = option.subject as ITeam;
        slug = subject.slug;
        break;
      }

      case 'user': {
        const subject = option.subject as IUser;
        slug = subject.username;
        break;
      }

      default:
        slug = '';
        break;
    }

    return `${option.subject_type} • ${slug} • ${compactNumberFormatter.format(option.token_limit)} • ${option.period_type}`;
  }, [options, value]);

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        onChange?.(val);
        combobox.closeDropdown();
      }}>
      <Combobox.Target>
        <TextInput
          label="Select Token Bucket"
          mb="md"
          {...props}
          value={currentValue}
          onChange={() => {
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          rightSection={isFetching ? <Loader size="xs" /> : null}
          error={error}
          readOnly
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: 'auto' }} onScroll={handleScroll}>
          {options.length === 0 && !isFetching ? (
            <Combobox.Empty>No results</Combobox.Empty>
          ) : (
            options.map((option) => (
              <Combobox.Option value={option.id} key={option.id}>
                <div className="flex flex-col flex-wrap gap-x-2 gap-y-1">
                  <ModelSubject
                    subjectType={option.subject_type}
                    subject={option.subject}
                    hideName
                  />
                  <Text size="sm" className="" opacity={1}>
                    <span className="">Token Limit: {option.token_limit}</span>
                    {' • '}
                    <span className="">Period: {option.period_type}</span>
                  </Text>
                </div>
              </Combobox.Option>
            ))
          )}

          {isFetching && (
            <Combobox.Option
              value="loading"
              disabled
              className="flex items-center justify-center opacity-100!">
              <Loader size="xs" color="blue" type="dots" />
            </Combobox.Option>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default SelectModelBucket;
