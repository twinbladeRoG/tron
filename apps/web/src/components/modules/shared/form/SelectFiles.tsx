import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { Combobox, Loader, Pill, PillsInput, TextInput, useCombobox } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import { useUserFilesInfiniteQuery } from '@/apis/queries/file-storage.queries';
import { cn, getFileIcon, getFileIconColor } from '@/lib/utils';

interface SelectFilesProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
  label?: string;
  className?: string;
}

const SelectFiles: React.FC<SelectFilesProps> = ({
  value = [],
  onChange,
  error,
  label,
  className,
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useUserFilesInfiniteQuery(debouncedSearch);

  const options = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const selectedFiles = useMemo(() => {
    return options.filter((team) => value.includes(team.id));
  }, [options, value]);

  const handleSelect = (teamId: string) => {
    const isSelected = value.includes(teamId);

    const newValue = isSelected ? value.filter((id) => id !== teamId) : [...value, teamId];

    onChange?.(newValue);
  };

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
    <Combobox store={combobox} onOptionSubmit={handleSelect}>
      <Combobox.Target>
        <PillsInput
          label={label}
          error={error}
          onClick={() => combobox.openDropdown()}
          className={className}>
          <Pill.Group>
            {selectedFiles.map((file) => (
              <Pill key={file.id} withRemoveButton onRemove={() => handleSelect(file.id)}>
                <div className="flex items-center gap-1">
                  <Icon
                    icon={getFileIcon(file.content_type)}
                    className={cn('text-base', getFileIconColor(file.content_type))}
                  />
                  <span>{file.original_filename}</span>
                </div>
              </Pill>
            ))}

            <Combobox.EventsTarget>
              <TextInput
                variant="unstyled"
                placeholder="Search files..."
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  combobox.openDropdown();
                }}
                onFocus={() => combobox.openDropdown()}
                rightSection={isFetching ? <Loader size="xs" /> : null}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: 'auto' }} onScroll={handleScroll}>
          {options.length === 0 && !isFetching ? (
            <Combobox.Empty>No results</Combobox.Empty>
          ) : (
            options.map((file) => (
              <Combobox.Option value={file.id} key={file.id} active={value.includes(file.id)}>
                <div className="flex flex-col flex-wrap gap-x-2 gap-y-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={getFileIcon(file.content_type)}
                      className={cn('text-2xl', getFileIconColor(file.content_type))}
                    />
                    <span className="text-sm">{file.original_filename}</span>
                    {value.includes(file.id) ? (
                      <Icon icon="solar:check-circle-bold-duotone" className="text-dark ml-auto" />
                    ) : null}
                  </div>
                </div>
              </Combobox.Option>
            ))
          )}

          {isFetchingNextPage && (
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

export default SelectFiles;
