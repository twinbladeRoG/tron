import React, { useMemo, useState } from 'react';
import { Combobox, Loader, TextInput, useCombobox } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import { useOrganizationsInfiniteQuery } from '@/apis/queries/organizations.queries';

interface SelectOrganizationProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

const SelectOrganization: React.FC<SelectOrganizationProps> = ({ value, onChange, error }) => {
  const combobox = useCombobox();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useOrganizationsInfiniteQuery(debouncedSearch);

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
          label="Select Organization"
          value={options.find((o) => o.id === value)?.name || search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            combobox.openDropdown();
          }}
          onFocus={() => combobox.openDropdown()}
          rightSection={isFetching ? <Loader size="xs" /> : null}
          placeholder="Search organization..."
          mb="md"
          error={error}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: 'auto' }} onScroll={handleScroll}>
          {options.length === 0 && !isFetching ? (
            <Combobox.Empty>No results</Combobox.Empty>
          ) : (
            options.map((item) => (
              <Combobox.Option value={item.id} key={item.id}>
                {item.name}
              </Combobox.Option>
            ))
          )}

          {isFetchingNextPage && (
            <Combobox.Option value="loading" disabled>
              <Loader size="xs" />
            </Combobox.Option>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default SelectOrganization;
