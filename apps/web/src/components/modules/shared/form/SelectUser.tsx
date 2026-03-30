import React, { useEffect, useMemo, useState } from 'react';
import {
  CloseButton,
  Combobox,
  Loader,
  Text,
  TextInput,
  type TextInputProps,
  useCombobox,
} from '@mantine/core';
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

  const selectedUser = useMemo(
    () => options.find((option) => String(option[valueKey]) === value),
    [options, value, valueKey]
  );

  useEffect(() => {
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setSearch('');
      return;
    }

    if (selectedUser) {
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setSearch(selectedUser.username);
    }
  }, [selectedUser, value]);

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

  const handleClear = () => {
    setSearch('');
    onChange?.('');
    combobox.closeDropdown();
  };

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const nextUser = options.find((option) => String(option[valueKey]) === val);

        setSearch(nextUser?.username ?? '');
        onChange?.(val);
        combobox.closeDropdown();
      }}>
      <Combobox.Target>
        <TextInput
          label="Select User"
          placeholder="Search user..."
          mb="md"
          {...props}
          value={search}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;

            setSearch(nextValue);

            if (value && nextValue !== selectedUser?.username) {
              onChange?.('');
            }

            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          rightSection={
            isFetching ? (
              <Loader size="xs" />
            ) : search || value ? (
              <CloseButton aria-label="Clear selected user" onClick={handleClear} />
            ) : null
          }
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
