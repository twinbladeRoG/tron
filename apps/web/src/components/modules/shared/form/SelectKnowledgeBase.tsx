import React, { useMemo, useState } from 'react';
import { Combobox, Loader, TextInput, type TextInputProps, useCombobox } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import { useKnowledgeBasesInfiniteQuery } from '@/apis/queries/knowledge-base.queries';

interface SelectKnowledgeBaseProps extends Omit<TextInputProps, 'value' | 'onChange'> {
  value?: string | null;
  onChange?: (value: string) => void;
}

const SelectKnowledgeBase: React.FC<SelectKnowledgeBaseProps> = ({ value, onChange, ...props }) => {
  const combobox = useCombobox();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useKnowledgeBasesInfiniteQuery(debouncedSearch);

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
          value={options.find((o) => o.id === value)?.name || search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            combobox.openDropdown();
          }}
          onFocus={() => combobox.openDropdown()}
          rightSection={isFetching ? <Loader size="xs" /> : null}
          placeholder="Search knowledge base..."
          {...props}
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

export default SelectKnowledgeBase;
