import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Group, Select, type SelectProps } from '@mantine/core';

import { useLlmModels } from '@/apis/queries/llm-models.queries';
import { getLlmProviderIcon } from '@/lib/utils';
import type { ILlmModel, LlmProvider } from '@/types';

interface SelectLlmModelProps extends SelectProps {
  valueKey?: keyof ILlmModel;
  autoSelectFirstValue?: boolean;
  allowSelectDisabledModels?: boolean;
}

const SelectLlmModel: React.FC<SelectLlmModelProps> = ({
  value,
  valueKey = 'name',
  onChange,
  autoSelectFirstValue = false,
  allowSelectDisabledModels = false,
  ...props
}) => {
  const models = useLlmModels();

  const options = (models.data ?? []).map((model) => ({
    value: String(model[valueKey]),
    label: model.display_name,
    disabled: !allowSelectDisabledModels && !model.has_access,
  }));

  useEffect(() => {
    if (autoSelectFirstValue && value === null && models.data && models.data.length > 0) {
      const val = models.data[0][valueKey];
      const option = models.data[0];
      onChange?.(String(val), {
        value: String(option[valueKey]),
        label: option.display_name,
        disabled: !option.has_access,
      });
    }
  }, [autoSelectFirstValue, value, models.data, onChange, valueKey]);

  const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
    <Group flex="1" gap="xs">
      <Icon
        icon={getLlmProviderIcon(
          (models.data ?? []).find((m) => m.name === option.value)?.provider as LlmProvider
        )}
      />
      <div className="whitespace-nowrap">{option.label}</div>
      {checked && <Icon icon="solar:check-circle-bold-duotone" className="ml-auto" />}
      {!checked && option.disabled && (
        <Icon icon="solar:shield-cross-bold-duotone" className="ml-auto text-red-600" />
      )}
    </Group>
  );

  return (
    <Select
      disabled={models.isFetching}
      data={options}
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
