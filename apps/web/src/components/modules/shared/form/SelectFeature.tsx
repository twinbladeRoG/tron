import React from 'react';
import { Icon } from '@iconify/react';
import { Group, Select, type SelectProps } from '@mantine/core';

import { useFeatures } from '@/apis/queries/features.queries';
import type { IFeature } from '@/types';

interface SelectFeatureProps extends SelectProps {
  valueKey?: keyof IFeature;
}

const SelectFeature: React.FC<SelectFeatureProps> = ({
  value,
  valueKey = 'id',
  onChange,
  ...props
}) => {
  const features = useFeatures();

  const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
    <Group flex="1" gap="xs">
      <div className="whitespace-nowrap">{option.label}</div>
      {checked && <Icon icon="solar:check-circle-bold-duotone" className="ml-auto" />}
    </Group>
  );

  return (
    <Select
      disabled={features.isFetching}
      data={(features.data ?? []).map((feature) => ({
        value: String(feature[valueKey]),
        label: feature.slug,
      }))}
      renderOption={renderSelectOption}
      value={value}
      onChange={onChange}
      allowDeselect={false}
      label="Select Feature"
      mb="md"
      {...props}
    />
  );
};

export default SelectFeature;
