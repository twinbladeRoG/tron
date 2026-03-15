import React, { useMemo, useState } from 'react';
import { Combobox, Loader, Text, TextInput, type TextInputProps, useCombobox } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import { useUsersInfiniteQuery } from '@/apis/queries/users.queries';
import type { IUser } from '@/types';

interface SelectUserProps extends Omit<TextInputProps, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  valueKey?: keyof IUser;
}

const SelectUser: React.FC<SelectUserProps> = ({ valueKey = 'id', value, onChange, ...props }) => {
  const combobox = useCombobox();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useUsersInfiniteQuery(debouncedSearch);

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

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        onChange?.(val);
        combobox.closeDropdown();
      }}>
      <Combobox.Target>
        <TextInput
          label="Select User"
          placeholder="Search user..."
          mb="md"
          {...props}
          value={options.find((o) => o[valueKey] === value)?.username || search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          rightSection={isFetching ? <Loader size="xs" /> : null}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: 'auto' }} onScroll={handleScroll}>
          {options.length === 0 && !isFetching ? (
            <Combobox.Empty>No results</Combobox.Empty>
          ) : (
            options.map((option) => (
              <Combobox.Option value={option[valueKey]} key={option.id}>
                <div className="flex flex-col flex-wrap gap-x-2 gap-y-1">
                  <Text size="sm" className="block">
                    {option.first_name} {option.last_name}
                  </Text>
                  <Text size="xs" className="" opacity={0.5}>
                    <span className="">{option.username}</span>
                    {' • '}
                    {option.email}
                  </Text>
                </div>
              </Combobox.Option>
            ))
          )}

          {(isFetching || isFetchingNextPage) && (
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

export default SelectUser;
