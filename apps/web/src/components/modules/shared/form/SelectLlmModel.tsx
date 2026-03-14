import React from 'react';
import { Icon } from '@iconify/react';
import { Group, Select, type SelectProps } from '@mantine/core';

import { useLlmModels } from '@/apis/queries/llm-models.queries';
import { getLlmProviderIcon } from '@/lib/utils';
import type { LlmProvider } from '@/types';

interface SelectLlmModelProps extends SelectProps {
  valueKey?: 'name' | 'id';
}

const SelectLlmModel: React.FC<SelectLlmModelProps> = ({
  value,
  valueKey = 'name',
  onChange,
  ...props
}) => {
  const models = useLlmModels();

  const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
    <Group flex="1" gap="xs">
      <Icon
        icon={getLlmProviderIcon(
          (models.data ?? []).find((m) => m.name === option.value)?.provider as LlmProvider
        )}
      />
      <div className="whitespace-nowrap">{option.label}</div>
      {checked && <Icon icon="solar:check-circle-bold-duotone" className="ml-auto" />}
    </Group>
  );

  return (
    <Select
      size="xs"
      variant="unstyled"
      disabled={models.isFetching}
      data={(models.data ?? []).map((model) => ({
        value: model[valueKey],
        label: model.display_name,
      }))}
      renderOption={renderSelectOption}
      value={value}
      onChange={onChange}
      leftSection={
        <Icon
          icon={getLlmProviderIcon(
            (models.data ?? []).find((m) => m[valueKey] === value)?.provider as LlmProvider
          )}
        />
      }
      w={140}
      allowDeselect={false}
      {...props}
    />
  );
};

export default SelectLlmModel;
