import React, { useMemo, useState } from 'react';
import { Combobox, Loader, Pill, PillsInput, Text, TextInput, useCombobox } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import { useTeamsInfiniteQuery } from '@/apis/queries/teams.queries';

interface SelectTeamsProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
}

const SelectTeams: React.FC<SelectTeamsProps> = ({ value = [], onChange, error }) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useTeamsInfiniteQuery(debouncedSearch);

  const options = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const selectedTeams = useMemo(() => {
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
        <PillsInput label="Select Teams" error={error} onClick={() => combobox.openDropdown()}>
          <Pill.Group>
            {selectedTeams.map((team) => (
              <Pill key={team.id} withRemoveButton onRemove={() => handleSelect(team.id)}>
                {team.name}
              </Pill>
            ))}

            <Combobox.EventsTarget>
              <TextInput
                variant="unstyled"
                placeholder="Search teams..."
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
            options.map((team) => (
              <Combobox.Option value={team.id} key={team.id} active={value.includes(team.id)}>
                <div className="flex flex-col flex-wrap gap-x-2 gap-y-1">
                  <Text size="sm" className="block">
                    {team.name}
                  </Text>
                  <Text size="xs" className="" opacity={0.5}>
                    <span className="uppercase">{team.division.slug}</span>
                    {' • '}
                    {team.division.organization.name}
                  </Text>
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

export default SelectTeams;
